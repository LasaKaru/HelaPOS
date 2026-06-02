/* HelaPOS — Payment modal. Faithful to Views/PaymentWindow.xaml:
   method radios, cash tendered + quick-cash grid, change due, summary rail. */
const { useState: useStatePay } = React;

function PaymentModal({ total, onClose, onComplete }) {
  const fmt = window.HELA_DATA.fmt;
  const [method, setMethod] = useStatePay("Cash");
  const [tendered, setTendered] = useStatePay("");
  const [done, setDone] = useStatePay(false);

  const t = parseFloat(tendered) || 0;
  const change = Math.max(0, t - total);
  const canComplete = method === "Cash" ? Math.round(t * 100) >= Math.round(total * 100) : true;

  const complete = () => { setDone(true); setTimeout(() => onComplete({ method, tendered: t, change }), 1100); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 860, maxWidth: "94vw", height: 600, maxHeight: "92vh", background: "var(--bg)",
        borderRadius: "var(--radius-lg)", overflow: "hidden", display: "grid",
        gridTemplateColumns: "1fr 320px", boxShadow: "var(--shadow-floating)" }}>

        {done ? (
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 16 }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--success-gradient)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>✓</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>Payment Complete</div>
            <div style={{ color: "var(--text-secondary)" }}>Receipt RCP-00483 · {fmt(total)}</div>
            {method === "Cash" && change > 0 && <div style={{ color: "var(--success)", fontWeight: 600 }}>Change due {fmt(change)}</div>}
          </div>
        ) : (
          <React.Fragment>
            {/* Left form */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "20px 30px", borderBottom: "1px solid var(--border)", background: "var(--surface)",
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>Process Payment</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Select method and enter details</div>
                </div>
                <div style={{ background: "var(--primary)", color: "#fff", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11 }}>Amount Due</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{fmt(total)}</div>
                </div>
              </div>

              <div style={{ padding: "20px 30px", overflow: "auto", flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>Payment Method *</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
                  {[["Cash", "💵"], ["Card", "💳"], ["Mobile", "📱"], ["Mixed", "🔀"]].map(([m, ic]) => (
                    <button key={m} onClick={() => setMethod(m)} style={{
                      padding: "14px 6px", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-sans)",
                      fontSize: 13, fontWeight: 600, textAlign: "center",
                      border: "1px solid " + (method === m ? "var(--primary)" : "var(--border)"),
                      background: method === m ? "var(--primary-light)" : "var(--surface)",
                      color: "var(--text-primary)" }}>
                      <div style={{ fontSize: 22 }}>{ic}</div>{m}</button>
                  ))}
                </div>

                {method === "Cash" ? (
                  <Card>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>💵 Cash Payment</div>
                    <Field label="Cash Tendered" required value={tendered} onChange={setTendered} placeholder="0.00" fontSize={20} />
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", margin: "16px 0 10px" }}>Quick Amount</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {[5, 10, 20, 50, 100].map((a) => (
                        <Button key={a} variant="secondary" onClick={() => setTendered(String(a))} style={{ padding: "10px 0" }}>${a}</Button>
                      ))}
                      <Button variant="secondary" onClick={() => setTendered(total.toFixed(2))} style={{ padding: "10px 0" }}>Exact</Button>
                    </div>
                    {t > 0 && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 18, marginTop: 18,
                        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Change Due</span>
                        <span style={{ fontSize: 30, fontWeight: 700, color: "var(--success)" }}>{fmt(change)}</span>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                      {method === "Card" ? "💳 Card Payment" : method === "Mobile" ? "📱 Mobile Payment" : "🔀 Mixed Payment"}</div>
                    <div style={{ background: "rgba(245,158,11,0.12)", borderRadius: 6, padding: 12,
                      fontSize: 12, color: "var(--text-secondary)" }}>
                      ⚠️ Demo Mode: {method} payments are simulated. Click Complete to finish.</div>
                  </Card>
                )}
              </div>
            </div>

            {/* Right summary */}
            <div style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)",
              display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "15px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
                fontSize: 18, fontWeight: 700 }}>Payment Summary</div>
              <div style={{ flex: 1, padding: 20 }}>
                <SumRow k="Method" v={method} />
                <SumRow k="Total" v={fmt(total)} />
                {method === "Cash" && <SumRow k="Tendered" v={fmt(t)} tone="success" />}
              </div>
              <div style={{ padding: 20, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
                <Button full disabled={!canComplete} onClick={complete} style={{ height: 48, fontSize: 16 }}>Complete Transaction</Button>
                <Button full variant="secondary" onClick={onClose} style={{ height: 44 }}>Cancel</Button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function SumRow({ k, v, tone }) {
  return <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{k}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: tone === "success" ? "var(--success)" : "var(--text-primary)" }}>{v}</span></div>;
}

window.PaymentModal = PaymentModal;
