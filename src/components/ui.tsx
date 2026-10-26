import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { statusLabels } from "@/lib/constants";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CampusGuard home">
      <span className="brand-icon">
        <ShieldCheck size={23} strokeWidth={1.7} />
      </span>
      <span>
        Campus<span className="brand-light">Guard</span>
        <small>OBAFEMI AWOLOWO UNIVERSITY</small>
      </span>
    </Link>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <i />
      {statusLabels[status] ?? status}
    </span>
  );
}
export function ConfidentialBadge() {
  return (
    <span className="quiet-badge">
      <LockKeyhole size={12} />
      Confidential
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
