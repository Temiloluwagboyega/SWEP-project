import { requireUser } from "@/lib/page-auth";
import { listReports } from "@/lib/reports";
import { staffChannel } from "@/lib/access";
import { PageHeading } from "@/components/ui";
import { StaffQueue } from "@/components/staff-queue";
export default async function Staff() {
  const user = await requireUser("staff");
  const channel = staffChannel(user) === "COMMITTEE" ? "Committee" : "Security";
  const reports = await listReports(user);
  return (
    <div className="shell page-content">
      <PageHeading
        eyebrow={`${channel.toUpperCase()} · RESPONDER PORTAL`}
        title="A clear view of what needs you."
        description="Review, assign, and follow up on reports in your receiving channel."
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
