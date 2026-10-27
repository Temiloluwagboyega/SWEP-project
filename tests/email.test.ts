import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import ts from "typescript";
function fixture(
  options: {
    immediate?: boolean;
    unconfigured?: boolean;
    mailFails?: boolean;
    lookupFails?: boolean;
  } = {},
) {
  const sent: Record<string, unknown>[] = [],
    jobs: (() => Promise<void>)[] = [],
    logs: unknown[][] = [];
  let transportOptions: Record<string, unknown> | undefined, query: unknown;
  const filename = path.resolve("src/lib/email.ts");
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const overrides: Record<string, unknown> = {
    nodemailer: {
      createTransport(value: Record<string, unknown>) {
        transportOptions = value;
        return {
          async sendMail(message: Record<string, unknown>) {
            if (options.mailFails)
              throw new Error("PRIVATE recipient/password/server response");
            sent.push(message);
          },
        };
      },
    },
    "next/server": {
      after(job: () => Promise<void>) {
        if (options.immediate) throw new Error("No request context");
        jobs.push(job);
      },
    },
    "./db": {
      db: {
        user: {
          async findMany(value: unknown) {
            query = value;
            if (options.lookupFails)
              throw new Error("PRIVATE database details");
            return [
              { email: "one@fixture.invalid" },
              { email: "two@fixture.invalid" },
            ];
          },
        },
      },
    },
    "./constants": { statusLabels: { ASSIGNED: "Assigned" } },
    "../config/brand": { brand: { name: "SafeCampus" } },
  };
  const m = new Module(filename, module) as Module & {
    _compile(source: string, filename: string): void;
  };
  m.filename = filename;
  const original = m.require.bind(m);
  m.require = ((name: string) =>
    overrides[name] ?? original(name)) as typeof m.require;
  const saved = {
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_PORT: process.env.SMTP_PORT,
    AUTH_URL: process.env.AUTH_URL,
  };
  Object.assign(process.env, {
    SMTP_USER: options.unconfigured ? "" : "mailer@fixture.invalid",
    SMTP_PASS: options.unconfigured ? "" : "fictional-smtp-password",
    SMTP_PORT: "587",
    AUTH_URL: "https://campus.example",
  });
  try {
    m._compile(source, filename);
  } finally {
    for (const [key, value] of Object.entries(saved))
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
  }
  const api = m.exports as typeof import("../src/lib/email");
  async function run(action: () => Promise<void>) {
    const original = console.error;
    console.error = (...args) => logs.push(args);
    try {
      await action();
      for (const job of jobs.splice(0)) await job();
    } finally {
      console.error = original;
    }
  }
  return {
    api,
    sent,
    jobs,
    logs,
    run,
    get query() {
      return query;
    },
    get transportOptions() {
      return transportOptions;
    },
  };
}
test("SMTP enforces TLS, disables resource reads and defers private notification payloads", async () => {
  const f = fixture();
  await f.api.sendReportReceived("student@fixture.invalid", "SCS-2026-000001");
  assert.equal(f.sent.length, 0);
  assert.equal(f.jobs.length, 1);
  await f.run(async () => {});
  assert.equal(f.sent.length, 1);
  assert.equal(f.transportOptions?.requireTLS, true);
  assert.equal(f.transportOptions?.disableFileAccess, true);
  assert.equal(f.transportOptions?.disableUrlAccess, true);
  const message = f.sent[0];
  assert.equal(message.to, "student@fixture.invalid");
  assert.match(
    String(message.html),
    /https:\/\/campus.example\/reports\/SCS-2026-000001/,
  );
  assert.ok(!JSON.stringify(message).includes("fictional-smtp-password"));
  assert.ok(!("cc" in message));
  assert.ok(!("bcc" in message));
});
test("urgent lookup is deferred, channel-scoped and sends separate recipient envelopes", async () => {
  const f = fixture();
  await f.api.sendUrgentAlert("SECURITY", "SCS-2026-000002");
  assert.equal(f.query, undefined);
  await f.run(async () => {});
  assert.deepEqual(f.query, {
    where: { role: { in: ["SECURITY", "SUPERVISOR"] }, isActive: true },
    select: { email: true },
  });
  assert.deepEqual(
    f.sent.map((m) => m.to),
    ["one@fixture.invalid", "two@fixture.invalid"],
  );
  for (const message of f.sent) {
    assert.ok(!Array.isArray(message.to));
    assert.ok(!String(message.html).includes("one@fixture.invalid"));
  }
});
test("SMTP and database failures cannot reject the report action or leak private error text", async () => {
  for (const options of [{ mailFails: true }, { lookupFails: true }]) {
    const f = fixture({ ...options, immediate: true });
    await f.run(() => f.api.sendUrgentAlert("COMMITTEE", "SCS-2026-000003"));
    assert.ok(f.logs.length > 0);
    assert.ok(!JSON.stringify(f.logs).includes("PRIVATE"));
  }
});
test("no configured SMTP means no send, job or staff database lookup", async () => {
  const f = fixture({ unconfigured: true });
  await f.run(async () => {
    await f.api.sendWelcome("student@fixture.invalid");
    await f.api.sendUrgentAlert("COMMITTEE", "SCS-2026-000004");
  });
  assert.equal(f.sent.length, 0);
  assert.equal(f.jobs.length, 0);
  assert.equal(f.query, undefined);
});
test("welcome excludes user data and status notifications include only reference/status/link", async () => {
  const f = fixture({ immediate: true });
  await f.run(async () => {
    await f.api.sendWelcome("student@fixture.invalid");
    await f.api.sendStatusUpdate(
      "student@fixture.invalid",
      "SCS-2026-000005",
      "ASSIGNED",
    );
  });
  assert.equal(f.sent.length, 2);
  assert.match(String(f.sent[0].subject), /SafeCampus/);
  assert.match(String(f.sent[1].html), /Assigned/);
  assert.ok(!String(f.sent[0].html).includes("student@fixture.invalid"));
});
