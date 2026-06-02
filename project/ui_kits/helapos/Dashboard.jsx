/* HelaPOS — Dashboard. Faithful to Views/ModernDashboardView.xaml:
   orange-gradient header greeting, 4-up stat row, week/month, quick-action grid,
   recent transactions + top products. */
function StatCard({ icon, label, value, delta, gradient, onClick, sub }) {
  return (
    <Card lift style={gradient ? { background: "var(--accent-gradient)", border: "none", minHeight: 120 } : { minHeight: 120 }} onClick={onClick}>
      {gradient ? (
        <div style={{ textAlign: "center", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
          <div style={{ fontSize: 40 }}>{icon}</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>{label}</div>
        </div>
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            {delta && <Badge tone="success">{delta}</Badge>}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", margin: "12px 0 4px" }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{sub}</div>}
        </React.Fragment>
      )}
    </Card>
  );
}

function QuickAction({ icon, title, sub, onClick, badge }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? "var(--bg-secondary)" : "var(--surface)",
        border: "1px solid " + (h ? "var(--primary)" : "var(--border)"),
        borderRadius: "var(--radius-lg)", padding: 20, cursor: "pointer", textAlign: "center",
        boxShadow: h ? "var(--shadow-floating)" : "var(--shadow-elevated)",
        transform: h ? "translateY(-4px)" : "none", transition: "all var(--dur-fast) var(--ease-quick)",
        fontFamily: "var(--font-sans)",
      }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={{ fontSize: 36 }}>{icon}</span>
        {badge != null && <span style={{ position: "absolute", top: -4, right: -10, background: "var(--error)",
          color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 12, padding: "2px 6px" }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, margin: "8px 0 4px", color: "var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{sub}</div>
    </button>
  );
}

function Dashboard({ onNewSale, onReports, onSettings, user }) {
  const D = window.HELA_DATA, fmt = D.fmt;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      {/* Gradient header */}
      <div style={{ background: "var(--accent-gradient)", padding: "30px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{greet}, {user.name}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 8 }}>
            {dateStr} <span style={{ opacity: 0.7 }}>•</span> {user.role}
          </div>
        </div>
        <img src="assets/helao2-logo.jpg" alt="HelaO2" style={{ height: 40, borderRadius: 6, background: "#fff", padding: "4px 8px" }} />
      </div>

      <div style={{ padding: "30px 40px" }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Today's Performance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 15, marginBottom: 30 }}>
          <StatCard icon="💰" label="Total Sales" value={fmt(4820.50)} delta="+12%" />
          <StatCard icon="🧾" label="Transactions" value="128" sub="Avg: $37.66" />
          <StatCard icon="👥" label="Customers Served" value="96" />
          <StatCard icon="➕" label="Start New Sale" gradient onClick={onNewSale} />
        </div>

        {/* Week / Month */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 30 }}>
          {[["📊 This Week", fmt(13330), "↑ 8.4%", "642"], ["📈 This Month", fmt(58940), "↑ 14.1%", "2,840"]].map(([t, s, g, tx]) => (
            <Card key={t} lift>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 15 }}>{t}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sales</div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{s}</div>
                </div>
                <Badge tone="success" style={{ padding: "6px 10px" }}>{g}</Badge>
              </div>
              <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Transactions</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{tx}</span>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 15, marginBottom: 30 }}>
          <QuickAction icon="📦" title="Inventory" sub="16 products" />
          <QuickAction icon="👥" title="Customers" sub="2 customers" />
          <QuickAction icon="👔" title="Employees" sub="4 active" />
          <QuickAction icon="📊" title="Reports" sub="View Analytics" onClick={onReports} />
          <QuickAction icon="⚠️" title="Stock Alerts" sub="5 low stock" badge="5" />
          <QuickAction icon="⚙️" title="Settings" sub="Configure System" onClick={onSettings} />
        </div>

        {/* Recent + top */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 15 }}>
          <Card lift>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 15 }}>🕐 Recent Transactions</div>
            {D.recentTx.map((t) => (
              <div key={t.no} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.no}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Today {t.time}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{fmt(t.total)}</div>
              </div>
            ))}
          </Card>
          <Card lift>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 15 }}>🏆 Top Products</div>
            {D.topProducts.map((p) => (
              <div key={p.name} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--primary)", marginTop: 2 }}>{fmt(p.price)}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
