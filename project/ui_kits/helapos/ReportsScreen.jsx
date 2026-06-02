/* HelaPOS — Reports. KPI cards + a weekly sales bar chart + top products. */
function ReportsScreen({ onBack }) {
  const D = window.HELA_DATA, fmt = D.fmt;
  const max = Math.max(...D.weekSales.map((d) => d.v));

  return (
    <div>
      <SubHeader title="Reports & Analytics" subtitle="This week's performance" onBack={onBack}
        right={<div style={{ display: "flex", gap: 8 }}>
          {["Day", "Week", "Month"].map((p, i) => (
            <span key={p} style={{ fontSize: 13, fontWeight: 600, borderRadius: 16, padding: "8px 16px",
              background: i === 1 ? "var(--primary)" : "var(--bg-secondary)",
              color: i === 1 ? "#fff" : "var(--text-secondary)" }}>{p}</span>
          ))}
        </div>} />

      <div style={{ padding: "28px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 15, marginBottom: 28 }}>
          {[["💰", "Total Sales", fmt(13330), "+8.4%"], ["🧾", "Transactions", "642", "+5.1%"],
            ["📦", "Items Sold", "1,884", "+9.7%"], ["📈", "Avg Sale", fmt(20.76), "+3.2%"]].map(([ic, l, v, d]) => (
            <Card key={l} lift>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 30 }}>{ic}</span><Badge tone="success">{d}</Badge>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", margin: "12px 0 4px" }}>{l}</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 15 }}>
          {/* Bar chart */}
          <Card lift>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>📊 Sales by Day</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 220 }}>
              {D.weekSales.map((d, i) => (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%", borderRadius: "6px 6px 0 0", height: (d.v / max * 100) + "%",
                      background: i === 5 ? "var(--accent-gradient)" : "var(--bg-tertiary)",
                      position: "relative",
                    }} title={fmt(d.v)}>
                      <span style={{ position: "absolute", top: -20, left: 0, right: 0, textAlign: "center",
                        fontSize: 11, fontWeight: 600, color: i === 5 ? "var(--primary)" : "var(--text-tertiary)" }}>
                        {(d.v / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top products w/ progress */}
          <Card lift>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>🏆 Top Sellers</div>
            {[["Cappuccino", 92], ["Croissant", 74], ["Iced Latte", 61], ["Cold Brew", 48], ["Muffin", 35]].map(([n, pct]) => (
              <div key={n} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{n}</span><span style={{ color: "var(--text-secondary)" }}>{pct}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--bg-secondary)" }}>
                  <div style={{ height: "100%", width: pct + "%", borderRadius: 4, background: "var(--accent-gradient)" }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

window.ReportsScreen = ReportsScreen;
