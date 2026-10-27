const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const cp = require("node:child_process");
const dotenv = require("dotenv");
const root = path.resolve(__dirname, "..");
const filename = path.join(root, ".env");
const checking = process.argv.includes("--check");
function validSecret(value = "") {
  return (
    value.length >= 32 &&
    !/^(.)\1+$/.test(value) &&
    !/replace|changeme|example|password/i.test(value)
  );
}
try {
  if (fs.existsSync(filename) && fs.lstatSync(filename).isSymbolicLink())
    throw new Error("Manage the .env symlink outside this helper.");
  let text = fs.existsSync(filename) ? fs.readFileSync(filename, "utf8") : "";
  const values = dotenv.parse(text);
  function set(key, value) {
    const line = key + "=" + JSON.stringify(value);
    const regex = new RegExp("^" + key + "=.*$", "m");
    text = regex.test(text)
      ? text.replace(regex, () => line)
      : text.trimEnd() + "\n" + line + "\n";
    values[key] = value;
  }
  if (!checking) {
    if (!validSecret(values.AUTH_SECRET)) {
      set("AUTH_SECRET", crypto.randomBytes(48).toString("base64url"));
      console.log(
        "Generated a new AUTH_SECRET; value is never printed. Existing sessions must sign in again.",
      );
    }
    if (!values.DATABASE_URL) set("DATABASE_URL", "file:./dev.db");
    if (!values.AUTH_URL) set("AUTH_URL", "http://localhost:3000");
    if (!values.APP_ENV)
      set(
        "APP_ENV",
        values.DATABASE_URL.startsWith("file:") ? "local" : "production",
      );
    fs.writeFileSync(filename, text, { mode: 0o600 });
    fs.chmodSync(filename, 0o600);
    if (values.DATABASE_URL.startsWith("file:")) {
      const database = path.resolve(
        root,
        "prisma",
        values.DATABASE_URL.slice(5).split("?")[0],
      );
      if (!path.relative(root, database).startsWith(".."))
        for (const suffix of ["", "-wal", "-shm", "-journal"])
          if (fs.existsSync(database + suffix))
            fs.chmodSync(database + suffix, 0o600);
    }
  }
  if (!validSecret(values.AUTH_SECRET))
    throw new Error(
      "AUTH_SECRET must be a non-placeholder random secret of at least 32 characters.",
    );
  if ((fs.statSync(filename).mode & 0o077) !== 0)
    throw new Error(
      ".env permissions must restrict access to its owner. Run npm run env:setup.",
    );
  const ignored = cp.spawnSync("git", ["check-ignore", "--quiet", ".env"], {
    cwd: root,
  });
  if (ignored.status !== 0) throw new Error(".env must be ignored by Git.");
  const tracked = cp.spawnSync("git", ["ls-files", "--error-unmatch", ".env"], {
    cwd: root,
    stdio: "ignore",
  });
  if (tracked.status === 0)
    throw new Error(
      ".env is tracked. Remove it from Git and rotate any exposed secret.",
    );
  console.log(
    "ENVIRONMENT_VERIFIED: private .env; strong secret present; Git ignores and does not track it.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
