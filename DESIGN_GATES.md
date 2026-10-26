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

- [x] D4: Strict type checking passes with installed dependencies
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [x] D5: Production build succeeds
  CHECK: CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=0a6f18b320bd6397df14ccb5dc8ac112dd8b475ef3b14c91810c88470876d0e1; exit=0; EXPECT=matched; output-sha256=fa22b6e7c2ffa1c18b075a3c2c079caf7dbe4adcb93a074467562c9a4bf5ac2c; output-bytes=1258; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [ ] D6: Revised screens render correctly on phone and desktop with keyboard-accessible navigation and forms
  EVIDENCE: pending

- [x] D7: Design rationale, folder responsibilities, and verification limitations are documented accurately
  EVIDENCE: Reviewed docs/design-upgrade.md, docs/brand-guidelines.md, design-system/campusguard/MASTER.md and README against the changed source. They document all seven skill contributions, actual token/font adaptations, feature/HTTP folders, unchanged access policy, isolated fixture preview, failed npm downloads, and failed Chrome launch; no deployment or browser-completion claim.

- [x] D8: Nine screens render through the actual UI components in an isolated fictional-data preview
  CHECK: node scripts/render-design-preview.cjs
  EXPECT: DESIGN_PREVIEW_RENDERED
  EVIDENCE: automatic-evidence=v1; definition-sha256=b7bb3ce6bc023735b6ec357632875f5e7338464fe2646a0ecebb48d6638d61f9; exit=0; EXPECT=matched; output-sha256=f62cd3da464804dc9d18974934fee6f28f145b67f88dc92d6b75421dd9f391a9; output-bytes=96; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

Preview now uses the installed project dependencies by default. The earlier temporary cached runtime was removed after installation to reclaim disk space. The preview remains fixture-based and does not validate backend flows.

Dependencies are now installed and D4/D5 can be verified. D6 still requires browser execution: the test web server cannot listen on 127.0.0.1:3000 in this session.

Shared-check provenance: D1/D2/D4/D5 reuse the exact current automatic evidence for identical commands in GATES:G0/G6/G1/G3, executed in this workspace. No additional rebuild was run merely to update this second ledger.
