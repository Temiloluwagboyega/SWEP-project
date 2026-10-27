# Gates: continue Claude's merged PR review

OWNS: src/**, tests/**, scripts/**, docs/**, CONTINUATION_GATES.md

Scope: Finish existing SafeCampus branding, sticky/portal navigation, compact errors and email-security work in the merge-prs worktree. Preserve both merged PRs and avoid any real email delivery.

- [x] C1: TypeScript passes on the merged implementation
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/private/tmp/claude-501/-Users-wikiwoo-Documents-swep/3ae44046-590c-47ee-8b84-de9a66e9e172/scratchpad/wt; path=77c9042590fd/25 entries

- [x] C2: Mocked SMTP tests prove confidential payloads, recipient isolation, deferred delivery and safe failures
  CHECK: node --import tsx --test tests/email.test.ts
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=17f9950a0fa22ad58ef75f3c472c6965b0c893138445183b4f397b8b8afb6294; exit=0; EXPECT=matched; output-sha256=9f3963deff59e12e77c5870ce41cbb5d84e4491077f963991199814b351c0d57; output-bytes=1274; shell=/bin/sh; cwd=/private/tmp/claude-501/-Users-wikiwoo-Documents-swep/3ae44046-590c-47ee-8b84-de9a66e9e172/scratchpad/wt; path=77c9042590fd/25 entries

- [x] C3: Access-policy regressions pass
  CHECK: npm run check:access
  EXPECT: ACCESS_POLICY_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a055ca596adde04046c8f73f56eef3c32c5f156db0155e4c6cf20e77cdf4b4e6; exit=0; EXPECT=matched; output-sha256=d250d417f0ed85e233c184b4c6a566ba0ea0c11f5fbf9bb619b10fd3e3c75805; output-bytes=302; shell=/bin/sh; cwd=/private/tmp/claude-501/-Users-wikiwoo-Documents-swep/3ae44046-590c-47ee-8b84-de9a66e9e172/scratchpad/wt; path=77c9042590fd/25 entries

- [x] C4: Merged app builds
  CHECK: CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=0a6f18b320bd6397df14ccb5dc8ac112dd8b475ef3b14c91810c88470876d0e1; exit=0; EXPECT=matched; output-sha256=c86e3cf4713f10c3595115ee12ba1277dffdd506cc9722e5682f75c69e37fbdf; output-bytes=1282; shell=/bin/sh; cwd=/private/tmp/claude-501/-Users-wikiwoo-Documents-swep/3ae44046-590c-47ee-8b84-de9a66e9e172/scratchpad/wt; path=77c9042590fd/25 entries

- [ ] C5: PostgreSQL security/lifecycle tests pass without SMTP credentials
  CHECK: node scripts/test-without-email.cjs
  EXPECT: INTEGRATION_PASSED
  EVIDENCE: pending

- [ ] C6: Browser navigation, sticky layout, error sizing and hydration are verified
  EVIDENCE: pending

- [x] C7: Worktree status and remaining publish/verification limits are documented accurately
  EVIDENCE: Reviewed docs/claude-continuation.md against local merge-prs history and implemented changes. Explicitly records separate main, mocked mail tests/no deliveries, failed test database TCP and preview requests (EPERM), and absent remote merge/deployment/browser validation.

ABANDON: C5 The configured PostgreSQL test database TCP connection is denied with EPERM, and both suites fail during isolated-schema initialisation. Rerun node scripts/test-without-email.cjs in a terminal with database access.

ABANDON: C6 Access to the existing local preview at 127.0.0.1:3100 is denied with EPERM. Current sticky/menu/hydration/visual behaviour requires browser acceptance in a permitted environment.
