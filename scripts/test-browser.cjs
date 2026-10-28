// Exercise the real UI against fictional fixtures in a disposable schema.
// No email is delivered and the configured application's records are untouched.
require("dotenv/config");
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { createServer } = require("node:net");
const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}
let activeChild;
let interrupted = false;
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
  interrupted = true;
  activeChild?.kill("SIGTERM");
});
function run(args, env) {
  if (interrupted) return Promise.reject(new Error("Browser checks interrupted."));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: "inherit" });
    activeChild = child;
    child.once("error", reject);
    child.once("exit", (code) => {
      activeChild = undefined;
      code === 0 && !interrupted ? resolve() : reject(new Error(`Browser check step failed (exit ${code}).`));
    });
  });
}
async function main() {
  const base = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!base) throw new Error("Configure TEST_DATABASE_URL for browser tests.");
  const url = new URL(base);
  if (!["postgresql:", "postgres:"].includes(url.protocol))
    throw new Error("Browser tests require an online PostgreSQL connection in TEST_DATABASE_URL or DATABASE_URL_UNPOOLED.");
  const schema = `test_browser_${randomBytes(6).toString("hex")}`;
  url.searchParams.set("schema", schema);
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    CI: "1", NODE_ENV: "test", APP_ENV: "local",
    DATABASE_URL: url.toString(), DATABASE_URL_UNPOOLED: url.toString(),
    AUTH_SECRET: randomBytes(48).toString("base64url"), AUTH_URL: origin,
    PORT: String(port), E2E_BASE_URL: origin, SMTP_USER: "", SMTP_PASS: "",
  };
  const db = new PrismaClient({ datasourceUrl: url.toString() });
  try {
    if (!process.argv.includes("--skip-build")) {
      await run(["node_modules/next/dist/bin/next", "build", "--webpack"], {
        ...env, NODE_ENV: "production",
      });
    } else if (!fs.existsSync(".next/BUILD_ID")) {
      throw new Error("Run npm run build before using --skip-build.");
    }
    await run(["node_modules/prisma/build/index.js", "migrate", "deploy"], env);
    await run(["--import", "tsx", "prisma/seed.ts"], env);
    await run(["node_modules/@playwright/test/cli.js", "test"], { ...env, NODE_ENV: "production" });
    console.log("BROWSER_PASSED");
  } finally {
    try { await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); }
    finally { await db.$disconnect(); }
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
