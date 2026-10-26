import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/page-auth";
import { listReports } from "@/lib/reports";
import { PageHeading } from "@/components/ui/page-heading";
import { ReportsList } from "@/components/reports/reports-list";
export default async function Reports() {
  const user = await requireUser("student");
  const reports = await listReports(user);
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow="Student portal"
        title="My reports"
        description="Keep track of what you’ve reported and see what happens next."
        action={
          <Link className="button button-primary" href="/report/new">
            <Plus aria-hidden="true" size={18} />
            New report
          </Link>
        }
      />
      <ReportsList reports={reports} />
    </div>
  );
}
