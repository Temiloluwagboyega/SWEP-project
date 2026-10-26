# CampusGuard design system

This is the implementation design direction for the OAU course prototype. It is subordinate to the project brief's safety, confidentiality, scope, and access requirements. Read any `pages/<page>.md` override before changing a specific view.

## Research and adaptation

UI UX Pro Max's verified `Government/Public Service` product match and `Accessible & Ethical` style informed this system. We adapted that guidance to campus incident reporting. This is not a claim of government/university endorsement, WCAG certification, or a guaranteed emergency response. The earlier anonymous-community match was rejected.

The final choices below supersede generic examples returned by the search tool. In particular: no `transition: all`, decorative hover transforms, testimonials, fabricated activity metrics, remote-font requirement, or blanket AAA claims.

## Source files

- Brand and layout rationale: `docs/brand-guidelines.md`.
- Authoritative token values and aliases: `docs/design-tokens.json`.
- Generated runtime variables: `src/styles/tokens.css`.
- Layout and component rules: `src/styles/base.css`, `layout.css`, `components.css`, `pages.css`.

## Foundations

| Purpose             | Value                         |
| ------------------- | ----------------------------- |
| Navigation/identity | Navy `#132D46`                |
| Primary action      | Teal `#0B6477`, white label   |
| Reading surface     | White `#FFFFFF`               |
| Background          | Paper `#F4F7FB`               |
| Secondary text      | Slate `#526478`               |
| Urgent guidance     | Amber `#805012` on pale amber |

Use primitive → semantic → component token layers. Semantic status text colours have dedicated light surfaces. The normal-text colour pairs are measured by `scripts/verify-design.cjs` against 4.5:1. Borders used as control boundaries are stronger than decorative dividers.

One local sans-serif stack; 16px body, 14px secondary/label text, 12px minimum compact metadata. The search tool suggested Atkinson Hyperlegible; local fallback fonts are deliberate while remote downloads are unavailable. Keep paragraphs around 65–75 characters and use balanced headings. Avoid repeated uppercase micro-labels.

Use an 8px spacing rhythm with 4px details, 6px control radii, 10px panels, and restrained elevation only where it helps hierarchy. No font, image, chart, animation, state-management, or component-framework dependency is required for the redesign.

## Layout rules

Public: visible emergency strip; brand/navigation; report action and receiving-channel explanation; three-step reporting process; confidentiality explanation; monitoring limitation in the footer.

Portal: the same global emergency/help navigation, a navy contextual navigation area, readable page heading, summary/filters, then reports or form/details. On phones, contextual navigation wraps into normal document flow above content. The public menu has a labelled toggle and Escape handling. Nothing fixed obscures form fields or focus.

## Components and states

- Buttons: primary, outline, quiet; normal/hover/focus/disabled/loading; comfortable 44–48px minimum interaction area; do not move layout on hover.
- Fields: explicit labels, required indicators, correct input types/autocomplete, retained values after failure, linked inline errors, and focused error summary after failed submission.
- Badges: textual status plus semantic colour; confidentiality/urgency also have text/icons. Never rely on colour alone.
- Reports: semantic staff table on desktop, labelled record layout on phones; support long text; apply confidentiality redaction before data reaches the components.
- Polling: retain 30-second visible-tab refresh, prevent stale request results from overwriting new filter state, and announce new-report counts in a single contextual live region.
- Motion: short colour/state changes and loading feedback only; respect reduced motion.

## Verification boundaries

The source/contrast/import/HTTP/access checks and isolated React rendering can run independently. `artifacts/design-preview.html` uses real UI components with fictional fixtures and preview-only adapters; it deliberately refuses report mutations and is not the application. Full Next.js routing/authentication, database integration, build, and browser reflow/interaction checks require the actual dependency installation and working browser environment.
