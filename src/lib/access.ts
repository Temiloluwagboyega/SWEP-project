import type { Channel, Prisma, Report, Role } from "@prisma/client";
import type { ReportView } from "../types/app";
export type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
export type FullReport = Prisma.ReportGetPayload<{
  include: {
    location: true;
    reporter: { select: { id: true; name: true; email: true } };
    assignee: { select: { id: true; name: true } };
    events: true;
  };
}>;
export function staffChannel(user: SessionUser): Channel | null {
  return user.role === "COMMITTEE"
    ? "COMMITTEE"
    : ["SECURITY", "SUPERVISOR"].includes(user.role)
      ? "SECURITY"
      : null;
}
export function scopeFor(user: SessionUser): Prisma.ReportWhereInput {
  return user.role === "STUDENT"
    ? { reporterId: user.id }
    : { channel: staffChannel(user)! };
}
export function canViewReport(user: SessionUser, report: Report) {
  return user.role === "STUDENT"
    ? report.reporterId === user.id
    : staffChannel(user) === report.channel;
}
export function canViewConfidential(user: SessionUser, report: Report) {
  return (
    canViewReport(user, report) &&
    (!report.confidential ||
      report.reporterId === user.id ||
      report.assigneeId === user.id ||
      (user.role === "SUPERVISOR" && report.channel === "SECURITY"))
  );
}
export function canHandle(user: SessionUser, report: Report) {
  return (
    user.role !== "STUDENT" &&
    canViewReport(user, report) &&
    canViewConfidential(user, report)
  );
}
export function canEdit(user: SessionUser, report: Report) {
  return (
    user.role === "STUDENT" &&
    report.reporterId === user.id &&
    report.status === "SUBMITTED" &&
    report.assigneeId === null
  );
}
export function serializeReport(
  user: SessionUser,
  report: FullReport,
): ReportView {
  if (!canViewReport(user, report))
    throw new Error("Inaccessible report passed to serializer");
  const metadata = {
    ref: report.ref,
    category: report.category,
    status: report.status,
    urgent: report.urgent,
    createdAt: report.createdAt.toISOString(),
  };
  if (!canViewConfidential(user, report)) return metadata;
  const student = user.role === "STUDENT";
  return {
    ...metadata,
    id: report.id,
    description: report.description,
    location: {
      id: report.location.id,
      name: report.location.name,
      area: report.location.area,
    },
    locationNote: report.locationNote,
    occurredAt: report.occurredAt.toISOString(),
    channel: report.channel,
    confidential: report.confidential,
    updatedAt: report.updatedAt.toISOString(),
    editable: canEdit(user, report),
    ...(!student
      ? { reporter: report.reporter, assignee: report.assignee }
      : {}),
    events: report.events.map((e) => ({
      toStatus: e.toStatus,
      createdAt: e.createdAt.toISOString(),
      publicNote: e.publicNote,
      actorLabel:
        e.actorChannel === "COMMITTEE"
          ? "Committee"
          : e.actorChannel === "SECURITY"
            ? "Security"
            : "Reporter",
      action: e.action,
      ...(!student && e.actorChannel === staffChannel(user)
        ? { internalNote: e.internalNote }
        : {}),
    })),
  };
}
export type ReportDTO = ReturnType<typeof serializeReport>;
