import { requireUser } from "@/lib/page-auth";
import { listReports } from "@/lib/reports";
import { staffChannel } from "@/lib/access";
import { PageHeading } from "@/components/ui/page-heading";
import { StaffQueue } from "@/components/staff/staff-queue";
export default async function Staff() {
  const user = await requireUser("staff");
  const channel = staffChannel(user) === "COMMITTEE" ? "Committee" : "Security";
  const reports = await listReports(user);
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow={`${channel} responder portal`}
        title={user.role === "SUPERVISOR" ? "Supervisor dashboard" : `${channel} dashboard`}
        description="Review and assign reports, explore location patterns, and follow up in your receiving channel."
        action={
          <div className="portal-label">
            <span className="green-dot" />
            {user.role === "SUPERVISOR"
              ? "Security supervisor"
              : `${channel} responder`}
          </div>
        }
      />
      <StaffQueue initialReports={reports} channel={channel} />
    </div>
  );
}
