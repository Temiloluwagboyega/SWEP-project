import { notFound } from "next/navigation";
import { requireUser } from "@/lib/page-auth";
import { getReport } from "@/lib/reports";
import { staffChannel } from "@/lib/access";
import { ApiError } from "@/lib/http";
import { db } from "@/lib/db";
import { ReportDetail } from "@/components/report-detail";
import { StaffActions } from "@/components/staff-actions";
export default async function StaffDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("staff");
  const { id } = await params;
  try {
    const report = await getReport(user, id);
    const users = await db.user.findMany({
      where: {
        role: {
          in:
            staffChannel(user) === "COMMITTEE"
              ? ["COMMITTEE"]
              : ["SECURITY", "SUPERVISOR"],
        },
      },
      select: { id: true, name: true },
    });
    return (
      <ReportDetail
        report={report}
        staff
        actions={
          <StaffActions
            key={`${report.status}-${report.id ?? report.ref}`}
            report={report}
            users={users}
            userId={user.id}
            committee={user.role === "COMMITTEE"}
          />
        }
      />
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
