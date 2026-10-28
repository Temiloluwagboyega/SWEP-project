import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/page-auth";
import { listReports } from "@/lib/reports";
import { PageHeading } from "@/components/ui/page-heading";
import { ReportsList } from "@/components/reports/reports-list";
export default async function Reports() {
  const user = await requireUser("student");
  const reports = await listReports(user);
  const displayName = user.name || "Student";
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow="Student portal"
        title="My reports"
        description="Track your submitted campus concerns, review receiving channels, and follow status updates."
        action={
          <div className="page-heading-actions">
            <Link
              href="/profile"
              className="header-profile-link"
              title={`Signed in as ${displayName} · View profile`}
            >
              <span className="avatar header-avatar" aria-hidden="true">
                {displayName.slice(0, 1)}
              </span>
              <span className="header-profile-text">
                <span className="header-profile-name">{displayName}</span>
                <span className="header-profile-badge">Student</span>
              </span>
            </Link>
            <Link className="button button-primary button-new-report" href="/report/new">
              <Plus aria-hidden="true" size={18} strokeWidth={2.2} />
              New report
            </Link>
          </div>
        }
      />
      <ReportsList reports={reports} />
    </div>
  );
}
