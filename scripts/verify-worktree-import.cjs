const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs/worktree-import-manifest.json"),
    "utf8",
  ),
);
for (const [file, expected] of Object.entries(manifest.files)) {
  assert.ok(
    !file.startsWith("/") && !file.split("/").includes(".."),
    "Invalid snapshot path",
  );
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, file)))
      .digest("hex"),
    expected,
    "Imported file differs: " + file,
  );
}
for (const file of manifest.deleted)
  assert.ok(
    !fs.existsSync(path.join(root, file)),
    "Old source file remains: " + file,
  );
const env = require("dotenv").parse(fs.readFileSync(path.join(root, ".env")));
for (const name of ["DATABASE_URL", "DATABASE_URL_UNPOOLED"])
  assert.ok(
    ["postgresql:", "postgres:"].includes(new URL(env[name]).protocol),
    "Expected PostgreSQL " + name,
  );
console.log(
  "WORKTREE_IMPORT_VERIFIED: " +
    Object.keys(manifest.files).length +
    " imported files match the snapshot; " +
    manifest.deleted.length +
    " reviewed deletions applied; PostgreSQL environment present.",
);
