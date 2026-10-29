# Gates: signup investigation and application audit

OWNS: AUTH_APP_AUDIT_GATES.md, .npmrc, .env.example, README.md, package.json, package-lock.json, public/images/oau-campus.jpg, src/**, tests/**, docs/**

Scope: diagnose signup and login behavior, audit the application, fix confirmed defects, and report verification and remaining risks.

- [x] G1: signup and login paths are traced and code-verified failure causes are distinguished
  EVIDENCE: Reviewed registration route, Auth.js authorization/session callbacks, client form, and rate limiter; documented three code-verified failure paths and the unavailable account-specific evidence in docs/app-audit-2026-10-29.md.

- [x] G2: confirmed auth defects are fixed and a realistic signup and login regression passes
  EVIDENCE: Production registration guard and Vercel IP fixture pass in the 39-test suite; full 7-case browser suite passes signup, sign-out, wrong password, correct login, and avatar upload regression.

- [x] G3: API authorization, report workflow, data handling, deployment settings, and main UI flows are reviewed with verified findings
  EVIDENCE: Reviewed source and tests in src/lib/access.ts, reports.ts, security/, email.ts, src/app/api/, src/components/, prisma/, next.config.ts, and deployment docs; findings and limits recorded in docs/app-audit-2026-10-29.md. Policy check and browser cases passed.

- [x] G4: typecheck, automated tests, and build complete after changes
  EVIDENCE: npm run check:syntax passed; npm run check:access passed; npm run typecheck passed; npm test passed 39/39; npm run test:e2e passed 7/7; CAMPUS_DISABLE_BUILD_CACHE=1 npm run build passed; npm ci --dry-run --ignore-scripts passed.

- [x] G5: final report names unresolved risks and limits of live-account diagnosis
  EVIDENCE: docs/app-audit-2026-10-29.md records missing identity verification/recovery, Prisma advisory, campus IP limits, draft continuity, and unavailable hosted/account evidence; final user report will repeat the material actions.
