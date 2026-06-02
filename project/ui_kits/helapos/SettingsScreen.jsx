/* HelaPOS — Settings. Users customize store identity, brand image, theme & accent color.
   Changes apply live (via HELA_CONFIG.apply) and persist to localStorage. */
const { useRef: useRefSet } = React;

function SettingsScreen({ onBack, cfg, setCfg }) {
  const fileRef = useRefSet(null);
  const A = window.HELA_ACCENTS;

  const update = (patch) => setCfg((c) => ({ ...c, ...patch }));

  const onPickLogo = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => update({ logo: r.result });
    r.readAsDataURL(f);
  };

  return (
    <div>
      <SubHeader title="Settings" subtitle="Customize your store identity & appearance" onBack={onBack} />
      <div style={{ padding: "28px 40px", maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Store identity */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>🏪 Store Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Store Name" value={cfg.storeName} onChange={(v) => update({ storeName: v })} />
            <Field label="Tagline" value={cfg.storeTagline} onChange={(v) => update({ storeTagline: v })} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Field label="Receipt Address" value={cfg.address} onChange={(v) => update({ address: v })} />
          </div>
        </Card>

        {/* Brand image */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>🖼️ Brand Image</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18 }}>
            Shown in the top bar, login screen and on printed receipts.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 180, height: 80, borderRadius: 8, border: "1px dashed var(--border-hover)",
              background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {cfg.logo
                ? <img src={cfg.logo} alt="brand" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                : <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No image</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickLogo} style={{ display: "none" }} />
              <Button variant="secondary" onClick={() => fileRef.current && fileRef.current.click()}>Upload Image</Button>
              {cfg.logo && <Button variant="ghost" onClick={() => update({ logo: null })}
                style={{ color: "var(--error)", padding: "8px 12px" }}>Remove</Button>}
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>🎨 Appearance</div>

          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Theme</div>
          <div style={{ display: "inline-flex", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
            {[["light", "☀️ Light"], ["dark", "🌙 Dark"]].map(([k, l]) => (
              <button key={k} onClick={() => update({ theme: k })} style={{
                padding: "9px 20px", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
                fontSize: 13, fontWeight: 600,
                background: cfg.theme === k ? "var(--primary)" : "var(--surface)",
                color: cfg.theme === k ? "#fff" : "var(--text-secondary)" }}>{l}</button>
            ))}
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Accent Color</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {Object.keys(A).map((k) => {
              const sel = cfg.accent === k;
              return (
                <button key={k} onClick={() => update({ accent: k })} title={A[k].name} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "none",
                  background: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  <span style={{ width: 46, height: 46, borderRadius: "50%", background: A[k].grad,
                    boxShadow: sel ? "0 0 0 3px var(--surface), 0 0 0 5px " + A[k].primary : "inset 0 0 0 1px rgba(0,0,0,.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>
                    {sel ? "✓" : ""}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: sel ? "var(--text-primary)" : "var(--text-secondary)" }}>{A[k].name}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 22, padding: 16, borderRadius: 8, background: "var(--accent-gradient)", color: "#fff" }}>
            <div style={{ fontSize: 13, opacity: .85 }}>Live preview</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>This is your accent color</div>
          </div>
        </Card>

        <div style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", paddingBottom: 10 }}>
          Changes are saved automatically and applied across the whole app.
        </div>
      </div>
    </div>
  );
}

window.SettingsScreen = SettingsScreen;
