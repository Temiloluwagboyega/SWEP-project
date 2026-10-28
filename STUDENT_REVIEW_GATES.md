# Gates: student review and reporting improvements

OWNS: src/**, prisma/**, tests/**, scripts/test-browser.cjs, scripts/test-without-email.cjs, scripts/verify-database.cjs, next.config.ts, next-env.d.ts, tsconfig.json, playwright.config.ts, package.json, docs/student-review.md, docs/security.md, README.md, STUDENT_REVIEW_GATES.md

Scope: reconcile Chapter Three and the IRMS reference with CampusGuard; implement sourced emergency contacts, nearby-security guidance, shorter passwords, optional incident coordinates, and restricted staff analytics and maps.

- [x] G1: Chapter Three requirements and reference-project findings have an evidence-backed implementation comparison.
  EVIDENCE: Reviewed all 16 PDF pages and mapped FR-01 through FR-12 plus privacy, status model, dashboards, database and tests in docs/student-review.md. Compared IRMS report form, location explorer, map helpers and incident model. GPS/maps/analytics extend the PDF MVP; remaining scope and chapter corrections are explicit.

- [x] G2: Emergency phone links match official published sources and guidance includes nearby campus security.
  EVIDENCE: On 2026-10-28 checked https://security.oauife.edu.ng/security-tips/ for 09034592436, 09070367707 and 09070367711, and NCC Special Duties service charter for 112. Reviewed contact config, banner, emergency help, home, report form and detail for nearby-security guidance. Sources and dates are displayed; website checks are distinguished from stakeholder confirmation and live calls.

- [x] G3: Type checking accepts the integrated reporting and dashboard implementation.
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries

- [x] G4: Password, coordinate persistence, input rejection, role access, confidential redaction, report lifecycle and email regression tests pass.
  CHECK: npm test
  EXPECT: INTEGRATION_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=451787c1c8b2037ed058a2366d2dfb338f3d4c3593fc7de5431f618b74018dde; exit=0; EXPECT=matched; output-sha256=79d04bea490232435f33b2a18bcefe048cc994bd5bf9647c0774a50dd9d83e43; output-bytes=7838; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries

- [x] G5: The production application builds successfully.
  CHECK: npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=b976a3a4b877a5bca2d6bb1fb46bcd8b87a088ddc7eb5eed0124999b21b824b8; exit=0; EXPECT=matched; output-sha256=9ae41684788dca944f5c7d9ca00a2983684524851064b7561c368b8b936c2298; output-bytes=1286; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries

- [x] G6: Browser flows verify all roles, optional geolocation, map selection, emergency links and responsive layouts against the production build.
  CHECK: npm run test:e2e -- --skip-build
  EXPECT: BROWSER_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=94d3e1fc2cc84a55a2d2b1e6cd33d4b673e8a3b34c61469096df21afe1d54846; exit=0; EXPECT=matched; output-sha256=effbf8719c42d3593a3c6682815ccddcd3f9b1dfe1fdf263306a49d8d57aa303; output-bytes=1234; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries
