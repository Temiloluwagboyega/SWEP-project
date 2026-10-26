export const categories = [
  "THEFT",
  "PHONE_THEFT",
  "ACCOMMODATION_DISPUTE",
  "CIVIL_MATTER",
  "ASSAULT",
  "SEXUAL_ASSAULT",
  "SUSPICIOUS_ACTIVITY",
  "SAFETY_HAZARD",
  "OTHER",
] as const;
export const statuses = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
] as const;
export const channels = ["COMMITTEE", "SECURITY"] as const;
export const categoryLabels: Record<string, string> = {
  THEFT: "Theft",
  PHONE_THEFT: "Phone or device theft",
  ACCOMMODATION_DISPUTE: "Accommodation dispute",
  CIVIL_MATTER: "Civil matter",
  ASSAULT: "Assault",
  SEXUAL_ASSAULT: "Sexual assault",
  SUSPICIOUS_ACTIVITY: "Suspicious activity",
  SAFETY_HAZARD: "Safety hazard",
  OTHER: "Other",
};
export const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};
export const channelLabels: Record<string, string> = {
  COMMITTEE: "Student Union Security Committee",
  SECURITY: "Official University Security",
};
export function shortChannel(channel: string) {
  return channel === "COMMITTEE" ? "Committee" : "Security";
}
export function dateLabel(value: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}
