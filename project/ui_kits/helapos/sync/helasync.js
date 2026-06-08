/* ============================================================================
 * HelaSync — offline-first sync core for HelaPOS
 * ----------------------------------------------------------------------------
 * Pure, dependency-free logic for the multi-store / multi-terminal sync model
 * described in docs/multi-store-sync.md. This module is the server-free heart
 * of phases P0–P2: identity, clocks, the oplog resolver, and the numeric
 * ledgers. It runs identically in the browser (window.HelaSync) and in Node
 * (module.exports) so the same code is unit-tested and shipped.
 *
 * Design invariants this module guarantees (asserted by helasync.test.js):
 *   1. ULIDs are globally unique and lexicographically time-sortable.
 *   2. The op resolver is ORDER-INDEPENDENT — replaying the same set of ops in
 *      any order yields byte-identical state (the CRDT merge property). This is
 *      what makes eventual consistency across terminals safe.
 *   3. Numeric fields (stock, credit, points) are derived sums of append-only
 *      movements, so concurrent terminals compose instead of clobbering.
 * ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HelaSync = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---- randomness (browser crypto / Node global crypto / Math.random) -------
  const getRandom = (n) => {
    const out = new Uint8Array(n);
    const c = typeof globalThis !== "undefined" ? globalThis.crypto : null;
    if (c && c.getRandomValues) c.getRandomValues(out);
    else for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
    return out;
  };

  /* ---------------------------------------------------------------------------
   * ULID — 48-bit timestamp + 80-bit randomness, Crockford base32 (26 chars).
   * Monotonic: within the same millisecond the random component is incremented
   * so ids minted in a tight loop still sort in creation order.
   * ------------------------------------------------------------------------- */
  const ENC = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford (no I,L,O,U)
  function makeUlidFactory() {
    let lastTime = -1;
    let lastRand = null; // Uint8Array(10)
    return function ulid(now) {
      const time = now != null ? now : Date.now();
      let rand;
      if (time === lastTime && lastRand) {
        rand = lastRand.slice();
        for (let i = 9; i >= 0; i--) { if (rand[i] === 255) { rand[i] = 0; } else { rand[i]++; break; } }
      } else {
        rand = getRandom(10);
      }
      lastTime = time; lastRand = rand;

      // encode 48-bit time (10 base32 chars)
      let t = time, ts = "";
      for (let i = 9; i >= 0; i--) { ts = ENC[t % 32] + ts; t = Math.floor(t / 32); }
      // encode 80-bit randomness (16 base32 chars) from the 10 random bytes
      let bits = 0, val = 0, rs = "";
      for (let i = 0; i < rand.length; i++) {
        val = (val << 8) | rand[i]; bits += 8;
        while (bits >= 5) { bits -= 5; rs += ENC[(val >>> bits) & 31]; }
      }
      if (bits > 0) rs += ENC[(val << (5 - bits)) & 31];
      return (ts + rs).slice(0, 26);
    };
  }
  const ulid = makeUlidFactory();

  /* ---------------------------------------------------------------------------
   * Hybrid Logical Clock — (wallMillis, counter, nodeId).
   * Survives backward wall-clock jumps and gives a deterministic total order
   * for last-writer-wins tie-breaking. Encoded as a sortable string.
   * ------------------------------------------------------------------------- */
  function makeClock(nodeId) {
    let wall = 0, counter = 0;
    const pack = () => String(wall).padStart(15, "0") + ":" + String(counter).padStart(6, "0") + ":" + nodeId;
    return {
      nodeId,
      // local event
      now(physical) {
        const p = physical != null ? physical : Date.now();
        if (p > wall) { wall = p; counter = 0; }
        else counter++;
        return pack();
      },
      // merge a received remote clock (keeps us ahead of anything we've seen)
      recv(remote, physical) {
        const r = parseHlc(remote);
        const p = physical != null ? physical : Date.now();
        const maxWall = Math.max(wall, r.wall, p);
        if (maxWall === wall && maxWall === r.wall) counter = Math.max(counter, r.counter) + 1;
        else if (maxWall === wall) counter++;
        else if (maxWall === r.wall) counter = r.counter + 1;
        else counter = 0;
        wall = maxWall;
        return pack();
      },
      peek: pack,
    };
  }
  function parseHlc(s) {
    const p = String(s).split(":");
    return { wall: +p[0], counter: +p[1], node: p[2] || "" };
  }
  // a < b → -1, a > b → 1, equal → 0
  function hlcCmp(a, b) {
    const x = parseHlc(a), y = parseHlc(b);
    if (x.wall !== y.wall) return x.wall < y.wall ? -1 : 1;
    if (x.counter !== y.counter) return x.counter < y.counter ? -1 : 1;
    if (x.node !== y.node) return x.node < y.node ? -1 : 1;
    return 0;
  }

  /* ---------------------------------------------------------------------------
   * Per-entity conflict policy (see docs §5 D5).
   *   append — immutable / insert-wins (union by rowId). Financial & ledgers.
   *   lww    — field-level last-writer-wins by HLC. Mutable catalogue/profile.
   * ------------------------------------------------------------------------- */
  const POLICY = {
    bills: "append", logs: "append", shifts: "append", purchases: "append",
    stock_moves: "append", customer_ledger: "append",
    products: "lww", customers: "lww", users: "lww", tabs: "lww", suppliers: "lww",
  };
  const policyOf = (table) => POLICY[table] || "lww";

  // op shape: { opId, table, rowId, type:'put'|'del', payload, hlc, deviceId, userId }
  function makeOp(clock, deviceId, userId, table, rowId, type, payload) {
    return {
      opId: ulid(), table, rowId: String(rowId), type: type || "put",
      payload: payload || null, hlc: clock.now(), deviceId, userId: userId || null,
    };
  }

  function emptyState() { return { rows: {}, warnings: [] }; }

  function warn(state, code, detail) { state.warnings.push({ code, ...detail }); }

  /* Apply a single op to state in place. Order-independent by construction. */
  function applyOp(state, op) {
    const table = op.table;
    state.rows[table] = state.rows[table] || {};
    const tbl = state.rows[table];
    const key = String(op.rowId);
    const pol = policyOf(table);

    if (pol === "append") {
      // immutable union by rowId — first write wins, retries are no-ops
      if (!tbl[key]) tbl[key] = { id: key, ...(op.payload || {}), _hlc: op.hlc };
      return state;
    }

    // ---- field-level LWW ----
    let row = tbl[key];
    if (!row) row = tbl[key] = { id: key, _clocks: {}, _deletedHlc: null, _latestHlc: null };

    if (op.type === "del") {
      if (!row._deletedHlc || hlcCmp(op.hlc, row._deletedHlc) > 0) row._deletedHlc = op.hlc;
    } else {
      const data = op.payload || {};
      for (const f of Object.keys(data)) {
        const prev = row._clocks[f];
        if (!prev || hlcCmp(op.hlc, prev) > 0) { row[f] = data[f]; row._clocks[f] = op.hlc; }
      }
    }
    if (!row._latestHlc || hlcCmp(op.hlc, row._latestHlc) > 0) row._latestHlc = op.hlc;

    // resurrection: an edit newer than the delete brings the row back (warn — see §10 ex.4)
    const deleted = !!row._deletedHlc && (!row._latestHlc || hlcCmp(row._deletedHlc, row._latestHlc) >= 0);
    row._deleted = deleted;
    if (row._deletedHlc && !deleted) warn(state, "resurrected", { table, rowId: key });

    return state;
  }

  function applyOps(state, ops) {
    for (const op of ops) applyOp(state, op);
    return state;
  }

  /* Materialised live rows for a table (tombstones hidden, meta stripped). */
  function liveRows(state, table) {
    const tbl = (state.rows && state.rows[table]) || {};
    const out = [];
    for (const key of Object.keys(tbl)) {
      const r = tbl[key];
      if (r._deleted) continue;
      const clean = {};
      for (const k of Object.keys(r)) if (k[0] !== "_") clean[k] = r[k];
      out.push(clean);
    }
    return out;
  }

  /* ---------------------------------------------------------------------------
   * Ledgers (see docs §5 D6). Displayed values are derived sums, never synced
   * absolutes — so two terminals decrementing the same SKU both count.
   * ------------------------------------------------------------------------- */
  // stock_moves: { id, productId, qty(+in/-out), reason, ... }
  function stockOnHand(state) {
    const moves = liveRows(state, "stock_moves");
    const onHand = {};
    for (const m of moves) onHand[m.productId] = (onHand[m.productId] || 0) + (+m.qty || 0);
    const oversold = Object.keys(onHand).filter((p) => onHand[p] < 0);
    return { onHand, oversold };
  }
  // customer_ledger: { id, customerId, kind:'credit'|'points', delta, ... }
  function customerBalances(state) {
    const entries = liveRows(state, "customer_ledger");
    const bal = {};
    for (const e of entries) {
      const c = (bal[e.customerId] = bal[e.customerId] || { credit: 0, points: 0 });
      if (e.kind === "points") c.points += +e.delta || 0;
      else c.credit += +e.delta || 0;
    }
    const negative = Object.keys(bal).filter((c) => bal[c].credit < 0 || bal[c].points < 0);
    return { balances: bal, negative };
  }

  /* ---------------------------------------------------------------------------
   * Human-readable, collision-free numbering (docs §5 D2a).
   * Each terminal owns its series; numbers never need the network.
   * ------------------------------------------------------------------------- */
  function deviceNumber(prefix, deviceCode, seq, width) {
    return prefix + "-" + deviceCode + "-" + String(seq).padStart(width || 5, "0");
  }

  return {
    ulid, makeUlidFactory,
    makeClock, parseHlc, hlcCmp,
    POLICY, policyOf, makeOp, emptyState, applyOp, applyOps, liveRows,
    stockOnHand, customerBalances, deviceNumber,
  };
});
