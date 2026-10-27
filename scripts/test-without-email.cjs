// Testing must never deliver messages using configured SMTP credentials.
require("dotenv/config");
const { spawnSync } = require("node:child_process");
const result = spawnSync(
  process.execPath,
  [
    "--import",
    "tsx",
    "--test",
    "tests/integration.test.ts",
    "tests/security.test.ts",
  ],
  {
    env: {
      ...process.env,
      TEST_DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        process.env.DATABASE_URL_UNPOOLED ||
        process.env.DATABASE_URL,
      SMTP_USER: "",
      SMTP_PASS: "",
      NODE_ENV: "test",
    },
    stdio: "inherit",
  },
);
if (result.error || result.status !== 0) process.exitCode = 1;
else console.log("INTEGRATION_PASSED");
