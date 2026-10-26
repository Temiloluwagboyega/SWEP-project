import { Prisma, type Status } from "@prisma/client";
import { db } from "./db";
import { ApiError } from "./http/errors";
import {
  canEdit,
  canHandle,
  canViewReport,
  scopeFor,
  serializeReport,
  staffChannel,
  type SessionUser,
} from "./access";
import {
  assignSchema,
  editSchema,
  referSchema,
  reportSchema,
  statusSchema,
} from "./validation";
import { transitions } from "./status";
import { categories, statuses } from "./constants";
const include = {
  location: true,
  reporter: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true } },
  events: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.ReportInclude;
function keyWhere(key: string) {
  return { OR: [{ id: key }, { ref: key }] };
}
function denied(): never {
  throw new ApiError(404, "Report not found.");
}
async function find(
  tx: Prisma.TransactionClient,
  user: SessionUser,
  key: string,
) {
  const report = await tx.report.findFirst({
    where: { ...keyWhere(key), ...scopeFor(user) },
    include,
  });
  if (!report || !canViewReport(user, report)) denied();
  return report;
}
async function locationExists(tx: Prisma.TransactionClient, id: string) {
  if (!(await tx.location.findUnique({ where: { id } })))
    throw new ApiError(400, "Choose a valid campus location.");
}
async function lockedUpdate(
  tx: Prisma.TransactionClient,
  report: Awaited<ReturnType<typeof find>>,
  data: Prisma.ReportUncheckedUpdateManyInput,
) {
  const updated = await tx.report.updateMany({
    where: {
      id: report.id,
      updatedAt: report.updatedAt,
      status: report.status,
      channel: report.channel,
      assigneeId: report.assigneeId,
    },
    data: { ...data, updatedAt: new Date() },
  });
  if (updated.count !== 1)
    throw new ApiError(409, "This report changed. Refresh and try again.");
}
export async function listReports(
  user: SessionUser,
  query = new URLSearchParams(),
) {
  const where: Prisma.ReportWhereInput = scopeFor(user);
  const status = query.get("status"),
    category = query.get("category");
  if (status) {
    if (!statuses.includes(status as Status))
      throw new ApiError(400, "Invalid status filter.");
    where.status = status as Status;
  }
  if (category) {
    if (!(categories as readonly string[]).includes(category))
      throw new ApiError(400, "Invalid category filter.");
    where.category = category as (typeof categories)[number];
  }
  if (query.get("urgent") === "true") where.urgent = true;
  if (query.get("mine") === "true" && user.role !== "STUDENT")
    where.assigneeId = user.id;
  const reports = await db.report.findMany({
    where,
    include,
    orderBy:
      user.role === "STUDENT"
        ? [{ updatedAt: "desc" }]
        : [{ urgent: "desc" }, { createdAt: "asc" }],
    take: 200,
  });
  return reports.map((report) => serializeReport(user, report));
}
export async function getReport(user: SessionUser, key: string) {
  const report = await find(db, user, key);
  return serializeReport(user, report);
}
export async function createReport(user: SessionUser, input: unknown) {
  if (user.role !== "STUDENT") denied();
  const data = reportSchema.parse(input);
  return db.$transaction(async (tx) => {
    await locationExists(tx, data.locationId);
    const sequence = await tx.referenceSequence.create({ data: {} });
    const ref = `SCS-${new Date().getUTCFullYear()}-${String(sequence.id).padStart(6, "0")}`;
    const report = await tx.report.create({
      data: {
        ...data,
        occurredAt: new Date(data.occurredAt),
        ref,
        reporterId: user.id,
        events: {
          create: {
            action: "CREATED",
            toStatus: "SUBMITTED",
            actorId: user.id,
            publicNote:
              "Your report has been submitted to the selected channel.",
          },
        },
      },
    });
    return { ref: report.ref, id: report.id, status: report.status };
  });
}
export async function editReport(
  user: SessionUser,
  key: string,
  input: unknown,
) {
  const data = editSchema.parse(input);
  return db.$transaction(async (tx) => {
    const report = await find(tx, user, key);
    if (user.role !== "STUDENT" || report.reporterId !== user.id) denied();
    if (!canEdit(user, report))
      throw new ApiError(
        409,
        "This report has been reviewed or assigned and can no longer be edited.",
      );
    await locationExists(tx, data.locationId);
    await lockedUpdate(tx, report, data);
    await tx.statusEvent.create({
      data: {
        reportId: report.id,
        action: "EDITED",
        fromStatus: report.status,
        toStatus: report.status,
        actorId: user.id,
        publicNote: "You updated the report before review.",
      },
    });
    return { ref: report.ref };
  });
}
export async function changeStatus(
  user: SessionUser,
  key: string,
  input: unknown,
) {
  const data = statusSchema.parse(input);
  return db.$transaction(async (tx) => {
    const report = await find(tx, user, key);
    if (!staffChannel(user)) denied();
    // Unassigned confidential cases may be acknowledged using metadata only.
    const acknowledge =
      report.assigneeId === null &&
      report.status === "SUBMITTED" &&
      data.toStatus === "UNDER_REVIEW" &&
      !data.publicNote &&
      !data.internalNote;
    if (!canHandle(user, report) && !acknowledge) denied();
    if (!transitions[report.status].includes(data.toStatus))
      throw new ApiError(409, "That status transition is not allowed.");
    if (data.toStatus === "ASSIGNED")
      throw new ApiError(
        409,
        "Use Assign handler to select the responsible person.",
      );
    await lockedUpdate(tx, report, {
      status: data.toStatus,
      ...(data.toStatus === "UNDER_REVIEW" ? { assigneeId: null } : {}),
    });
    await tx.statusEvent.create({
      data: {
        ...data,
        reportId: report.id,
        action: "STATUS_CHANGE",
        fromStatus: report.status,
        actorId: user.id,
        actorChannel: staffChannel(user),
      },
    });
    return { status: data.toStatus };
  });
}
export async function assignReport(
  user: SessionUser,
  key: string,
  input: unknown,
) {
  const { assigneeId } = assignSchema.parse(input);
  return db.$transaction(async (tx) => {
    const report = await find(tx, user, key);
    const channel = staffChannel(user);
    if (!channel) denied();
    // A metadata-only reader may claim an unassigned case, never assign it to somebody else.
    if (
      !canHandle(user, report) &&
      !(report.assigneeId === null && assigneeId === user.id)
    )
      denied();
    if (report.status !== "UNDER_REVIEW")
      throw new ApiError(409, "Review this report before assigning a handler.");
    const handler = await tx.user.findUnique({ where: { id: assigneeId } });
    if (!handler || staffChannel(handler) !== channel)
      throw new ApiError(400, "Choose a handler in this channel.");
    await lockedUpdate(tx, report, { assigneeId, status: "ASSIGNED" });
    await tx.statusEvent.create({
      data: {
        reportId: report.id,
        action: "ASSIGNED",
        fromStatus: report.status,
        toStatus: "ASSIGNED",
        actorId: user.id,
        actorChannel: channel,
        publicNote: "A handler in the receiving channel has been assigned.",
      },
    });
    return { status: "ASSIGNED" };
  });
}
export async function referReport(
  user: SessionUser,
  key: string,
  input: unknown,
) {
  const { reason } = referSchema.parse(input);
  return db.$transaction(async (tx) => {
    const report = await find(tx, user, key);
    if (user.role !== "COMMITTEE" || !canHandle(user, report)) denied();
    if (["CLOSED", "REJECTED", "RESOLVED"].includes(report.status))
      throw new ApiError(409, "Only an active report can be referred.");
    await lockedUpdate(tx, report, {
      channel: "SECURITY",
      assigneeId: null,
      status: "SUBMITTED",
    });
    await tx.statusEvent.create({
      data: {
        reportId: report.id,
        action: "REFERRED",
        fromStatus: report.status,
        toStatus: "SUBMITTED",
        actorId: user.id,
        actorChannel: "COMMITTEE",
        publicNote: `Referred to Official Security. ${reason}`,
      },
    });
    return { status: "SUBMITTED", channel: "SECURITY" };
  });
}
