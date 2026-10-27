import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { brand } from "@/config/brand";
export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      aria-label={`${brand.name} home`}
    >
      <span className="brand-icon">
        <ShieldCheck aria-hidden="true" size={27} strokeWidth={1.7} />
      </span>
      <span>
        <span className="brand-name" translate="no">
          {brand.name}
        </span>
        <small>{brand.tagline}</small>
      </span>
    </Link>
  );
}
