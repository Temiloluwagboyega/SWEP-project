"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  FilePlus2,
  Home,
  LifeBuoy,
  LockKeyhole,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { SignOutButton } from "./sign-out";
type Account = { name?: string | null; role: string } | null;
function selected(path: string, href: string) {
  return href === "/"
    ? path === "/"
    : path === href || path.startsWith(`${href}/`);
}
export function SiteHeader({ account }: { account: Account }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const staff = !!account && account.role !== "STUDENT";
  const items = [
    { href: "/", label: "Overview" },
    {
      href: staff ? "/staff" : "/reports",
      label: staff ? "Staff queue" : "My reports",
    },
    { href: "/contacts", label: "Get help" },
  ];
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={selected(path, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-account">
          {account ? (
            <>
              <span className="avatar" aria-hidden="true">
                {account.name?.slice(0, 1) ?? "U"}
              </span>
              <span className="account-name">
                {account.name}
                <small>{staff ? "Responder" : "Student"}</small>
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="button button-outline button-small">
              Sign in
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          )}
          <button
            ref={toggle}
            type="button"
            className="icon-button menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X aria-hidden="true" size={22} />
            ) : (
              <Menu aria-hidden="true" size={22} />
            )}
          </button>
        </div>
      </div>
      <nav
        className="mobile-nav shell"
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={selected(path, item.href) ? "page" : undefined}
          >
            {item.label}
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        ))}
      </nav>
    </header>
  );
}
export function AppShell({
  account,
  children,
}: {
  account: Account;
  children: ReactNode;
}) {
  const path = usePathname();
  const portal =
    account &&
    (path.startsWith("/reports") ||
      path.startsWith("/report/") ||
      path.startsWith("/staff"));
  if (!portal) return <>{children}</>;
  const staff = account.role !== "STUDENT";
  const links = staff
    ? [
        { href: "/staff", label: "Report queue", icon: ClipboardList },
        { href: "/contacts", label: "Emergency contacts", icon: LifeBuoy },
      ]
    : [
        { href: "/reports", label: "My reports", icon: ClipboardList },
        { href: "/report/new", label: "New report", icon: FilePlus2 },
        { href: "/contacts", label: "Emergency contacts", icon: LifeBuoy },
      ];
  return (
    <div className="shell portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-identity">
          <ShieldCheck aria-hidden="true" size={23} />
          <div>
            <strong>
              {staff
                ? account.role === "COMMITTEE"
                  ? "Committee portal"
                  : "Security portal"
                : "Student portal"}
            </strong>
            <small>
              {staff ? "Manage your channel’s reports" : "Report and follow up"}
            </small>
          </div>
        </div>
        <nav aria-label="Portal navigation">
          {links.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              aria-current={selected(path, item.href) ? "page" : undefined}
            >
              <item.icon aria-hidden="true" size={19} />
              {item.label}
            </Link>
          ))}
          <Link href="/">
            <Home aria-hidden="true" size={19} />
            Back to overview
          </Link>
        </nav>
        <div className="sidebar-note">
          <LockKeyhole aria-hidden="true" size={19} />
          <strong>Private by default</strong>
          <p>
            {staff
              ? "Access is limited to your channel and permitted case details."
              : "Other students cannot see your reports."}
          </p>
        </div>
        <span className="prototype-label">OAU course project</span>
      </aside>
      <div className="portal-content">{children}</div>
    </div>
  );
}
