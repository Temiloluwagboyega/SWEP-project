import { getSessionUser } from "@/lib/auth";
import { HomeContent } from "@/components/home/home-content";
export default async function Home() {
  const user = await getSessionUser();
  return <HomeContent isStaff={!!user && user.role !== "STUDENT"} />;
}
