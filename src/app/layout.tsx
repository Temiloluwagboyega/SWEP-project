import type { Metadata, Viewport } from "next";
import { getSessionUser } from "@/lib/auth";
import { AppShell, SiteHeader } from "@/components/layout/app-shell";
import { EmergencyBanner } from "@/components/layout/emergency-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "CampusGuard · OAU Campus Security",
    template: "%s · CampusGuard",
  },
  description:
    "Report a campus incident, find security contacts, and follow your report at Obafemi Awolowo University.",
};
export const viewport: Viewport = { themeColor: "#132D46" };
export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const account = user ? { name: user.name, role: user.role } : null;
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <EmergencyBanner />
        <SiteHeader account={account} />
        <main id="main">
          <AppShell account={account}>{children}</AppShell>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
