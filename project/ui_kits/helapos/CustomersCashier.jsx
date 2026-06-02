/* HelaPOS — Customers (CRM list) + Cashier (cash drawer / shift). Navy-themed, no orange. */
const { useState: useStateCC } = React;

const HELA_CUSTOMERS = [
  { name: "Nimal Perera", phone: "+94 77 123 4567", visits: 42, spent: 1284.50, points: 640, last: "Today" },
  { name: "Saman Fernando", phone: "+94 71 988 2210", visits: 17, spent: 512.00, points: 255, last: "Yesterday" },
  { name: "Ayesha Jiffry", phone: "+94 76 451 0098", visits: 63, spent: 2190.75, points: 1095, last: "Today" },
  { name: "Ruwan Silva", phone: "+94 70 332 7741", visits: 8, spent: 196.20, points: 98, last: "3 days ago" },
  { name: "Dilani Wickrama", phone: "+94 72 605 1123", visits: 29, spent: 874.00, points: 437, last: "1 week ago" },
  { name: "Kasun Bandara", phone: "+94 78 220 9934", visits: 5, spent: 132.40, points: 66, last: "Today" },
];
const AV = ["#0B1E40", "#1D4ED8", "#0D9488", "#4F46E5", "#1E293B", "#13294F"];
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function CustomersScreen() {
  const fmt = window.HELA_DATA.fmt;
  const [q, setQ] = useStateCC("");
  const list = q.trim() ? HELA_CUSTOMERS.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase())) : HELA_CUSTOMERS;
  return (
    <div>
      <SubHeader title="Customers" subtitle={HELA_CUSTOMERS.length + " customers · loyalty members"}
        right={<button style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--primary)", color: "#fff",
          border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>＋ Add Customer</button>} />
      <div style={{ padding: "22px 30px" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone…"
          style={{ width: 280, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 16,
            background: "var(--bg)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: 14, outline: "none" }} />
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
          overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr .8fr 1.1fr 1fr 1fr", padding: "12px 18px",
            background: "var(--bg-secondary)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
            <span>Customer</span><span>Phone</span><span>Visits</span><span>Total Spent</span><span>Points</span><span>Last Visit</span>
          </div>
          {list.map((c, i) => (
            <div key={c.name} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr .8fr 1.1fr 1fr 1fr", padding: "12px 18px",
              alignItems: "center", fontSize: 14, borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", background: AV[i % AV.length], color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{initials(c.name)}</span>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
              </div>
              <span style={{ color: "var(--text-secondary)" }}>{c.phone}</span>
              <span style={{ color: "var(--text-secondary)" }}>{c.visits}</span>
              <span style={{ fontWeight: 700 }}>{fmt(c.spent)}</span>
              <span><span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", borderRadius: 20, padding: "4px 12px" }}>{c.points} pts</span></span>
              <span style={{ color: "var(--text-secondary)" }}>{c.last}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CASH_MOVES = [
  { reason: "Opening float", amount: 200.00, time: "08:00", type: "in" },
  { reason: "Cash sale · ORD-00479", amount: 63.45, time: "10:03", type: "in" },
  { reason: "Cash sale · ORD-00482", amount: 245.00, time: "10:24", type: "in" },
  { reason: "Supplier payout · vegetables", amount: 85.00, time: "10:40", type: "out" },
  { reason: "Cash sale · ORD-00485", amount: 41.20, time: "11:02", type: "in" },
];

function CashierScreen() {
  const fmt = window.HELA_DATA.fmt;
  const cashIn = CASH_MOVES.filter((m) => m.type === "in").reduce((s, m) => s + m.amount, 0);
  const cashOut = CASH_MOVES.filter((m) => m.type === "out").reduce((s, m) => s + m.amount, 0);
  const expected = cashIn - cashOut;
  return (
    <div>
      <SubHeader title="Cashier" subtitle="Current shift · Admin · opened 08:00"
        right={<button style={{ background: "var(--error)", color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 16px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>Close Shift</button>} />
      <div style={{ padding: "22px 30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
          <InvStat label="Cash Sales" value={fmt(496.65)} color="var(--success)" />
          <InvStat label="Card Sales" value={fmt(742.10)} color="var(--info)" />
          <InvStat label="Cash Out" value={fmt(cashOut)} color="var(--error)" />
          <InvStat label="Expected in Drawer" value={fmt(expected)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
            overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ padding: "14px 18px", fontWeight: 700, fontSize: 15, borderBottom: "1px solid var(--border)" }}>Cash Movements</div>
            {CASH_MOVES.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px",
                borderBottom: i < CASH_MOVES.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.reason}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{m.time}</div>
                </div>
                <span style={{ fontWeight: 700, color: m.type === "in" ? "var(--success)" : "var(--error)" }}>
                  {m.type === "in" ? "+" : "−"}{fmt(m.amount)}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
            padding: 20, boxShadow: "var(--shadow-card)", height: "fit-content" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Drawer Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={drawerBtn}>＋ Cash In</button>
              <button style={drawerBtn}>− Cash Out</button>
              <button style={drawerBtn}>🖨 Print X-Report</button>
              <button style={{ ...drawerBtn, background: "var(--primary)", color: "#fff", border: "none" }}>Count Drawer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const drawerBtn = { padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text-primary)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, textAlign: "left" };

Object.assign(window, { CustomersScreen, CashierScreen });
