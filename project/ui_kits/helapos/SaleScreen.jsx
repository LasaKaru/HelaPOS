/* HelaPOS — Home (restaurant POS): menu grid + Order Details panel.
   Layout inspired by tablet restaurant-POS references, themed in HelaO2 navy. */
const { useState: useStateSale } = React;

/* Page header used by Reports / Settings (kept global) */
function SubHeader({ title, subtitle, onBack, right }) {
  return (
    <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)",
      padding: "18px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer",
          fontSize: 20, color: "var(--text-secondary)" }}>←</button>}
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* Simple honest empty-state for modules not built out in the kit */
function Placeholder({ icon, title }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", color: "var(--text-tertiary)", gap: 10 }}>
      <div style={{ fontSize: 54 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-secondary)" }}>{title}</div>
      <div style={{ fontSize: 13 }}>This module isn't built out in the UI kit yet.</div>
    </div>
  );
}

function MenuCard({ p, photo, onAdd }) {
  const [h, setH] = useStateSale(false), [press, setPress] = useStateSale(false);
  return (
    <button onClick={onAdd} onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        background: "var(--surface)", border: "1px solid " + (h ? "var(--primary)" : "var(--border)"),
        borderRadius: "var(--radius-lg)", padding: 10, cursor: "pointer", textAlign: "center",
        boxShadow: h ? "var(--shadow-hover)" : "var(--shadow-card)", transform: press ? "scale(0.97)" : "scale(1)",
        transition: "all var(--dur-fast) var(--ease-quick)", fontFamily: "var(--font-sans)" }}>
      <div style={{ height: 92, borderRadius: 10, background: photo ? ("center/cover no-repeat url(" + photo + ")") : p.tile,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, marginBottom: 10 }}>{photo ? "" : p.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", minHeight: 34,
        display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1.25 }}>{p.name}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{window.HELA_DATA.fmt(p.price)}</div>
    </button>
  );
}

function HomeScreen({ cart, setCart, table, query, onProceed, orderType, setOrderType, held, onHold, onRecall }) {
  const D = window.HELA_DATA, fmt = D.fmt;
  const [cat, setCat] = useStateSale("lunch");
  const [open, setOpen] = useStateSale(null); // expanded line item id
  const [heldOpen, setHeldOpen] = useStateSale(false);
  const photos = window.HELA_PHOTOS.load();
  const q = query || "";

  let list = D.products.filter((p) => p.cat === cat);
  if (q.trim()) list = D.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const add = (p) => { setCart((c) => {
    const f = c.find((i) => i.id === p.id);
    if (f) return c.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
    return [...c, { ...p, qty: 1, discount: 0 }];
  }); setOpen(p.id); };
  const patch = (id, k, v) => setCart((c) => c.map((i) => i.id === id ? { ...i, [k]: v } : i));
  const setQty = (id, n) => setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, n) } : i));
  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountTotal = cart.reduce((s, i) => s + i.price * i.qty * (i.discount || 0) / 100, 0);
  const tax = subtotal * D.TAX_RATE;
  const payable = Math.round((subtotal - discountTotal + tax) * 100) / 100;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 372px", height: "100%", minHeight: 0 }}>
      {/* Menu side */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, padding: "16px 22px", borderBottom: "1px solid var(--border)",
          overflowX: "auto" }}>
          {D.categories.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              fontSize: 14, fontWeight: 600, borderRadius: 10, padding: "9px 16px", cursor: "pointer",
              border: "none", whiteSpace: "nowrap", fontFamily: "var(--font-sans)",
              background: cat === c.id && !q ? "var(--primary)" : "transparent",
              color: cat === c.id && !q ? "#fff" : "var(--text-secondary)" }}>{c.name}</button>
          ))}
        </div>
        {/* Grid */}
        <div style={{ padding: "20px 22px", overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(158px,1fr))", gap: 16 }}>
            {list.map((p) => <MenuCard key={p.id} p={p} photo={photos[p.id]} onAdd={() => add(p)} />)}
          </div>
        </div>
      </div>

      {/* Order panel */}
      <div style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Header */}
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex",
          justifyContent: "space-between", alignItems: "center" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", color: "var(--text-primary)", fontWeight: 600, fontSize: 14, fontFamily: "var(--font-sans)" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>+</span>
            Add Customer</button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", fontSize: 15, position: "relative" }}>
            {held && held.length > 0 && (
              <button onClick={() => setHeldOpen((v) => !v)} style={{ background: "var(--primary-light)", color: "var(--primary)",
                border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans)" }}>
                ⏸ Held {held.length}</button>
            )}
            <span style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "5px 9px" }}>🧾</span>
            <span style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "5px 9px" }}>↻</span>
            {heldOpen && held.length > 0 && (
              <div style={{ position: "absolute", right: 0, top: 40, width: 252, background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-floating)", zIndex: 40, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>Held Orders</div>
                {held.map((h) => (
                  <div key={h.id} onClick={() => { onRecall(h); setHeldOpen(false); }} style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{h.type}{h.table ? " · " + h.table : ""}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{h.items.length} items · {h.time}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{fmt(h.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order meta + type */}
        <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
            <span>Order <b style={{ color: "var(--text-primary)" }}>#ORD-00483</b></span>
            <span>Table <b style={{ color: "var(--primary)" }}>{table || "—"}</b></span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Dine in", "Takeaway", "Delivery"].map((t) => (
              <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: "7px 0", borderRadius: 8,
                border: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
                background: orderType === t ? "var(--primary)" : "var(--bg)", color: orderType === t ? "#fff" : "var(--text-secondary)" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {cart.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>🍽️</div>No items yet.<br />Tap a dish to start the order.
            </div>
          ) : cart.map((i) => {
            const expanded = open === i.id;
            return (
              <div key={i.id} style={{ borderBottom: "1px solid var(--border)",
                borderLeft: expanded ? "3px solid var(--success)" : "3px solid transparent" }}>
                <div onClick={() => setOpen(expanded ? null : i.id)} style={{ display: "flex", alignItems: "center",
                  gap: 10, padding: "12px 16px", cursor: "pointer" }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 12, transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▶</span>
                  <span style={{ minWidth: 18, fontWeight: 700, color: "var(--text-primary)" }}>{i.qty}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                    {i.discount > 0 && <div style={{ fontSize: 11, color: "var(--success)" }}>{i.discount}% off</div>}
                    {i.note && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>📝 {i.note}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fmt(i.price * i.qty * (1 - (i.discount || 0) / 100))}</div>
                    {i.discount > 0 && <div style={{ fontSize: 11, color: "var(--text-tertiary)", textDecoration: "line-through" }}>{fmt(i.price * i.qty)}</div>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(i.id); }} style={{ background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-tertiary)", fontSize: 16 }}>✕</button>
                </div>
                {expanded && (
                  <div style={{ padding: "0 16px 14px 42px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <label style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>Quantity
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                          <StepBtn onClick={() => setQty(i.id, i.qty - 1)}>−</StepBtn>
                          <input value={i.qty} onChange={(e) => setQty(i.id, parseInt(e.target.value) || 1)}
                            style={inpStyle} />
                          <StepBtn onClick={() => setQty(i.id, i.qty + 1)}>+</StepBtn>
                        </div></label>
                      <label style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>Discount(%)
                        <input value={i.discount || 0} onChange={(e) => patch(i.id, "discount", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          style={{ ...inpStyle, width: "100%", marginTop: 5 }} /></label>
                    </div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginTop: 10 }}>Note
                      <input value={i.note || ""} onChange={(e) => patch(i.id, "note", e.target.value)} placeholder="e.g. no chilli, extra sauce"
                        style={{ ...inpStyle, width: "100%", marginTop: 5, textAlign: "left" }} /></label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add row */}
        <div style={{ display: "flex", gap: 18, padding: "11px 18px", background: "var(--primary-light)",
          fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: "var(--text-secondary)" }}>Add</span>
          <span style={{ color: "var(--primary)", cursor: "pointer" }}>Discount</span>
          <span style={{ color: "var(--primary)", cursor: "pointer" }}>Coupon Code</span>
          <span style={{ color: "var(--primary)", cursor: "pointer" }}>Note</span>
        </div>

        {/* Totals */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
          <Tot k="Subtotal" v={fmt(subtotal)} />
          {discountTotal > 0 && <Tot k="Discount" v={"– " + fmt(discountTotal)} tone="success" />}
          <Tot k={"Tax (" + (D.TAX_RATE * 100) + "%)"} v={fmt(tax)} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Payable Amount</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{fmt(payable)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 18px 18px" }}>
          <button disabled={!cart.length} onClick={onHold} style={{ ...actBtn, background: "var(--bg-secondary)",
            color: "var(--text-primary)", border: "1px solid var(--border)", opacity: cart.length ? 1 : .5 }}>⏸ Hold Order</button>
          <button disabled={!cart.length} onClick={() => onProceed(payable)} style={{ ...actBtn, background: "var(--success)",
            color: "#fff", opacity: cart.length ? 1 : .5 }}>✓ Proceed</button>
        </div>
      </div>
    </div>
  );
}

const inpStyle = { width: 44, textAlign: "center", padding: "7px 4px", borderRadius: 6,
  border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)",
  fontFamily: "var(--font-sans)", fontSize: 14, outline: "none" };
const actBtn = { padding: "13px 0", borderRadius: 10, border: "none", cursor: "pointer",
  fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700 };

function StepBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ width: 28, height: 30, borderRadius: 6, border: "1px solid var(--border)",
    background: "var(--bg)", cursor: "pointer", fontSize: 16, color: "var(--text-primary)" }}>{children}</button>;
}
function Tot({ k, v, tone }) {
  return <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{k}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: tone === "success" ? "var(--success)" : "var(--text-primary)" }}>{v}</span></div>;
}

Object.assign(window, { SubHeader, Placeholder, HomeScreen });
window.SaleScreen = HomeScreen; // back-comat alias
