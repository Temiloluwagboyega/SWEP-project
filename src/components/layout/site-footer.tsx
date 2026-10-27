import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { brand } from "@/config/brand";
export function SiteFooter() {
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
        This app is not monitored 24/7. For emergencies, call the QRS directly
        or visit the Senate Building. Phone numbers are awaiting verification.
      </p>
    </footer>
  );
}
