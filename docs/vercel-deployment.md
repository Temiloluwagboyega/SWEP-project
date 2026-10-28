# Vercel deployment URL configuration

The supplied failure log built `obaloluwa` commit `c8e6771`. Database migrations, Webpack compilation and TypeScript checking succeeded. Page-data collection failed when importing the root layout's authentication module, which rejected a missing or malformed `AUTH_URL`. `/_not-found` was the page whose configuration exposed that error; it was not a broken not-found component. The Nodemailer peer warning and Prisma update notice were not the fatal error.

Set these in **Vercel → Project Settings → Environment Variables** for each deployed environment:

| Variable | Value |
| --- | --- |
| `APP_ENV` | `production` for both hosted Production and Preview deployments; `local` is only for localhost. |
| `AUTH_SECRET` | Keep the existing strong secret, at least 32 characters. |
| `DATABASE_URL` | The existing online PostgreSQL application connection. |
| `DATABASE_URL_UNPOOLED` | The existing direct PostgreSQL connection used by migrations. |
| `AUTH_URL` | Optional explicit canonical origin, such as `https://your-project.vercel.app`, with no path or query. For a custom domain, set that domain. |

The application selects one canonical origin in this order:

1. Non-empty `AUTH_URL`.
2. Legacy `NEXTAUTH_URL`.
3. On Vercel Production, `https://VERCEL_PROJECT_PRODUCTION_URL`; fall back to `https://VERCEL_URL` if the production-domain variable is unavailable.
4. On Vercel Preview, `https://VERCEL_URL` for that deployment.
5. Outside hosting, the existing localhost default is available only in non-production mode. Production without a trusted URL fails clearly.

Enable access to [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables) when using automatic selection. These variables are read at build and runtime. The application does not infer its trusted origin from user-supplied forwarding headers. A malformed explicit URL still fails validation. Auth.js, email links, secure cookies and request-origin checks use the selected origin. Page requests through another Vercel alias redirect to the canonical origin before rendering forms; mutation Origin/CSRF checks remain enforced.

Environment variables can be scoped to Production, Preview or a particular preview branch. A Production-only setting does not repair a Preview deployment. If explicitly configuring `AUTH_URL` for previews, use that preview's canonical domain rather than the production domain. See [Vercel's environment-variable guide](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables).

Deploy the branch/commit containing the fix. The latest main-directory changes include `2_incident_coordinates`; the supplied older build found only two migrations. Applying a setting and rebuilding the old commit will not include the latest reporting/map features. No database reset or Prisma major upgrade is required for this error.

Local reproduction: `node scripts/verify-vercel-build.cjs` builds with `AUTH_URL` and `NEXTAUTH_URL` empty, production mode enabled and trusted Vercel deployment variables present. It preserves `.env`, disables outgoing email and does not run migrations or start local PostgreSQL. Current acceptance evidence is in `VERCEL_BUILD_GATES.md`. A local reproduction is not a successful hosted redeployment.

Verified on 28 October 2026: the missing-URL production build, TypeScript checking, all 11 deployment/email checks and the full 38-test regression suite passed. All 4 deployment-fix gates are met, with 0 unmet or abandoned. Hosted redeployment remains a separate step using a branch that includes this fix.
