const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require("/usr/local/lib/node_modules/typescript");
}
function loadSource(filename) {
  const absolute = path.resolve(filename);
  const compiled = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    fileName: absolute,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = new Module(absolute, module);
  loaded.filename = absolute;
  loaded.paths = Module._nodeModulePaths(path.dirname(absolute));
  loaded._compile(compiled, absolute);
  return loaded.exports;
}
const {
  canViewReport,
  canViewConfidential,
  canHandle,
  canEdit,
  serializeReport,
  scopeFor,
} = loadSource("src/lib/access.ts");
const { transitions } = loadSource("src/lib/status.ts");
const actors = {
  owner: { id: "owner", role: "STUDENT" },
  stranger: { id: "stranger", role: "STUDENT" },
  committee: { id: "committee", role: "COMMITTEE" },
  committeePeer: { id: "committee-peer", role: "COMMITTEE" },
  security: { id: "security", role: "SECURITY" },
  securityPeer: { id: "security-peer", role: "SECURITY" },
  supervisor: { id: "supervisor", role: "SUPERVISOR" },
};
const now = new Date("2026-10-26T08:00:00Z");
function fixture(extra = {}) {
  return {
    id: "incident-id",
    ref: "SCS-2026-000001",
    category: "ASSAULT",
    status: "SUBMITTED",
    urgent: true,
    channel: "COMMITTEE",
    confidential: false,
    reporterId: "owner",
    assigneeId: null,
    description: "SENSITIVE_DESCRIPTION",
    locationId: "place",
    locationNote: "SENSITIVE_LOCATION_NOTE",
    occurredAt: now,
    createdAt: now,
    updatedAt: now,
    location: { id: "place", name: "Fictional location", area: "Demo area" },
    reporter: {
      id: "owner",
      name: "SENSITIVE_REPORTER_NAME",
      email: "fixture@demo.test",
    },
    assignee: null,
    events: [
      {
        toStatus: "UNDER_REVIEW",
        createdAt: now,
        publicNote: "Public committee update",
        internalNote: "COMMITTEE_PRIVATE_NOTE",
        actorChannel: "COMMITTEE",
        actorId: "committee",
        action: "STATUS_CHANGE",
      },
      {
        toStatus: "SUBMITTED",
        createdAt: now,
        publicNote: "Public security update",
        internalNote: "SECURITY_PRIVATE_NOTE",
        actorChannel: "SECURITY",
        actorId: "security",
        action: "REFERRED",
      },
    ],
    ...extra,
  };
}
// Explicit policy cases, including a positive control for every secret whose absence is tested.
const cases = [
  {
    actor: "owner",
    report: {},
    view: true,
    full: true,
    handle: false,
    edit: true,
  },
  {
    actor: "owner",
    report: { confidential: true },
    view: true,
    full: true,
    handle: false,
    edit: true,
  },
  {
    actor: "stranger",
    report: {},
    view: false,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "committee",
    report: {},
    view: true,
    full: true,
    handle: true,
    edit: false,
  },
  {
    actor: "security",
    report: {},
    view: false,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "supervisor",
    report: { confidential: true },
    view: false,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "committee",
    report: { confidential: true },
    view: true,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "committee",
    report: { confidential: true, assigneeId: "committee" },
    view: true,
    full: true,
    handle: true,
    edit: false,
  },
  {
    actor: "committeePeer",
    report: { confidential: true, assigneeId: "committee" },
    view: true,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "security",
    report: { channel: "SECURITY", confidential: true },
    view: true,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "security",
    report: { channel: "SECURITY", confidential: true, assigneeId: "security" },
    view: true,
    full: true,
    handle: true,
    edit: false,
  },
  {
    actor: "securityPeer",
    report: { channel: "SECURITY", confidential: true, assigneeId: "security" },
    view: true,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "supervisor",
    report: { channel: "SECURITY", confidential: true },
    view: true,
    full: true,
    handle: true,
    edit: false,
  },
  {
    actor: "committee",
    report: { channel: "SECURITY" },
    view: false,
    full: false,
    handle: false,
    edit: false,
  },
  {
    actor: "owner",
    report: { assigneeId: "committee" },
    view: true,
    full: true,
    handle: false,
    edit: false,
  },
  {
    actor: "owner",
    report: { status: "UNDER_REVIEW" },
    view: true,
    full: true,
    handle: false,
    edit: false,
  },
  {
    actor: "owner",
    report: { status: "CLOSED" },
    view: true,
    full: true,
    handle: false,
    edit: false,
  },
];
for (const c of cases) {
  const user = actors[c.actor],
    report = fixture(c.report);
  assert.equal(canViewReport(user, report), c.view, `${c.actor}: visibility`);
  assert.equal(
    canViewConfidential(user, report),
    c.full,
    `${c.actor}: contents`,
  );
  assert.equal(canHandle(user, report), c.handle, `${c.actor}: handling`);
  assert.equal(canEdit(user, report), c.edit, `${c.actor}: editing`);
  if (!c.view) {
    assert.throws(() => serializeReport(user, report));
    continue;
  }
  const dto = serializeReport(user, report);
  if (!c.full) {
    assert.deepEqual(
      Object.keys(dto).sort(),
      ["ref", "category", "status", "urgent", "createdAt"].sort(),
    );
    for (const secret of [
      "SENSITIVE_DESCRIPTION",
      "SENSITIVE_LOCATION_NOTE",
      "SENSITIVE_REPORTER_NAME",
      "PRIVATE_NOTE",
      "incident-id",
    ])
      assert.ok(!JSON.stringify(dto).includes(secret));
  } else {
    assert.equal(dto.description, "SENSITIVE_DESCRIPTION");
    assert.equal(dto.locationNote, "SENSITIVE_LOCATION_NOTE");
    if (user.role === "STUDENT") {
      assert.equal("reporter" in dto, false);
      assert.equal("assignee" in dto, false);
      assert.ok(!JSON.stringify(dto).includes("PRIVATE_NOTE"));
      assert.ok(
        dto.events.every((e) => !("actorId" in e) && !("internalNote" in e)),
      );
    } else {
      assert.equal(dto.reporter.name, "SENSITIVE_REPORTER_NAME");
      const json = JSON.stringify(dto);
      assert.equal(
        json.includes("COMMITTEE_PRIVATE_NOTE"),
        user.role === "COMMITTEE",
      );
      assert.equal(
        json.includes("SECURITY_PRIVATE_NOTE"),
        user.role !== "COMMITTEE",
      );
    }
  }
}
assert.deepEqual(scopeFor(actors.owner), { reporterId: "owner" });
assert.deepEqual(scopeFor(actors.committee), { channel: "COMMITTEE" });
assert.deepEqual(scopeFor(actors.supervisor), { channel: "SECURITY" });
assert.deepEqual(transitions, {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "UNDER_REVIEW"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  REJECTED: [],
});
console.log(
  `ACCESS_POLICY_PASSED: ${cases.length} explicit permission cases, exact metadata allowlist, secret-positive controls, channel-isolated history, and status table. Database, authentication, and HTTP integration are not verified by this check.`,
);
