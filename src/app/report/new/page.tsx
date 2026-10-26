import Link from "next/link";
import { ArrowLeft, Info, LockKeyhole } from "lucide-react";
import { requireUser } from "@/lib/page-auth";
import { db } from "@/lib/db";
import { PageHeading } from "@/components/ui";
import { ReportForm } from "@/components/report-form";
export default async function NewReport() {
  await requireUser("student");
  const locations = await db.location.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="shell page-content">
      <Link className="back-link" href="/reports">
        <ArrowLeft size={15} />
        My reports
      </Link>
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Let’s get your concern heard."
        description="Tell us what happened, choose who receives it, and we’ll give you a reference to follow up."
      />
      <div className="report-layout">
        <ReportForm locations={locations} />
        <aside className="report-aside">
          <div className="panel">
            <span className="mini-icon">
              <Info size={21} />
            </span>
            <h3>Before you report</h3>
            <p>
              For immediate danger, go directly to the QRS at the Senate
              Building. This app is not monitored 24/7.
            </p>
            <hr />
            <h4>What happens next?</h4>
            <ol>
              <li>Your report is saved with a unique reference.</li>
              <li>The receiving team reviews and assigns it.</li>
              <li>You can check public status updates in My reports.</li>
            </ol>
          </div>
          <div className="aside-privacy">
            <LockKeyhole size={19} />
            <h4>Private by default</h4>
            <p>
              Other students cannot see your report. You decide whether to
              restrict details further with confidential reporting.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
