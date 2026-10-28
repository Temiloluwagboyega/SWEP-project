# Student review: requirements and implementation

Reviewed on 28 October 2026 against `CHAPTER_THREE_Methodology_Analysis_and_Design.pdf` (16 pages) and the read-only reference project at `irms project/IRMS` and `IRMS_B`. The source PDF is unchanged. The app's current brand is **SafeCampus**, from `src/config/brand.ts`; the chapter calls it CampusGuard.

## Chapter Three comparison

| Requirement | Implementation and evidence |
| --- | --- |
| FR-01: student registration/login; provisioned staff | Already implemented in Auth.js, the registration API and `prisma/seed.ts`. Registration always assigns STUDENT. Password minimum changed to 8 characters in shared validation and the form; bcrypt's 72-byte limit is retained. |
| FR-02: guided receiving-channel choice | Already implemented in `report-form.tsx`: Committee for appropriate mediation; Official Security for serious incidents. |
| FR-03: Committee-to-Security referral with reason | Already implemented in `referReport`, with an audit event and channel change. Former-channel access ends after referral. |
| FR-04: channel-restricted staff queue | Already implemented at `/staff`, with independent server-side access checks. Committee, Security and Supervisor now have explicit dashboard titles. |
| FR-05: category, campus location, time, description, channel | Already implemented. Extended with optional coordinates and device-reported accuracy. Campus location remains required; GPS is optional. |
| FR-06: urgent flag and direct-help guidance | Already implemented; guidance now includes nearby security personnel, QRS telephone help and the Senate Building option. No dispatch is promised. |
| FR-07: confidentiality | Already implemented. Unassigned peers receive only the existing metadata allowlist. Coordinates and location counts follow the same restrictions; permitted supervisors and assigned handlers retain their documented access. |
| FR-08: unique saved-report reference | Already implemented with a database sequence and unique reference constraint. |
| FR-09: own reports and public timeline | Already implemented at `/reports` and `/reports/[ref]`. Staff identities and internal notes remain excluded from student payloads. |
| FR-10: defined status transitions | Already implemented in `status.ts` and the report service, including reopening and terminal-status rules. |
| FR-11: same-channel staff assignment | Already implemented, with active-handler validation and stricter confidential-case assignment rules. |
| FR-12: accurate emergency contacts | Previous configuration contained placeholders. Replaced with OAU-published QRS/security lines and NCC's national emergency number, clickable telephone links, source links and source-check dates. No Committee number is invented. |

The chapter's non-functional requirements are covered by server-side authorisation, shared validation, atomic report/history writes, persisted references, restricted serializers, responsive interfaces and honest emergency messaging. See the integration and browser tests for executable checks. Tests do not establish operational staffing, stakeholder approval or live telephone availability.

## Improvements inspired by IRMS

The reference's `components/citizen/report/ReportForm.tsx` and `LocationExplorerPanel.tsx` combine incident details with GPS/location selection, and `components/shared/map-helpers.ts` supports incident map navigation. These informed the location workflow; no reference-project credentials, incident records or deployment settings were copied.

- **Optional incident coordinates:** explicit current-location action, permission-denied/timeout fallback, manual coordinates, removable points, stored accuracy, validation at the API and database, preservation during edits by older clients, and removal through an explicit null value.
- **Maps on request:** the reporter and permitted staff can load an OpenStreetMap point or open it in a separate tab. Coordinates are sent to the map provider only after the user loads or opens the map. No map key is needed. This is a selectable single-incident map, rather than a campus-wide heatmap or route-planning service.
- **Staff insights:** seven days of submission counts in West Africa Time, resolved/closed percentage, active reports older than 24 hours, location rankings, and a selectable incident map. Insights follow queue filters and use only the loaded, authorised reports, capped at 200. Restricted locations are omitted. Report counts do not establish crime rates or campus danger levels.
- **Role dashboards:** Committee and Security keep separate channels; Supervisor gets Security oversight under the existing confidentiality rules. The student dashboard remains owner-only.

The PDF does not require GPS, maps or analytics; these extend its documented MVP. Anonymous reporting is explicitly a later phase. Evidence uploads, automated dispatch, SMS/push, institution SSO and patrol-entry workflows are not added by this change.

## Contact provenance

- OAU Security Unit publishes **09034592436**, **09070367707**, and **09070367711** on its [security tips page](https://security.oauife.edu.ng/security-tips/). The OAU 2025/2026 orientation programme also identifies 09034592436 as the QRS hotline.
- NCC publishes **112** as the national emergency number in its [Special Duties service charter](https://www.ncc.gov.ng/about/servicom-charter/departmental-charters/special-duties-department-service-charter).

Sources were checked on 28 October 2026. These are website-sourced numbers, not evidence that project stakeholders supplied them or that a live call was answered. Direct stakeholder confirmation of availability and the Committee's current contact remains useful for the project defence.

## Database and verification

The app uses the online Neon PostgreSQL connection. The old SQLite file is preserved. `2_incident_coordinates` is additive: three nullable columns and a coordinate integrity constraint; existing reports remain valid.

`npm test` disables outgoing email and uses temporary PostgreSQL schemas for lifecycle/security tests. `npm run test:e2e` applies migrations and fictional fixtures in another temporary schema, starts a local web server connected to that online schema, runs Chromium and removes the schema afterwards. Each browser test resets only its own test schema's rate counters. The tests do not seed or delete the application's public-schema reports.

OpenStreetMap's embed is stubbed in the browser test so preview behaviour can be checked independently of the third-party network. Source URLs and real map destinations remain configured in the app. Physical location hardware, live call answering and an external map service outage cannot be guaranteed by these tests.

The current acceptance record is `STUDENT_REVIEW_GATES.md`.

## Chapter updates to make

Update Sections 3.5.1, 3.7.7 and 3.7.8 to describe sourced contact numbers and nearby-security guidance rather than awaiting all phone verification. Update the product name consistently if SafeCampus is retained. Add optional coordinate fields and the map/analytics interface to Sections 3.6–3.7, and add location/privacy/permission-denied scenarios to Section 3.9. The current Prisma schema targets PostgreSQL; it does not provide an interchangeable SQLite development mode. Do not describe sourcing numbers from official websites as a stakeholder interview or a completed live-call verification.
