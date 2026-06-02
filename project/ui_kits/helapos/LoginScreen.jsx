/* HelaPOS — Login screen. Faithful to Views/LoginView.xaml (centered card on subtle wash). */
const { useState: useStateLogin } = React;

function LoginScreen({ onLogin, cfg }) {
  const [u, setU] = useStateLogin("admin");
  const [p, setP] = useStateLogin("admin123");
  const [err, setErr] = useStateLogin("");
  const [loading, setLoading] = useStateLogin(false);

  const submit = () => {
    setErr("");
    if (u === "admin" && p === "admin123") {
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin({ name: "Admin", role: "Administrator" }); }, 650);
    } else {
      setErr("Invalid username or password. Use the demo credentials below.");
    }
  };

  return (
    <div style={{
      minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, var(--bg) 0%, var(--bg-secondary) 100%)", padding: 40,
    }}>
      <div style={{
        width: 400, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", padding: 40,
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {cfg && cfg.logo
            ? <img src={cfg.logo} alt="brand" style={{ height: 48, maxWidth: 220, objectFit: "contain" }} />
            : <img src="assets/helao2-logo.jpg" alt="HelaO2" style={{ height: 46, borderRadius: 6 }} />}
        </div>
        <div style={{ fontSize: 16, color: "var(--text-secondary)", textAlign: "center", marginBottom: 36 }}>
          {cfg ? cfg.storeName + " · " + cfg.storeTagline : "HelaPOS · Point of Sale"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Username" value={u} onChange={setU} />
          <Field label="Password" type="password" value={p} onChange={setP} />
          {err && <div style={{ color: "var(--error)", fontSize: 12 }}>{err}</div>}
          <Button full onClick={submit} style={{ height: 44, marginTop: 4 }}>
            {loading ? "Signing in…" : "Login"}
          </Button>
          {loading && (
            <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "40%", background: "var(--primary)",
                animation: "helaIndet 1s linear infinite" }} />
            </div>
          )}
        </div>

        <div style={{ background: "var(--bg-secondary)", borderRadius: 6, padding: 12, marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Demo Credentials</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Username: admin</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Password: admin123</div>
        </div>
      </div>
      <style>{`@keyframes helaIndet{0%{margin-left:-40%}100%{margin-left:100%}}`}</style>
    </div>
  );
}

window.LoginScreen = LoginScreen;
