# Smart Campus Security and Emergency Response System — project context

Last reconciled: 26 October 2026. This file gives future coding sessions durable project context from all four supplied documents. It records requirements, not an implementation claim. At creation, this workspace was empty; no application, dependencies, database, or deployment had been created or verified.

## Sources and precedence

Read these sources when more detail is needed. Their original locations are outside the repository and may not exist on another machine.

| Source                                       | Version/status                                           | Original path                                                             | Use                                                                                                                                   |
| -------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Project Brief                                | v1.1, 26 October 2026                                    | `/Users/wikiwoo/Downloads/Smart_Campus_Security_Project_Brief.pdf`        | Controlling product, implementation, API, security, and acceptance specification; explicitly calls itself the single source of truth. |
| Software Requirements Specification          | v0.1, 25 October 2026; draft, approval pending           | `/Users/wikiwoo/Downloads/Smart_Campus_Security_Requirements_SRS.docx`    | Requirement IDs and provisional acceptance criteria; proposed requirements are not verified research findings.                        |
| Research Analysis Report and Recommendations | Research collected 20–21 October 2026; no version stated | `/Users/wikiwoo/Downloads/Smart Campus Security Analysis.docx`            | Student survey, interviews, interpretation, recommendations, and research limitations.                                                |
| Team 3 Research and Feasibility Report       | No version/date stated in document                       | `/Users/wikiwoo/Downloads/Team_3_Research_and_Feasibility_Report_OAU.pdf` | Operational/technical feasibility, constraints, comparable systems, and an earlier two-week prototype plan.                           |

Follow explicit current user decisions, then the project brief for settled implementation decisions. Use the other documents for supporting evidence and context. Do not silently combine incompatible proposals. Preserve unresolved issues below and document assumptions. This context file does not grant institutional approval or resolve stakeholder questions.

The active plan is **four developers, two days**, rather than Team 3's earlier two-week schedule. The brief chooses one Next.js application with Node.js Route Handlers; Express and Firestore in the feasibility report are alternatives, not required technologies.

## Product and campus context

Build a mobile-friendly web application for Obafemi Awolowo University (OAU), Ile-Ife. Students submit incidents, choose a receiving channel, receive a reference, and track progress. Responders review, assign, refer, and update reports through a role-restricted staff portal on the same site.

This is a reporting and coordination layer supporting existing campus security. Keep phone and in-person routes visible. Do not promise immediate response, dispatch, continuous monitoring, guaranteed response times, or full anonymity.

Existing operations:

- Official security discovers many incidents through patrols. Students can report to the Quick Response Squad (QRS) in the **Senate Building**. The Chief Security Officer (CSO) directs reports to the appropriate department. Theft is common.
- The Student Union Security Committee connects students and management. It handles student civil matters and accommodation-agent disputes through mediation, sometimes with a third party and verbal/written statements. Serious matters go to higher officials or police.
- The committee has no authority over non-students or off-campus disputes. Sensitive cases are handled by only one or two representatives. Its reported holiday/exam-period activity does not establish 24/7 app coverage.
- Committee participation in the digital system is not yet agreed. Operational responsibilities must be confirmed before real use.

## Research evidence and its limits

Evidence consists of interviews with one official security officer, Prince Adewuyo Adebanjo, and one committee member, Mr Oyetolani, plus a Google Forms survey of **45 undergraduates**, 20–21 October 2026. These names identify research sources; do not reuse them as demo users.

| Finding                                            | Count/share         | Product implication                                       |
| -------------------------------------------------- | ------------------- | --------------------------------------------------------- |
| Not knowing whom to contact is a reporting barrier | 39/45, 87%          | Prominent contacts and clear channel guidance.            |
| Do not know official reporting channel             | 27/45, 60%          | Explain routes without requiring institutional knowledge. |
| Unsure of official channel                         | 7/45, 16%           | Guidance remains important beyond those answering “no.”   |
| Want report status updates                         | 45/45, 100%         | Reference and visible status history are core.            |
| A campus map or location list would help           | 38/45, 84%          | Seeded location selector; a map is not required.          |
| Want emergency contact information                 | 29/45, 64%          | Contacts available throughout the app.                    |
| Want anonymous or confidential reporting           | 21/45, 47%          | Confidential MVP; anonymous requires separate safeguards. |
| Privacy concern; fear of consequences              | 9/45 each, 20% each | Least privilege and minimal personal data.                |
| Connectivity/access problems                       | 15/45, 33%          | Lightweight interface and honest submission failures.     |
| Difficulty describing location                     | 9/45, 20%           | Location selector plus optional note.                     |
| Very confident in an emergency                     | 6/45, 13%           | Clear emergency direction; guidance page is stretch.      |

Preferred reporting medium: mobile app 15, phone 14, website 12, in person 4. No medium has a majority. A responsive website is a feasibility choice, not proof that most students prefer websites.

The 84% location result is from a separate map/list question; only 12/45 selected a location selector in the multi-select useful-features question. Do not conflate these figures. Reference numbers were selected by 5/45; tracking is supported most strongly by the unanimous request for updates.

Research is small and preliminary: only undergraduates, one interview per security body, roughly 24 hours of survey collection, some unclear free-text responses, and no question establishing experience of crime. Do not infer crime prevalence, campus-wide representation, institutional endorsement, or a guaranteed response capacity. Team 3 discusses Rave Guardian and university police services as examples, not integrations or chosen dependencies.

## MVP scope

Required: contacts on every page; student registration/login; incident form; channel choice with guidance; urgent and confidential flags; reference/confirmation; own-report list/detail/editing; channel-scoped staff queue with polling; status history; assignment; committee-to-security referral; server-side access checks.

### Emergency contacts and authentication

- Emergency strip on every page directs students in danger to call/go to QRS, Senate Building.
- Display: “This app is not monitored 24/7. For emergencies, call the QRS directly.”
- `/contacts` reads verified contacts from `src/config/contacts.ts`. Verified phone numbers become `tel:` links. Until verified, keep `VERIFY_BEFORE_DEMO` in configuration and display only the contact name/location. Never render the placeholder as a working number or invent a number.
- Registration fields: name, email, password (minimum eight characters). Always create `STUDENT`, irrespective of client-supplied roles. Passwords use bcrypt, cost 10 or higher.
- Seed staff accounts; no public staff registration or general admin role. Login sends students to `/reports`, staff to `/staff`.

### Report form and student tracking

`/report/new` is student-only. Use one shared Zod schema on client and server:

| Field          | Requirement                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`     | Required enum: `THEFT`, `PHONE_THEFT`, `ACCOMMODATION_DISPUTE`, `CIVIL_MATTER`, `ASSAULT`, `SEXUAL_ASSAULT`, `SUSPICIOUS_ACTIVITY`, `SAFETY_HAZARD`, `OTHER`. |
| `locationId`   | Required, valid seeded location.                                                                                                                              |
| `locationNote` | Optional; maximum 200 characters.                                                                                                                             |
| `occurredAt`   | Required date/time; cannot be in the future.                                                                                                                  |
| `description`  | Required; 20–2000 characters.                                                                                                                                 |
| `channel`      | Required: `COMMITTEE` or `SECURITY`; student's choice determines routing.                                                                                     |
| `urgent`       | Boolean, default false.                                                                                                                                       |
| `confidential` | Boolean, default false; automatically selected but changeable for assault/sexual assault.                                                                     |

Committee guidance: student disputes, accommodation-agent issues, civil matters suitable for mediation. Official Security guidance: theft, assault, threats, non-students, off-campus matters, serious incidents. For theft/phone theft/assault/sexual assault sent to Committee, show a non-blocking recommendation for Official Security. Do not override the student's selection.

Selecting urgent immediately shows directions to call/go to QRS before submission. Urgency prioritises the queue; it does not dispatch assistance.

Only show success after persistence. Server generates a unique sequence-based reference `SCS-YYYY-NNNNNN`, e.g. `SCS-2026-000123`. Confirmation includes reference, receiving channel, `SUBMITTED` status, next steps, and emergency contacts.

`/reports` lists only the student's reports: reference, category, channel, status, last update. `/reports/[ref]` shows submitted information and a permitted timeline. Students can edit category, location, description, and flags only while **both `SUBMITTED` and unassigned**; edits create an `EDITED` event. The brief does not grant editing of channel or occurrence time. After review/assignment, block edits with an explanation.

Student timelines expose only `toStatus`, `createdAt`, `publicNote`, and an actor label of “Committee” or “Security”. Do not expose staff names, handler identity, actor IDs, or internal notes through the response payload. A reference is an identifier, not an access credential.

### Roles and confidentiality

| Role         | Allowed scope                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STUDENT`    | Create reports; read own reports; edit own reports under the pre-review rule.                                                                      |
| `COMMITTEE`  | Committee queue; status/actions within permitted scope; assign within Committee; refer to Security.                                                |
| `SECURITY`   | Security queue, including referred reports; status/actions within permitted scope; assign within Security.                                         |
| `SUPERVISOR` | Security permissions plus access to all confidential reports in the Security channel and assignment within that channel. No Committee-wide access. |

Derive staff channel from role: `COMMITTEE → COMMITTEE`; `SECURITY`/`SUPERVISOR → SECURITY`.

Confidential reports remain visible to same-channel staff as **only reference, category, status, urgency, and created time**. Full confidential contents are available only to the reporter, assigned handler, and Security-channel supervisors, subject to channel access. Apply this to lists, details, nested relations, histories, and every other returned representation. The general queue columns must yield to this stricter allowlist.

Confidential is not anonymous: the handler can see the reporter's identity. The brief's checkbox says only the handler sees details, but its access rule also permits Security supervisors; make that exception clear in UI wording before implementation. Do not expand visibility to all staff or all supervisors across channels.

### Staff queue

- `/staff`: only staff's own channel. `/staff/reports/[id]`: authorised details/actions.
- Normal columns: reference, category, location, urgency, confidentiality, status, assignee, time since submission. Redact confidential rows as above.
- Filters: status, category, urgent only, assigned to me. Sort urgent first, then oldest first.
- Age indicator: amber after 24 hours, red after 48; urgent red after one hour. These are queue indicators, not promised service times.
- Poll `GET /api/reports` every 30 seconds while visible; pause when `document.visibilityState` is hidden. Use a small client component, no websockets.
- Newly arrived reports get a “New” badge; page title includes new count, e.g. `(2) Staff queue`. Track last-viewed state in the component; no extra database table.

### Statuses, assignment, referral

| Current status       | Allowed next statuses            |
| -------------------- | -------------------------------- |
| `SUBMITTED`          | `UNDER_REVIEW`, `REJECTED`       |
| `UNDER_REVIEW`       | `ASSIGNED`, `REJECTED`           |
| `ASSIGNED`           | `IN_PROGRESS`, `UNDER_REVIEW`    |
| `IN_PROGRESS`        | `RESOLVED`                       |
| `RESOLVED`           | `CLOSED`, `IN_PROGRESS` (reopen) |
| `CLOSED`, `REJECTED` | None                             |

Every mutation records the appropriate `StatusEvent`: `CREATED`, `STATUS_CHANGE`, `ASSIGNED`, `REFERRED`, or `EDITED`, with actor and timestamp. Status changes record old/new statuses and optional public/internal notes. Invalid transitions return **409**.

Assignment selects a staff user in the same channel, including self or colleague, and automatically sets `ASSIGNED`. Supervisor assigns within Security. Preserve confidentiality when checking action permissions; metadata access does not itself grant full-content access.

Committee-to-Security referral requires a reason, changes channel to `SECURITY`, clears assignee, resets status to `SUBMITTED`, and creates a `REFERRED` event. Committee immediately loses access. Student sees “Referred to Official Security”. No reverse referral is specified.

## Architecture and data contract

Brief-selected stack: Next.js 14+ App Router, TypeScript strict mode, React Server Components where natural, Tailwind CSS, Node.js Route Handlers (`export const runtime = "nodejs"`), PostgreSQL via Prisma, Auth.js/NextAuth v5 Credentials provider, bcrypt, and Zod. Auth session contains user `id` and `role`. Target hosting is Vercel, version control GitHub with feature branches/checkpoint merges. SQLite is a local fallback if cloud setup stalls, not an assumed persistent Vercel database.

Keep one repository and deployment. No microservices, additional state libraries, or websockets. A separate Express backend is conditional on lecturer requirements, currently unresolved. Verify compatible package versions when implementing; these stack choices are document requirements, not a claim that particular dependencies are already installed.

Expected paths:

```text
src/app/page.tsx
src/app/contacts/page.tsx
src/app/login/page.tsx
src/app/register/page.tsx
src/app/report/new/page.tsx
src/app/reports/page.tsx
src/app/reports/[ref]/page.tsx
src/app/staff/page.tsx
src/app/staff/reports/[id]/page.tsx
src/app/api/                       # endpoints below, including auth/[...nextauth]
src/components/
src/config/contacts.ts
src/lib/auth.ts                    # Auth.js, getSessionUser()
src/lib/db.ts                      # Prisma client
src/lib/access.ts                  # central server-side access rules
src/lib/validation.ts              # shared Zod schemas
src/lib/reference.ts               # reference sequence generation
src/lib/status.ts                  # transition rules
src/lib/notify.ts                  # optional staff email only
middleware.ts                      # staff redirect convenience, not security boundary
prisma/schema.prisma
prisma/seed.ts
```

Core entities from brief section 9:

- `User`: cuid `id`, `name`, unique `email`, `passwordHash`, `role` default `STUDENT`, `createdAt`; reporter, assignee, and event relations.
- `Location`: cuid `id`, unique `name`, `area`, reports.
- `Report`: cuid `id`, unique `ref`, category, description, location relation/ID, optional locationNote, occurredAt, channel, urgent/confidential default false, status default `SUBMITTED`, required reporter relation/ID, optional assignee relation/ID, createdAt, updatedAt, events. Index `[channel, status]`.
- `StatusEvent`: cuid `id`, report relation/ID, optional fromStatus, required toStatus, action string, actor relation/ID, optional publicNote/internalNote, createdAt.

The history table doubles as the audit log. Use transactional writes where report mutations and their events must stay consistent; this is implementation guidance to satisfy integrity requirements. Sequence storage/implementation is not specified in the supplied schema; implement concurrency-safe server-side generation rather than assuming a count-based reference is safe.

All API responses are JSON. Error shape: `{ "error": "message", "fields"?: { "field": "message" } }`. Codes: 400 validation; 401 unauthenticated; **404 missing or inaccessible report**; 409 invalid transition; 429 rate limit if implemented.

| Endpoint                         | Access/behaviour                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `POST /api/register`             | Public; `{name,email,password}`; creates student only.                                                               |
| `/api/auth/[...nextauth]`        | Authentication handlers.                                                                                             |
| `POST /api/reports`              | Student; validated report fields; creates report/reference/CREATED event; returns `{ref,id,status}`.                 |
| `GET /api/reports`               | Authenticated; student owns-only, staff channel-only with redaction; filters `status`, `category`, `urgent`, `mine`. |
| `GET /api/reports/[id]`          | Owner or permitted staff; report and permitted history.                                                              |
| `PATCH /api/reports/[id]`        | Owner, submitted and unassigned; edits plus event.                                                                   |
| `PATCH /api/reports/[id]/status` | Permitted channel staff; `{toStatus,publicNote?,internalNote?}`.                                                     |
| `POST /api/reports/[id]/assign`  | Permitted channel staff; `{assigneeId}` from same channel.                                                           |
| `POST /api/reports/[id]/refer`   | Committee; `{reason}`; one-way transfer to Security.                                                                 |
| `GET /api/staff/users`           | Staff; same-channel assignment candidates.                                                                           |
| `GET /api/locations`             | Public; seeded locations.                                                                                            |

## Security rules that must survive scope cuts

- Every API handler checks the session and relevant role, ownership, channel, and confidentiality on the server through `src/lib/access.ts`. UI hiding and middleware redirects are insufficient.
- Inaccessible reports return 404, including guessed IDs/references. Never use 403 to reveal that a protected report exists.
- Redact before serialising responses. Never send confidential fields and rely on client hiding.
- Never log passwords, session contents, or incident descriptions. Avoid personal/sensitive content in audit/error logs.
- No incident contents in URLs or sensitive data in browser storage. Use secure, httpOnly session cookies and HTTPS in deployment.
- Validate input server-side with Zod. Avoid concatenated raw SQL. Preserve database and history integrity.
- Emails/notifications never contain descriptions, location notes, reporter identity, or sensitive attachments.
- Use fictional identities/incidents in seeds, tests, screenshots, and demos. Real campus place names are acceptable.
- No real incident handling before university approval, verified contacts, security/data-handling review, and agreed receiving/review/closure responsibilities.

## Seed expectations

Locations proposed by the brief, pending correction: Senate Building; Main Library (Hezekiah Oluwasanmi Library); Oduduwa Hall; Moremi Hall; Awolowo Hall; Fajuyi Hall; Angola Hall; Mozambique Hall; ETF Hall; Faculty of Technology; Student Union Building; Sports Complex; Campus main gate; Staff quarters; Off campus (Ile-Ife town); Other. Populate `area` appropriately; the final list is not verified.

Demo staff: `committee1@demo.test`, `committee2@demo.test`, `security1@demo.test`, `security2@demo.test`, `supervisor@demo.test`. Demo students: `student1@demo.test`, `student2@demo.test`. Brief's demo-only password: `Demo#2026`, hashed in storage and documented in README. These are specified fixtures, not existing accounts or production credentials.

Seed approximately 15 fictional reports across channels/categories/statuses, including at least one urgent and one confidential report in each channel and one referred report. Keep history consistent with seeded state.

## Stretch and deferred scope

Implement stretch only after all MVP checks pass and scope permits; never quietly treat stretch as MVP:

- F13 rate limits: five submissions/user/hour; ten login attempts/IP/15 minutes; in-memory acceptable for demo.
- F14 anonymous reporting is described as stretch but explicitly deferred to Phase 2 elsewhere. Default to deferred. If later authorised, brief calls for a reference plus secret 12-character tracking code stored hashed, status-only retrieval, CAPTCHA, three submissions/IP/day, no urgent flag, “Unverified tip” presentation, no automatic action, and warning that content can identify the reporter.
- F15 emergency guidance for theft, assault, medical emergency, fire, ending with QRS contact.
- F16 staff-entered patrol reports use staff reporterId and a `staffEntered` flag; this flag is not in the supplied MVP schema.
- F17 require a public rejection reason and optionally `duplicateOfId`; duplicate field is not in MVP schema.
- F18 staff email on create/referral via Resend, `RESEND_API_KEY`, `src/lib/notify.ts`. Same-channel recipients; reference, category, urgency, staff-detail link only. Save first; sending failure must not turn saved submission into failure. Missing key skips email. Demo delivery must use inboxes controlled by the team, rather than assuming `.test` accounts receive mail.

Later phases: student status notifications, staff push/SMS, anonymous safeguards, emergency guidance/patrol logging where not completed as stretch; committee moderator/statements/settlement workflow and out-of-jurisdiction flag; interactive map; secure evidence uploads; analytics; campus-wide alerts; university integrations; native apps. Live GPS, chat, automated dispatch, and advanced integrations are outside the current build. Do not add features outside brief section 6 without team agreement.

## Delivery and acceptance

Team ownership in brief: P1 backend/auth/Prisma/API/access/status; P2 student UI; P3 staff UI; P4 DB/deploy/seeds/validation/QA/README/demo. This is a human team plan, not an instruction to spawn agents.

Day 1 checkpoint: registration/login, submissions to both channels, references, correct channel visibility, denial of another student's report. Day 2: handling/history/confidentiality, polling, mobile polish, full acceptance run; feature freeze at 13:00, fixes and eligible stretch, deployment and rehearsal. Brief prioritises staff emails then rate limiting among backend stretch work.

Brief's contingency cut order: all stretch, referral (status note instead), assignment (Supervisor-only confidentiality fallback), queue filters. These are scope reductions, not equivalent implementations of full MVP. Record a cut and its effect on acceptance; do not declare all MVP checks passed if referral/assignment is absent. A Supervisor-only fallback leaves Committee confidential handling unresolved because supervisors have Security-channel scope. Never broaden access to hide this gap. Never cut access control, references, history, or emergency contacts.

Auth fallback in brief: after a two-hour timebox, a simple signed session cookie may replace Auth.js. It must still satisfy session security and every access rule; it is not the default architecture.

Required acceptance checks from brief section 14:

| ID            | Expected evidence                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| AT-01 / AT-02 | Committee/Security submissions save, get references, appear only in intended channel.                         |
| AT-03 / AT-04 | Committee cannot open Security report; student cannot open another student's report; 404.                     |
| AT-05         | Missing required field yields field errors and no invalid save.                                               |
| AT-06 / AT-07 | Pre-review/unassigned edit works with event; post-review/assignment edit blocked.                             |
| AT-08         | Valid status change updates state/history; invalid transition returns 409.                                    |
| AT-09         | Core flows usable on phone and desktop without horizontal scroll.                                             |
| AT-10         | Contacts show verified details; no invented numbers. Unverified placeholders are not proof this check passed. |
| AT-14         | Unassigned same-channel staff see only allowed confidential metadata.                                         |
| AT-15         | Referral moves to Security, removes Committee access, shows student referral information.                     |
| AT-16         | Student timeline excludes internal notes and staff identities.                                                |
| AT-17         | Open staff queue receives new report within 30 seconds with “New” badge.                                      |
| AT-13 / AT-18 | Conditional: rate limits return 429; staff emails contain only permitted information.                         |

SRS AT-11/AT-12 cover anonymous retrieval and uploads only if enabled; they are not MVP requirements.

Definition of done: all MVP works at deployed URL; AT-01–AT-10 and AT-14–AT-17 pass; no report leaks; README explains setup, environment variables, demo accounts, and known limitations; five-minute fictional-data demo works on phone. Do not claim deployment or passing checks without evidence.

Demo outline: landing/contact; student theft to Committee and reference; urgent confidential assault to Security with emergency direction; Committee queue refresh and channel separation; review/assign/refer theft; Security reviews/reassigns the transferred report before progressing to resolution with public note; student sees timeline; another student's URL gives not found. Follow the transition table even where the brief's abbreviated demo omits steps.

## Unresolved questions and source inconsistencies

Keep these explicit rather than inventing decisions:

1. **Contacts and operations:** verified QRS phone/other contacts; who verifies them; who checks queues and how often; agreed recipients, reviewers, and closers; committee adoption; institutional approval.
2. **Locations and sensitive status detail:** final campus list and how much public detail is appropriate in sensitive cases remain open.
3. **Backend requirement:** confirm whether lecturer requires Express. Default remains Next.js Route Handlers.
4. **Assignment vs transition table:** assignment says it sets `ASSIGNED`, but direct `SUBMITTED → ASSIGNED` is absent from the allowed transitions. Conservative implementation assumption is review first, then assign; document it. Do not silently permit arbitrary jumps or set `ASSIGNED` without a valid assignee.
5. **Referral boundaries:** referral is an explicit reset outside the normal transition table. Allowed source statuses (especially terminal reports) and exact action permissions for unassigned confidential reports are unspecified. Resolve/document these before implementing those branches; do not weaken confidentiality. Self-assignment is permitted in general, but the detailed confidential action policy still needs care.
6. **Confidential wording:** “only the person handling my case” omits the permitted Security supervisor exception. Preserve the access rule and use honest explanatory copy. General queue columns cannot override the confidential metadata allowlist.
7. **History after referral:** `StatusEvent.actor` points to a user's current role, without an actor-channel snapshot. Preserve accurate Committee/Security labels across transfer. Whether Security may see prior Committee internal notes is unspecified; do not assume channel transfer grants unrestricted historical-note access.
8. **Phase ambiguity:** anonymous reporting is both stretch and Phase 2; emergency guidance/patrol logging also appear in both stretch and later lists. Treat them as deferred unless explicitly selected after MVP readiness. Feature-freeze wording and the schedule's afternoon stretch window also differ; keep the agreed scope explicit.
9. **Traceability gaps:** brief references FR-24/FR-25 and NFR-13/NFR-14, but supplied SRS stops at FR-23 and NFR-12. These are brief references, not requirements present in that SRS. SRS FR-17 concerns reporter notifications; brief F18 repurposes it for staff alerts. Do not claim a direct unchanged mapping.
10. **Approval and targets:** SRS review/traceability tables are pending. Authentication choices and workflow details are settled for the prototype by the brief, not institutionally approved. Production retention/deletion, backups/restoration, access review, breach handling, measurable performance/availability targets, and accessibility targets still need agreement. Core forms should already support keyboards, readable contrast, labels, inline validation, and honest failure feedback.

## Instructions for future coding sessions

Read this file before working, inspect actual repository state, and consult the controlling brief for detail. Keep the report-and-track loop small and complete. Preserve strict typing, shared validation, server-side authorisation, redaction, and truthful emergency/privacy copy. Explain assumptions and record confirmed decisions here. Report what actually changed and what was verified. Do not treat planned features, mock screens, seed specifications, or pending approvals as completed work.

## Implementation update — 26 October 2026

The initial Next.js source now exists in this workspace, with Tailwind styling, Auth.js Credentials configuration, Prisma/SQLite local schema and fictional seeds, shared Zod validation, server-side report lifecycle services and API routes, student/staff screens, polling, and integration/browser test source. PostgreSQL remains the deployment target. A generated ignored `.env` contains a local authentication secret; do not expose or commit it.

Implementation decisions are recorded in README: review before assignment; metadata-only confidential acknowledgement and self-claim; active-case-only referral; channel-isolated internal history with immutable `StatusEvent.actorChannel`; and a database reference sequence. These are prototype assumptions pending stakeholder review.

Installation is currently blocked by npm-registry DNS/network access, with required Prisma/Auth.js packages unavailable in the local cache. Syntax and direct access-policy checks can run through the machine's global TypeScript, but dependency installation, strict type checking, database execution, production build, browser verification, verified contacts, and deployment must not be marked complete without subsequent evidence. See `GATES.md` and `README.md` for exact status and next commands.

### Dependency/testing follow-up

The subsequent installation retry again failed to resolve `registry.npmjs.org`; direct DNS lookup confirmed `ENOTFOUND`. Syntax (40 files) and pure access-policy checks (17 cases) were rerun successfully. Strict type, database integration, production-build, and browser checks remain unmet because dependencies are unavailable. `SETUP_CHECKLIST.md` now records the exact local commands, current email implementation gap, Resend configuration requirements, and remaining contact/database/hosting/operational prerequisites. No live email was sent and no cloud service was provisioned.
