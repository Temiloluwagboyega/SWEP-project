# Verification after dependency installation

26 October 2026. User completed `npm install` in their normal terminal. This report supersedes earlier dependency-blocked status notes.

| Check                       | Result                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dependencies                | `node_modules` and `package-lock.json` present; Prisma 6.19.3 and Next.js 16.4.3 installed.                                                                  |
| Prisma generation           | Successful against the local SQLite schema.                                                                                                                  |
| Initial migration           | `20261026132333_init` created and applied to `prisma/dev.db`.                                                                                                |
| Seed                        | 7 fictional users, 16 proposed campus locations, 15 fictional reports, 49 status events, 15 reference-sequence entries.                                      |
| Strict TypeScript           | Passed.                                                                                                                                                      |
| Database integration tests  | All 7 passed, including ownership/channel isolation, confidential redaction, editing restrictions, transitions, referral, and parallel reference generation. |
| Production build            | Passed with `CAMPUS_DISABLE_BUILD_CACHE=1`; application pages and API routes compiled.                                                                       |
| Browser end-to-end tests    | Blocked: the test server cannot listen on `127.0.0.1:3000` in this session (`EPERM`). No live login/UI/polling acceptance result is claimed.                 |
| Cloud PostgreSQL/deployment | Not configured or deployed. The verified database is the local SQLite demo.                                                                                  |

The database has five domain tables: User, Location, Report, StatusEvent, and ReferenceSequence, plus Prisma's migration bookkeeping table. `scripts/verify-database.cjs` checks the applied migration and demo records through a fresh Prisma connection without logging report contents, password hashes, or environment secrets.

The tsx CLI tried to create an optional local IPC socket that this session disallows. Seed and test scripts now use Node's supported `--import tsx` loader instead. That runs the same TypeScript files without opening that socket.

The first production build compiled but could not write its cache because the disk filled. Only task-generated `.next/cache` and the temporary preview runtime were removed. No user documents, database, original npm cache, or installed project dependencies were deleted. The cache-disabled build then completed successfully.

To run the app from a normal terminal:

```sh
cd /Users/wikiwoo/Documents/swep
npm run dev
```

Visit `http://localhost:3000`. Student: `student1@demo.test`; staff: `security1@demo.test`; demo password: `Demo#2026`. These are fictional demonstration accounts. No real incident data or operational-readiness claim is implied.

For browser testing outside the restricted session, install the Playwright Chromium browser if it is not already available, then run `npm run test:e2e`. Database integration tests use a disposable temporary database; browser tests write fictional records to the local demo database.

A future PostgreSQL deployment needs a PostgreSQL-specific schema/migration history and matching Prisma generation/build configuration. The SQLite migration is not portable PostgreSQL SQL. Emergency contact phone verification, stakeholder operating procedures, and real-use approval are still pending; optional staff email is still unwired.

## Security hardening — 27 October 2026

The security migration is applied locally and preserved the fictional data. The private environment/key, persistent abuse counters, revocable/expiring sessions, bounded requests, canonical-origin/CSRF checks and browser policies are implemented. The current check record is [SECURITY_GATES.md](../SECURITY_GATES.md); controls and deployment limits are in [security.md](security.md). Earlier test counts refer to the pre-hardening run. Full browser acceptance still requires a permitted server/browser environment.

Security acceptance covers 7 incident lifecycle cases and 15 security cases, including direct Auth.js CSRF/login/logout/revocation, concurrent persistent limits, fail-closed rate verification, bounded bodies and registration role injection. Typecheck, production build, access policy and local migration checks pass. The final disabled-handler change passed regression tests, typecheck and build. Seven of eight security gates are met; the browser gate is explicitly recorded as an outstanding handoff. Browser acceptance remains a required handoff. The npm audit attempt failed with registry DNS ENOTFOUND, so no clean dependency-audit claim is made.
