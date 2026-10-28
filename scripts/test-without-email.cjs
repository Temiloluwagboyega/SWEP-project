// Testing must never deliver messages using configured SMTP credentials.
require("dotenv/config");
const { spawnSync } = require("node:child_process");
const { mkdirSync } = require("node:fs");
mkdirSync("artifacts", { recursive: true });
const database = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!/^postgres(?:ql)?:\/\//.test(database ?? "")) {
  console.error("Configure an online PostgreSQL connection in TEST_DATABASE_URL or DATABASE_URL_UNPOOLED before running database tests.");
  process.exit(1);
}
const result = spawnSync(
  process.execPath,
  [
    "--import",
    "tsx",
    "--test",
    "--test-reporter=tap",
    "--test-reporter-destination=stdout",
    "--test-reporter=tap",
    "--test-reporter-destination=artifacts/student-review-tests.tap",
    "tests/integration.test.ts",
    "tests/security.test.ts",
    "tests/email.test.ts",
    "tests/insights.test.ts",
    "tests/deployment-config.test.ts",
  ],
  {
    env: {
      ...process.env,
      TEST_DATABASE_URL: database,
      SMTP_USER: "",
      SMTP_PASS: "",
      NODE_ENV: "test",
    },
    stdio: "inherit",
  },
);
if (result.error || result.status !== 0) process.exitCode = 1;
else console.log("INTEGRATION_PASSED");
