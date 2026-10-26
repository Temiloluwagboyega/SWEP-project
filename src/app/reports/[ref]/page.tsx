import { notFound } from "next/navigation";
import { requireUser } from "@/lib/page-auth";
import { getReport } from "@/lib/reports";
import { ApiError } from "@/lib/http";
import { ReportDetail } from "@/components/report-detail";
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await requireUser("student");
  const { ref } = await params;
  const query = await searchParams;
  try {
    const report = await getReport(user, ref);
    return <ReportDetail report={report} submitted={query.submitted === "1"} />;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
