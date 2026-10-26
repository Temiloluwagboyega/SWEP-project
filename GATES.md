# Gates: Smart Campus Security initial application

OWNS: src/**, prisma/**, scripts/**, tests/**, package.json, package-lock.json, tsconfig.json, next.config.ts, playwright.config.ts, postcss.config.mjs, next-env.d.ts, .gitignore, .env.example, README.md, SETUP_CHECKLIST.md, codex.md, GATES.md

Current blocker: Dependency installation fails with ENOTFOUND registry.npmjs.org. G1–G4 remain unmet; offline checks do not prove runtime readiness.

Scope: A locally runnable Next.js application implementing the report-and-track MVP with persistent demo data and server-side privacy controls. Verified contacts and institutional deployment remain external prerequisites.

- [x] G0: TypeScript source has no syntax errors and the checker rejects a malformed control
  CHECK: npm run check:syntax
  EXPECT: SYNTAX_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=2614bafa8645d030e92148aa71eb6ff2dbdb12f4819f8919501f67b746439656; exit=0; EXPECT=matched; output-sha256=b22dcd827f09553a5da8c1f0cf379c3fa5e63b34451532806fce985dfddc1035; output-bytes=185; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

- [ ] G1: Application passes strict TypeScript checking
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: pending

- [ ] G2: Access, redaction, report lifecycle, and concurrent references pass integration tests
  CHECK: npm test
  EXPECT: INTEGRATION_PASSED
  EVIDENCE: pending

- [ ] G3: Production application compiles successfully
  CHECK: npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: pending

- [ ] G4: Browser flows support registration, both channels, handling, privacy, and mobile layouts
  CHECK: npm run test:e2e
  EXPECT: BROWSER_PASSED
  EVIDENCE: pending

- [x] G5: Documentation accurately explains local setup, assumptions, verification, and deployment prerequisites
  EVIDENCE: Reviewed README against source and observed npm failures on 26 October 2026; it distinguishes written code from unverified runtime behaviour, lists SQLite/PostgreSQL setup and demo accounts, documents intake/referral assumptions and pending contacts, and makes no deployment claim.

- [x] G6: Offline execution of access controls enforces ownership, channels, confidential redaction, and the status table
  CHECK: npm run check:access
  EXPECT: ACCESS_POLICY_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a055ca596adde04046c8f73f56eef3c32c5f156db0155e4c6cf20e77cdf4b4e6; exit=0; EXPECT=matched; output-sha256=d250d417f0ed85e233c184b4c6a566ba0ea0c11f5fbf9bb619b10fd3e3c75805; output-bytes=302; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=6b96db336957/34 entries

Follow-up assessment: SETUP_CHECKLIST.md records the repeated registry DNS failure, rerun check results, and remaining email/deployment requirements. No new application feature was enabled and no live email was sent.
