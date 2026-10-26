import Link from "next/link";
import { ShieldQuestion } from "lucide-react";
export default function NotFound() {
  return (
    <div className="shell page-content empty-page">
      <ShieldQuestion size={46} strokeWidth={1.2} />
      <div className="eyebrow">404 · NOT FOUND</div>
      <h1>We couldn’t find that page.</h1>
      <p>
        The link may be incorrect, or this report may not be available to your
        account.
      </p>
      <Link className="button button-primary" href="/">
        Return to overview
      </Link>
    </div>
  );
}
