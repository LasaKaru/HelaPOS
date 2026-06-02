# HelaPOS — Design System

A brand & UI design system for **HelaPOS**, the point-of-sale product from **HelaO2**.
HelaPOS is a **Windows desktop application** (.NET 9 / WPF) for retail checkout, inventory,
customers, employees, gift cards, store credit and reporting. Its interface follows a clean,
minimalist, **"Claude-inspired"** aesthetic: lots of white space, a single brand accent
(**HelaO2 navy** by default), soft card elevation, and gentle motion.

This folder is the reusable design system: brand assets, color & type foundations, a CSS
token sheet, preview cards, and a high-fidelity **UI kit** that recreates the core HelaPOS
screens in HTML/React so you can assemble on-brand mocks, prototypes and slides quickly.

---

## Sources

Everything here was reverse-engineered from real product material the user provided. You may
not have access, but these are recorded so you (or the reader) can go deeper:

- **GitHub — `LasaKaru/POS`** (private): the WPF desktop app. Source of truth for all colors,
  type, components and screen layouts.
  → https://github.com/LasaKaru/POS
  Key files imported & studied:
  - `Styles/Colors.xaml`, `Styles/LightTheme.xaml`, `Styles/DarkTheme.xaml` — palette + brushes
  - `Styles/ControlStyles.xaml`, `Styles/EnhancedControls.xaml` — buttons, inputs, cards, badges
  - `Styles/Animations.xaml` — easing, gradients, shadows, transitions
  - `Views/LoginView.xaml`, `Views/ModernDashboardView.xaml`, `Views/PaymentWindow.xaml`,
    `Views/ReportsView.xaml`, `Views/InventoryView.xaml`, `Views/SettingsHubView.xaml`
- **Related repos** by the same author/org (not used directly, listed for context):
  `LasaKaru/helao2-website` (corporate site — Vite + React + Tailwind), `LasaKaru/GroceryPOS`,
  `LasaKaru/fastfood-pos-csharp`, `LasaKaru/RestPOS`.
- **`uploads/unnamed (14) hlo2.jpg`** — the HelaO2 brand logo (now `assets/helao2-logo.jpg`).

> Tip for future work: the `LasaKaru/POS` repo also contains extensive design notes
> (`ARCHITECTURE.md`, `UI_ENHANCEMENTS.md`, `PHASE*_COMPLETE.md`) worth reading to recreate
> additional screens (gift cards, store credit, employees, held sales) at higher fidelity.

---

## CONTENT FUNDAMENTALS

How HelaPOS writes copy — observed across the app's screens.

- **Voice:** Plain, functional, retail-operator English. The product talks like a tool, not a
  personality. No marketing fluff inside the app.
- **Person:** Mostly impersonal/imperative for actions (**"Start New Sale", "Add Payment",
  "Complete Transaction", "Process Payment"**). Warmly second-person only in the dashboard
  greeting (a time-based **"Good morning / afternoon"** line).
- **Casing:** **Title Case** for buttons, section headers, card titles, and nav
  ("Today's Performance", "Quick Actions", "Recent Transactions", "Stock Alerts").
  Sentence case for helper/descriptive text ("Select payment method and enter details").
- **Labels:** Short noun phrases — "Total Sales", "Transactions", "Customers Served",
  "Amount Due", "Change Due", "Cash Tendered", "Cardholder Name". Required fields marked
  with a trailing ` *`.
- **Numbers & money:** Currency is always shown formatted via a converter; stat values are
  large and bold. Deltas are expressed as signed percentages in a pill ("+12%", "↑ 8.4%").
  *(The sample data uses `$`; HelaO2 is Sri-Lankan, so swap to `Rs.`/`LKR` for local builds —
  see CAVEATS.)*
- **Status / feedback:** Direct and literal — "Demo Mode: Card payments will be simulated",
  "Demo Credentials", "low stock". Errors are plain statements, shown in red.
- **Emoji:** **Yes — used deliberately as iconography** throughout the app (see ICONOGRAPHY).
  Section headers and stat cards are prefixed with a single emoji (📊 This Week, 🏆 Top Products,
  🕐 Recent Transactions). Use sparingly: one leading glyph per heading/card, never mid-sentence.
- **Vibe:** Calm, confident, "professional retail software." Clean and uncluttered; it trusts
  white space and one accent color rather than decoration.

---

## VISUAL FOUNDATIONS

The complete low-level visual language. All values are lifted verbatim from the WPF styles
and mirrored in `colors_and_type.css`.

### Color
- **Brand accent: HelaO2 Navy `#0B1E40`** (default). Hover lifts to `#16294F`, pressed deepens
  to `#061227`; a pale navy tint `#E7EBF2` marks selected list rows. This is the only chromatic
  color in normal UI — everything else is neutral grey.
- **User-customizable:** the accent is set on the **Settings → Appearance** screen and applied
  live by overriding `--primary` / `--accent-gradient` on `:root`. Built-in presets: **Navy**
  (default), **Blue** `#1D4ED8`, **Black/Slate** `#1E293B`, **Teal** `#0D9488`, **Indigo**
  `#4F46E5`. Each ships a matching hover, tint and gradient.
- **Signature gradient** `#1A3160 → #0B1E40` (135°) powers the dashboard header, the "Start New
  Sale" hero tile, and progress bars. Used as a *surface* fill, not as text. Re-themes with the
  chosen accent.
- **No orange.** The original WPF code shipped a warm "Claude Orange" (`#D97706`) accent; per
  brand direction this system replaces it with the HelaO2 navy. The legacy orange is kept in the
  token file only for reference (`--legacy-orange`) and is not used anywhere in the UI.
- **Neutrals (light):** white app bg `#FFFFFF`, secondary `#F9FAFB`, tertiary `#F3F4F6`,
  borders `#E5E7EB` (hover `#D1D5DB`). Text ramps `#111827 / #6B7280 / #9CA3AF`.
- **Dark theme** is fully supported and toggled in Settings → Appearance. Neutrals invert to a
  slate family (bg `#1F2937`, surface `#374151`); the accent and semantics are unchanged.
- **Semantics:** success `#10B981`, error `#EF4444`, info `#3B82F6`, warning `#F59E0B` — used
  for status meaning (deltas, validation, alerts). Note: to keep the UI orange-free, low-stock
  chips in the shopping flow use the **accent** color rather than the amber warning token.
- **Brand mark color:** the HelaO2 logo is **deep ink navy** on a cream field. The brand image
  is also user-replaceable (Settings → Brand Image); the uploaded logo appears in the top bar,
  login screen and on printed receipts.

### Type
- **Family:** `Segoe UI` (Windows system font) → humanist sans fallback. See font note in CAVEATS.
- **Scale (real px):** display 32 / title 24 / section 22 / stat value 28 / card title 18 / 16,
  body & controls 14, captions 13, small 12, badge 11. Weights: 400 body, 600 SemiBold for
  labels/headings, 700 Bold for titles & numbers.
- Big bold numbers are a signature: KPI values render at 24–28px Bold against tiny grey labels.

### Spacing & layout
- Generous padding: cards 16–20px, screen gutters 30–40px, header padding 40×30.
- Grid-based dashboards: `UniformGrid` stat rows (4-up), quick-action grids (3×2), two-column
  master/summary splits (e.g. Payment = flexible form + fixed 350px summary rail).
- Section rhythm: heading → 20px gap → grid → 30px gap to next section.
- Dividers are 1px `--border` separators with ~16px vertical margin.

### Corners
- Buttons & inputs **6px**; cards / icon-buttons / amount badges **8px**; elevated & animated
  cards, product tiles, quick-action tiles **12px**; pill toggles & status badges **12–16px**.

### Elevation / shadows
- Resting card: `0 2px 12px rgba(0,0,0,.10)`.
- Elevated (stat/quick-action) card: `0 4px 20px rgba(0,0,0,.10)`.
- Hover: shadow grows to `0 4px 16px` / floating `0 8px 24px` and **opacity deepens**.
- Dark theme uses stronger shadows (opacity .30–.45). Soft, neutral-black, never colored.

### Motion
- **Easing:** Cubic `EaseOut` (`--ease-smooth`) for entrances; Quadratic `EaseOut`
  (`--ease-quick`) for hovers. Durations: fast `0.15s`, medium `0.30s`.
- **Entrances:** cards fade-in (+ subtle slide-up / scale-from-0.95) on load.
- **Hover state:** cards & quick-action tiles **lift `translateY(-4px)`**, border turns the
  accent color, shadow deepens. Icon buttons **scale to 1.1**. All smooth, no bounce.
- **Press state:** **scale down** — buttons `0.98`, product tiles `0.97`, icon buttons `0.95`.
- A 1s infinite rotating ring is the only looping animation (loading spinner). Indeterminate
  progress bar appears during login.

### Surfaces & effects
- **Cards** = surface fill + 1px border + soft shadow + rounded corner. The default card pattern.
  No colored left-borders, no heavy outlines.
- Backgrounds are flat solids. The only gradients are the accent/semantic gradients on
  intentional hero surfaces; the login screen uses a very subtle white→`#F9FAFB` diagonal wash.
- Transparency/blur is minimal — a glassmorphism brush exists but is reserved; icon buttons use
  transparent backgrounds that fill grey on hover.
- Imagery: the app is largely **imagery-free** (data UI). Where photos would appear (product
  thumbnails), they sit in rounded tiles. No grain, no duotone treatments.

---

## ICONOGRAPHY

**HelaPOS uses emoji as its primary icon system.** This is a deliberate, pervasive choice in
the WPF app — not a placeholder. Examples observed verbatim in the views:

- Stats & sections: 💰 Total Sales · 🧾 Transactions · 👥 Customers · 📊 This Week ·
  📈 This Month · 🏆 Top Products · 🕐 Recent Transactions
- Actions / nav: ➕ Start New Sale · 📦 Inventory · 👔 Employees · ⚙️ Settings · 🔄 Refresh ·
  ⚠️ Stock Alerts
- Payment: 💵 Cash · 💳 Card

Rules:
- One emoji per heading, stat card, or action tile — placed leading, at 32–40px for hero tiles,
  ~16–18px inline in headers. Never inside running sentences.
- Unicode arrows (↑ ↓) are used for trend deltas inside semantic pills.
- There is **no custom icon font, SVG sprite, or icon library** in the codebase. If a build
  needs crisper/scalable icons, the closest match to the app's friendly-rounded tone is
  **Lucide** (rounded stroke) or system emoji; document any swap. For the recreations in this
  system we keep emoji to stay faithful to the product.
- **Logo:** `assets/helao2-logo.jpg` — "HelaO2" wordmark in ink navy with a heartbeat/pulse
  mark inside an "O". Cream background (not transparent). This is the corporate brand mark; the
  POS product screens themselves don't show a logo (they show a text "POS System" title on login).

---

## Index / Manifest

Root files:
- **`README.md`** — this file.
- **`colors_and_type.css`** — all color, type, radius, shadow & motion tokens as CSS variables
  + helper type classes. Import this in any HelaPOS mock.
- **`SKILL.md`** — Agent-Skills-compatible entry point.
- **`assets/`** — brand & visual assets (`helao2-logo.jpg`).
- **`preview/`** — design-system preview cards (typography, color, components) shown in the
  Design System tab.
- **`ui_kits/helapos/`** — high-fidelity HTML/React recreation of the HelaPOS desktop app:
  login → dashboard → point-of-sale checkout → payment → reports. See its own README.
- **`Styles/`, `Views/`, `App.xaml`** — the original imported WPF source, kept as reference.

UI kits:
- **`ui_kits/helapos/`** — the HelaPOS Windows POS application.

---

## CAVEATS / substitutions

- **Font:** `Segoe UI` is a Windows-only system font and is **not on Google Fonts**. On non-Windows
  viewers the system falls back automatically; for an exact webfont I recommend **Source Sans 3**
  (closest free humanist match) or Microsoft's open-source **Selawik**. *Flagging this — please
  confirm the preferred web substitute or supply a licensed Segoe UI webfont.*
- **Currency:** sample data uses `$`. HelaO2 is Sri-Lankan; switch to `Rs.` / `LKR` for production.
- **Logo:** provided as a JPG on a cream background (no transparency). A transparent PNG/SVG would
  be ideal for placing on dark/colored surfaces.
