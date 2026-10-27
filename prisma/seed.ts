import "dotenv/config";
import { PrismaClient, type Category, type Status } from "@prisma/client";
import { hash } from "bcryptjs";
const db = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production")
    throw new Error("Demo seeding is disabled in production.");
  const passwordHash = await hash("Demo#2026", 12);
  const fixtures = [
    ["committee1@demo.test", "Demo Committee One", "COMMITTEE"],
    ["committee2@demo.test", "Demo Committee Two", "COMMITTEE"],
    ["security1@demo.test", "Demo Security One", "SECURITY"],
    ["security2@demo.test", "Demo Security Two", "SECURITY"],
    ["supervisor@demo.test", "Demo Supervisor", "SUPERVISOR"],
    ["student1@demo.test", "Demo Student One", "STUDENT"],
    ["student2@demo.test", "Demo Student Two", "STUDENT"],
  ] as const;
  const users = await Promise.all(
    fixtures.map(([email, name, role]) =>
      db.user.upsert({
        where: { email },
        create: { email, name, role, passwordHash },
        update: {},
      }),
    ),
  );
  const places = [
    "Senate Building",
    "Main Library (Hezekiah Oluwasanmi Library)",
    "Oduduwa Hall",
    "Moremi Hall",
    "Awolowo Hall",
    "Fajuyi Hall",
    "Angola Hall",
    "Mozambique Hall",
    "ETF Hall",
    "Faculty of Technology",
    "Student Union Building",
    "Sports Complex",
    "Campus main gate",
    "Staff quarters",
    "Off campus (Ile-Ife town)",
    "Other",
  ];
  const locations = await Promise.all(
    places.map((name, i) =>
      db.location.upsert({
        where: { name },
        create: {
          name,
          area:
            i >= 3 && i <= 8
              ? "Halls of residence"
              : "Campus and surrounding areas",
        },
        update: {},
      }),
    ),
  );
  if ((await db.report.count()) > 0) {
    console.log(
      "Demo accounts and locations ready; existing reports preserved.",
    );
    return;
  }
  const examples: { category: Category; description: string }[] = [
    {
      category: "PHONE_THEFT",
      description:
        "Fictional demo: A phone was left on a reading desk and could not be located when the student returned.",
    },
    {
      category: "ACCOMMODATION_DISPUTE",
      description:
        "Fictional demo: Two students need mediation over a room allocation and a refundable accommodation deposit.",
    },
    {
      category: "SAFETY_HAZARD",
      description:
        "Fictional demo: A damaged walkway light leaves a section of the path difficult to see after dark.",
    },
    {
      category: "SUSPICIOUS_ACTIVITY",
      description:
        "Fictional demo: Unfamiliar activity was noticed near a closed building. The reporter requests a review.",
    },
    {
      category: "ASSAULT",
      description:
        "Fictional demo: A student reports an altercation near a hall and requests confidential follow-up from an assigned handler.",
    },
  ];
  const chain: Status[] = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ];
  for (let i = 0; i < 15; i++) {
    const channel =
      i === 14 ? "COMMITTEE" : i % 2 === 0 ? "SECURITY" : "COMMITTEE";
    const handler = channel === "SECURITY" ? users[2] : users[0];
    const stage = i % chain.length;
    const createdAt = new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000);
    const confidential = i === 3 || i === 4 || i === 8;
    await db.$transaction(async (tx) => {
      const sequence = await tx.referenceSequence.create({ data: {} });
      const report = await tx.report.create({
        data: {
          ...examples[i % examples.length],
          ref: `SCS-${new Date().getUTCFullYear()}-${String(sequence.id).padStart(6, "0")}`,
          locationId: locations[i % locations.length].id,
          locationNote: "Fictional demonstration location note.",
          occurredAt: new Date(createdAt.getTime() - 60 * 60 * 1000),
          channel,
          reporterId: users[5 + (i % 2)].id,
          urgent: i === 1 || i === 4,
          confidential,
          status: chain[stage],
          assigneeId: stage >= 2 ? handler.id : null,
          createdAt,
        },
      });
      for (let j = 0; j <= stage; j++)
        await tx.statusEvent.create({
          data: {
            reportId: report.id,
            fromStatus: j ? chain[j - 1] : null,
            toStatus: chain[j],
            action:
              j === 0 ? "CREATED" : j === 2 ? "ASSIGNED" : "STATUS_CHANGE",
            actorId: j === 0 ? report.reporterId : handler.id,
            actorChannel: j === 0 ? null : channel,
            publicNote:
              j === 0
                ? "Your report was submitted."
                : `Report ${chain[j].toLowerCase().replaceAll("_", " ")}.`,
            internalNote: j ? "Fictional internal handling note." : null,
            createdAt: new Date(createdAt.getTime() + j * 60000),
          },
        });
      if (i === 14) {
        const committeeActor = users[0];
        await tx.statusEvent.create({
          data: {
            reportId: report.id,
            fromStatus: report.status,
            toStatus: "SUBMITTED",
            action: "REFERRED",
            actorId: committeeActor.id,
            actorChannel: "COMMITTEE",
            publicNote:
              "Referred to Official Security. Fictional case requires official follow-up.",
          },
        });
        await tx.report.update({
          where: { id: report.id },
          data: { channel: "SECURITY", status: "SUBMITTED", assigneeId: null },
        });
      }
    });
  }
  console.log(
    "Demo seed ready: 7 accounts, 16 locations, 15 fictional reports.",
  );
}
main()
  .catch(() => {
    console.error("Demo seed failed; check database configuration.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
