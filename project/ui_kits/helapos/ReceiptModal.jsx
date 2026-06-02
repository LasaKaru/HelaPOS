/* HelaPOS — Receipt. Printable sales receipt shown after a completed payment.
   Narrow monospace "paper" with store identity, line items, totals & payment. */
function ReceiptModal({ sale, cfg, onClose, onNewSale }) {
  const fmt = window.HELA_DATA.fmt;
  const dash = "------------------------------";

  return (
    <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(11,30,64,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

        {/* Paper */}
        <div className="receipt-paper" style={{
          width: 340, background: "#fff", color: "#111827", borderRadius: 10,
          boxShadow: "var(--shadow-floating)", padding: "26px 28px",
          fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.7 }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            {cfg.logo
              ? <img src={cfg.logo} alt="" style={{ maxHeight: 46, maxWidth: 180, marginBottom: 6 }} />
              : <div style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800, letterSpacing: ".5px" }}>{cfg.storeName}</div>}
            <div style={{ fontSize: 11, color: "#6B7280" }}>{cfg.address}</div>
          </div>

          <div style={{ color: "#9CA3AF" }}>{dash}</div>
          <Line l="Receipt" r={sale.no} />
          <Line l="Date" r={sale.date} />
          {sale.type && <Line l="Type" r={sale.type} />}
          {sale.table && <Line l="Table" r={sale.table} />}
          <Line l="Cashier" r="Admin" />
          <div style={{ color: "#9CA3AF" }}>{dash}</div>

          {/* Items */}
          {sale.items.map((i) => (
            <div key={i.id} style={{ margin: "4px 0" }}>
              <div>{i.name}</div>
              <Line l={"  " + i.qty + " x " + fmt(i.price)} r={fmt(i.qty * i.price)} />
            </div>
          ))}

          <div style={{ color: "#9CA3AF" }}>{dash}</div>
          <Line l="Subtotal" r={fmt(sale.subtotal)} />
          {sale.discount > 0 && <Line l="Discount" r={"-" + fmt(sale.discount)} />}
          <Line l={"Tax (" + (window.HELA_DATA.TAX_RATE * 100) + "%)"} r={fmt(sale.tax)} />
          <Line l="TOTAL" r={fmt(sale.total)} bold />
          <div style={{ color: "#9CA3AF" }}>{dash}</div>
          <Line l={"Paid (" + sale.method + ")"} r={fmt(sale.method === "Cash" ? sale.tendered : sale.total)} />
          {sale.method === "Cash" && <Line l="Change" r={fmt(sale.change)} />}
          <div style={{ color: "#9CA3AF" }}>{dash}</div>

          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#6B7280" }}>
            {sale.items.reduce((s, i) => s + i.qty, 0)} item(s) · Thank you!
          </div>
          <div style={{ textAlign: "center", fontFamily: "var(--font-sans)", letterSpacing: 4,
            fontSize: 22, marginTop: 8 }}>||█|||█|█||██|█|</div>
        </div>

        {/* Actions */}
        <div className="no-print" style={{ display: "flex", gap: 10 }}>
          <Button onClick={() => window.print()}>🖨️ Print Receipt</Button>
          <Button variant="secondary" onClick={onNewSale}>New Sale</Button>
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

function Line({ l, r, bold }) {
  return <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 700 : 400,
    fontSize: bold ? 14 : 12.5 }}><span>{l}</span><span>{r}</span></div>;
}

window.ReceiptModal = ReceiptModal;
