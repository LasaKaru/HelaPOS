/* HelaPOS — Tables (floor plan) + Orders (list) modules. Navy-themed, no orange. */
const { useState: useStateMod } = React;

/* ---------- sample state (kit data) ---------- */
const HELA_TABLES = [
  { id: "T1", seats: 2, status: "available" },
  { id: "T2", seats: 4, status: "occupied", amount: 245.00, since: "32m", guests: 3 },
  { id: "T3", seats: 4, status: "available" },
  { id: "T4", seats: 6, status: "reserved", who: "Mr. Perera", at: "1:30 PM" },
  { id: "T5", seats: 2, status: "occupied", amount: 63.45, since: "12m", guests: 2 },
  { id: "T6", seats: 8, status: "billed", amount: 410.00, since: "1h 04m", guests: 6 },
  { id: "T7", seats: 4, status: "available" },
  { id: "T8", seats: 4, status: "occupied", amount: 152.00, since: "48m", guests: 4 },
  { id: "T9", seats: 2, status: "available" },
  { id: "T10", seats: 6, status: "reserved", who: "Fernando", at: "2:00 PM" },
  { id: "T11", seats: 4, status: "occupied", amount: 88.50, since: "20m", guests: 2 },
  { id: "T12", seats: 2, status: "available" },
];

const HELA_ORDERS = [
  { no: "ORD-00482", table: "T2", type: "Dine in", items: 6, amount: 245.00, status: "Preparing", time: "10:24" },
  { no: "ORD-00481", table: "—", type: "Takeaway", items: 2, amount: 88.50, status: "Served", time: "10:19" },
  { no: "ORD-00480", table: "T8", type: "Dine in", items: 4, amount: 152.00, status: "Served", time: "10:11" },
  { no: "ORD-00479", table: "T5", type: "Dine in", items: 3, amount: 63.45, status: "Paid", time: "10:03" },
  { no: "ORD-00478", table: "—", type: "Takeaway", items: 5, amount: 131.20, status: "Paid", time: "09:58" },
  { no: "ORD-00477", table: "T6", type: "Dine in", items: 9, amount: 410.00, status: "Preparing", time: "09:46" },
  { no: "ORD-00476", table: "T11", type: "Dine in", items: 2, amount: 88.50, status: "Paid", time: "09:32" },
];

const T_STATUS = {
  available: { label: "Available", color: "var(--success)", soft: "rgba(16,185,129,.10)" },
  occupied:  { label: "Occupied",  color: "var(--primary)", soft: "var(--primary-light)" },
  reserved:  { label: "Reserved",  color: "var(--info)",    soft: "rgba(59,130,246,.10)" },
  billed:    { label: "Billed",    color: "var(--text-tertiary)", soft: "var(--bg-tertiary)" },
};

function TablesScreen({ onSelectTable }) {
  const fmt = window.HELA_DATA.fmt;
  const [filter, setFilter] = useStateMod("all");
  const list = filter === "all" ? HELA_TABLES : HELA_TABLES.filter((t) => t.status === filter);

  return (
    <div>
      <SubHeader title="Tables" subtitle="Floor plan · live status"
        right={<div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text-secondary)" }}>
          {Object.keys(T_STATUS).map((k) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: T_STATUS[k].color }} />{T_STATUS[k].label}</span>
          ))}
        </div>} />
      <div style={{ padding: "22px 30px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["all", "available", "occupied", "reserved", "billed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 16,
              padding: "8px 16px", border: "none", cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--font-sans)",
              background: filter === f ? "var(--primary)" : "var(--bg-secondary)", color: filter === f ? "#fff" : "var(--text-secondary)" }}>{f}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 16 }}>
          {list.map((t) => {
            const s = T_STATUS[t.status];
            return (
              <div key={t.id} onClick={() => t.status === "available" && onSelectTable(t.id)}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderTop: "4px solid " + s.color,
                  borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-card)",
                  cursor: t.status === "available" ? "pointer" : "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{t.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.soft, borderRadius: 20, padding: "4px 10px" }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>🪑 {t.seats} seats</div>
                <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                {t.status === "occupied" && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <div>{t.guests} guests · {t.since}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{fmt(t.amount)}</div></div>}
                {t.status === "billed" && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Awaiting payment<div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{fmt(t.amount)}</div></div>}
                {t.status === "reserved" && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.who}<div style={{ marginTop: 2 }}>⏰ {t.at}</div></div>}
                {t.status === "available" && <div style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>Tap to seat →</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const O_STATUS = {
  Preparing: { color: "var(--info)", soft: "rgba(59,130,246,.10)" },
  Served:    { color: "var(--success)", soft: "rgba(16,185,129,.10)" },
  Paid:      { color: "var(--text-secondary)", soft: "var(--bg-tertiary)" },
};

function OrdersScreen() {
  const fmt = window.HELA_DATA.fmt;
  const [tab, setTab] = useStateMod("All");
  const list = tab === "All" ? HELA_ORDERS
    : tab === "Paid" ? HELA_ORDERS.filter((o) => o.status === "Paid")
    : HELA_ORDERS.filter((o) => o.type === tab);

  return (
    <div>
      <SubHeader title="Orders" subtitle="Today · 7 orders" />
      <div style={{ padding: "22px 30px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["All", "Dine in", "Takeaway", "Paid"].map((f) => (
            <button key={f} onClick={() => setTab(f)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 16,
              padding: "8px 16px", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
              background: tab === f ? "var(--primary)" : "var(--bg-secondary)", color: tab === f ? "#fff" : "var(--text-secondary)" }}>{f}</button>
          ))}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
          overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr .8fr 1fr .7fr 1fr 1fr .8fr", padding: "12px 18px",
            background: "var(--bg-secondary)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)",
            borderBottom: "1px solid var(--border)" }}>
            <span>Order</span><span>Table</span><span>Type</span><span>Items</span><span>Amount</span><span>Status</span><span>Time</span>
          </div>
          {list.map((o, idx) => {
            const s = O_STATUS[o.status];
            return (
              <div key={o.no} style={{ display: "grid", gridTemplateColumns: "1.3fr .8fr 1fr .7fr 1fr 1fr .8fr",
                padding: "14px 18px", fontSize: 14, alignItems: "center",
                borderBottom: idx < list.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontWeight: 700 }}>{o.no}</span>
                <span style={{ color: o.table === "—" ? "var(--text-tertiary)" : "var(--primary)", fontWeight: 600 }}>{o.table}</span>
                <span style={{ color: "var(--text-secondary)" }}>{o.type}</span>
                <span style={{ color: "var(--text-secondary)" }}>{o.items}</span>
                <span style={{ fontWeight: 700 }}>{fmt(o.amount)}</span>
                <span><span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: s.soft, borderRadius: 20, padding: "4px 12px" }}>{o.status}</span></span>
                <span style={{ color: "var(--text-secondary)" }}>{o.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TablesScreen, OrdersScreen });
