# Gates: student review and reporting improvements

OWNS: src/**, prisma/**, tests/**, scripts/test-browser.cjs, scripts/test-without-email.cjs, scripts/verify-database.cjs, next.config.ts, next-env.d.ts, tsconfig.json, playwright.config.ts, package.json, docs/student-review.md, docs/security.md, README.md, STUDENT_REVIEW_GATES.md

Scope: reconcile Chapter Three and the IRMS reference with CampusGuard; implement sourced emergency contacts, nearby-security guidance, shorter passwords, optional incident coordinates, and restricted staff analytics and maps.

- [x] G1: Chapter Three requirements and reference-project findings have an evidence-backed implementation comparison.
  EVIDENCE: Reviewed all 16 PDF pages and mapped FR-01 through FR-12 plus privacy, status model, dashboards, database and tests in docs/student-review.md. Compared IRMS report form, location explorer, map helpers and incident model. GPS/maps/analytics extend the PDF MVP; remaining scope and chapter corrections are explicit.

- [x] G2: Emergency phone links match official published sources and guidance includes nearby campus security.
  EVIDENCE: On 2026-10-28 checked https://security.oauife.edu.ng/security-tips/ for 09034592436, 09070367707 and 09070367711, and NCC Special Duties service charter for 112. Reviewed contact config, banner, emergency help, home, report form and detail for nearby-security guidance. Sources and dates are displayed; website checks are distinguished from stakeholder confirmation and live calls.

- [ ] G3: Type checking accepts the integrated reporting and dashboard implementation.
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: pending

- [ ] G4: Password, coordinate persistence, input rejection, role access, confidential redaction, report lifecycle and email regression tests pass.
  CHECK: npm test
  EXPECT: INTEGRATION_PASSED
  EVIDENCE: pending

- [ ] G5: The production application builds successfully.
  CHECK: npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: pending

- [ ] G6: Browser flows verify all roles, optional geolocation, map selection, emergency links and responsive layouts against the production build.
  CHECK: npm run test:e2e -- --skip-build
  EXPECT: BROWSER_PASSED
  EVIDENCE: pending
