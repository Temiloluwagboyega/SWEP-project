const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require("/usr/local/lib/node_modules/typescript");
}
const root = path.resolve(__dirname, "..");
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    );
}
function existsModule(name) {
  return [
    name,
    name + ".ts",
    name + ".tsx",
    name + ".d.ts",
    path.join(name, "index.ts"),
    path.join(name, "index.tsx"),
  ].some((p) => fs.existsSync(p) && fs.statSync(p).isFile());
}
function load(name, overrides = {}) {
  const filename = path.join(root, name);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = m.require.bind(m);
  m.require = (n) => overrides[n] ?? original(n);
  m._compile(output, filename);
  return m.exports;
}
const tokens = JSON.parse(
  fs.readFileSync(path.join(root, "docs/design-tokens.json"), "utf8"),
);
const colors = Object.fromEntries(
  Object.entries(tokens.primitive.color).map(([k, v]) => [k, v.$value]),
);
const runtimeTokens = fs.readFileSync(
  path.join(root, "src/styles/tokens.css"),
  "utf8",
);
for (const [name, color] of Object.entries(colors)) {
  const match = runtimeTokens.match(
    new RegExp("--primitive-color-" + name + ":\\s*(#[A-Fa-f0-9]+)"),
  );
  assert.equal(
    match?.[1].toUpperCase(),
    color.toUpperCase(),
    "Runtime colour must match token source: " + name,
  );
}
function luminance(hex) {
  const parts = hex
    .slice(1)
    .match(/../g)
    .map((s) => parseInt(s, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
assert.equal(contrast("#FFFFFF", "#FFFFFF"), 1, "known low-contrast control");
const pairs = [
  ["ink", "white"],
  ["slate", "white"],
  ["slate", "paper"],
  ["white", "teal"],
  ["white", "navy"],
  ["nav-muted", "navy"],
  ["teal", "soft-teal"],
  ["amber", "amber-bg"],
  ["red", "red-bg"],
  ["success", "success-bg"],
  ["assigned", "assigned-bg"],
  ["progress", "progress-bg"],
];
for (const [a, b] of pairs)
  assert.ok(
    contrast(colors[a], colors[b]) >= 4.5,
    `${a}/${b}: ${contrast(colors[a], colors[b]).toFixed(2)} contrast`,
  );
const internalFiles = files(path.join(root, "src")).filter((p) =>
  /\.tsx?$/.test(p),
);
let imports = 0;
for (const file of internalFiles) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const name = statement.moduleSpecifier.text;
    let target;
    if (name.startsWith("@/")) target = path.join(root, "src", name.slice(2));
    else if (name.startsWith("."))
      target = path.resolve(path.dirname(file), name);
    else continue;
    assert.ok(existsModule(target), `${file}: missing ${name}`);
    imports++;
  }
}
for (const folder of [
  "components/ui",
  "components/layout",
  "components/auth",
  "components/home",
  "components/reports",
  "components/staff",
  "hooks",
  "lib/http",
  "styles",
])
  assert.ok(fs.statSync(path.join(root, "src", folder)).isDirectory());
assert.ok(!fs.existsSync(path.join(root, "src/components/ui.tsx")));
assert.ok(!fs.existsSync(path.join(root, "src/lib/http.ts")));
for (const file of internalFiles.filter(
  (p) => p.includes("/components/") || p.includes("/hooks/"),
))
  assert.ok(
    !/\bfetch\s*\(/.test(fs.readFileSync(file, "utf8")),
    `${file}: requests belong in the HTTP client`,
  );
const css = files(path.join(root, "src/styles")).filter((p) =>
  p.endsWith(".css"),
);
for (const file of css.filter((p) => !p.endsWith("tokens.css")))
  assert.ok(
    !/#[a-f\d]{3,8}\b/i.test(fs.readFileSync(file, "utf8")),
    `${file}: use colour tokens`,
  );
const allCss = css.map((p) => fs.readFileSync(p, "utf8")).join("\n");
assert.ok(allCss.includes("prefers-reduced-motion"));
assert.ok(allCss.includes(":focus-visible"));
assert.ok(allCss.includes("text-wrap: balance"));
const definitions = new Set(
  [...allCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
);
for (const match of allCss.matchAll(/var\((--[\w-]+)\)/g))
  assert.ok(definitions.has(match[1]), `Undefined token ${match[1]}`);
(async () => {
  const { request, HttpError, reportUrl } = load("src/lib/http/client.ts");
  const original = global.fetch;
  let call;
  try {
    global.fetch = async (url, options) => {
      call = { url, options };
      return new Response(JSON.stringify({ ref: "SCS-2026-000001" }), {
        headers: { "content-type": "application/json" },
      });
    };
    assert.equal(
      (
        await request("/api/reports", {
          method: "POST",
          body: { description: "Fictional fixture" },
        })
      ).ref,
      "SCS-2026-000001",
    );
    assert.equal(call.options.cache, "no-store");
    assert.equal(call.options.credentials, "same-origin");
    assert.equal(call.options.headers.get("content-type"), "application/json");
    assert.deepEqual(JSON.parse(call.options.body), {
      description: "Fictional fixture",
    });
    await assert.rejects(request("https://untrusted.example/api/reports"));
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          error: "Check details",
          fields: { description: "Too short" },
        }),
        { status: 400 },
      );
    await assert.rejects(
      request("/api/reports"),
      (e) =>
        e instanceof HttpError &&
        e.status === 400 &&
        e.fields.description === "Too short",
    );
    global.fetch = async () =>
      new Response("<html>Error</html>", { status: 502 });
    await assert.rejects(
      request("/api/reports"),
      (e) => e instanceof HttpError && e.status === 502,
    );
    assert.equal(
      reportUrl("test/unsafe", "status"),
      "/api/reports/test%2Funsafe/status",
    );
  } finally {
    global.fetch = original;
  }
  const { ApiError } = load("src/lib/http/errors.ts");
  const { checkOrigin } = load("src/lib/http/origin.ts", {
    "./errors": { ApiError },
  });
  checkOrigin(
    new Request("https://campus.example/api/reports", {
      headers: { origin: "https://campus.example" },
    }),
  );
  assert.throws(
    () =>
      checkOrigin(
        new Request("https://campus.example/api/reports", {
          headers: { origin: "https://other.example" },
        }),
      ),
    (e) => e instanceof ApiError && e.status === 400,
  );
  console.log(
    `DESIGN_STRUCTURE_PASSED: ${pairs.length} colour pairs >=4.5:1; ${imports} internal imports resolve; component/HTTP folders, CSS variables, motion/focus rules, and real HTTP client/origin controls verified.`,
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
