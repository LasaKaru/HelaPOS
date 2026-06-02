/* Shared HelaPOS UI primitives — faithful to the WPF ControlStyles/EnhancedControls. */
const { useState } = React;

/* ---- Button: PrimaryButton / SecondaryButton ---- */
function Button({ variant = "primary", children, onClick, disabled, style, full }) {
  const [press, setPress] = useState(false);
  const base = {
    fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
    borderRadius: "var(--radius-sm)", padding: "12px 24px", cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "background-color var(--dur-fast) var(--ease-quick), border-color var(--dur-fast) var(--ease-quick), box-shadow var(--dur-fast) var(--ease-quick), transform var(--dur-fast) var(--ease-quick)",
    transform: press ? "scale(0.98)" : "scale(1)", width: full ? "100%" : "auto",
    opacity: disabled ? 0.5 : 1, ...style,
  };
  const variants = {
    primary: { background: "var(--primary)", color: "#fff" },
    secondary: { background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" },
    ghost: { background: "transparent", color: "var(--text-secondary)" },
  };
  const hov = {
    primary: { background: "var(--primary-hover)" },
    secondary: { background: "var(--bg-tertiary)", borderColor: "var(--border-hover)" },
    ghost: { background: "var(--bg-secondary)", color: "var(--primary)" },
  };
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{ ...base, ...variants[variant], ...(hover && !disabled ? hov[variant] : {}) }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}>
      {children}
    </button>
  );
}

/* ---- Card: surface + 1px border + soft shadow ---- */
function Card({ children, style, hover, onClick, lift }) {
  const [h, setH] = useState(false);
  const active = lift && h;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)", border: "1px solid " + (active ? "var(--primary)" : "var(--border)"),
        borderRadius: "var(--radius-lg)", padding: 20,
        boxShadow: active ? "var(--shadow-floating)" : "var(--shadow-elevated)",
        transform: active ? "translateY(-4px)" : "none",
        transition: "all var(--dur-fast) var(--ease-quick)",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>
      {children}
    </div>
  );
}

/* ---- Field: label + input ---- */
function Field({ label, type = "text", value, onChange, placeholder, fontSize = 14, required }) {
  const [focus, setFocus] = useState(false), [hover, setHover] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <label style={{ fontSize: 14, fontWeight: 600 }}>{label}{required && " *"}</label>}
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          fontFamily: "var(--font-sans)", fontSize, padding: "10px 12px",
          borderRadius: "var(--radius-sm)", outline: "none", color: "var(--text-primary)",
          background: "var(--bg)",
          border: "1px solid " + (focus ? "var(--primary)" : hover ? "var(--border-hover)" : "var(--border)"),
        }} />
    </div>
  );
}

/* ---- Badge ---- */
function Badge({ tone = "primary", children, style }) {
  const map = {
    primary: "var(--primary)", success: "var(--success)", warning: "var(--warning)",
    error: "var(--error)", info: "var(--info)",
  };
  return (
    <span style={{
      background: map[tone], color: "#fff", fontSize: 11, fontWeight: 600,
      borderRadius: 12, padding: "4px 8px", whiteSpace: "nowrap", ...style,
    }}>{children}</span>
  );
}

/* ---- Theme toggle (light/dark on <html data-theme>) ---- */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} title="Toggle theme"
      style={{
        width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer",
        background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 18,
      }}>{dark ? "☀️" : "🌙"}</button>
  );
}

Object.assign(window, { Button, Card, Field, Badge, ThemeToggle });
