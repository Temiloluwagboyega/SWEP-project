# CampusGuard visual direction

CampusGuard is an OAU course prototype for incident reporting and follow-up. Students may arrive under stress, on small phones, or with limited connectivity. Staff need to read and triage reports. The visual identity should make those tasks understandable and trustworthy without implying that this project is an approved official university service.

## Direction and rationale

Use a public-service interface: clear white surfaces, navy navigation, teal actions, generous spacing, and readable sans-serif type. The public page should explain the two reporting routes and lead directly to reporting. The student/staff portals should prioritise records and actions over decoration.

The first UI UX Pro Max query, “campus safety reporting portal”, matched an anonymous community product. That was rejected because this MVP requires identified student accounts and confidential handling. The narrower “government public service portal” query returned its Accessible & Ethical style and high-contrast public-service palette, a suitable starting point for a campus support service. It is guidance, not a claim of government affiliation or accessibility certification. Do not adopt its generic testimonial or blanket AAA requirements as project facts.

## Tokens

- Navy `#132D46`: identity, navigation, major headings.
- Teal `#0B6477`: primary actions, links, selected controls.
- White `#FFFFFF`: reading and input surfaces.
- Paper `#F4F7FB`: page background and section separation.
- Slate `#526478`: secondary text with measured readable contrast.
- Amber `#805012`: urgent guidance on pale amber surfaces, always paired with words/icons.

Use three layers: raw values in primitives; purpose in semantic aliases; button, input, panel and badge properties in component tokens. Status colours are semantic, not decorative. No arbitrary colour literals in TSX.

## Typography and layout

Use one local system sans-serif stack. UI UX Pro Max recommends Atkinson Hyperlegible; this build uses dependable local fonts so it does not need a font download to render. Body size is 16px, supporting copy at least 14px, labels 14px, and compact reference/status text at least 12px. Do not use letter-spaced uppercase labels throughout the app.

Content is left aligned. Keep long descriptions around 65–75 characters per line. Use an 8px spacing rhythm (with 4px for small details). Main reading surfaces use restrained radii and borders. A public introduction may use a split layout only where the second column contains useful routing information; avoid decorative floating cards.

Public page:

```text
Emergency direction
Brand / overview / reports / get help / sign in
Headline and report action | Choose Committee or Security
How reporting works
Privacy and in-person reporting guidance
Footer and monitoring limitation
```

Portal:

```text
Emergency direction / identity
Navigation | Page heading and primary action
           | Summary / filters
           | Reports or form / details and next actions
```

Mobile: sidebar becomes ordinary compact navigation above content; public navigation has a labelled toggle. No sticky bottom controls, hidden focus targets, or horizontal document overflow. Controls should have comfortable 44px hit areas. Forms keep entered values on errors and focus a linked error summary after failed submission. A status badge must contain text.

## Voice and interactions

Use direct language: “Report an incident”, “My reports”, “Choose a location”, “Assign a handler”. No testimonials, invented response metrics, decorative claims about safety, guaranteed response, invented phone numbers, dispatch promises, or claims of full anonymity. Identify unverified contacts honestly.

Motion is limited to loading feedback and short state transitions; respect reduced motion. Reuse existing Lucide icons, hide decorative ones from assistive technology, and label icon-only buttons. There is no need for animation, chart, font, component-framework, or image packages for this redesign.

## Quality checks

Measure normal-text colour pairs against 4.5:1. Review focus rings, keyboard navigation, mobile reflow, zoom, form labels/errors, long report content, live queue updates, and confidentiality redaction. Screenshots/static rendering can assess appearance; they cannot verify authentication or database/API behaviour. Keep those verification results separate.
