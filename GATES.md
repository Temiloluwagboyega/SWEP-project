# Gates: Smart Campus Security initial application

OWNS: src/**, prisma/**, scripts/**, tests/**, package.json, package-lock.json, tsconfig.json, next.config.ts, playwright.config.ts, postcss.config.mjs, next-env.d.ts, .gitignore, .env.example, README.md, SETUP_CHECKLIST.md, codex.md, GATES.md

Current state: Dependencies are installed, the local SQLite migration has been applied, fictional data is seeded, and database integration/type checks pass. Browser acceptance remains blocked because this session cannot listen on 127.0.0.1:3000. Production checks use the documented low-disk build mode.

Scope: A locally runnable Next.js application implementing the report-and-track MVP with persistent demo data and server-side privacy controls. Verified contacts and institutional deployment remain external prerequisites.

- [x] G0: TypeScript source has no syntax errors and the checker rejects a malformed control
  CHECK: npm run check:syntax
  EXPECT: SYNTAX_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=2614bafa8645d030e92148aa71eb6ff2dbdb12f4819f8919501f67b746439656; exit=0; EXPECT=matched; output-sha256=7b612443d58c2540811620cde4d1cb18bb6bca63b6c2a9914d6c217afbcb4c83; output-bytes=185; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [x] G1: Application passes strict TypeScript checking
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [x] G2: Access, redaction, report lifecycle, and concurrent references pass integration tests
  CHECK: npm test
  EXPECT: INTEGRATION_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=451787c1c8b2037ed058a2366d2dfb338f3d4c3593fc7de5431f618b74018dde; exit=0; EXPECT=matched; output-sha256=79b61944a073066fee5b24ce4e412b60016f66aba6cd1806914f2f1aa19d2cca; output-bytes=2048; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [x] G3: Production application compiles successfully
  CHECK: CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=0a6f18b320bd6397df14ccb5dc8ac112dd8b475ef3b14c91810c88470876d0e1; exit=0; EXPECT=matched; output-sha256=fa22b6e7c2ffa1c18b075a3c2c079caf7dbe4adcb93a074467562c9a4bf5ac2c; output-bytes=1258; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [ ] G4: Browser flows support registration, both channels, handling, privacy, and mobile layouts
  CHECK: npm run test:e2e
  EXPECT: BROWSER_PASSED
  EVIDENCE: pending

- [x] G5: Documentation accurately explains local setup, assumptions, verification, and deployment prerequisites
  EVIDENCE: Reviewed current README, SETUP_CHECKLIST and docs/verification-status.md against installed dependencies, applied migration, seeded counts and actual successful type/integration/build outputs. Browser EPERM, SQLite-only status, PostgreSQL history separation, unwired email and pending contact verification are documented without a deployment claim.

- [x] G6: Offline execution of access controls enforces ownership, channels, confidential redaction, and the status table
  CHECK: npm run check:access
  EXPECT: ACCESS_POLICY_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a055ca596adde04046c8f73f56eef3c32c5f156db0155e4c6cf20e77cdf4b4e6; exit=0; EXPECT=matched; output-sha256=d250d417f0ed85e233c184b4c6a566ba0ea0c11f5fbf9bb619b10fd3e3c75805; output-bytes=302; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

Follow-up assessment: SETUP_CHECKLIST.md records the repeated registry DNS failure, rerun check results, and remaining email/deployment requirements. No new application feature was enabled and no live email was sent.

- [x] G7: Local demo tables have an applied versioned migration and the expected fictional accounts and records
  CHECK: node scripts/verify-database.cjs
  EXPECT: DATABASE_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=d89ba057d8aeb44fc05fc78717e635b27b0408f6241a9c28591f94499a90c77f; exit=0; EXPECT=matched; output-sha256=3766cd6ed1bc90bf3a2bf9a45879830b8b27d604224f0f85dab3fea92faca068; output-bytes=162; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries
