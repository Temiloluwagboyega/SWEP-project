# Gates: import reviewed Claude worktree into main checkout

OWNS: src/**, prisma/**, scripts/**, tests/**, docs/**, package.json, package-lock.json, .env.example, .gitignore, .vercelignore, README.md, CLAUDE_HANDOFF.md, CONTINUATION_GATES.md, MAIN_IMPORT_GATES.md

Scope: Bring the merged PostgreSQL/SMTP PRs and reviewed SafeCampus changes into this main working directory, preserve private credentials and data, validate locally, and attempt commit/push.

- [ ] M1: Imported source files and deletions match the source-worktree snapshot
  CHECK: node scripts/verify-worktree-import.cjs
  EXPECT: WORKTREE_IMPORT_VERIFIED
  EVIDENCE: pending

- [ ] M2: Main checkout passes TypeScript
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: pending

- [ ] M3: Main checkout passes mocked email security tests without sending mail
  CHECK: node --import tsx --test tests/email.test.ts
  EXPECT: fail 0
  EVIDENCE: pending

- [ ] M4: Main checkout builds with the PostgreSQL client
  CHECK: CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: pending

- [ ] M5: Private environment remains ignored with a strong secret and required database URLs
  CHECK: node scripts/setup-env.cjs --check
  EXPECT: ENVIRONMENT_VERIFIED
  EVIDENCE: pending

- [ ] M6: All imported changes are committed and pushed to origin main
  EVIDENCE: pending
