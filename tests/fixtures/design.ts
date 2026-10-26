import type { ReportView } from "@/types/app";
export const locations = [
  { id: "demo-senate", name: "Senate Building", area: "Academic area" },
  { id: "demo-moremi", name: "Moremi Hall", area: "Halls of residence" },
  { id: "demo-library", name: "Main Library", area: "Academic area" },
];
const examples: ReportView[] = [
  {
    id: "demo-1",
    ref: "SCS-2026-000021",
    category: "PHONE_THEFT",
    status: "UNDER_REVIEW",
    channel: "SECURITY",
    urgent: false,
    confidential: false,
    createdAt: "2026-10-26T07:15:00Z",
    updatedAt: "2026-10-26T09:10:00Z",
    occurredAt: "2026-10-26T06:45:00Z",
    location: locations[1],
    locationNote: "Near the main entrance",
    description:
      "Fictional demonstration: A phone was left on a reading desk and could not be located when the student returned.",
    editable: false,
    assignee: null,
    events: [
      {
        toStatus: "SUBMITTED",
        createdAt: "2026-10-26T07:15:00Z",
        publicNote:
          "Your report was submitted to Official University Security.",
        actorLabel: "Reporter",
        action: "CREATED",
      },
      {
        toStatus: "UNDER_REVIEW",
        createdAt: "2026-10-26T09:10:00Z",
        publicNote: "The receiving team is reviewing the information provided.",
        actorLabel: "Security",
        action: "STATUS_CHANGE",
      },
    ],
  },
  {
    id: "demo-2",
    ref: "SCS-2026-000020",
    category: "ACCOMMODATION_DISPUTE",
    status: "IN_PROGRESS",
    channel: "COMMITTEE",
    urgent: false,
    confidential: false,
    createdAt: "2026-10-25T12:00:00Z",
    updatedAt: "2026-10-26T08:20:00Z",
    location: locations[1],
    assignee: { id: "demo-handler", name: "Demo Committee One" },
  },
  {
    id: "demo-3",
    ref: "SCS-2026-000018",
    category: "SAFETY_HAZARD",
    status: "RESOLVED",
    channel: "SECURITY",
    urgent: false,
    confidential: false,
    createdAt: "2026-10-24T09:00:00Z",
    updatedAt: "2026-10-26T07:30:00Z",
    location: locations[0],
    assignee: { id: "demo-security", name: "Demo Security One" },
  },
  {
    id: "demo-4",
    ref: "SCS-2026-000016",
    category: "CIVIL_MATTER",
    status: "SUBMITTED",
    channel: "COMMITTEE",
    urgent: false,
    confidential: true,
    createdAt: "2026-10-24T07:00:00Z",
    updatedAt: "2026-10-24T07:00:00Z",
    location: locations[2],
  },
];
const progression = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];
export const reports: ReportView[] = examples.map((report) => ({
  ...report,
  occurredAt: report.occurredAt ?? report.createdAt,
  description:
    report.description ??
    `Fictional demonstration: A student reports a ${report.category.toLowerCase().replaceAll("_", " ")} and asks the receiving team to review the details.`,
  locationNote:
    report.locationNote ?? "Fictional demonstration location details.",
  editable: report.status === "SUBMITTED",
  events:
    report.events ??
    progression
      .slice(0, progression.indexOf(report.status) + 1)
      .map((status, index) => ({
        toStatus: status,
        createdAt: new Date(
          new Date(report.createdAt).getTime() + index * 1200000,
        ).toISOString(),
        publicNote:
          index === 0
            ? "Your report has been submitted."
            : "The receiving team recorded a status update for this fictional case.",
        actorLabel:
          index === 0
            ? "Reporter"
            : report.channel === "COMMITTEE"
              ? "Committee"
              : "Security",
        action:
          index === 0
            ? "CREATED"
            : status === "ASSIGNED"
              ? "ASSIGNED"
              : "STATUS_CHANGE",
      })),
}));
export const redacted: ReportView = {
  ref: "SCS-2026-000022",
  category: "ASSAULT",
  status: "SUBMITTED",
  urgent: true,
  createdAt: "2026-10-26T10:00:00Z",
};
export const staffReports: ReportView[] = [
  redacted,
  ...reports.filter((r) => r.channel === "SECURITY"),
];
