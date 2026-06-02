/* HelaPOS — runtime store config: brand image, store name, theme, accent color.
   Persisted to localStorage; applied by writing CSS variables on :root so the
   whole UI kit re-themes live (every component reads --primary / --accent-gradient). */
window.HELA_ACCENTS = {
  navy:   { name: "Navy",   primary: "#0B1E40", hover: "#16294F", light: "#E7EBF2", grad: "linear-gradient(135deg,#1A3160 0%,#0B1E40 100%)" },
  blue:   { name: "Blue",   primary: "#1D4ED8", hover: "#1E40AF", light: "#DBEAFE", grad: "linear-gradient(135deg,#3B82F6 0%,#1D4ED8 100%)" },
  slate:  { name: "Black",  primary: "#1E293B", hover: "#0F172A", light: "#E2E8F0", grad: "linear-gradient(135deg,#334155 0%,#1E293B 100%)" },
  teal:   { name: "Teal",   primary: "#0D9488", hover: "#0F766E", light: "#CCFBF1", grad: "linear-gradient(135deg,#14B8A6 0%,#0D9488 100%)" },
  indigo: { name: "Indigo", primary: "#4F46E5", hover: "#4338CA", light: "#E0E7FF", grad: "linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)" },
};

window.HELA_CONFIG = (function () {
  const KEY = "hela.config.v1";
  const DEFAULTS = {
    storeName: "HelaPOS Store",
    storeTagline: "Point of Sale",
    address: "123 Galle Road, Colombo 03",
    logo: null,            // dataURL of uploaded brand image
    theme: "light",        // light | dark
    accent: "navy",        // key into HELA_ACCENTS
  };

  function load() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch (e) { return { ...DEFAULTS }; }
  }
  function save(cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }

  function apply(cfg) {
    const root = document.documentElement;
    root.setAttribute("data-theme", cfg.theme);
    const a = window.HELA_ACCENTS[cfg.accent] || window.HELA_ACCENTS.navy;
    root.style.setProperty("--primary", a.primary);
    root.style.setProperty("--primary-hover", a.hover);
    root.style.setProperty("--primary-light", a.light);
    root.style.setProperty("--accent-gradient", a.grad);
  }

  return { DEFAULTS, load, save, apply };
})();

/* Per-dish photos (uploaded in Inventory) — keyed by product id, persisted separately. */
window.HELA_PHOTOS = (function () {
  const KEY = "hela.photos.v1";
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(map) { try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {} }
  return { load, save };
})();
