import Link from "next/link";
import { ShieldCheck } from "lucide-react";
export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      aria-label="CampusGuard home"
    >
      <span className="brand-icon">
        <ShieldCheck aria-hidden="true" size={27} strokeWidth={1.7} />
      </span>
      <span>
        <span className="brand-name" translate="no">
          CampusGuard
        </span>
        <small>Obafemi Awolowo University</small>
      </span>
    </Link>
  );
}
