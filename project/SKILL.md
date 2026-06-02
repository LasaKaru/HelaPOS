---
name: helapos-design
description: Use this skill to generate well-branded interfaces and assets for HelaPOS (the HelaO2 point-of-sale product), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

This is the design system for **HelaPOS**, a Windows (.NET/WPF) point-of-sale application by
**HelaO2**. Its look is a clean, minimalist "Claude-inspired" retail UI: white space, soft card
elevation, gentle motion, **deep ink navy as the brand identity color**, and **Claude Orange
(`#D97706`) as the interactive action accent**. Emoji are used as the product's icon system.

Key files:
- `README.md` — full brand, content, visual & iconography guidelines (start here).
- `colors_and_type.css` — all color, type, radius, shadow & motion tokens as CSS variables.
- `preview/` — design-system spec cards.
- `ui_kits/helapos/` — high-fidelity HTML/React recreation of the app (login → dashboard →
  POS checkout → payment → reports) with reusable components.
- `assets/` — the HelaO2 logo.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view, pulling tokens from `colors_and_type.css` and
components from the UI kit. If working on production code, copy assets and read the rules here
to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some clarifying questions, and act as an expert designer who outputs HTML artifacts
_or_ production code, depending on the need.
