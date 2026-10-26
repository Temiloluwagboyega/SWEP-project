# Design and structure upgrade

The previous design used very small copy, scattered styling overrides, decorative floating cards, and a flat component folder. The revision uses a public-service direction with readable text, clear hierarchy, consistent spacing, useful receiving-channel information, and contextual student/responder navigation.

## Skills applied

| Skill                       | Contribution                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI UX Pro Max               | Verified public-service design-system match; targeted form-error and Next.js guidance. Rejected the initial anonymous-community match.                                                                    |
| Frontend Design             | Removed decorative dashboard mockups and repeated uppercase labels; made the reporting task and channel guidance the visual focus.                                                                        |
| Brand                       | Documented a restrained campus-support identity and direct copy without official-endorsement or emergency-response claims.                                                                                |
| Design System               | Three token layers in JSON and generated CSS, semantic status colours, component states, and measurable text contrast.                                                                                    |
| UI Styling                  | Responsive page/form layouts, semantic controls, comfortable targets, and consistent panels, buttons, badges and fields.                                                                                  |
| Web Design Guidelines       | Labels, decorative-icon semantics, visible focus, reduced motion, proper filter-button states, semantic table markup, and focused error summaries.                                                        |
| Vercel React Best Practices | Small client interaction components, server-rendered page structure, request-local session lookup deduplication, and explicit module imports. No cross-user incident caching or additional state library. |

## Folder responsibilities

```text
src/
  components/
    auth/             Sign-in/register form and presentation
    home/             Public introduction and channel routing explanation
    layout/           Brand, navigation, app shell, emergency banner, footer
    reports/          Student form, list, detail and timeline presentation
    staff/            Queue, semantic report table and case actions
    ui/               Shared buttons, badges, headings, panels and errors
  hooks/
    use-staff-queue.ts Visible-tab polling and stale-request protection
  lib/http/
    client.ts         JSON requests; same-origin credentials; no-store responses
    errors.ts         Backend ApiError, independent of framework responses
    origin.ts         Mutation origin verification
    response.ts       Backend JSON error responses and safe error handling
  styles/
    tokens.css        Generated primitive, semantic and component variables
    base.css          Typography, element defaults, focus and reduced motion
    layout.css        Global navigation, portal shell and footer
    components.css    Shared controls and common UI patterns
    pages.css         Public/auth/report/queue/detail layouts
```

This interprets the requested “HTTP folder” as request/response organisation for the existing Next.js app. It does not introduce a separate HTML application or backend service.

## Behaviour and privacy

The report ownership/channel/confidentiality policy and status transitions remain in their existing server modules. The report service change is its error-class import path. Student and staff page guards still execute on the server. API authorisation does not depend on navigation visibility.

Registration/report/case-action forms use the shared browser request helper. Staff refresh uses the same helper. No incident descriptions, identities, or tokens are written to browser storage. All report requests use `no-store`. Session-user lookup is deduplicated only within a React request, with the authoritative database role lookup retained.

The public Committee/Security choices preselect that channel when an authenticated student opens the new report form. Category hints remain non-blocking. Students can change confidentiality. Unverified phone numbers remain hidden rather than being converted into telephone links.

## Checks and preview

```sh
npm run check:syntax
npm run check:access
node scripts/verify-design.cjs
```

`verify-design.cjs` checks twelve text-colour combinations, CSS variable references, internal module paths, HTTP folder/component structure, centralised client requests, and actual HTTP client/origin helper behaviour using in-memory request/response fixtures. It includes positive controls for low contrast and rejected origins. These checks are not substitutes for type checking, database tests, or browser testing.

A standalone component preview is generated at `artifacts/design-preview.html`. Open it directly in a browser. It includes public, sign-in/register, student reports/form/detail, staff queue, and restricted confidential-detail views. Navigation operates through its `screen` query parameter. Every view is labelled **Design preview · fictional data · reports are not saved**.

The preview imports the real UI components, with isolated adapters for Next navigation/links and authentication. It uses fictional report fixtures. GET queue refresh is fixture-based; saving/updating reports returns an explicit preview-only error. It never acts as a deployment or proves backend behaviour.

Regenerate with installed development dependencies (the preview builder uses esbuild, also used by the project's tsx tool):

```sh
node scripts/render-design-preview.cjs
```

In this restricted session, verified cached React, React DOM, Lucide, Zod and esbuild packages were restored under `/tmp/swep-design-runtime/node_modules`, outside the application install. The same builder ran using `DESIGN_PREVIEW_RUNTIME` pointed there. This generated the preview and server-rendered nine screens successfully without installing the application's missing Prisma/Auth.js dependencies. The cached packages were checked against their npm cache integrity records. They do not constitute a successful `npm install`.

The production build and full strict type checks remain blocked by missing dependencies after another npm registry DNS failure. Chrome's launch attempt closed before a usable page became available. Therefore phone/desktop screenshots, real-browser reflow, keyboard interaction, and full application flows are **not marked verified**. Use `DESIGN_GATES.md` for the precise current acceptance status.

## After dependency installation

Dependencies are now installed. Strict TypeScript and seven actual database integration tests pass, and the production build passes with `CAMPUS_DISABLE_BUILD_CACHE=1`. The initial SQLite migration and demo data are verified. The temporary cached preview runtime was removed to recover disk space; the preview builder can now use the installed project dependencies. The earlier dependency-blocked notes above describe the design session, not the latest installation state.

Live browser acceptance remains blocked by the session's inability to listen on `127.0.0.1:3000`. See [the current verification report](verification-status.md).
