# Multi‑Store & Backend Sync — Architecture Spec

> Status: **Proposed** (design only — no backend exists yet)
> Author: HelaPOS engineering · Last updated: 2026‑06‑08
> Scope: the last open item on the Phase‑1 roadmap. This document defines *how*
> HelaPOS becomes a multi‑terminal, multi‑store, offline‑first system that
> synchronises through a central backend. It is implementation‑ready: every
> decision is tied to a concrete hook in the current code.

---

## 1. TL;DR

HelaPOS today is a single‑terminal, offline app: an in‑memory mirror (`mem`) is
the source of truth, persisted to `localStorage` (JSON snapshot + a base64 SQLite
image), with all writes funnelled through `HelaDB.insert/update/remove`.

To make it sync we do **not** need to rewrite the UI. We need five things:

1. **Globally unique IDs** (ULIDs) instead of device‑local `max(id)+1`.
2. **A change log (oplog)** written at the existing `HelaDB` mutation choke point.
3. **Per‑record sync metadata** (`rev`, `updatedAt`, `deviceId`, `deleted`).
4. **A ledger model for numeric fields** (stock, store credit, loyalty points)
   so concurrent terminals can't clobber each other's counts.
5. **A thin sync client + backend** that exchanges deltas with conflict rules.

Recommended build path: **offline‑first, oplog‑based delta sync over HTTP** to a
**custom Node + Postgres backend** (with a managed Postgres such as Supabase as
the fast path). Rationale and alternatives are in §7.

The work is phased so that **Phase 0 ships with zero behavioural change** and the
app keeps working fully offline at every step.

---

## 2. Goals & non‑goals

### Goals
- **Offline‑first.** A terminal must take orders and payments with no network,
  exactly as today, and reconcile later.
- **Multi‑terminal within a store.** 2–10 POS terminals share one catalogue,
  customer base, live tables, and inventory in near‑real‑time.
- **Multi‑store.** A chain runs N stores; head office sees consolidated data;
  catalogue/pricing can be pushed down per store or globally.
- **Correctness of money & stock.** No lost sales, no double‑counted loyalty, no
  drifting stock under concurrency.
- **Eventual consistency** with bounded, explainable conflict resolution.
- **Tenant isolation & least privilege** — a terminal only syncs what its store
  and role allow.

### Non‑goals (for this phase)
- Real‑time collaborative editing of a single record (we use record/field‑level
  resolution, not OT/rich‑text CRDTs).
- Strong global transactions across stores (we are eventually consistent).
- Replacing the local SQLite engine — it stays as the local store.
- Payment‑processor / fiscal‑device integration (tracked separately).

---

## 3. Where we are today (and why it can't sync yet)

Grounded in `project/ui_kits/helapos/index.html`:

| Concern | Current implementation | Sync blocker |
|---|---|---|
| Source of truth | `mem` (in‑RAM), mirrored to SQLite WASM | Fine — stays local |
| Persistence | `localStorage` JSON + base64 SQLite; optional AES‑GCM at rest | Fine |
| **Identity** | `nextId = max(id)+1` per device | **Two terminals both mint id 484 → collision** |
| **Human numbers** | `counters.bill/invoice/po` incremented locally | **Duplicate invoice numbers across terminals** |
| Mutations | all via `insert/update/remove → persist()` | Good — single choke point to instrument |
| **Change tracking** | none (no `updatedAt`, no tombstones) | **Can't compute deltas or propagate deletes** |
| **Stock** | separate `localStorage` map `hela.stock.v1` (`{id: qty}`), absolute values, mutated by sale/adjust/receiving | **Absolute LWW loses concurrent decrements; also lives outside HelaDB** |
| **Credit / points** | absolute fields on `customers` updated read‑modify‑write | **Concurrent updates clobber each other** |
| Append‑only data | `bills`, `logs`, `shifts`, `purchases` | Easy to merge (insert‑only) |
| Clocks | `Date.now()` on device | Device clock skew breaks LWW ordering |

Four of these are hard blockers (identity, counters, change tracking, numeric
integrity). The rest are already in good shape.

---

## 4. Target topology

```
            ┌─────────────────────────── Head office ───────────────────────────┐
            │                         Sync backend (API)                          │
            │   Postgres (per‑tenant rows)  ·  oplog table  ·  sequence service   │
            │   auth (store keys + user JWT)  ·  admin/reporting console          │
            └───────▲───────────────────────▲───────────────────────────▲────────┘
                    │  HTTPS delta sync       │                            │
        ┌───────────┴──────────┐   ┌──────────┴─────────┐      ┌──────────┴─────────┐
        │   Store A (gateway?)  │   │      Store B        │      │      Store C        │
        │  ┌────────┐ ┌───────┐ │   │  ┌────────┐         │      │  ┌────────┐        │
        │  │Term A1 │ │Term A2│ │   │  │Term B1 │  ...     │      │  │Term C1 │ ...    │
        │  │HelaDB+ │ │HelaDB+│ │   │  │HelaDB+ │         │      │  │HelaDB+ │        │
        │  │ oplog  │ │ oplog │ │   │  └────────┘         │      │  └────────┘        │
        │  └────────┘ └───────┘ │   └────────────────────┘      └────────────────────┘
        └───────────────────────┘
```

**Each terminal is a full offline node** (today's app + sync client). The backend
is the hub. Terminals normally sync **directly** to the backend over HTTPS.

*Optional* per‑store **gateway/LAN relay** (a designated terminal or small box):
lets terminals in one store stay in sync over the LAN even when the WAN link is
down, and batches uploads. Recommended for venues with flaky internet, but **out
of scope for the first release** — start with each terminal ↔ backend directly.

---

## 5. Core design decisions

### D1 — Identity: ULIDs, not `max(id)+1`
Replace `nextId()` with a **ULID** (sortable, 128‑bit, timestamp‑prefixed,
collision‑safe across devices). ULIDs sort by creation time, which keeps lists
stable and makes the oplog naturally ordered.

- New rows: `id = ulid()`.
- **Back‑compat:** existing integer ids stay valid; treat `id` as an opaque
  string everywhere. A one‑time local migration can leave old ids as‑is (they're
  unique within that device's history) and only *new* rows get ULIDs — but the
  clean option is to remap on first sync (see §9, P1).
- All foreign references (`bill.customer.id`, `purchase.supplierId`, stock keys)
  follow the same id type.

### D2 — Human‑readable sequences (invoice/bill/PO numbers)
Counters can't increment independently per device. Two options:

- **D2a (recommended): device‑prefixed numbers.** Each terminal gets a short
  `deviceCode` (e.g. `A1`). Numbers become `INV-A1-00042`. Unique by
  construction, works fully offline, human‑auditable per terminal. Backend never
  needs to be consulted to issue a number.
- **D2b: server‑allocated ranges.** Backend hands each terminal a block of
  numbers (e.g. 4001–4100); terminal consumes locally, requests a new block when
  low. Gives a single global sequence but needs connectivity to refill and leaves
  gaps. Use only if a regulator requires a single unbroken series per store.

> Default to **D2a**. It removes a whole class of online dependencies.

### D3 — Change tracking (the oplog)
Instrument the existing choke point. Every `insert/update/remove` also appends an
**operation** and stamps **sync metadata** on the row:

Per‑row metadata (added to every synced table):
```
_rev       monotonic per‑row revision (integer, ++ on each local write)
_updatedAt hybrid logical clock (see D4)
_updatedBy userId
_deviceId  originating device
_deleted   tombstone flag (soft delete; never hard‑delete synced rows)
_syncedRev last _rev acknowledged by the backend (for "dirty" detection)
```

Oplog row:
```
{ opId: ulid(), table, rowId, type: 'put'|'del', payload, hlc, deviceId, userId }
```
The oplog is the unit of upload. `remove()` becomes a soft delete (`_deleted=true`
+ `del` op); rows are physically purged only after the backend confirms and a
retention window passes.

**Hook:** `insert`, `update`, `remove`, `counter` in the `HelaDB` IIFE already
call `persist()`. Wrap them so they also `appendOp()` + bump metadata. No call
site in the UI changes.

### D4 — Clocks: Hybrid Logical Clocks (HLC)
Device wall clocks drift; pure LWW on `Date.now()` is unsafe. Use a **Hybrid
Logical Clock**: `(wallMillis, counter, deviceId)`. HLCs are monotonic per node,
survive backward clock jumps, and give a total order for tie‑breaking. The
backend can also re‑stamp an authoritative receive time for audit. LWW
comparisons (D5) order by HLC, then `deviceId` as a final deterministic tiebreak.

### D5 — Conflict resolution policy (per entity)
Resolution is chosen per table by **how the data behaves**, not one global rule:

| Entity | Strategy | Why |
|---|---|---|
| `bills`, `logs`, `shifts`, `purchases` | **Append‑only / insert‑wins** | Immutable financial/audit records. A ULID can't collide; just union. Edits (e.g. refunds) are *new* rows referencing the original. |
| `products` (catalogue fields: name, price, cat, sku, mods) | **Field‑level LWW (HLC)** | Rare concurrent edits; last edit per field wins. Head‑office push can be flagged authoritative. |
| `customers` (profile fields: name, phone, …) | **Field‑level LWW (HLC)** | Same. |
| **stock on‑hand** | **Ledger (sum of movements)** — see D6 | Two terminals selling the same SKU must *both* decrement. LWW would lose one sale. |
| **store credit, loyalty points** | **Ledger (sum of entries)** — see D6 | Concurrent redeem/earn must compose, not overwrite. |
| `tabs` (open table orders) | **Single‑writer lock + LWW fallback** | A tab should be edited by one terminal at a time. Soft lock (`_lockedBy`,`_lockExpiry`); if two edits race, LWW on line‑items with a surfaced warning. Transfer/merge become explicit ops. |
| `counters` | **Eliminated** by D2a (device‑prefixed) | No shared mutable counter to conflict on. |
| `users` | **LWW, backend‑authoritative** | Security‑sensitive; head office wins. |

### D6 — Numeric integrity: from absolute values to ledgers
This is the most important change and the current biggest gap.

**Problem:** `stock[id]`, `customer.credit`, `customer.points` are absolute and
updated read‑modify‑write. If terminal A and B both sell the last 3 of an item
offline, replaying two `stock=…` writes loses one decrement.

**Fix:** model these as **append‑only movement ledgers**; the displayed value is a
*derived sum*, never a synced absolute.

- New table `stock_moves`: `{ id, productId, qty(+in/−out), reason:'sale|adjust|receive|transfer', refId, storeId, hlc, deviceId }`.
  On‑hand = `Σ qty` per product per store. Sales insert a `−qty` move; purchasing
  (currently `stock[id]+=qty`) inserts `+qty`; manual adjust inserts a delta.
- New table `credit_entries` and `points_entries` (or one `customer_ledger`):
  `{ id, customerId, delta, reason, refBill, hlc, deviceId }`. Balance = `Σ delta`.
  Redemption at payment and refund‑to‑credit append entries instead of writing
  `customer.credit`.
- These tables are **append‑only**, so they sync with the trivial insert‑wins
  rule (D5) and are inherently conflict‑free. A negative on‑hand after merge is a
  real oversell signal worth surfacing, not a corruption.

> This subsumes the existing `hela.stock.v1` localStorage map — stock moves *into*
> HelaDB as a first‑class synced table, fixing the "stock lives outside the DB"
> wart at the same time. Cached on‑hand totals can still be memoised for the UI.

---

## 6. Sync protocol

Offline‑first **delta sync** with per‑table cursors. Two RPCs:

### `POST /sync/push`
Upload local ops the backend hasn't acknowledged.
```jsonc
{
  "deviceId": "A1",
  "storeId": "store_A",
  "ops": [
    { "opId":"01J…", "table":"bills",       "rowId":"01J…", "type":"put", "hlc":"…", "payload":{…} },
    { "opId":"01J…", "table":"stock_moves", "rowId":"01J…", "type":"put", "hlc":"…", "payload":{…} }
  ]
}
```
- **Idempotent** on `opId` (backend dedupes; safe to retry).
- Backend validates tenant scope, applies conflict rules, returns accepted
  `opId`s + any server‑authoritative corrections.

### `GET /sync/pull?since=<cursor>&tables=…`
Download changes from other devices since the caller's cursor.
```jsonc
{
  "changes": [ { "table":"products", "rowId":"…", "rev":7, "hlc":"…", "payload":{…}, "deleted":false } ],
  "cursor": "01J…",        // opaque high‑water mark to send next time
  "more": false            // pagination flag
}
```

### Loop & resilience
- Trigger: on app start, on reconnect, after each sale (debounced), and on a
  timer (e.g. every 15–30 s) when online.
- **Backoff:** exponential with jitter on failure (mirror the repo's git‑push
  retry policy: 2s/4s/8s/16s), capped; never block the POS UI.
- **Ordering:** apply pulled changes by HLC; local unsynced ops are re‑based on
  top (their `_rev` already higher) so the local user's in‑flight edits aren't
  visibly reverted.
- **Partial sync by role/store:** a cashier terminal pulls its store's catalogue,
  customers, open tabs, and its own bills; it does *not* pull other stores' data.
- **Large initial sync:** first pull is a snapshot endpoint (`GET /sync/bootstrap`)
  returning a compacted state, then incremental from the returned cursor.

### Status surfacing
Add a sync indicator to the top bar: `Synced ✓ / Syncing… / Offline (n pending)`.
Reuse the existing `flash()` for errors. Pending‑op count comes from rows where
`_rev > _syncedRev`.

---

## 7. Backend: build vs. buy

The frontend is a static single file. The backend is greenfield. Options:

| Option | Fit | Pros | Cons |
|---|---|---|---|
| **Custom Node/TS + Postgres** *(recommended)* | High | Full control of conflict rules, tenant model, oplog & sequence service; cheap; deployable anywhere | We build & operate it |
| **Supabase** (Postgres + Auth + RLS) | High (fast path) | Managed Postgres, row‑level security for tenant isolation, auth included; can host the custom sync endpoints as Edge Functions | Vendor coupling; RLS must encode our scoping |
| **CouchDB ↔ PouchDB** | Medium | Replication & conflict handling *built in*, proven offline model | Doc‑level (not field‑level) conflicts; ledger model still on us; another datastore to learn; weaker ad‑hoc reporting than SQL |
| **ElectricSQL / PowerSync** (sync layer over Postgres) | Medium‑High | Purpose‑built Postgres↔local sync, partial replication, handles deltas | Opinionated; our SQLite‑WASM/local layer would be replaced/adapted; maturity/ops cost |
| **Turso / libSQL embedded replicas** | Medium | Same SQLite dialect we already use; embedded replicas sync to a primary | Sync is row‑replication, not our app‑level conflict semantics; ledger model still on us |
| **Firebase Firestore** | Medium | Turnkey realtime + offline cache | NoSQL remodelling; cost at write volume; SQL reporting lost |

**Recommendation:** **custom Node + Postgres**, optionally **on Supabase** to skip
DB/auth ops. Reasons: our conflict rules are domain‑specific (ledgers, tab locks,
device‑prefixed numbers) and don't map cleanly onto a generic sync engine; SQL
gives head‑office reporting for free; Postgres RLS cleanly enforces multi‑tenancy.

### Minimal backend surface
```
POST /auth/device           # exchange store key + device enroll → device JWT
POST /sync/push             # upload ops (idempotent on opId)
GET  /sync/pull?since=…     # download deltas (cursor paginated)
GET  /sync/bootstrap        # first‑run compacted snapshot
GET  /admin/stores, /admin/reports/*   # head‑office console (server‑side aggregation)
```
Server tables mirror client tables + `tenants(stores)`, `devices`, `oplog`,
and (if D2b) `sequence_blocks`.

---

## 8. Security & multi‑tenancy

- **Tenant key per store** + **per‑device enrolment** → device‑scoped JWT
  (`storeId`, `deviceId`, `role`). Tokens are short‑lived + refreshable.
- **Scoping:** every synced row carries `storeId`; backend (Postgres RLS or
  middleware) rejects pull/push outside the caller's store, except head‑office
  roles. Catalogue rows may be `storeId=null` (global) and pushed down.
- **Transport:** HTTPS only; HSTS. The existing **encryption‑at‑rest** (AES‑GCM
  snapshot) stays for the local DB.
- **RBAC continuity:** the app already has roles (admin/manager/cashier) and an
  audit log. Extend audit to record sync events (`sync_push`, `conflict_resolved`)
  so reconciliation is traceable — reuse `HelaDB.log`.
- **Revocation:** a lost/stolen terminal can be remotely deauthorised (device
  blocklist); its un‑pushed local data is unrecoverable by design (already
  encrypted at rest).
- **PII:** customer data syncs only within its store unless head office is
  explicitly granted; supports basic data‑residency per tenant.

---

## 9. Migration & phasing

Each phase is independently shippable and **keeps the app fully offline‑capable**.

- **P0 — Sync metadata, no behaviour change.** Add `_rev/_updatedAt/_deviceId/
  _deleted` and an `appendOp()` to `HelaDB.insert/update/remove`; generate a
  `deviceId`/`deviceCode` on first run. Oplog accumulates locally and is unused.
  *Risk: ~nil. Nothing reads the new fields yet.*
- **P1 — Identity & numbering.** Switch `nextId`→`ulid()`; switch counters to
  device‑prefixed numbers (D2a). One‑time local remap of legacy integer ids.
- **P2 — Ledgerise numeric fields (D6).** Introduce `stock_moves`,
  `customer_ledger`; migrate `hela.stock.v1` and absolute credit/points into
  opening‑balance entries; compute displayed values as sums (memoised). *Biggest
  internal change; fully testable offline before any backend exists.*
- **P3 — Backend + sync client.** Stand up the Node/Postgres service; implement
  `push/pull/bootstrap`; add the sync loop, backoff, and the top‑bar status. Now
  two terminals genuinely share state.
- **P4 — Multi‑store & head office.** Tenant scoping, catalogue push‑down,
  consolidated reporting console, device management/revocation, optional LAN
  gateway.

**Testing strategy (verifiable without a server):** P0–P2 are pure local logic
and unit‑testable in Node (the repo already validates logic this way). Add a
**deterministic merge simulator**: feed two oplogs into the resolver and assert
final state — covers the nasty cases (concurrent last‑item sale, double redeem,
tab edit race, delete‑vs‑edit) before the network is ever involved.

---

## 10. Worked conflict examples

1. **Last item, two terminals, both offline.** Stock on‑hand = 1. A and B each
   sell it. Each appends a `−1` `stock_move`. After sync, on‑hand = `−1` → an
   **oversell alert** (real, surfaced), not a silently lost sale. Both bills are
   valid and present. *Absolute‑value LWW would have hidden one sale.*
2. **Concurrent credit redeem.** Customer credit = $20. A redeems $15 offline; B
   redeems $10 offline. Two ledger entries (−15, −10) → balance −5 → flagged for
   staff. Without ledgers, one redemption would vanish.
3. **Catalogue edit race.** A renames a product; B changes its price; same minute.
   Field‑level LWW keeps both edits (different fields). If both edit price, higher
   HLC wins, deterministically, and the loser is in the audit log.
4. **Delete vs. edit.** A deletes a product (tombstone); B edits it. Tombstone +
   higher HLC wins per policy; if B's edit is newer and the row is referenced by
   open tabs, surface a "deleted item still on an open order" warning instead of
   hard‑removing.
5. **Tab edited on two terminals.** Soft lock prevents it normally; if the lock
   expired, line‑items merge by LWW and staff see a "tab changed elsewhere"
   notice before settling.

---

## 11. Open questions / risks

- **Legacy id remap (P1):** remap on first sync vs. keep integers forever behind a
  `legacyId` field. Leaning remap for a clean global namespace.
- **Refunds & immutability:** confirm every "edit" to a financial record is modelled
  as a new compensating row (already true for refunds; verify for void/discount).
- **Clock trust:** how much do we trust device wall time for receipts vs. the HLC
  for ordering? Proposal: HLC for merge order, server receive‑time for audit,
  device local time only for display.
- **Reporting consistency:** head‑office reports are eventually consistent; define
  an "as‑of cursor" so a report is reproducible.
- **Gateway/LAN relay:** worth it for poor‑connectivity venues — defer to P4+.
- **Schema evolution:** version the sync payload; backend must accept older
  clients during rollout.

---

## 12. Why this fits HelaPOS specifically

- The **single mutation choke point** (`HelaDB.insert/update/remove → persist`)
  means oplog + metadata is a *localized* change, not a UI rewrite.
- The app is **already offline‑first** (mem + localStorage + SQLite WASM); we're
  adding a network *tier*, not changing the local model.
- **Append‑only data already dominates** (bills/logs/shifts/purchases) — the
  easy‑merge majority.
- The **two real hazards** (device‑local ids/counters, absolute stock/credit/
  points) are precisely identified and fixed by D1/D2 and D6.
- Phasing lets us deliver value (and tests) **before** any backend exists.
```

*This is a design document. No code in this commit changes runtime behaviour.*
