# Gates: CampusGuard design and structure upgrade

OWNS: src/**, docs/**, design-system/**, tests/**, scripts/**, artifacts/**, DESIGN_GATES.md, README.md, codex.md

Scope: Redesign public and portal screens with a consistent, accessible design system; organise shared UI and HTTP helpers; preserve report privacy and behaviour.

- [x] D1: TypeScript source and configuration parse without syntax errors
  CHECK: npm run check:syntax
  EXPECT: SYNTAX_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=2614bafa8645d030e92148aa71eb6ff2dbdb12f4819f8919501f67b746439656; exit=0; EXPECT=matched; output-sha256=7b612443d58c2540811620cde4d1cb18bb6bca63b6c2a9914d6c217afbcb4c83; output-bytes=185; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [x] D2: Access controls retain ownership, channel, and confidential history isolation
  CHECK: npm run check:access
  EXPECT: ACCESS_POLICY_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a055ca596adde04046c8f73f56eef3c32c5f156db0155e4c6cf20e77cdf4b4e6; exit=0; EXPECT=matched; output-sha256=d250d417f0ed85e233c184b4c6a566ba0ea0c11f5fbf9bb619b10fd3e3c75805; output-bytes=302; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [x] D3: Design tokens have readable contrast and the new component and HTTP module boundaries resolve
  CHECK: node scripts/verify-design.cjs
  EXPECT: DESIGN_STRUCTURE_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=e22307f1f5275bf0d2b5e483504cb742d8137435e74024c5cd3401539edf5769; exit=0; EXPECT=matched; output-sha256=af9c9b29a5ce4b73f24669a971f4d7cfdf8c2eb5c6e6c83eb059eedc6b95fb54; output-bytes=186; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [ ] D4: Strict type checking passes with installed dependencies
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: pending

- [ ] D5: Production build succeeds
  CHECK: npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: pending

- [ ] D6: Revised screens render correctly on phone and desktop with keyboard-accessible navigation and forms
  EVIDENCE: pending

- [x] D7: Design rationale, folder responsibilities, and verification limitations are documented accurately
  EVIDENCE: Reviewed docs/design-upgrade.md, docs/brand-guidelines.md, design-system/campusguard/MASTER.md and README against the changed source. They document all seven skill contributions, actual token/font adaptations, feature/HTTP folders, unchanged access policy, isolated fixture preview, failed npm downloads, and failed Chrome launch; no deployment or browser-completion claim.

- [x] D8: Nine screens render through the actual UI components in an isolated fictional-data preview
  CHECK: node scripts/render-design-preview.cjs
  EXPECT: DESIGN_PREVIEW_RENDERED
  EVIDENCE: automatic-evidence=v1; definition-sha256=b7bb3ce6bc023735b6ec357632875f5e7338464fe2646a0ecebb48d6638d61f9; exit=0; EXPECT=matched; output-sha256=f62cd3da464804dc9d18974934fee6f28f145b67f88dc92d6b75421dd9f391a9; output-bytes=96; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

Offline preview runtime for this session: DESIGN_PREVIEW_RUNTIME=/tmp/swep-design-runtime/node_modules. This uses integrity-checked cached packages and isolated Next adapters; it does not validate the full application.

D4/D5 require the missing application dependencies. D6 requires a browser that launches successfully; the Chrome process closed before a usable page was available.
