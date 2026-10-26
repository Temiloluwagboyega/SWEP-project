import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/page-auth";
import { listReports } from "@/lib/reports";
import { PageHeading } from "@/components/ui";
import { ReportsList } from "@/components/reports-list";
export default async function Reports() {
  const user = await requireUser("student");
  const reports = await listReports(user);
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Your concerns. Your updates."
        description="Keep track of what you’ve reported and see what happens next."
        action={
          <Link className="button button-primary" href="/report/new">
            <Plus size={18} />
            New report
          </Link>
        }
      />
      <ReportsList reports={reports} />
    </div>
  );
}
