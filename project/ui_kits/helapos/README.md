# HelaPOS — UI Kit

A high-fidelity, click-through recreation of the **HelaPOS** Windows desktop application
(the .NET 9 / WPF point-of-sale product from HelaO2), rebuilt in React + HTML so you can
assemble on-brand mocks and prototypes fast.

> This is a **cosmetic recreation**, not production code — interactions are faked and data is
> sample data (`data.js`). Visuals, spacing, colors, motion and component anatomy are matched
> to the real WPF styles (`Styles/ControlStyles.xaml`, `Styles/EnhancedControls.xaml`,
> `Styles/Animations.xaml`) and views (`Views/*.xaml`) in `LasaKaru/POS`.

## Run it
Open `index.html`. Everything is wired through CDN React 18 + Babel; no build step.
Demo login is pre-filled — **admin / admin123**.

## Interactive flow
A tablet restaurant-POS layout: a **left icon rail** (Home · Customers · Tables · Cashier ·
Orders · Reports · Settings · Logout) and a **top bar** (brand · product search · sync/online ·
Select Table · theme toggle). **Store identity, theme and accent color are user-customizable**
in Settings and persist to `localStorage`.

1. **Login** — centered card; brand logo (or store name), demo-credentials hint.
2. **Home** (landing) — category tabs (Starters / Breakfast / Lunch / Supper / Deserts /
   Beverages), an image-led **menu grid**, and a right **Order Details** panel: an **order-type**
   toggle (Dine in / Takeaway / Delivery), line items that expand to **Quantity + Discount(%) +
   Note**, live Subtotal / Tax / Payable Amount, and **Hold Order** + **Proceed** actions.
   **Hold Order** parks the order in a **Held** tray to recall later; top-bar search filters the
   grid; **Select Table** tags the order (order type + table print on the receipt).
3. **Payment** — modal: method picker (Cash / Card / Mobile / Mixed), cash-tendered + quick-cash,
   live change-due, summary rail, success state.
4. **Receipt** — printable monospace receipt (logo/store name, table, line items, totals,
   payment, change, barcode); Print / New Sale / Done.
5. **Reports** — KPI cards, weekly sales bar chart, top-sellers list.
6. **Settings** — store name/tagline/address, brand-image upload, light/dark theme, accent
   presets (Navy / Blue / Black / Teal / Indigo) applied live.
7. **Tables** — floor-plan grid with live status (Available / Occupied / Reserved / Billed),
   filters, guest/amount details; tapping an available table seats it and returns to Home.
8. **Orders** — today's orders list with Dine in / Takeaway / Paid filters and status badges.
9. **Inventory & Stock** — stock stats (in/low/out + stock value), category filter + search,
   per-product stock adjust, status badges, and a **photo thumbnail you upload** — the photo
   then appears on that dish's Home menu card (persisted in `localStorage`).
10. **Customers** — CRM list (avatar, phone, visits, spend, loyalty points) with search + Add.
11. **Cashier** — cash-drawer / shift view: cash & card sales, cash-out, expected drawer,
    cash-movement log, and drawer actions (Cash In/Out, X-Report, Count, Close Shift).

## Files
| File | Purpose |
|------|---------|
| `index.html` | Entry point — loads React, tokens, and all components |
| `colors_and_type.css` | Design tokens (copied from the system root) |
| `data.js` | Sample catalog, categories, metrics |
| `config.js` | Store config: accent presets, theme & brand-image persistence |
| `ui.jsx` | Primitives: `Button`, `Card`, `Field`, `Badge`, `ThemeToggle` |
| `LoginScreen.jsx` | Login screen |
| `Dashboard.jsx` | Legacy KPI dashboard (not in the restaurant nav; kept for reuse) |
| `SaleScreen.jsx` | **Home**: menu grid + Order Details panel (`HomeScreen`, `MenuCard`); also defines shared `SubHeader` + `Placeholder` |
| `PaymentModal.jsx` | Payment modal |
| `ReceiptModal.jsx` | Printable receipt |
| `ReportsScreen.jsx` | Reports & analytics |
| `SettingsScreen.jsx` | Store identity & appearance customization |
| `Modules.jsx` | Tables (floor plan) + Orders (list) screens |
| `Inventory.jsx` | Inventory & stock management + dish-photo upload |
| `CustomersCashier.jsx` | Customers CRM list + Cashier cash-drawer/shift |
| `app.jsx` | Root orchestrator + top nav + config/theme |
| `assets/` | Brand logo |

## Building your own screens
Components export onto `window`, so you can compose them in any new `text/babel` script.
Reuse `Button`, `Card`, `Field`, `Badge` for consistency; pull colors/type from
`colors_and_type.css` variables (`--primary`, `--brand-navy`, `--surface`, `--text-secondary`, …).
Keep emoji as the icon system to stay faithful to the product.

## Not included (left out on purpose)
The real app also has Customers, Employees, Gift Cards, Store Credit, an Inventory editor and
Held Sales. They follow the same card/table/modal patterns — recreate them from the
corresponding `Views/*.xaml` if a project needs them.
