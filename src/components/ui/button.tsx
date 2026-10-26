import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
type Variant = "primary" | "outline" | "quiet";
export function buttonClass(variant: Variant = "primary", className = "") {
  return `button button-${variant} ${className}`.trim();
}
export function Button({
  children,
  variant = "primary",
  loading = false,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <Loader2 aria-hidden="true" size={18} className="spin" />}
      {children}
    </button>
  );
}
export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}
