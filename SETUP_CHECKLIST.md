# What is needed to run and finish CampusGuard

Assessment: 26 October 2026. This is a source/configuration review plus the checks that could run in the current environment; it is not a successful runtime acceptance report.

## Current installation and verification state

The user completed npm installation in a normal terminal. Prisma 6.19.3 and Next.js 16.4.3 are installed. The initial SQLite migration is applied and the fictional demo database is seeded. Strict TypeScript checking, all seven database integration cases, and a cache-disabled production build now pass.

Browser checks are still blocked because this session cannot listen on `127.0.0.1:3000` (`EPERM`). This is distinct from the earlier npm DNS failure. No hosted PostgreSQL connection or deployment is configured. See [the verification report](docs/verification-status.md) for current evidence and commands.

## 1. Finish local installation and testing

Run these from a terminal that can access the npm registry and the Prisma/Playwright download hosts:

```sh
cd /Users/wikiwoo/Documents/swep
npm install
npm run db:generate
npm run db:setup
npx playwright install chromium
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The ignored local `.env` already contains a generated authentication secret and a SQLite URL; its migration and demo seed have been applied. Do not print or share the secret. On a different checkout, copy `.env.example` and generate a new secret first.

To view the app after setup:

```sh
npm run dev
```

Open `http://localhost:3000`. The seeded demo password is `Demo#2026`; account names/roles are in README. Database integration tests use a temporary database. Browser tests write fictional reports/accounts into the local demo database.

No email account, paid hosting, SMS account, map key, or cloud database is required to test the local MVP. The database tests pass; complete browser acceptance outside this session before declaring every UI flow verified.

## 2. Email: both implementation and service setup are still needed

**Current state:** no `src/lib/notify.ts`, no email SDK dependency, no email send calls, and no delivery test. Setting an API key alone will not turn on email.

The project brief selects **Resend** for optional staff alerts. The required behaviour is notification on a new report or a Committee-to-Security referral, sent only to staff in the receiving channel. Student status-update emails are deferred, not part of that feature.

### Configuration you would supply

| Item                                                    | Purpose                                                                                                                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resend account and server-side `RESEND_API_KEY`         | Allows the backend to call the email provider. Store in local/deployment secret settings, never in client code or Git.                                                                   |
| A domain you control and DNS access                     | Required to verify your sending domain for normal delivery. Add the DNS records Resend supplies.                                                                                         |
| Sender address, e.g. `CampusGuard <alerts@your-domain>` | Must use the verified sending domain. A proposed `RESEND_FROM_EMAIL` variable would be added with the integration; it is not currently read by this app.                                 |
| Team-controlled recipient inboxes                       | The current `committee1@demo.test`/`security1@demo.test` fixtures are not delivery inboxes. Configure approved staff addresses in the database through a deliberate seed/account update. |
| Canonical application URL                               | Use the correct `AUTH_URL` origin for staff-detail links; use HTTPS for deployed delivery.                                                                                               |

Resend documents the API key and verified-domain requirements in its [Node.js guide](https://resend.com/docs/send-with-nodejs) and [domain verification guide](https://resend.com/docs/dashboard/domains/introduction). Its shared `onboarding@resend.dev` sender is suitable for initial testing with the account owner's inbox; arbitrary recipients need a verified domain, as described in [Vercel's Resend walkthrough](https://vercel.com/academy/visual-workflow-builder-on-vercel/resend-plugin).

### Code and checks still to add after the MVP checks pass

- Add the Resend client and a server-only `src/lib/notify.ts` helper with validated sender/origin configuration.
- Call it after a report/referral transaction commits. Missing API key skips delivery; provider failure must not undo a saved report or tell the student their saved report failed.
- Query only receiving-channel staff. Send to recipients individually or otherwise avoid unnecessarily exposing recipient addresses.
- Include only reference, category, urgency, and an authenticated staff-detail link. Never include description, location note, reporter identity, evidence, or internal notes. This applies to confidential reports too.
- Test missing configuration, provider rejection/timeouts, both receiving channels, referral recipients, and absence of sensitive fields using mocks. Only then test real delivery to a team-controlled inbox.
- Confirm who checks the queue; delivery of an email does not establish that someone will respond immediately.

No email has been sent as part of this assessment. Credentials are not needed to write/mock-test the integration; they are needed for an authorised live-delivery test.

## 3. Other things needed for the demo or deployment

| Item                           | Current state                                                                          | Next action                                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Verified emergency contacts    | Phone numbers still `VERIFY_BEFORE_DEMO`; UI hides fake phone links                    | Obtain/verify QRS and approved contact details, then update `src/config/contacts.ts`.                                                                              |
| Campus locations               | Proposed locations seeded in source                                                    | Confirm names/areas with the team.                                                                                                                                 |
| Local database                 | SQLite schema and seed source present, not executed here                               | Run generation/setup after install.                                                                                                                                |
| Hosted database                | Not provisioned; no PostgreSQL migration exists                                        | For Vercel, provision PostgreSQL, change Prisma provider, generate/review migrations, and retest with PostgreSQL. Local-file SQLite is not durable Vercel storage. |
| Hosting and URL                | No deployment exists                                                                   | Configure a Node.js host, deployment URL, database secret, and fresh deployment `AUTH_SECRET`; pass the checks first.                                              |
| Account ownership and recovery | Password login exists in source; email verification/reset do not                       | Consider verified emails and expiring, single-use password-reset tokens before real use. They are additional work, not enabled by staff alerts.                    |
| Abuse controls                 | Rate limiting not implemented                                                          | Add the brief's optional limits after MVP is green; real-use deployment needs reviewed abuse controls.                                                             |
| Sensitive-case procedures      | Prototype assumptions documented in README                                             | Agree confidential intake, assignment/referral rules, public status detail, and queue-checking responsibility with stakeholders.                                   |
| Real-use readiness             | University approval, retention/deletion, backup/restore, and access review not settled | Complete these before storing real incident data. Use fictional data for the course demonstration.                                                                 |

Vercel explains why local-file SQLite is unsuitable for its serverless filesystem in its [SQLite support guidance](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel).

Evidence uploads, maps/GPS, SMS, anonymous reporting, and university integration remain outside the initial MVP; do not create service accounts for them just to run the current app.
