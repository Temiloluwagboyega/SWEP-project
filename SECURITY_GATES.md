# Gates: application security baseline

OWNS: src/**, prisma/**, scripts/**, tests/**, next.config.ts, package.json, .env.example, .gitignore, README.md, docs/**, codex.md, SECURITY_GATES.md

Scope: Protect secrets, persistent abuse limits, request boundaries, revocable/expiring authentication, and browser headers while preserving report confidentiality. Production identity verification, hosting controls, backups, stakeholder approval and browser acceptance remain explicit external prerequisites.

- [x] S1: Local environment has a valid private ignored secret without exposing its value
  CHECK: node scripts/setup-env.cjs --check
  EXPECT: ENVIRONMENT_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=4497f82f1794bea1d664ffb0f11fab5bf85c8df8713508962b5c925494dce65a; exit=0; EXPECT=matched; output-sha256=abb375ec926d48f9db6d794dca0e6aa2d850eede84f15c11a1f23f9fb56be964; output-bytes=94; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] S2: Database-backed security tests and incident lifecycle regressions pass
  CHECK: npm test
  EXPECT: INTEGRATION_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=451787c1c8b2037ed058a2366d2dfb338f3d4c3593fc7de5431f618b74018dde; exit=0; EXPECT=matched; output-sha256=1b1789a72111b28a6eff5d622cde9b4fc473a7c421bd230df9b5ee460edeec92; output-bytes=5505; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] S3: Strict TypeScript passes
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] S4: Production build accepts the authentication and nonce policy
  CHECK: CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=0a6f18b320bd6397df14ccb5dc8ac112dd8b475ef3b14c91810c88470876d0e1; exit=0; EXPECT=matched; output-sha256=fbb62a1a40d5d99d86df2f9266c8910e7adf27d8c8c209fd42c49c98d4b1e4a3; output-bytes=1240; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] S5: Confidentiality and HTTP/component checks retain their expected behaviour
  CHECK: npm run check:access && node scripts/verify-design.cjs
  EXPECT: DESIGN_STRUCTURE_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=d44b45432661013fa346aba81a25aff74d62d25186020fb2edb499fc3c0b249c; exit=0; EXPECT=matched; output-sha256=12f17b374025c5644100bb04dde2c7c3352f0b77a14ae1dae680a7d469fef305; output-bytes=488; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] S6: Applied security migration preserves fictional incident data
  CHECK: node scripts/verify-database.cjs
  EXPECT: DATABASE_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=d89ba057d8aeb44fc05fc78717e635b27b0408f6241a9c28591f94499a90c77f; exit=0; EXPECT=matched; output-sha256=3766cd6ed1bc90bf3a2bf9a45879830b8b27d604224f0f85dab3fea92faca068; output-bytes=162; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [ ] S7: Browser login, nonce/hydration and protected actions pass end to end
  CHECK: npm run test:e2e
  EXPECT: BROWSER_PASSED
  EVIDENCE: pending

- [x] S8: Production prerequisites and remaining verification limits are accurately documented
  EVIDENCE: Reviewed docs/security.md, README.md, SETUP_CHECKLIST.md, docs/verification-status.md and codex.md against implementation. Explicitly records PostgreSQL migration, trusted proxy, verified identity/MFA/recovery, contacts/approval, browser acceptance and unavailable registry audit. No production-readiness claim.

ABANDON: S7 This workspace denies listening on 127.0.0.1:3000 (EPERM), so Playwright cannot start its web server. Run npm run test:e2e from a normal terminal and verify production CSP on staging. This remains a required handoff, not a pass.
