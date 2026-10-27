import "dotenv/config";
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { readSecurityConfig } from "../src/lib/security/config";
import { ApiError } from "../src/lib/http/errors";
import { boundedText, readJson } from "../src/lib/http/body";
import { checkOrigin } from "../src/lib/http/origin";
import { contentSecurityPolicy } from "../src/lib/security/headers";
import { registerSchema, loginSchema } from "../src/lib/validation";
let db: PrismaClient, temp: string, userId: string;
let limiter: typeof import("../src/lib/security/rate-limit");
let sessions: typeof import("../src/lib/security/sessions");
let authRoute: typeof import("../src/app/api/auth/[...nextauth]/route");
const password = "Fictional test passphrase 2026!";
const origin = "http://localhost:3000";
const email = "security-fixture@demo.test";
async function status(promise: Promise<unknown>, code: number) {
  await assert.rejects(
    promise,
    (e) => e instanceof ApiError && e.status === code,
  );
}
before(async () => {
  temp = await mkdtemp(path.join(tmpdir(), "campus-hardening-"));
  process.env.DATABASE_URL = `file:${path.join(temp, "test.db")}`;
  process.env.AUTH_SECRET = randomBytes(48).toString("base64url");
  process.env.AUTH_URL = origin;
  process.env.APP_ENV = "local";
  delete process.env.TRUSTED_CLIENT_IP_HEADER;
  const pushed = spawnSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "db", "push", "--skip-generate"],
    { env: process.env, encoding: "utf8" },
  );
  assert.equal(pushed.status, 0, "Isolated security database must initialise");
  ({ db } = await import("../src/lib/db"));
  limiter = await import("../src/lib/security/rate-limit");
  sessions = await import("../src/lib/security/sessions");
  authRoute = await import("../src/app/api/auth/[...nextauth]/route");
  userId = (
    await db.user.create({
      data: {
        name: "Fictional Security Test",
        email,
        passwordHash: await hash(password, 12),
      },
    })
  ).id;
});
beforeEach(async () => {
  delete process.env.TRUSTED_CLIENT_IP_HEADER;
  await db.rateLimitBucket.deleteMany();
  await db.loginSession.deleteMany();
  await db.user.update({
    where: { id: userId },
    data: { isActive: true, sessionVersion: 0 },
  });
});
after(async () => {
  if (db) await db.$disconnect();
  if (temp) await rm(temp, { recursive: true, force: true });
});

test("configuration rejects weak keys and unsafe production origins/databases", () => {
  const valid = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: origin,
    APP_ENV: "local",
    DATABASE_URL: "file:./dev.db",
  };
  assert.equal(readSecurityConfig(valid).origin, origin);
  for (const secret of [
    "",
    "short",
    "x".repeat(64),
    "replace-with-your-secret-value-here",
  ])
    assert.throws(() => readSecurityConfig({ ...valid, AUTH_SECRET: secret }));
  for (const url of [
    "https://user:pass@campus.example",
    "https://campus.example/subpath",
    "javascript:alert(1)",
  ])
    assert.throws(() => readSecurityConfig({ ...valid, AUTH_URL: url }));
  assert.throws(() => readSecurityConfig({ ...valid, APP_ENV: "production" }));
  assert.throws(() =>
    readSecurityConfig({
      ...valid,
      APP_ENV: "production",
      AUTH_URL: "https://campus.example",
    }),
  );
  assert.equal(
    readSecurityConfig({
      ...valid,
      APP_ENV: "production",
      AUTH_URL: "https://campus.example",
      DATABASE_URL: "postgresql://fixture.invalid/db",
    }).production,
    true,
  );
});

test("body readers enforce actual streamed bytes, content type and UTF-8", async () => {
  const json = (body: string, headers: Record<string, string> = {}) =>
    new Request(origin, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body,
    });
  assert.deepEqual(await readJson(json('{"safe":true}')), { safe: true });
  await assert.rejects(readJson(json("{broken")), SyntaxError);
  await status(readJson(json("{}", { "content-type": "text/plain" })), 415);
  await status(
    readJson(json("x".repeat(17000), { "content-length": "1" })),
    413,
  );
  await status(boundedText(json("{}", { "content-length": "99999" }), 8), 413);
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new Uint8Array(5000));
      c.enqueue(new Uint8Array(5000));
      c.close();
    },
  });
  await status(
    boundedText(
      new Request(origin, {
        method: "POST",
        body: stream,
        duplex: "half",
      } as RequestInit),
      8192,
    ),
    413,
  );
  await status(
    boundedText(
      new Request(origin, { method: "POST", body: new Uint8Array([0xff]) }),
      8,
    ),
    400,
  );
});

test("mutations require canonical origin and reject cross-site browser requests", () => {
  checkOrigin(new Request(origin, { headers: { origin } }));
  for (const headers of [
    {},
    { origin: "https://evil.example" },
    { origin, "sec-fetch-site": "cross-site" },
  ] as Record<string, string>[])
    assert.throws(
      () => checkOrigin(new Request(origin, { headers })),
      (e) => e instanceof ApiError && e.status === 400,
    );
});

test("IP headers are ignored unless explicitly configured behind a trusted proxy", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.1",
    "x-client-ip": "198.51.100.2",
  });
  assert.equal(limiter.clientAddress(headers), "unverified-client");
  process.env.TRUSTED_CLIENT_IP_HEADER = "x-client-ip";
  assert.equal(limiter.clientAddress(headers), "198.51.100.2");
  headers.set("x-client-ip", "198.51.100.2, 198.51.100.3");
  assert.equal(limiter.clientAddress(headers), "unverified-client");
});

test("persistent rate limits reject excess requests, conceal identities and reset at expiry", async () => {
  const now = 1_800_000_000_000;
  for (let i = 0; i < 10; i++)
    await limiter.consumeLimit("loginAccount", email, now);
  await assert.rejects(
    limiter.consumeLimit("loginAccount", email, now),
    (e) =>
      e instanceof ApiError &&
      e.status === 429 &&
      Number(e.headers["Retry-After"]) > 0,
  );
  const row = await db.rateLimitBucket.findFirstOrThrow();
  assert.equal(row.count, 11);
  assert.match(row.id, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(row).includes(email));
  const { PrismaClient } = await import("@prisma/client");
  const second = new PrismaClient();
  try {
    assert.equal(
      (
        await second.rateLimitBucket.findUniqueOrThrow({
          where: { id: row.id },
        })
      ).count,
      11,
    );
  } finally {
    await second.$disconnect();
  }
  await limiter.consumeLimit(
    "loginAccount",
    email,
    now + limiter.limits.loginAccount.window,
  );
  assert.equal(await db.rateLimitBucket.count(), 1);
});

test("concurrent report attempts share one atomic five-per-hour limit", async () => {
  const results = await Promise.allSettled(
    Array.from({ length: 8 }, () => limiter.consumeLimit("report", userId)),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 5);
  for (const result of results)
    if (result.status === "rejected") assert.equal(result.reason.status, 429);
});

test("sessions enforce idle/absolute expiry and revoke on version or account changes", async () => {
  const session = await sessions.createLoginSession(userId);
  assert.equal(
    (await sessions.validateLoginSession(session.id, userId, 0))?.id,
    userId,
  );
  assert.equal(
    await sessions.validateLoginSession(session.id, "other-user", 0),
    null,
  );
  assert.equal(
    await sessions.validateLoginSession(
      session.id,
      userId,
      0,
      (
        await db.loginSession.findUniqueOrThrow({ where: { id: session.id } })
      ).lastSeenAt.getTime() + sessions.SESSION_IDLE_MS,
    ),
    null,
  );
  assert.equal(
    sessions.sessionIsFresh(
      {
        ...session,
        lastSeenAt: new Date(
          session.createdAt.getTime() + sessions.SESSION_MAX_MS,
        ),
      },
      session.createdAt.getTime() + sessions.SESSION_MAX_MS,
    ),
    false,
  );
  await db.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
  assert.equal(
    await sessions.validateLoginSession(session.id, userId, 0),
    null,
  );
  await db.user.update({ where: { id: userId }, data: { isActive: false } });
  assert.equal(
    await sessions.validateLoginSession(session.id, userId, 1),
    null,
  );
});

test("account maintenance revokes sessions and can disable/re-enable access", async () => {
  await sessions.createLoginSession(userId);
  const run = (action: string) =>
    spawnSync(
      process.execPath,
      ["scripts/manage-account.cjs", "--user-id", userId, action],
      { env: process.env, encoding: "utf8" },
    );
  assert.equal(run("--disable").status, 0);
  assert.equal(await db.loginSession.count(), 0);
  assert.equal(
    (await db.user.findUniqueOrThrow({ where: { id: userId } })).isActive,
    false,
  );
  assert.equal(run("--enable").status, 0);
  assert.equal(
    (await db.user.findUniqueOrThrow({ where: { id: userId } })).isActive,
    true,
  );
  assert.equal(run("--revoke").status, 0);
  assert.equal(
    (await db.user.findUniqueOrThrow({ where: { id: userId } })).sessionVersion,
    3,
  );
});

test("new passwords require 15 characters and enforce bcrypt's UTF-8 byte limit", () => {
  assert.equal(
    registerSchema.safeParse({ name: "Test User", email, password }).success,
    true,
  );
  assert.equal(
    registerSchema.safeParse({
      name: "Test User",
      email,
      password: "Demo#2026",
    }).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ email, password: "Demo#2026" }).success,
    true,
  );
  assert.equal(
    registerSchema.safeParse({
      name: "Test User",
      email,
      password: "🔐".repeat(20),
    }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({
      name: "Test User",
      email,
      password,
      role: "SUPERVISOR",
    }).success,
    false,
  );
});

function cookies(response: Response) {
  return response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}
async function csrf() {
  const response = await authRoute.GET(
    new NextRequest(origin + "/api/auth/csrf"),
  );
  assert.equal(response.status, 200);
  return {
    token: (await response.json()).csrfToken as string,
    cookie: cookies(response),
  };
}
async function login(
  token: string,
  cookie: string,
  extra: Record<string, string> = {},
) {
  return authRoute.POST(
    new NextRequest(origin + "/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/x-www-form-urlencoded",
        "x-auth-return-redirect": "1",
        cookie,
        ...extra,
      },
      body: new URLSearchParams({
        csrfToken: token,
        email,
        password,
        callbackUrl: origin + "/reports",
      }).toString(),
    }),
  );
}

test("real Auth.js handlers enforce CSRF, issue private cookies and reject revoked JWT sessions", async () => {
  const c = await csrf();
  const rejected = await login("invalid-csrf", c.cookie);
  assert.match((await rejected.json()).url, /MissingCSRF/);
  assert.equal(await db.loginSession.count(), 0);
  const response = await login(c.token, c.cookie);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).url, origin + "/reports");
  assert.match(response.headers.get("cache-control")!, /no-store/);
  const authCookie = response.headers
    .getSetCookie()
    .find((c) => c.startsWith("authjs.session-token="));
  assert.ok(authCookie);
  assert.match(authCookie, /HttpOnly/i);
  assert.match(authCookie, /SameSite=Lax/i);
  const cookie = cookies(response);
  const get = () =>
    authRoute.GET(
      new NextRequest(origin + "/api/auth/session", { headers: { cookie } }),
    );
  const active = await (await get()).json();
  assert.equal(active.user.id, userId);
  assert.ok(!JSON.stringify(active).includes(password));
  assert.ok(!JSON.stringify(active).includes(process.env.AUTH_SECRET!));
  await db.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
  assert.equal(await (await get()).json(), null);
});

test("auth IP throttling returns Retry-After and a URL compatible with the login client", async () => {
  for (let i = 0; i < 10; i++)
    await limiter.consumeLimit("loginIp", "unverified-client");
  const response = await login("any-token", "");
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get("retry-after")) > 0);
  const url = new URL((await response.json()).url);
  assert.equal(url.origin, origin);
  assert.equal(url.searchParams.get("code"), "rate_limited");
  const cross = await authRoute.POST(
    new NextRequest(origin + "/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        "content-type": "application/json",
      },
      body: "{}",
    }),
  );
  assert.equal(cross.status, 400);
});

test("account throttle persists across trusted IPs, and signout deletes the server session", async () => {
  const c = await csrf();
  for (let i = 0; i < 10; i++)
    await limiter.consumeLimit("loginAccount", email);
  process.env.TRUSTED_CLIENT_IP_HEADER = "x-client-ip";
  const limited = await login(c.token, c.cookie, {
    "x-client-ip": "198.51.100.4",
  });
  const limitedUrl = (await limited.json()).url;
  assert.equal(
    new URL(limitedUrl).searchParams.get("code"),
    "rate_limited",
    limitedUrl,
  );
  assert.equal(await db.loginSession.count(), 0);
  await db.rateLimitBucket.deleteMany();
  const signed = await login(c.token, c.cookie);
  assert.equal(await db.loginSession.count(), 1);
  const cookie = [c.cookie, cookies(signed)].join("; ");
  const signout = await authRoute.POST(
    new NextRequest(origin + "/api/auth/signout", {
      method: "POST",
      headers: {
        origin,
        cookie,
        "content-type": "application/x-www-form-urlencoded",
        "x-auth-return-redirect": "1",
      },
      body: new URLSearchParams({
        csrfToken: c.token,
        callbackUrl: origin,
      }).toString(),
    }),
  );
  assert.equal(signout.status, 200);
  assert.equal(await db.loginSession.count(), 0);
});

test("production CSP uses a fresh per-response nonce and overwrites supplied nonce headers", async () => {
  const policy = contentSecurityPolicy("abcdefghijklmnopqrstuv==", false, true);
  assert.match(policy, /strict-dynamic/);
  assert.match(policy, /upgrade-insecure-requests/);
  assert.ok(!policy.includes("unsafe-eval"));
  assert.ok(
    !policy
      .split(";")
      .find((s) => s.trim().startsWith("script-src"))!
      .includes("unsafe-inline"),
  );
  const { proxy } = await import("../src/proxy");
  const make = () =>
    proxy(
      new NextRequest(origin + "/reports", {
        headers: { "x-nonce": "attacker" },
      }),
    );
  const a = make(),
    b = make();
  const nonce = a.headers.get("x-middleware-request-x-nonce");
  assert.ok(nonce);
  assert.notEqual(nonce, "attacker");
  assert.notEqual(nonce, b.headers.get("x-middleware-request-x-nonce"));
  assert.ok(
    a.headers.get("content-security-policy")!.includes(`nonce-${nonce}`),
  );
  assert.equal(
    a.headers.get("x-middleware-request-content-security-policy"),
    a.headers.get("content-security-policy"),
  );
});

test("rate verification fails closed when its database table is unavailable", async () => {
  await db.$executeRawUnsafe(
    'ALTER TABLE "RateLimitBucket" RENAME TO "RateLimitBucket_test_unavailable"',
  );
  try {
    await status(limiter.consumeLimit("loginIp", "fixture"), 503);
  } finally {
    await db.$executeRawUnsafe(
      'ALTER TABLE "RateLimitBucket_test_unavailable" RENAME TO "RateLimitBucket"',
    );
  }
});

test("registration handler hashes passwords, denies role injection and limits attempts", async () => {
  const route = await import("../src/app/api/[...path]/route");
  const submit = (body: object) =>
    route.POST(
      new Request(origin + "/api/register", {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ path: ["register"] }) },
    );
  const input = {
    name: "Fictional Registration",
    email: "registration-fixture@demo.test",
    password,
  };
  const result = await submit(input);
  assert.equal(result.status, 201);
  assert.match(result.headers.get("cache-control")!, /no-store/);
  const account = await db.user.findUniqueOrThrow({
    where: { email: input.email },
  });
  assert.equal(account.role, "STUDENT");
  assert.notEqual(account.passwordHash, password);
  const { compare } = await import("bcryptjs");
  assert.equal(await compare(password, account.passwordHash), true);
  assert.equal(
    (
      await submit({
        ...input,
        email: "forbidden-fixture@demo.test",
        role: "SUPERVISOR",
      })
    ).status,
    400,
  );
  assert.equal((await submit({ ...input, password: "short" })).status, 400);
  assert.equal(
    (await submit({ ...input, email: "excess-fixture@demo.test" })).status,
    429,
  );
  assert.equal(
    await db.user.count({
      where: {
        email: {
          in: ["forbidden-fixture@demo.test", "excess-fixture@demo.test"],
        },
      },
    }),
    0,
  );
});
