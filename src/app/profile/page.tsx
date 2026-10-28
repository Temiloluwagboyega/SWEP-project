import type { Metadata } from "next";
import { requireUser } from "@/lib/page-auth";
import { ProfileContent } from "@/components/profile/profile-content";

export const metadata: Metadata = {
  title: "My profile",
  description:
    "View your verified university credentials, reporting role, and account safety information.",
};

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="shell page-content">
      <ProfileContent user={user} />
    </div>
  );
}
