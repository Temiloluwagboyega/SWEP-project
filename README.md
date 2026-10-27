# CampusGuard · OAU

A Smart Campus Security and Emergency Response System course prototype for Obafemi Awolowo University, Ile-Ife. Students choose the Student Union Security Committee or Official University Security, submit a report, and follow its status. Staff see only their own channel and permitted confidential information.

The controlling requirements are summarised in [codex.md](codex.md). Dependencies are installed, the initial local SQLite migration is applied, and fictional demo data is seeded. Strict TypeScript checking and the incident lifecycle integration tests pass. A production build passes in the low-disk mode below. Browser end-to-end checks remain blocked by this session's localhost-listening restriction; the app has not been deployed. See [GATES.md](GATES.md) and [the current verification report](docs/verification-status.md).

For the latest download/test retry and the precise email, database, contact, and hosting requirements, see [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md).

## Run locally

Requirements: Node.js 22 LTS, npm, internet access for the initial dependency and Prisma engine downloads.

```sh
npm install
npm run env:setup
```

`env:setup` creates a private, Git-ignored `.env`, generates a random `AUTH_SECRET` if needed and preserves an existing valid key. The local working copy already has one. Never commit `.env`. See [the security baseline](docs/security.md) for session controls, exact rate limits and production prerequisites.

```sh
npm run db:generate
npm run db:setup
npm run dev
```

Open `http://localhost:3000`. The local fallback is SQLite at `prisma/dev.db`; the initial schema is recorded in `prisma/migrations/20261026132333_init/migration.sql`. Reports persist across process restarts. `db:setup` applies saved migrations and seeds fictional data. The seed command preserves existing reports rather than deleting them. It is disabled when `NODE_ENV=production`.

If you use a different local host or port, update `AUTH_URL`. Keep browser requests on the same origin as the server.

## Demo accounts

All of these fictional accounts use **`Demo#2026`**, stored as bcrypt hashes. They are local demo fixtures, not production credentials.

| Email                                           | Role                |
| ----------------------------------------------- | ------------------- |
| `student1@demo.test` / `student2@demo.test`     | Student             |
| `committee1@demo.test` / `committee2@demo.test` | Committee           |
| `security1@demo.test` / `security2@demo.test`   | Security            |
| `supervisor@demo.test`                          | Security supervisor |

Seed data includes 16 proposed campus locations and 15 fictional reports across categories, statuses, and channels, including confidential, urgent, and referred examples. Public registration always creates a student. Staff accounts are seeded; there is no public admin registration.

## Implemented source

- Responsive landing page, contacts, registration/login, student reports, report form, editing, detail, and timeline pages.
- Auth.js v5 Credentials authentication, bcrypt, JWT sessions, authoritative database role lookup.
- Prisma persistence, sequence-backed references, transactional report changes and history.
- Shared Zod validation, server-side ownership/channel checks, explicit confidential redaction, report-not-found 404 responses, origin checks on application mutations.
- Staff queue filters, urgent/oldest sorting, age indicators, 30-second visible-tab polling, new-report badges/counts, and manual refresh.
- Review, same-channel assignment, valid status changes, and one-way Committee-to-Security referral.
- Student timelines exclude internal notes, staff names, and staff IDs. Internal notes from a previous channel stay hidden after referral.
- All pages display emergency direction and the app's monitoring limitation. No invented phone numbers or working placeholder phone links.

Database-backed report services have now passed the integration suite. Authentication, browser interactions, and complete UI flows still require the browser checks below.

## Structure

```text
src/app/                  App Router pages and layouts
src/app/api/              Node.js API handlers
src/components/           Feature folders: auth, home, layout, reports, staff, ui
src/lib/access.ts         Role/channel/owner/confidentiality checks and redaction
src/lib/reports.ts        Transactional report lifecycle services
src/lib/auth.ts           Authentication and session-user lookup
src/lib/validation.ts     Shared input schemas
src/lib/status.ts         Allowed status transitions
src/lib/http/             Browser requests, backend errors, origin, responses
src/styles/               Tokens, base, layout, shared components, page styles
src/config/contacts.ts    Pending/verified contact configuration
prisma/schema.prisma      Local SQLite schema
prisma/seed.ts             Non-destructive fictional demo seed
scripts/check-syntax.cjs   Offline syntax check with malformed-code control
tests/integration.test.ts  Database-backed lifecycle/privacy tests
tests/browser/            Playwright browser flows
```

The API is routed by `src/app/api/[...path]/route.ts`; Auth.js has its own more-specific route. The public contract remains the endpoint paths defined in `codex.md`. Page handlers call the same protected services directly on the server. Server page guards replace the brief's optional middleware redirect; each API independently authorises access.

## Environment

| Variable          | Purpose                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`    | Local: `file:./dev.db`. Production: a configured PostgreSQL connection after changing the Prisma provider.             |
| `AUTH_SECRET`     | Unique random secret; required for secure sessions.                                                                    |
| `AUTH_URL`        | Canonical application origin, locally `http://localhost:3000`.                                                         |
| `APP_ENV` | `local` for the localhost SQLite demo; `production` requires public HTTPS and PostgreSQL. |
| `TRUSTED_CLIENT_IP_HEADER` | Optional single-IP header overwritten by a trusted reverse proxy. Leave empty locally. |

Do not log secrets, session contents, incident descriptions, or database error payloads. Staff email notifications are deferred; `RESEND_API_KEY` is not used by this implementation.

## Checks

After installing dependencies and generating the Prisma client:

```sh
npm run check:syntax
npm run check:access
npm run typecheck
npm test
npm run build
```

Integration tests create and remove an isolated temporary SQLite database. They test saved reports, unique references under parallel submissions, ownership and channel denials, exact confidential allowlists with positive controls for sensitive data, editing restrictions, status transitions, same-channel assignment, referral, historical-note isolation, terminal states, and urgency ordering. They do not alter the demo database.

For browser checks, initialise the local demo database, install the browser, then run:

```sh
npm run db:setup
npx playwright install chromium
npm run test:e2e
```

Playwright starts the development server if one is not running. Browser tests submit fictional reports and create a fictional student in the **demo database**, so this suite must never target a real deployment or real incident data. It covers registration, submission to both channels, open-queue polling, handling/referral, student privacy, wrong-account denial, cross-origin mutation rejection, and mobile/desktop overflow checks. Run against a disposable demo database if you want the original fixtures unchanged.

The offline access check executes the actual access-control and status-table source against explicit policy fixtures, including positive controls for redacted secrets. It does not substitute for database, session, API, or browser integration testing.

Seed and integration commands use `node --import tsx` so they do not require the tsx CLI’s optional local IPC socket.

The syntax check works with local TypeScript or the current machine's global TypeScript fallback. It only proves syntactic validity; it does not prove type safety, package compatibility, database correctness, authentication, browser behaviour, or build success.

## Recorded implementation assumptions

1. **Review before assignment:** the transition table takes precedence over abbreviated demo instructions. Assignment is available from `UNDER_REVIEW` and creates `ASSIGNED` with a real handler.
2. **Confidential intake:** same-channel staff can acknowledge an unassigned report into `UNDER_REVIEW` without notes, then claim it for themselves using metadata only. They cannot assign confidential cases to colleagues until they already have full-content permission. Security supervisors retain their stated channel-specific permissions. This conservative intake policy needs stakeholder review before real use.
3. **Referral:** only active reports may be transferred; `RESOLVED`, `CLOSED`, and `REJECTED` reports cannot be referred. A confidential Committee report must be handled by its assignee before referral. Transfer resets status/assignee, revokes Committee access, and writes a public referral reason.
4. **Internal history:** added immutable `StatusEvent.actorChannel` for accurate attribution and channel-specific internal notes after transfer. It is additional security/integrity metadata, not a new product feature. Reporter-created events are labelled “Reporter”. No staff identities are exposed to students.
5. **References:** added a database autoincrement `ReferenceSequence`; the sequence is global, with the current UTC year in the reference prefix, rather than an unspecified annual reset.
6. **Confidential queues:** strict metadata allowlist overrides general queue columns, including hiding location and assignee. Links use the already-permitted reference when the internal ID is redacted.
7. **Local database:** no cloud database credentials were supplied, so the brief's SQLite fallback is used for local development. PostgreSQL remains the deployment target.
8. **Queue size:** list responses return up to 200 reports, prioritised according to the brief. Pagination beyond the course-demo scale is not implemented.

## Deployment prerequisites

This app is designed for a Node.js host such as Vercel, following the brief. It has not been deployed. The Sites plugin's Cloudflare Workers hosting does not match the specified Node.js/Prisma architecture, so no Sites project was created.

Before deploying:

1. Install dependencies, generate and commit a reviewed lockfile, and pass type, integration, build, and browser checks.
2. Provision PostgreSQL (for example, Neon or Supabase) and configure its `DATABASE_URL`. PostgreSQL needs its own schema/provider and migration history; do not apply the saved SQLite migration SQL or its migration lock to PostgreSQL. Configure Prisma generation and the deployment build to use the selected PostgreSQL schema, generate/review its migration, apply it to staging, and rerun the database checks there. This cloud configuration has not been created yet.
3. Configure a fresh `AUTH_SECRET`, canonical HTTPS `AUTH_URL`, and secure host/session settings. Do not seed shared demo passwords into real-use environments. Default Auth.js production cookies require HTTPS.
4. Configure the deployment build as `npm run build`, and apply reviewed migrations as an explicit deployment step. Run staging tests again with PostgreSQL; passing SQLite checks does not prove PostgreSQL deployment behaviour.
5. Verify QRS/contact information, finalise locations, agree queue-monitoring responsibilities, and review the confidential intake/referral assumptions with stakeholders.
6. Obtain university approval and agree retention/deletion, backups/restoration, access reviews, incident handling and recovery procedures before accepting real incident data.

## Known limitations and deferred work

- **Current browser blocker:** the session cannot listen on `127.0.0.1:3000`, so Playwright cannot start the test web server. Dependencies, the Prisma client, local migration, seed, integration tests, and low-disk production build are now verified. No live browser-flow or deployment result is claimed.
- Emergency phone numbers are unverified. `VERIFY_BEFORE_DEMO` stays in configuration and is never presented as a phone number. The verified-contact acceptance check remains pending.
- Committee participation, checking frequency, production readiness, and sensitive public-update policy are unconfirmed.
- Anonymous reporting, evidence uploads, email/SMS/push notifications, patrol-entry UI, rejection-reason enforcement/duplicate linking, maps/GPS, analytics, and university integrations are deferred per the brief.
- Database-backed login, registration, report and API limits are implemented. Hosting needs trusted proxy and edge protection configuration; see [security details](docs/security.md).
- Student pages refresh on navigation; only the staff queue polls. Confidential reports expose category/urgency/time to channel staff as explicitly required by the brief.
- Sessions expire after 30 minutes idle or eight hours absolute; operators can revoke sessions or disable accounts using `account:manage`. Email verification, recovery, staff SSO/MFA and an account management UI are not implemented.

# SWEP-project

## Design upgrade

See [the design and folder guide](docs/design-upgrade.md), [brand direction](docs/brand-guidelines.md), and [design master](design-system/campusguard/MASTER.md). A standalone, fixture-only component preview is generated at `artifacts/design-preview.html`; it is not the running backend application. The redesign adds reusable UI components, feature folders, an HTTP helper folder, token-based styling, contextual portal navigation, accessible error summaries, and a responsive staff report table. Verification boundaries are recorded in [DESIGN_GATES.md](DESIGN_GATES.md).

## Migration and low-disk commands

`npm run db:setup` applies saved **SQLite** migrations and seeds the local demo. After changing the local Prisma schema, create a new development migration with `npm run db:migrate -- --name describe_change`. Do not reset an existing database merely to re-run setup. Integration tests continue to create a disposable schema in their own temporary database.

The first build exhausted available disk while writing Webpack/TypeScript caches. Only task-generated temporary preview packages and `.next/cache` were removed. The following opt-in mode disables the production Webpack cache and completed successfully:

```sh
CAMPUS_DISABLE_BUILD_CACHE=1 npm run build
```

Normal development caching is unchanged. `.env`, the SQLite file, dependencies, and source files were preserved.

## Security update (27 October 2026)

The local security migration adds persistent rate counters, revocable login sessions, account activation and session version fields. Request size/type/origin checks, private API responses, stronger new passwords, nonce CSP and HTTPS security headers are implemented. See [SECURITY_GATES.md](SECURITY_GATES.md) for validation evidence and [docs/security.md](docs/security.md) for configuration and outstanding real-use requirements. This remains a fictional local demo.
