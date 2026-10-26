import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type { SessionUser } from "../src/lib/access";
let db: PrismaClient;
let service: typeof import("../src/lib/reports");
let ApiError: typeof import("../src/lib/http/errors").ApiError;
let schema: string | undefined;
let student: SessionUser,
  other: SessionUser,
  committee: SessionUser,
  committee2: SessionUser,
  security: SessionUser,
  security2: SessionUser,
  supervisor: SessionUser;
let locationId: string;
function body(extra: object = {}) {
  return {
    category: "PHONE_THEFT",
    description:
      "Fictional test: A phone went missing from a reading desk near the entrance.",
    locationId,
    locationNote: "Test-only location detail",
    occurredAt: new Date(Date.now() - 60000).toISOString(),
    channel: "COMMITTEE",
    urgent: false,
    confidential: false,
    ...extra,
  };
}
async function errorCode(action: Promise<unknown>, code: number) {
  await assert.rejects(
    action,
    (e) => e instanceof ApiError && e.status === code,
  );
}
before(async () => {
  const base = process.env.TEST_DATABASE_URL;
  assert.ok(base, "Set TEST_DATABASE_URL to a PostgreSQL database for tests");
  // A throwaway schema keeps tests isolated from the demo data in the same database.
  schema = `test_${randomBytes(6).toString("hex")}`;
  const url = new URL(base);
  url.searchParams.set("schema", schema);
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED = url.toString();
  const pushed = spawnSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "db", "push", "--skip-generate"],
    { env: process.env, encoding: "utf8" },
  );
  assert.equal(pushed.status, 0, "Isolated test database must initialise");
  ({ db } = await import("../src/lib/db"));
  service = await import("../src/lib/reports");
  ({ ApiError } = await import("../src/lib/http/errors"));
  const roles = [
    "STUDENT",
    "STUDENT",
    "COMMITTEE",
    "COMMITTEE",
    "SECURITY",
    "SECURITY",
    "SUPERVISOR",
  ] as const;
  const users = [];
  for (let i = 0; i < roles.length; i++)
    users.push(
      await db.user.create({
        data: {
          name: `Fictional User ${i}`,
          email: `fixture${i}@demo.test`,
          role: roles[i],
          passwordHash: "unused-service-test-hash",
        },
      }),
    );
  [student, other, committee, committee2, security, security2, supervisor] =
    users;
  locationId = (
    await db.location.create({
      data: { name: "Fictional campus location", area: "Test" },
    })
  ).id;
});
after(async () => {
  if (db) {
    if (schema) await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await db.$disconnect();
  }
});

test("each channel persists reports, references, and initial timeline; students see only their own", async () => {
  const a = await service.createReport(student, body());
  const b = await service.createReport(student, body({ channel: "SECURITY" }));
  assert.match(a.ref, /^SCS-\d{4}-\d{6}$/);
  assert.notEqual(a.ref, b.ref);
  assert.equal((await service.getReport(student, a.ref)).status, "SUBMITTED");
  const cQueue = await service.listReports(committee),
    sQueue = await service.listReports(security);
  assert.ok(cQueue.some((r) => r.ref === a.ref));
  assert.ok(!cQueue.some((r) => r.ref === b.ref));
  assert.ok(sQueue.some((r) => r.ref === b.ref));
  assert.ok(!sQueue.some((r) => r.ref === a.ref));
  await errorCode(service.getReport(other, a.id), 404);
  await errorCode(service.getReport(security, a.id), 404);
  await errorCode(service.getReport(committee, b.id), 404);
  assert.equal((await service.listReports(other)).length, 0);
  assert.equal(
    (await db.statusEvent.findMany({ where: { reportId: a.id } }))[0].action,
    "CREATED",
  );
});

test("validation rejects invalid fields, unknown locations, future dates, staff creation and overposting", async () => {
  const before = await db.report.count();
  for (const invalid of [
    { description: "short" },
    { occurredAt: new Date(Date.now() + 86400000).toISOString() },
    { category: "INVALID" },
    { locationId: "" },
    { role: "SUPERVISOR" },
  ])
    await assert.rejects(service.createReport(student, body(invalid)));
  await errorCode(
    service.createReport(student, body({ locationId: "missing" })),
    400,
  );
  await errorCode(service.createReport(committee, body()), 404);
  assert.equal(await db.report.count(), before);
});

test("editing is permitted only before review and events never expose internal details to students", async () => {
  const a = await service.createReport(student, body());
  const {
    channel: _channel,
    occurredAt: _time,
    ...editable
  } = body({
    description:
      "Fictional test: Updated details before the case is reviewed by the committee.",
  });
  await service.editReport(student, a.id, editable);
  assert.equal(
    (await service.getReport(student, a.id)).description,
    editable.description,
  );
  await assert.rejects(
    service.editReport(student, a.id, { ...editable, channel: "SECURITY" }),
  );
  await errorCode(
    service.assignReport(committee, a.id, { assigneeId: committee.id }),
    409,
  );
  await service.changeStatus(committee, a.id, {
    toStatus: "UNDER_REVIEW",
    publicNote: "Review started",
    internalNote: "SECRET_INTERNAL_TEST",
  });
  await errorCode(service.editReport(student, a.id, editable), 409);
  const studentView = JSON.stringify(await service.getReport(student, a.id));
  assert.ok(studentView.includes("Review started"));
  for (const secret of [
    "SECRET_INTERNAL_TEST",
    committee.id,
    committee.name!,
    "internalNote",
    "actorId",
    "assignee",
  ])
    assert.ok(!studentView.includes(secret), `must not leak ${secret}`);
  assert.ok(
    JSON.stringify(await service.getReport(committee, a.id)).includes(
      "SECRET_INTERNAL_TEST",
    ),
    "positive control: note really exists for permitted staff",
  );
});

test("confidential metadata is an exact allowlist in list and detail; handler and Security supervisor get full access", async () => {
  const a = await service.createReport(
    student,
    body({ confidential: true, channel: "SECURITY" }),
  );
  const allowed = ["ref", "category", "status", "urgent", "createdAt"].sort();
  assert.deepEqual(
    Object.keys(await service.getReport(security, a.id)).sort(),
    allowed,
  );
  assert.deepEqual(
    Object.keys(
      (await service.listReports(security)).find((r) => r.ref === a.ref)!,
    ).sort(),
    allowed,
  );
  assert.equal(
    (await service.getReport(student, a.id)).description,
    body().description,
  );
  assert.equal(
    (await service.getReport(supervisor, a.id)).description,
    body().description,
  );
  await errorCode(
    service.changeStatus(security, a.id, {
      toStatus: "UNDER_REVIEW",
      internalNote: "forbidden note",
    }),
    404,
  );
  await service.changeStatus(security, a.id, { toStatus: "UNDER_REVIEW" });
  await errorCode(
    service.assignReport(security, a.id, { assigneeId: security2.id }),
    404,
  );
  await service.assignReport(security, a.id, { assigneeId: security.id });
  assert.equal(
    (await service.getReport(security, a.id)).description,
    body().description,
  );
  assert.deepEqual(
    Object.keys(await service.getReport(security2, a.id)).sort(),
    allowed,
  );
  await errorCode(
    service.changeStatus(security2, a.id, { toStatus: "IN_PROGRESS" }),
    404,
  );
  const c = await service.createReport(student, body({ confidential: true }));
  await errorCode(service.getReport(supervisor, c.id), 404);
  await service.changeStatus(committee, c.id, { toStatus: "UNDER_REVIEW" });
  await service.assignReport(committee, c.id, { assigneeId: committee.id });
  assert.equal(
    (await service.getReport(committee, c.id)).description,
    body().description,
  );
  assert.deepEqual(
    Object.keys(await service.getReport(committee2, c.id)).sort(),
    allowed,
  );
});

test("status transitions, channel assignment, referral boundaries, and terminal states are enforced", async () => {
  const a = await service.createReport(student, body());
  await errorCode(
    service.changeStatus(committee, a.id, { toStatus: "RESOLVED" }),
    409,
  );
  await service.changeStatus(committee, a.id, {
    toStatus: "UNDER_REVIEW",
    internalNote: "COMMITTEE_ONLY_NOTE",
  });
  await errorCode(
    service.assignReport(committee, a.id, { assigneeId: security.id }),
    400,
  );
  await service.assignReport(committee, a.id, { assigneeId: committee.id });
  await service.referReport(committee, a.id, {
    reason: "Requires official follow-up.",
  });
  await errorCode(service.getReport(committee, a.id), 404);
  assert.ok(
    !(await service.listReports(committee)).some((r) => r.ref === a.ref),
  );
  const securityView = await service.getReport(security, a.id);
  assert.equal(securityView.status, "SUBMITTED");
  assert.equal(securityView.assignee, null);
  assert.ok(!JSON.stringify(securityView).includes("COMMITTEE_ONLY_NOTE"));
  const history = await db.statusEvent.findMany({ where: { reportId: a.id } });
  assert.ok(history.some((e) => e.internalNote === "COMMITTEE_ONLY_NOTE"));
  const ownerView = await service.getReport(student, a.id);
  assert.ok(
    ownerView.events?.some(
      (e) =>
        e.action === "REFERRED" &&
        e.publicNote?.includes("Referred to Official Security"),
    ),
  );
  await service.changeStatus(security, a.id, { toStatus: "UNDER_REVIEW" });
  await service.assignReport(security, a.id, { assigneeId: security.id });
  await service.changeStatus(security, a.id, { toStatus: "IN_PROGRESS" });
  await service.changeStatus(security, a.id, { toStatus: "RESOLVED" });
  await service.changeStatus(security, a.id, { toStatus: "IN_PROGRESS" });
  await service.changeStatus(security, a.id, { toStatus: "RESOLVED" });
  await service.changeStatus(security, a.id, { toStatus: "CLOSED" });
  await errorCode(
    service.changeStatus(security, a.id, { toStatus: "IN_PROGRESS" }),
    409,
  );
  const rejected = await service.createReport(student, body());
  await service.changeStatus(committee, rejected.id, { toStatus: "REJECTED" });
  await errorCode(
    service.referReport(committee, rejected.id, {
      reason: "Cannot transfer a terminal case.",
    }),
    409,
  );
});

test("parallel submissions have unique references and one CREATED event each", async () => {
  const created = await Promise.all(
    Array.from({ length: 4 }, () => service.createReport(student, body())),
  );
  assert.equal(new Set(created.map((r) => r.ref)).size, created.length);
  for (const report of created)
    assert.equal(
      await db.statusEvent.count({
        where: { reportId: report.id, action: "CREATED" },
      }),
      1,
    );
});

test("status filters reject bad input and urgency sorting puts urgent reports first", async () => {
  await errorCode(
    service.listReports(
      committee,
      new URLSearchParams({ status: "NOT_A_STATUS" }),
    ),
    400,
  );
  const urgent = await service.createReport(student, body({ urgent: true }));
  const reports = await service.listReports(committee);
  assert.equal(reports[0].ref, urgent.ref);
});
