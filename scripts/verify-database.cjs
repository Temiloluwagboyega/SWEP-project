require("dotenv/config");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
async function main() {
  assert.ok(
    process.env.APP_ENV === "local" && process.env.NODE_ENV !== "production",
    "This check is only for the local fictional demo database.",
  );
  const db = new PrismaClient();
  try {
    const counts = {
      users: await db.user.count(),
      locations: await db.location.count(),
      reports: await db.report.count(),
      events: await db.statusEvent.count(),
      references: await db.referenceSequence.count(),
    };
    assert.ok(
      counts.users >= 7 && counts.locations >= 16 && counts.reports >= 15,
      "Expected fictional demo fixtures are missing.",
    );
    assert.ok(
      counts.events >= counts.reports && counts.references >= counts.reports,
    );
    const accounts = await db.user.findMany({
      where: {
        email: {
          in: [
            "student1@demo.test",
            "student2@demo.test",
            "committee1@demo.test",
            "committee2@demo.test",
            "security1@demo.test",
            "security2@demo.test",
            "supervisor@demo.test",
          ],
        },
      },
      select: { email: true, role: true, isActive: true, sessionVersion: true },
    });
    assert.equal(accounts.length, 7);
    assert.ok(
      accounts.every(
        (u) =>
          typeof u.isActive === "boolean" && Number.isInteger(u.sessionVersion),
      ),
    );
    await db.loginSession.count();
    await db.rateLimitBucket.count();
    assert.equal(
      accounts.find((u) => u.email === "supervisor@demo.test").role,
      "SUPERVISOR",
    );
    const migrations =
      await db.$queryRaw`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 1`;
    assert.equal(migrations.length, 1);
    assert.match(migrations[0].migration_name, /_security_controls$/);
    assert.ok(migrations[0].finished_at);
    assert.equal(migrations[0].rolled_back_at, null);
    assert.ok(
      fs.existsSync(
        path.join(
          __dirname,
          "../prisma/migrations",
          migrations[0].migration_name,
          "migration.sql",
        ),
      ),
    );
    console.log(
      "DATABASE_VERIFIED: " +
        JSON.stringify(counts) +
        "; versioned local migration applied; fictional staff/student roles present.",
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : "Local database verification failed.",
  );
  process.exitCode = 1;
});
