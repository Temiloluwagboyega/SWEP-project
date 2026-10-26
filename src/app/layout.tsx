import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { Brand } from "@/components/ui";
import { SignOutButton } from "@/components/sign-out";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "CampusGuard · OAU Campus Security",
    template: "%s · CampusGuard",
  },
  description:
    "Report a campus incident, find security contacts, and follow your report at Obafemi Awolowo University.",
};
export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="emergency-strip">
          <div className="shell emergency-inner">
            <span>
              <span className="emergency-dot" />
              <strong>In danger now?</strong> Go directly to the QRS, Senate
              Building.
            </span>
            <Link href="/contacts">
              Emergency contacts <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
        <header className="site-header">
          <div className="shell nav-inner">
            <Brand />
            <nav aria-label="Main navigation">
              <Link href="/">Overview</Link>
              <Link
                href={
                  user?.role === "STUDENT"
                    ? "/reports"
                    : user
                      ? "/staff"
                      : "/login"
                }
              >
                {user && user.role !== "STUDENT" ? "Staff queue" : "My reports"}
              </Link>
              <Link href="/contacts">Get help</Link>
            </nav>
            <div className="nav-account">
              {user ? (
                <>
                  <span className="avatar">
                    {user.name?.slice(0, 1) ?? "U"}
                  </span>
                  <span className="account-name">
                    {user.name}
                    <small>
                      {user.role === "STUDENT"
                        ? "Student portal"
                        : "Responder portal"}
                    </small>
                  </span>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="button button-small button-outline"
                >
                  Sign in <ArrowUpRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <span>
              <ShieldCheck size={15} /> A safer campus starts with all of us.
            </span>
            <span>
              <MapPin size={14} /> OAU, Ile-Ife{" "}
              <span className="footer-divider">/</span> Course project · Demo
            </span>
          </div>
          <div className="shell footer-note">
            This app is not monitored 24/7. For emergencies, call the QRS
            directly or visit the Senate Building. Emergency phone numbers are
            pending verification.
          </div>
        </footer>
      </body>
    </html>
  );
}
