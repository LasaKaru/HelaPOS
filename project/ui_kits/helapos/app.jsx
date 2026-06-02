/* HelaPOS UI Kit — restaurant POS shell.
   Left icon rail + top search/Select-Table bar. Home (menu + order) → Payment → Receipt,
   plus Reports & Settings. Identity, theme & accent are user-customizable (Settings). */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const NAV = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "tables", icon: "🍽️", label: "Tables" },
  { id: "cashier", icon: "💵", label: "Cashier" },
  { id: "inventory", icon: "📦", label: "Inventory" },
  { id: "orders", icon: "🧾", label: "Orders" },
  { id: "reports", icon: "📊", label: "Reports" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function Rail({ screen, setScreen, onLogout }) {
  return (
    <div className="no-print" style={{ width: 86, flex: "none", background: "var(--surface)",
      borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 0" }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand-navy)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, marginBottom: 18 }}>H</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, width: "100%", alignItems: "center" }}>
        {NAV.map((n) => {
          const on = screen === n.id;
          return (
            <button key={n.id} onClick={() => setScreen(n.id)} title={n.label} style={{
              width: 62, padding: "9px 0", borderRadius: 12, border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "var(--font-sans)",
              background: on ? "var(--primary)" : "transparent", color: on ? "#fff" : "var(--text-secondary)" }}>
              <span style={{ fontSize: 20, filter: on ? "grayscale(1) brightness(3)" : "none" }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onLogout} title="Logout" style={{ width: 62, padding: "9px 0", borderRadius: 12, border: "none",
        cursor: "pointer", background: "transparent", color: "var(--text-tertiary)", display: "flex",
        flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "var(--font-sans)" }}>
        <span style={{ fontSize: 20 }}>⏻</span><span style={{ fontSize: 10, fontWeight: 600 }}>Logout</span></button>
    </div>
  );
}

function TopBar({ cfg, setCfg, query, setQuery, table, setTable }) {
  const [openT, setOpenT] = useStateApp(false);
  const brand = cfg.logo
    ? <img src={cfg.logo} alt="brand" style={{ height: 26, maxWidth: 130, objectFit: "contain" }} />
    : <span style={{ fontWeight: 800, fontSize: 19, color: "var(--text-primary)" }}>Hela<span style={{ color: "var(--text-secondary)" }}>POS</span></span>;
  return (
    <div className="no-print" style={{ height: 62, flex: "none", background: "var(--surface)",
      borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, padding: "0 20px" }}>
      {brand}
      <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}>🔍</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products....."
          style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: 10, border: "1px solid var(--border)",
            background: "var(--bg-secondary)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: 14, outline: "none" }} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)" }}>
        <span title="Sync" style={{ cursor: "pointer" }}>↻</span>
        <span title="Online" style={{ color: "var(--success)" }}>📶</span>
      </div>
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenT((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 7,
          background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px",
          cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>
          ▦ {table ? "Table " + table : "Select Table"}</button>
        {openT && (
          <div style={{ position: "absolute", right: 0, top: 48, background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, boxShadow: "var(--shadow-floating)", padding: 8, display: "grid",
            gridTemplateColumns: "repeat(4,1fr)", gap: 6, width: 200, zIndex: 30 }}>
            {window.HELA_DATA.tables.map((t) => (
              <button key={t} onClick={() => { setTable(t); setOpenT(false); }} style={{ padding: "10px 0", borderRadius: 8,
                border: "1px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600,
                background: table === t ? "var(--primary)" : "var(--bg)", color: table === t ? "#fff" : "var(--text-primary)" }}>{t}</button>
            ))}
          </div>
        )}
      </div>
      <ThemeToggle dark={cfg.theme === "dark"} onToggle={() => setCfg((c) => ({ ...c, theme: c.theme === "dark" ? "light" : "dark" }))} />
    </div>
  );
}

function App() {
  const [screen, setScreen] = useStateApp("login");
  const [user, setUser] = useStateApp(null);
  const [cart, setCart] = useStateApp([]);
  const [table, setTable] = useStateApp(null);
  const [query, setQuery] = useStateApp("");
  const [pay, setPay] = useStateApp(null);
  const [receipt, setReceipt] = useStateApp(null);
  const [cfg, setCfg] = useStateApp(window.HELA_CONFIG.load());
  const [rcpNo, setRcpNo] = useStateApp(483);
  const [orderType, setOrderType] = useStateApp("Dine in");
  const [held, setHeld] = useStateApp([]);

  const orderTotal = (items) => {
    const D = window.HELA_DATA;
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    const disc = items.reduce((s, i) => s + i.price * i.qty * (i.discount || 0) / 100, 0);
    return Math.round((sub - disc + sub * D.TAX_RATE) * 100) / 100;
  };
  const onHold = () => {
    if (!cart.length) return;
    setHeld((h) => [...h, { id: Date.now(), items: cart, table, type: orderType,
      total: orderTotal(cart), time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    setCart([]); setTable(null); setOrderType("Dine in");
  };
  const onRecall = (h) => { setCart(h.items); setTable(h.table); setOrderType(h.type); setHeld((p) => p.filter((x) => x.id !== h.id)); };

  useEffectApp(() => { window.HELA_CONFIG.apply(cfg); window.HELA_CONFIG.save(cfg); }, [cfg]);

  const logout = () => { setUser(null); setCart([]); setTable(null); setScreen("login"); };

  const onPaid = (details) => {
    const D = window.HELA_DATA;
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const disc = cart.reduce((s, i) => s + i.price * i.qty * (i.discount || 0) / 100, 0);
    const tax = subtotal * D.TAX_RATE;
    const no = "ORD-" + String(rcpNo).padStart(5, "0");
    setRcpNo((n) => n + 1);
    setReceipt({ no, table, type: orderType, date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      items: cart, subtotal, discount: disc, tax, total: Math.round((subtotal - disc + tax) * 100) / 100, ...details });
    setPay(null);
  };
  const closeReceipt = (again) => { setCart([]); setReceipt(null); setOrderType("Dine in"); if (!again) setTable(null); setScreen("home"); };

  if (screen === "login") return <LoginScreen cfg={cfg} onLogin={(u) => { setUser(u); setScreen("home"); }} />;

  let content;
  if (screen === "reports") content = <ReportsScreen />;
  else if (screen === "settings") content = <SettingsScreen cfg={cfg} setCfg={setCfg} />;
  else if (screen === "customers") content = <CustomersScreen />;
  else if (screen === "tables") content = <TablesScreen onSelectTable={(t) => { setTable(t); setScreen("home"); }} />;
  else if (screen === "cashier") content = <CashierScreen />;
  else if (screen === "inventory") content = <InventoryScreen />;
  else if (screen === "orders") content = <OrdersScreen />;

  return (
    <div style={{ height: "100vh", display: "flex", background: "var(--bg)" }}>
      <Rail screen={screen} setScreen={setScreen} onLogout={logout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar cfg={cfg} setCfg={setCfg} query={query} setQuery={setQuery} table={table} setTable={setTable} />
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {screen === "home"
            ? <HomeScreen cart={cart} setCart={setCart} table={table} query={query} onProceed={(amt) => setPay({ total: amt })}
                orderType={orderType} setOrderType={setOrderType} held={held} onHold={onHold} onRecall={onRecall} />
            : content}
        </div>
      </div>

      {pay && <PaymentModal total={pay.total} onClose={() => setPay(null)} onComplete={onPaid} />}
      {receipt && <ReceiptModal sale={receipt} cfg={cfg} onClose={() => closeReceipt(false)} onNewSale={() => closeReceipt(true)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
