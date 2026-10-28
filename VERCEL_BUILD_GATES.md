# Gates: Vercel canonical URL build fix

OWNS: src/lib/security/config.ts, src/lib/auth.ts, src/lib/email.ts, src/proxy.ts, next.config.ts, tests/deployment-config.test.ts, tests/email.test.ts, scripts/test-without-email.cjs, scripts/verify-vercel-build.cjs, docs/vercel-deployment.md, docs/security.md, README.md, .env.example, VERCEL_BUILD_GATES.md

Scope: fix the logged missing AUTH_URL build failure using validated, trusted Vercel deployment configuration; keep authentication, redirects, email links and HTTPS policy consistent.

- [x] G1: Deployment configuration tests reject unsafe origins and cover explicit, legacy, production and preview URL selection and canonical redirects.
  CHECK: node --import tsx --test tests/deployment-config.test.ts tests/email.test.ts
  EXPECT: /# fail 0/
  EVIDENCE: automatic-evidence=v1; definition-sha256=89d36fb365cf566b73b5c3288102436d6bf888213d84cbce9b4202f65511815e; exit=0; EXPECT=matched; output-sha256=f8bf40dab6a06d40d158c9866ccfd363fbdcc4dcfc1ed3fea099a899dfb96772; output-bytes=2677; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries

- [x] G2: The integrated application passes TypeScript checking.
  CHECK: npm run typecheck
  EXPECT: TYPECHECK_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=a9feb7548db5d5dd1e35480d7809e5337f4564c35e0bcf45f1d1ff2e2df9b105; exit=0; EXPECT=matched; output-sha256=b94d6f155a477ec91c521d2763395d6539d60a70a64a61afc9e1778802f5365b; output-bytes=117; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries

- [x] G3: A production build succeeds with AUTH_URL and NEXTAUTH_URL absent and trusted Vercel variables provided.
  CHECK: node scripts/verify-vercel-build.cjs
  EXPECT: VERCEL_BUILD_PASSED
  EVIDENCE: automatic-evidence=v1; definition-sha256=bc7ebe851d764207103f46ba92c20cc45275806d3cf1c46656dbed028362bbed; exit=0; EXPECT=matched; output-sha256=7513d774af8da7eb18dbe31c500d92d34db2394abf4f5c5f81b36daf526d8cd8; output-bytes=803; shell=/bin/sh; cwd=/Users/wikiwoo/Documents/swep; path=d43db95f577e/30 entries

- [x] G4: Deployment instructions explain the reported error, environment scopes and the older branch/commit in the supplied log.
  EVIDENCE: docs/vercel-deployment.md maps the supplied c8e6771/obaloluwa log to missing AUTH_URL after successful migrations/compilation, documents explicit and automatic URL selection, production mode, environment scopes, and the third migration in current main. It links official Vercel environment documentation and distinguishes a local reproduction from hosted redeployment. No secrets were changed or published.
