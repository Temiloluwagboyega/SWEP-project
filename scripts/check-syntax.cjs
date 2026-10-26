const fs = require("node:fs");
const path = require("node:path");
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require("/usr/local/lib/node_modules/typescript");
}
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : /\.(tsx?|mjs|cjs)$/.test(e.name) && !e.name.endsWith(".d.ts")
          ? [path.join(dir, e.name)]
          : [],
    );
}
const sources = ["src", "prisma", "tests", "scripts"]
  .flatMap(files)
  .filter((f) => /\.tsx?$/.test(f));
sources.push(
  ...fs
    .readdirSync(".")
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".d.ts")),
);
let failures = 0;
// Positive control: confirm this exact syntax checker detects malformed TSX.
const control = ts.transpileModule("const bad = <div>;", {
  fileName: "control.tsx",
  reportDiagnostics: true,
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
});
if (
  !control.diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error)
)
  throw new Error("Syntax checker negative control failed");
for (const source of sources) {
  const result = ts.transpileModule(fs.readFileSync(source, "utf8"), {
    fileName: source,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      isolatedModules: true,
    },
  });
  for (const diagnostic of result.diagnostics ?? [])
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      failures++;
      console.error(
        source,
        ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
      );
    }
}
if (failures) process.exitCode = 1;
else
  console.log(
    `SYNTAX_PASSED: ${sources.length} TypeScript files; malformed TSX control rejected. This is not type or runtime verification.`,
  );
