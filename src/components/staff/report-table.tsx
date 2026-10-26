import Link from "next/link";
import { Clock3 } from "lucide-react";
import { categoryLabels, dateLabel } from "@/lib/constants";
import {
  StatusBadge,
  ConfidentialBadge,
  UrgentBadge,
} from "@/components/ui/badge";
import type { ReportView } from "@/types/app";
function age(value: string, now: number | null) {
  if (now === null) return dateLabel(value);
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(value).getTime()) / 60000),
  );
  return minutes < 60
    ? `${minutes}m ago`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h ago`
      : `${Math.floor(minutes / 1440)}d ago`;
}
export function ReportTable({
  reports,
  newRefs,
  now,
}: {
  reports: ReportView[];
  newRefs: string[];
  now: number | null;
}) {
  return (
    <table className="queue-table">
      <caption className="sr-only">
        Reports in your receiving channel, sorted urgent first and then oldest
        first. Confidential details are restricted.
      </caption>
      <thead>
        <tr>
          <th scope="col">Report</th>
          <th scope="col">Location</th>
          <th scope="col">Status</th>
          <th scope="col">Handler</th>
          <th scope="col">Received</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => {
          const hours =
            now === null
              ? 0
              : (now - new Date(r.createdAt).getTime()) / 3600000;
          const ageClass =
            (r.urgent && hours >= 1) || hours >= 48
              ? "age-red"
              : hours >= 24
                ? "age-amber"
                : "";
          return (
            <tr key={r.ref}>
              <td>
                <div className="report-card-top">
                  <Link
                    className="queue-report-link"
                    href={`/staff/reports/${r.id ?? r.ref}`}
                  >
                    <span className="reference">{r.ref}</span>
                    <strong>{categoryLabels[r.category]}</strong>
                  </Link>
                  {newRefs.includes(r.ref) && (
                    <span className="new-badge">New</span>
                  )}
                </div>
                <div className="row-badges">
                  {r.urgent && <UrgentBadge />}
                  {(!r.id || r.confidential) && <ConfidentialBadge />}
                </div>
              </td>
              <td
                data-label="Location"
                className={!r.id ? "redacted-cell" : undefined}
              >
                {r.location?.name ?? "Restricted"}
              </td>
              <td data-label="Status">
                <StatusBadge status={r.status} />
              </td>
              <td data-label="Handler">
                {!r.id ? "Restricted" : (r.assignee?.name ?? "Unassigned")}
              </td>
              <td data-label="Received">
                <time
                  dateTime={r.createdAt}
                  className={`queue-age ${ageClass}`}
                >
                  <Clock3 aria-hidden="true" size={14} />
                  {age(r.createdAt, now)}
                </time>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
