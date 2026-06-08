/* ============================================================================
 * HelaSync merge simulator + unit tests
 * ----------------------------------------------------------------------------
 * Proves the sync core (docs/multi-store-sync.md) WITHOUT a backend. Run with:
 *     node --test project/ui_kits/helapos/sync/
 * Covers: ULID ordering, HLC monotonicity, the order-independence (CRDT) merge
 * property, and every worked conflict example from §10 of the spec.
 * ========================================================================== */
const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("./helasync.js");

/* Deterministic shuffle (seeded) so "order independence" is reproducible. */
function shuffles(arr, n) {
  const out = [];
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let k = 0; k < n; k++) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    out.push(a);
  }
  return out;
}
const canon = (state) => JSON.stringify(state.rows, Object.keys(state.rows).sort());

/* Two terminals A and B, each with its own clock. */
function terminals() {
  return {
    A: { clock: H.makeClock("A1"), dev: "A1" },
    B: { clock: H.makeClock("B1"), dev: "B1" },
  };
}

// ---------------------------------------------------------------------------
test("ULID is sortable and unique, even minted in a tight loop", () => {
  const ids = [];
  for (let i = 0; i < 5000; i++) ids.push(H.ulid());
  assert.equal(new Set(ids).size, ids.length, "all unique");
  const sorted = ids.slice().sort();
  assert.deepEqual(ids, sorted, "creation order == lexicographic order");
  // explicit same-ms monotonicity
  const a = H.ulid(1000), b = H.ulid(1000);
  assert.ok(a < b, "monotonic within a millisecond");
});

test("HLC is monotonic and survives a backward wall-clock jump", () => {
  const c = H.makeClock("X");
  const t1 = c.now(1000);
  const t2 = c.now(1000);     // same physical ms -> counter advances
  const t3 = c.now(500);      // clock jumped BACKWARDS -> must still advance
  assert.ok(H.hlcCmp(t1, t2) < 0);
  assert.ok(H.hlcCmp(t2, t3) < 0, "time never goes backwards logically");
});

test("HLC recv keeps the receiver ahead of anything it has seen", () => {
  const a = H.makeClock("A"), b = H.makeClock("B");
  const fromA = a.now(5000);
  const atB = b.recv(fromA, 1000);   // B's wall is behind A's
  assert.ok(H.hlcCmp(atB, fromA) > 0, "after recv, B > the message it received");
});

// ---------------------------------------------------------------------------
test("CRDT property: merge is order-independent across many entity types", () => {
  const { A, B } = terminals();
  const pid = H.ulid();
  const ops = [
    // append-only financial + ledger
    H.makeOp(A.clock, "A1", "u1", "bills", H.ulid(), "put", { total: 1200 }),
    H.makeOp(B.clock, "B1", "u2", "bills", H.ulid(), "put", { total: 800 }),
    H.makeOp(A.clock, "A1", "u1", "stock_moves", H.ulid(), "put", { productId: pid, qty: -1, reason: "sale" }),
    H.makeOp(B.clock, "B1", "u2", "stock_moves", H.ulid(), "put", { productId: pid, qty: -1, reason: "sale" }),
    // field-level LWW catalogue edits
    H.makeOp(A.clock, "A1", "u1", "products", pid, "put", { name: "Latte" }),
    H.makeOp(B.clock, "B1", "u2", "products", pid, "put", { price: 950 }),
  ];

  const baseline = canon(H.applyOps(H.emptyState(), ops));
  for (const order of shuffles(ops, 50)) {
    assert.equal(canon(H.applyOps(H.emptyState(), order)), baseline, "any order -> identical state");
  }
});

test("idempotency: replaying the same ops changes nothing (safe retries)", () => {
  const { A } = terminals();
  const ops = [
    H.makeOp(A.clock, "A1", "u1", "bills", "bill_1", "put", { total: 500 }),
    H.makeOp(A.clock, "A1", "u1", "products", "p1", "put", { price: 100 }),
  ];
  const once = canon(H.applyOps(H.emptyState(), ops));
  const twice = canon(H.applyOps(H.emptyState(), ops.concat(ops)));
  assert.equal(once, twice);
});

// ---------------------------------------------------------------------------
// §10 ex.1 — last item, two terminals, both offline
test("ex1: concurrent last-item sale -> oversell surfaced, both sales kept", () => {
  const { A, B } = terminals();
  const pid = "espresso";
  // opening stock of 1 (a +1 receive move)
  const ops = [
    H.makeOp(A.clock, "A1", "u0", "stock_moves", H.ulid(), "put", { productId: pid, qty: 1, reason: "receive" }),
    // A and B each sell the last one offline
    H.makeOp(A.clock, "A1", "u1", "bills", H.ulid(), "put", { total: 600 }),
    H.makeOp(A.clock, "A1", "u1", "stock_moves", H.ulid(), "put", { productId: pid, qty: -1, reason: "sale" }),
    H.makeOp(B.clock, "B1", "u2", "bills", H.ulid(), "put", { total: 600 }),
    H.makeOp(B.clock, "B1", "u2", "stock_moves", H.ulid(), "put", { productId: pid, qty: -1, reason: "sale" }),
  ];
  const state = H.applyOps(H.emptyState(), ops);
  const { onHand, oversold } = H.stockOnHand(state);
  assert.equal(onHand[pid], -1, "1 in, 2 out -> -1 (no lost decrement)");
  assert.deepEqual(oversold, [pid], "oversell is surfaced, not hidden");
  assert.equal(H.liveRows(state, "bills").length, 2, "both sales survive");
});

// §10 ex.2 — concurrent store-credit redemption
test("ex2: concurrent credit redeem -> both compose, negative balance flagged", () => {
  const { A, B } = terminals();
  const cid = "cust_7";
  const ops = [
    H.makeOp(A.clock, "A1", "u0", "customer_ledger", H.ulid(), "put", { customerId: cid, kind: "credit", delta: 20 }),
    H.makeOp(A.clock, "A1", "u1", "customer_ledger", H.ulid(), "put", { customerId: cid, kind: "credit", delta: -15 }),
    H.makeOp(B.clock, "B1", "u2", "customer_ledger", H.ulid(), "put", { customerId: cid, kind: "credit", delta: -10 }),
  ];
  const { balances, negative } = H.customerBalances(H.applyOps(H.emptyState(), ops));
  assert.equal(balances[cid].credit, -5, "20 - 15 - 10 = -5 (neither redeem lost)");
  assert.deepEqual(negative, [cid]);
});

// §10 ex.3 — catalogue edit race (field-level LWW)
test("ex3a: different fields edited concurrently -> both edits survive", () => {
  const { A, B } = terminals();
  const ops = [
    H.makeOp(A.clock, "A1", "u1", "products", "p1", "put", { name: "Flat White" }),
    H.makeOp(B.clock, "B1", "u2", "products", "p1", "put", { price: 850 }),
  ];
  const [row] = H.liveRows(H.applyOps(H.emptyState(), ops), "products");
  assert.equal(row.name, "Flat White");
  assert.equal(row.price, 850);
});

test("ex3b: same field edited concurrently -> higher HLC wins, deterministically", () => {
  const { A, B } = terminals();
  const aOp = H.makeOp(A.clock, "A1", "u1", "products", "p1", "put", { price: 800 });
  const bOp = H.makeOp(B.clock, "B1", "u2", "products", "p1", "put", { price: 900 });
  const winner = H.hlcCmp(aOp.hlc, bOp.hlc) > 0 ? 800 : 900;
  // apply in both orders -> same winner
  for (const order of [[aOp, bOp], [bOp, aOp]]) {
    const [row] = H.liveRows(H.applyOps(H.emptyState(), order), "products");
    assert.equal(row.price, winner);
  }
});

// §10 ex.4 — delete vs edit
test("ex4a: delete wins over an OLDER concurrent edit", () => {
  const c = H.makeClock("A1");
  const edit = H.makeOp(c, "A1", "u1", "products", "p1", "put", { price: 700 });
  const del = H.makeOp(c, "A1", "u1", "products", "p1", "del");   // newer
  const state = H.applyOps(H.emptyState(), [edit, del]);
  assert.equal(H.liveRows(state, "products").length, 0, "row is gone");
});

test("ex4b: an edit NEWER than the delete resurrects the row and warns", () => {
  const c = H.makeClock("A1");
  const del = H.makeOp(c, "A1", "u1", "products", "p1", "del");
  const edit = H.makeOp(c, "A1", "u1", "products", "p1", "put", { price: 700 }); // newer
  const state = H.applyOps(H.emptyState(), [del, edit]);
  assert.equal(H.liveRows(state, "products").length, 1, "row comes back");
  assert.ok(state.warnings.some((w) => w.code === "resurrected"), "resurrection is surfaced");
});

// ---------------------------------------------------------------------------
test("device-prefixed numbering is human-readable and per-terminal", () => {
  assert.equal(H.deviceNumber("INV", "A1", 42), "INV-A1-00042");
  assert.equal(H.deviceNumber("PO", "B3", 7, 4), "PO-B3-0007");
});
