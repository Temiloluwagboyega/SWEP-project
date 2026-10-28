# Gates: import reviewed Claude worktree into main checkout

OWNS: src/**, prisma/**, scripts/**, tests/**, docs/**, package.json, package-lock.json, .env.example, .gitignore, .vercelignore, README.md, CLAUDE_HANDOFF.md, CONTINUATION_GATES.md, MAIN_IMPORT_GATES.md

Scope: Bring the merged PostgreSQL/SMTP PRs and reviewed SafeCampus changes into this main working directory, preserve private credentials and data, validate locally, and attempt commit/push.

- [x] M1: Imported source files and deletions match the source-worktree snapshot
  CHECK: node scripts/verify-worktree-import.cjs
  EXPECT: WORKTREE_IMPORT_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=51b41b8aa30d195e6faf7cfe15dd5b9858098959d10318b3fd2e9dbb3b2c4510; exit=0; EXPECT=matched; output-sha256=afe908462acc4bc2bb1b3c56b47c750ea2d6c3a089bbee3fdcd9c80aeb2d6d1d; output-bytes=126; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] M2: Main checkout passes TypeScript
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] M3: Main checkout passes mocked email security tests without sending mail
  CHECK: node --import tsx --test tests/email.test.ts
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=17f9950a0fa22ad58ef75f3c472c6965b0c893138445183b4f397b8b8afb6294; exit=0; EXPECT=matched; output-sha256=aeb51ef10aa4febf550a6c36d0ff869f3fe8c663cb5043ed5f7f33760860b672; output-bytes=1276; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] M4: Main checkout builds with the PostgreSQL client
  CHECK: CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
  EXPECT: BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=0a6f18b320bd6397df14ccb5dc8ac112dd8b475ef3b14c91810c88470876d0e1; exit=0; EXPECT=matched; output-sha256=519eb96b1b6061af8e497c5aca6c02cd9520744d31ec5a1d3e3bdd9c814d5c7b; output-bytes=1288; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [x] M5: Private environment remains ignored with a strong secret and required database URLs
  CHECK: node scripts/setup-env.cjs --check
  EXPECT: ENVIRONMENT_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=4497f82f1794bea1d664ffb0f11fab5bf85c8df8713508962b5c925494dce65a; exit=0; EXPECT=matched; output-sha256=abb375ec926d48f9db6d794dca0e6aa2d850eede84f15c11a1f23f9fb56be964; output-bytes=94; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=95c1ccbd93d9/35 entries

- [ ] M6: All imported changes are committed and pushed to origin main
  EVIDENCE: pending
