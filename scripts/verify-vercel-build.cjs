// Reproduce the supplied Vercel failure without changing the private .env file.
require("dotenv/config");
const { spawnSync } = require("node:child_process");
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production", APP_ENV: "production",
    AUTH_URL: "", NEXTAUTH_URL: "",
    VERCEL: "1", VERCEL_ENV: "preview",
    VERCEL_URL: "safecampus-build-check.vercel.app",
    VERCEL_PROJECT_PRODUCTION_URL: "safecampus-production-check.vercel.app",
    SMTP_USER: "", SMTP_PASS: "",
  },
});
if (result.error || result.status !== 0) process.exitCode = 1;
else console.log("VERCEL_BUILD_PASSED");
