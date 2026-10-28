"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { brand } from "@/config/brand";
import { inPortal, type Account } from "./app-shell";

export function SiteFooter({ account = null }: { account?: Account }) {
  const pathname = usePathname();
  // Do not display the large public footer in the authenticated portal
  if (inPortal(pathname, account)) {
    return null;
  }
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="footer-brand">
            <ShieldCheck aria-hidden="true" size={20} />
            {brand.name}
          </p>
          <p>Campus incident reporting and follow-up.</p>
        </div>
        <div className="footer-links">
          <Link href="/contacts">Emergency contacts</Link>
          <span>OAU, Ile-Ife · Course project</span>
        </div>
      </div>
      <p className="shell footer-note">
        This app is not monitored 24/7. For emergencies, contact security personnel near you,
        call QRS directly, or visit the Senate Building. Published telephone numbers and sources are on the contacts page.
      </p>
    </footer>
  );
}
