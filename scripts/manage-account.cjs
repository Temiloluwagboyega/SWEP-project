// Run only from an authorised operator's shell. No public administration endpoint.
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const args = process.argv.slice(2),
  index = args.indexOf("--user-id");
const id = index >= 0 ? args[index + 1] : undefined;
const actions = args.filter((a) =>
  ["--revoke", "--disable", "--enable"].includes(a),
);
async function main() {
  if (!id || id.startsWith("--") || actions.length !== 1 || args.length !== 3)
    throw new Error(
      "Usage: npm run account:manage -- --user-id ID --revoke|--disable|--enable",
    );
  const action = actions[0],
    db = new PrismaClient();
  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          sessionVersion: { increment: 1 },
          ...(action === "--disable"
            ? { isActive: false }
            : action === "--enable"
              ? { isActive: true }
              : {}),
        },
      });
      await tx.loginSession.deleteMany({ where: { userId: id } });
    });
    console.log(
      "ACCOUNT_UPDATED: sessions revoked" +
        (action === "--disable"
          ? "; account disabled"
          : action === "--enable"
            ? "; account enabled"
            : ""),
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    "Account update failed. Check the user ID, database access and command syntax.",
  );
  process.exitCode = 1;
});
