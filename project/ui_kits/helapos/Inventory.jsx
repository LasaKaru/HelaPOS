/* HelaPOS — Inventory & Stock management. Adjust stock, see status, and upload dish
   photos (which then appear on the Home menu cards). Navy-themed, no orange. */
const { useState: useStateInv, useRef: useRefInv } = React;

const STOCK_KEY = "hela.stock.v1";
const BASE_STOCK = { 6: 6, 8: 4, 15: 9, 16: 7, 20: 8, 21: 5, 25: 3, 28: 0, 14: 0 };
function loadStock() {
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(STOCK_KEY) || "{}"); } catch (e) {}
  const map = {};
  window.HELA_DATA.products.forEach((p) => {
    map[p.id] = saved[p.id] != null ? saved[p.id] : (BASE_STOCK[p.id] != null ? BASE_STOCK[p.id] : 40);
  });
  return map;
}
function stockStatus(n) {
  if (n <= 0) return { label: "Out of Stock", color: "var(--error)", soft: "rgba(239,68,68,.10)" };
  if (n <= 10) return { label: "Low Stock", color: "var(--info)", soft: "rgba(59,130,246,.10)" };
  return { label: "In Stock", color: "var(--success)", soft: "rgba(16,185,129,.10)" };
}

function InvStat({ label, value, color }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
      padding: "16px 18px", boxShadow: "var(--shadow-card)" }}>
      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || "var(--text-primary)", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function InvRow({ p, qty, photo, onAdjust, onPhoto }) {
  const ref = useRefInv(null);
  const s = stockStatus(qty);
  const fmt = window.HELA_DATA.fmt;
  const pick = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => onPhoto(p.id, r.result); r.readAsDataURL(f); };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "56px 2fr 1.1fr .9fr 1.4fr 1.1fr", alignItems: "center",
      gap: 8, padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
      <div onClick={() => ref.current.click()} title="Upload photo"
        style={{ width: 44, height: 44, borderRadius: 8, cursor: "pointer", overflow: "hidden",
          background: photo ? ("center/cover no-repeat url(" + photo + ")") : p.tile,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid var(--border)" }}>
        {photo ? "" : p.icon}
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>SKU-{String(p.id).padStart(4, "0")}</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{p.cat}</div>
      <div style={{ fontWeight: 700 }}>{fmt(p.price)}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => onAdjust(p.id, -1)} style={invBtn}>−</button>
        <span style={{ minWidth: 30, textAlign: "center", fontWeight: 700 }}>{qty}</span>
        <button onClick={() => onAdjust(p.id, 1)} style={invBtn}>+</button>
      </div>
      <span><span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: s.soft, borderRadius: 20, padding: "4px 12px" }}>{s.label}</span></span>
    </div>
  );
}
const invBtn = { width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
  background: "var(--bg)", cursor: "pointer", fontSize: 16, color: "var(--text-primary)", fontFamily: "var(--font-sans)" };

function InventoryScreen() {
  const D = window.HELA_DATA, fmt = D.fmt;
  const [stock, setStock] = useStateInv(loadStock);
  const [photos, setPhotos] = useStateInv(() => window.HELA_PHOTOS.load());
  const [cat, setCat] = useStateInv("all");
  const [query, setQuery] = useStateInv("");

  const adjust = (id, d) => setStock((s) => { const n = { ...s, [id]: Math.max(0, (s[id] || 0) + d) };
    localStorage.setItem(STOCK_KEY, JSON.stringify(n)); return n; });
  const setPhoto = (id, url) => setPhotos((p) => { const n = { ...p, [id]: url }; window.HELA_PHOTOS.save(n); return n; });

  let list = D.products;
  if (cat !== "all") list = list.filter((p) => p.cat === cat);
  if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const vals = D.products.map((p) => stock[p.id] || 0);
  const inStock = vals.filter((n) => n > 10).length;
  const low = vals.filter((n) => n > 0 && n <= 10).length;
  const out = vals.filter((n) => n <= 0).length;
  const stockValue = D.products.reduce((s, p) => s + p.price * (stock[p.id] || 0), 0);

  return (
    <div>
      <SubHeader title="Inventory & Stock" subtitle="Stock levels · tap a thumbnail to set a dish photo" />
      <div style={{ padding: "22px 30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 22 }}>
          <InvStat label="Products" value={D.products.length} />
          <InvStat label="In Stock" value={inStock} color="var(--success)" />
          <InvStat label="Low Stock" value={low} color="var(--info)" />
          <InvStat label="Out of Stock" value={out} color="var(--error)" />
          <InvStat label="Stock Value" value={fmt(stockValue)} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          {["all", ...D.categories.map((c) => c.id)].map((f) => (
            <button key={f} onClick={() => setCat(f)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 16,
              padding: "7px 14px", border: "none", cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--font-sans)",
              background: cat === f ? "var(--primary)" : "var(--bg-secondary)", color: cat === f ? "#fff" : "var(--text-secondary)" }}>{f}</button>
          ))}
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…"
            style={{ marginLeft: "auto", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--bg)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: 13, outline: "none", width: 200 }} />
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
          overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "56px 2fr 1.1fr .9fr 1.4fr 1.1fr", gap: 8,
            padding: "12px 18px", background: "var(--bg-secondary)", fontSize: 12, fontWeight: 700,
            color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
            <span>Photo</span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span>
          </div>
          {list.map((p) => <InvRow key={p.id} p={p} qty={stock[p.id] || 0} photo={photos[p.id]} onAdjust={adjust} onPhoto={setPhoto} />)}
        </div>
      </div>
    </div>
  );
}

window.InventoryScreen = InventoryScreen;
