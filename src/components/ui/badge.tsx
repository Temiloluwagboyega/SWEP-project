import { LockKeyhole, TriangleAlert } from "lucide-react";
import { statusLabels } from "@/lib/constants";
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="badge-dot" aria-hidden="true" />
      {statusLabels[status] ?? status}
    </span>
  );
}
export function ConfidentialBadge() {
  return (
    <span className="quiet-badge">
      <LockKeyhole aria-hidden="true" size={14} />
      Confidential
    </span>
  );
}
export function UrgentBadge() {
  return (
    <span className="urgent-badge">
      <TriangleAlert aria-hidden="true" size={14} />
      Urgent
    </span>
  );
}
