import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/page-auth";
import { getReport } from "@/lib/reports";
import { ApiError } from "@/lib/http/errors";
import { db } from "@/lib/db";
import { PageHeading } from "@/components/ui/page-heading";
import { ReportForm } from "@/components/reports/report-form";
import type { ReportView } from "@/types/app";
export default async function EditReport({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const user = await requireUser("student");
  const { ref } = await params;
  let report: ReportView;
  try {
    report = await getReport(user, ref);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!report.editable)
    return (
      <div className="shell page-content">
        <PageHeading
          title="This report is already being handled."
          description="Editing is available only before review and assignment. Check the report’s timeline for progress."
        />
        <Link href={`/reports/${ref}`} className="button button-primary">
          Back to report
        </Link>
      </div>
    );
  const locations = await db.location.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="shell page-content narrow">
      <PageHeading
        eyebrow={ref}
        title="Update your report."
        description="You can make changes while your report is submitted and unassigned."
      />
      <ReportForm report={report} locations={locations} />
    </div>
  );
}
