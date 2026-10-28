import type { ReportView } from "../types/app";

const terminal = new Set(["RESOLVED", "CLOSED", "REJECTED"]);
export function reportInsights(reports: ReportView[], now: number) {
  const today = new Date(now + 3_600_000).toISOString().slice(0, 10);
  const midnight = Date.parse(`${today}T00:00:00Z`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(midnight - (6 - index) * 86_400_000).toISOString().slice(0, 10);
    return { date, count: 0 };
  });
  const byDay = new Map(days.map((day) => [day.date, day]));
  const locations = new Map<string, { name: string; count: number; active: number }>();
  let resolved = 0, overdue = 0, restricted = 0;
  for (const report of reports) {
    const day = byDay.get(new Date(Date.parse(report.createdAt) + 3_600_000).toISOString().slice(0, 10));
    if (day) day.count++;
    if (["RESOLVED", "CLOSED"].includes(report.status)) resolved++;
    if (!terminal.has(report.status) && now - Date.parse(report.createdAt) >= 86_400_000) overdue++;
    if (!report.id) restricted++;
    if (report.location) {
      const location = locations.get(report.location.id) ?? { name: report.location.name, count: 0, active: 0 };
      location.count++;
      if (!terminal.has(report.status)) location.active++;
      locations.set(report.location.id, location);
    }
  }
  return {
    days,
    locations: [...locations.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    resolved,
    resolutionPercent: reports.length ? Math.round(resolved / reports.length * 100) : 0,
    overdue,
    restricted,
    mapped: reports.filter((report) => report.id && report.coordinates),
  };
}
