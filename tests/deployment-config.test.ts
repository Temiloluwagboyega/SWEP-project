import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { NextRequest } from "next/server";
import { readAppOrigin, readSecurityConfig } from "../src/lib/security/config";
import { proxy } from "../src/proxy";
import { checkOrigin } from "../src/lib/http/origin";

const production = {
  NODE_ENV: "production",
  APP_ENV: "production",
  AUTH_SECRET: "Deployment-configuration-fixture-secret-2026!",
  DATABASE_URL: "postgresql://fixture.invalid/db",
} as const;
const hosted = {
  ...production,
  VERCEL: "1",
  VERCEL_ENV: "production",
  VERCEL_URL: "safecampus-deployment.vercel.app",
  VERCEL_PROJECT_PRODUCTION_URL: "campus.example",
};
function withEnv(values: Record<string, string>, action: () => void) {
  const keys = [
    ...Object.keys(production), "AUTH_URL", "NEXTAUTH_URL", "VERCEL",
    "VERCEL_ENV", "VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL",
    "VERCEL_BRANCH_URL", "TRUSTED_CLIENT_IP_HEADER",
  ];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  Object.assign(process.env, values);
  try { action(); } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("explicit AUTH_URL wins, legacy NEXTAUTH_URL works, and local defaults remain local", () => {
  assert.equal(readAppOrigin({ ...hosted, AUTH_URL: " https://custom.example/ " }), "https://custom.example");
  assert.equal(readAppOrigin({ ...hosted, NEXTAUTH_URL: "https://legacy.example" }), "https://legacy.example");
  assert.equal(readAppOrigin({ ...hosted, AUTH_URL: "", NEXTAUTH_URL: "https://legacy.example" }), "https://legacy.example");
  assert.equal(readAppOrigin({}), "http://localhost:3000");
});

test("Vercel production uses its production domain and previews use their own deployment", () => {
  assert.equal(readSecurityConfig(hosted).origin, "https://campus.example");
  assert.equal(readAppOrigin({ ...hosted, VERCEL_ENV: "preview" }), "https://safecampus-deployment.vercel.app");
  assert.equal(readAppOrigin({ ...hosted, VERCEL_PROJECT_PRODUCTION_URL: "" }), "https://safecampus-deployment.vercel.app");
  assert.equal(readAppOrigin({ ...hosted, AUTH_URL: "", NEXTAUTH_URL: "" }), "https://campus.example");
});

test("hosting still rejects missing or unsafe configuration rather than weakening validation", () => {
  assert.throws(() => readAppOrigin(production), /Configure AUTH_URL/);
  assert.throws(() => readAppOrigin({ ...hosted, VERCEL: "0" }), /Configure AUTH_URL/);
  assert.throws(() => readAppOrigin({ ...hosted, APP_ENV: "local" }), /Local mode/);
  for (const AUTH_URL of [
    "http://campus.example", "https://localhost", "https://127.0.0.1",
    "https://user:pass@campus.example", "https://campus.example/path",
    "https://campus.example?query=1", "https://campus.example#hash",
    "javascript:alert(1)", "campus.example",
  ]) assert.throws(() => readAppOrigin({ ...hosted, AUTH_URL }));
  for (const VERCEL_URL of ["host.invalid/path", "user@host.invalid", "localhost", "host.invalid?query=1"])
    assert.throws(() => readAppOrigin({ ...hosted, VERCEL_ENV: "preview", VERCEL_URL }));
  assert.throws(() => readSecurityConfig({ ...hosted, AUTH_SECRET: "short" }), /AUTH_SECRET/);
  assert.throws(() => readSecurityConfig({ ...hosted, DATABASE_URL: "file:dev.db" }), /PostgreSQL/);
});

test("Vercel aliases redirect to the trusted canonical host while preserving path and query", () => {
  withEnv(hosted, () => {
    const response = proxy(new NextRequest("https://safecampus-deployment.vercel.app/reports?status=SUBMITTED", {
      headers: { host: "safecampus-deployment.vercel.app" },
    }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), "https://campus.example/reports?status=SUBMITTED");
    const doubleSlash = proxy(new NextRequest("https://safecampus-deployment.vercel.app//untrusted.example/path", {
      headers: { host: "safecampus-deployment.vercel.app" },
    }));
    assert.equal(new URL(doubleSlash.headers.get("location")!).origin, "https://campus.example");
    const canonical = proxy(new NextRequest("http://internal-listener:3000/reports", {
      headers: { host: "campus.example", "x-forwarded-host": "untrusted.example" },
    }));
    assert.equal(canonical.headers.get("location"), null);
    assert.ok(canonical.headers.get("content-security-policy")?.includes("upgrade-insecure-requests"));
    assert.doesNotThrow(() => checkOrigin(new Request("https://campus.example/api/reports", { headers: { origin: "https://campus.example" } })));
    assert.throws(() => checkOrigin(new Request("https://campus.example/api/reports", { headers: { origin: "https://untrusted.example" } })));
  });
});

test("Auth.js startup receives the same inferred origin without using request headers", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", `
    await import('./src/lib/auth.ts');
    if (process.env.AUTH_URL !== 'https://campus.example') throw new Error('Auth.js origin mismatch');
    console.log('AUTH_ORIGIN_PASSED');
  `], {
    encoding: "utf8",
    env: { ...process.env, ...hosted, AUTH_URL: "", NEXTAUTH_URL: "", SMTP_USER: "", SMTP_PASS: "" },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /AUTH_ORIGIN_PASSED/);
});
