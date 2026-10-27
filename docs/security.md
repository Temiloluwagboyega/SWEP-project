# Application security baseline

This is a local demonstration with fictional incidents. These safeguards do not establish readiness to receive real campus incidents. Browser acceptance, cloud configuration and institutional review remain required.

## Private configuration

`AUTH_SECRET` is required: Auth.js uses it to protect session tokens. `npm run env:setup` creates `.env` when missing, generates 48 random bytes encoded as base64url when the key is absent/weak, preserves an existing valid key, and restricts file permissions to the owner (0600). It also restricts the existing local SQLite files to 0600. No key is printed. `.env` must be ignored and untracked by Git; `.env.example` contains no secret. Run `node scripts/setup-env.cjs --check` to verify this. Rotating the key invalidates existing cookies. Never share `.env`, upload it as an artifact or commit it.

`AUTH_URL` is the exact canonical origin, without a path or query. `APP_ENV=local` requires a localhost origin and permits localhost HTTP and the SQLite demo, including a local production build. Use `APP_ENV=production` on a real host; configuration then requires a public HTTPS origin and a PostgreSQL connection URL. Production credentials reject the shared demo password and `@demo.test` accounts. Demo seeding is disabled in production mode. These checks do not provision hosting or convert the SQLite Prisma schema to PostgreSQL.

Generate a separate fresh secret for each hosted environment using its secret manager. Keep database passwords server-side, use an application-specific database role with minimum privileges, require TLS to the database, and restrict database access at the provider. Do not set a secret in a `NEXT_PUBLIC_` variable.

## Authentication and session controls

Passwords are bcrypt-hashed at cost 12. New registrations require at least 15 characters and a maximum of 72 UTF-8 bytes to avoid bcrypt truncation. Existing local demo accounts retain their old passwords for demonstrations. Login errors do not distinguish a missing user from an incorrect password. Student registration strictly accepts name/email/password and assigns STUDENT on the server; clients cannot assign staff roles.

JWT cookies use Auth.js HttpOnly and SameSite=Lax settings; HTTPS origins use Secure cookies. Auth.js CSRF verification remains enabled. Redirects are restricted to the canonical origin. Every authenticated session also needs a database `LoginSession` record: 30 minutes without an authenticated session check or eight hours since login ends access, even if the cookie is refreshed. Background staff polling counts as activity; the eight-hour absolute limit still applies. Deleted sessions, disabled accounts, or a changed `sessionVersion` invalidate tokens on their next check. Roles are read from the database. Signing out deletes the current session record. Existing cookies from before this migration need a fresh login.

An authorised operator can invalidate every session for a user without changing the global secret:

```sh
npm run account:manage -- --user-id USER_ID --revoke
npm run account:manage -- --user-id USER_ID --disable
npm run account:manage -- --user-id USER_ID --enable
```

Each command increments the session version and removes their sessions. Enabling does not restore old sessions. Disabled accounts are excluded from handler choices and cannot receive a new assignment. Existing reports remain in their channel for authorised staff handling; account suspension does not erase history or automatically reassign work. There is no public account administration endpoint. Database/shell access must be restricted to authorised operators.

## Persistent abuse limits

Fixed-window counters live in the application database and use atomic increments. They survive restarts and are shared by instances connected to that same database. HMAC keys conceal account addresses and client addresses in rate-limit records. Expired buckets are pruned. A database error denies the request with 503; exhausted limits return 429 with Retry-After. Auth.js account-throttling errors expose `code=rate_limited` to the login client; the outer HTTP IP limit supplies the 429 response and Retry-After.

| Action | Limit | Identity |
| --- | --- | --- |
| Credential login attempts | 10 / 15 minutes | Client address, and independently normalised account email |
| Registration | 3 / hour | Client address |
| New incident report | 5 / hour | Authenticated user |
| Other authenticated API writes | 60 / minute | Authenticated user |
| Authenticated API reads | 240 / minute | Authenticated user |
| Auth endpoints and public locations reads | 120 / minute, separate counters | Client address |
| Unauthenticated protected API requests | 60 / minute | Client address |

Fixed windows can allow a burst across a window boundary. Limits are a starting policy to review with the campus operators; they are not DDoS protection or an emergency response guarantee. A report limit can affect legitimate repeat reporting, so the existing phone/in-person guidance remains important.

**Proxy configuration matters:** the default ignores all supplied IP headers and uses one conservative shared bucket for unverified clients. For deployment, set `TRUSTED_CLIENT_IP_HEADER` only to a single-IP header your trusted edge proxy always overwrites, and prevent clients bypassing that proxy. Invalid/missing/multiple-address values use the shared bucket. Merely setting it to an Internet-supplied `x-forwarded-for` would make throttling spoofable. Configure the provider's documented header and verify it on staging. Edge rate limits and request size/time limits must also protect application resources before requests reach the database. Server-rendered pages and static assets are not covered by the API counters.

## Requests, privacy and browser protections

Custom JSON requests require application/json and are capped at 16 KiB; auth requests are capped at 8 KiB. Streamed bytes are counted even when Content-Length is absent or dishonest. Invalid UTF-8 is rejected. Mutations require the canonical Origin, and cross-site Fetch Metadata requests are rejected. Auth.js additionally validates CSRF tokens. API/auth responses are private and no-store. Error logs omit request bodies, credentials, incident text and database details.

Server-side access checks enforce owner-only student reports, channel-scoped staff access and the exact confidential-report metadata allowlist. Report updates retain transactional history. React renders incident text as escaped text; no HTML upload/rendering feature is enabled.

The Next.js proxy generates a fresh CSP nonce for every page response and passes the matching policy into Next.js rendering. Production scripts require that nonce with strict-dynamic; eval is allowed only in development. Production style elements require a nonce; `style-src-attr 'unsafe-inline'` remains for existing React style attributes. Framing and objects are blocked; sources default to self. Other headers include nosniff, no-referrer, DENY framing, restricted camera/microphone/geolocation/payment and HSTS on HTTPS origins. Browser nonce/hydration behaviour still needs end-to-end verification in an environment able to start the server.

## Required before real use

- Provision PostgreSQL with its own reviewed Prisma schema/provider and migration history; apply to staging and rerun security/data tests. The checked-in migrations are SQLite only. Use HTTPS hosting, trusted proxy configuration, secrets management, provider access controls and edge abuse protection.
- Establish verified campus identities, approved staff provisioning and a stronger staff authentication mechanism such as institutional SSO/MFA. Student email verification, password recovery and breach/common-password screening are not implemented. Email notifications are also unwired; no email provider key is currently required by the app. Adding a key alone will not enable those features.
- Define incident access reviews, retention/deletion rules, encryption at rest, protected backups and tested restoration, operational monitoring without incident contents, incident response procedures and contact verification with the university. Current audit events cover report workflows; there is no operator audit dashboard or security monitoring service.
- The local npm audit attempt failed because registry.npmjs.org could not be resolved (ENOTFOUND); there is no successful vulnerability scan result. Run dependency vulnerability scanning with network access, keep the framework/Auth.js dependencies maintained, and perform an independent security review. Passing local tests is not a vulnerability audit or penetration test.
- Complete browser tests and staging checks of login, logout, expiry, CSP/hydration, trusted client address handling, concurrency and confidential access. Obtain institutional approval before collecting real sensitive reports.

Implementation follows [Auth.js configuration guidance](https://authjs.dev/reference/core), [OWASP authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), and [Next.js nonce CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy). These are implementation references, not certification.
