"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  FilePlus2,
  LifeBuoy,
  LockKeyhole,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { SignOutButton } from "./sign-out";
import { ProfileMenu } from "./profile-menu";
export type Account = { name?: string | null; role: string; email?: string | null } | null;
// Signed-in portal pages use the sidebar for navigation instead of the public header.
export function inPortal(path: string, account: Account): boolean {
  return (
    !!account &&
    (path.startsWith("/reports") ||
      path.startsWith("/report/") ||
      path.startsWith("/staff") ||
      path.startsWith("/profile") ||
      path === "/contacts" ||
      path.startsWith("/contacts/"))
  );
}
function useMenu() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    // Prevent background scrolling while the mobile drawer is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);
  return { path, open, setOpen, toggle };
}
function MenuButton({
  menu,
  controls,
  className,
}: {
  menu: ReturnType<typeof useMenu>;
  controls: string;
  className: string;
}) {
  return (
    <button
      ref={menu.toggle}
      type="button"
      className={`icon-button ${className}`}
      aria-label={menu.open ? "Close navigation" : "Open navigation"}
      aria-expanded={menu.open}
      aria-controls={controls}
      onClick={() => menu.setOpen(!menu.open)}
    >
      {menu.open ? (
        <X aria-hidden="true" size={22} />
      ) : (
        <Menu aria-hidden="true" size={22} />
      )}
    </button>
  );
}
function selected(path: string, href: string) {
  return href === "/"
    ? path === "/"
    : path === href || path.startsWith(`${href}/`);
}
export function SiteHeader({ account }: { account: Account }) {
  const menu = useMenu();
  const { path, open, setOpen } = menu;
  const staff = !!account && account.role !== "STUDENT";
  const items = [
    { href: "/", label: "Overview" },
    {
      href: staff ? "/staff" : "/reports",
      label: staff ? "Staff queue" : "My reports",
    },
    { href: "/contacts", label: "Get help" },
  ];
  if (inPortal(path, account)) return null;
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
          <MenuButton
            menu={menu}
            controls="mobile-navigation"
            className="menu-toggle"
          />
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

function getPortalBreadcrumb(path: string, staff: boolean, role?: string) {
  const portalName = staff
    ? role === "COMMITTEE"
      ? "Committee Portal"
      : "Security Portal"
    : "Student Portal";
  const portalRoot = staff ? "/staff" : "/reports";

  let pageLabel = "Dashboard";
  if (path === "/reports") pageLabel = "My reports";
  else if (path === "/contacts" || path.startsWith("/contacts/"))
    pageLabel = "Emergency contacts";
  else if (path === "/report/new") pageLabel = "New report";
  else if (path === "/profile") pageLabel = "My profile";
  else if (path.includes("/edit")) pageLabel = "Edit report";
  else if (path.startsWith("/reports/")) pageLabel = "Report details";
  else if (path === "/staff") pageLabel = "Report queue";
  else if (path.startsWith("/staff/reports/")) pageLabel = "Report review";

  return { portalName, portalRoot, pageLabel };
}

function PortalHeader({
  path,
  account,
}: {
  path: string;
  account: NonNullable<Account>;
}) {
  const staff = account.role !== "STUDENT";
  const { portalName, portalRoot, pageLabel } = getPortalBreadcrumb(
    path,
    staff,
    account.role,
  );
  const displayName = account.name || (staff ? "Responder" : "Student");
  const isStudent = account.role === "STUDENT";
  const showNewReport = isStudent && path !== "/report/new";

  return (
    <header className="portal-header" aria-label="Portal top bar">
      <nav className="portal-breadcrumb" aria-label="Breadcrumb">
        <Link href={portalRoot} className="portal-crumb-root">
          <ShieldCheck aria-hidden="true" size={16} />
          <span>{portalName}</span>
        </Link>
        <span className="portal-crumb-separator" aria-hidden="true">
          /
        </span>
        <span className="portal-crumb-current" aria-current="page">
          {pageLabel}
        </span>
      </nav>
      <div className="portal-header-actions">
        {showNewReport && (
          <Link
            className="button button-primary button-header-new"
            href="/report/new"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={2.4} />
            <span>New report</span>
          </Link>
        )}
        <ProfileMenu account={account} />
      </div>
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
  const menu = useMenu();
  const { path } = menu;
  useEffect(() => {
    const top = document.querySelector(".top-bar");
    if (!top) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--top-bar-height",
        `${top.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(top);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--top-bar-height");
    };
  }, []);
  if (!account || !inPortal(path, account)) return <>{children}</>;
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
    <div className="portal-shell">
      {menu.open && (
        <div
          className="portal-backdrop"
          aria-hidden="true"
          onClick={() => menu.setOpen(false)}
        />
      )}
      <aside className="portal-sidebar" data-open={menu.open || undefined}>
        <div className="portal-bar">
          <Brand inverse />
          <MenuButton
            menu={menu}
            controls="portal-panel"
            className="portal-menu-toggle"
          />
        </div>
        <div className="portal-panel" id="portal-panel">
          <div className="portal-identity">
            <div className="portal-identity-badge">
              <span className="portal-status-dot" aria-hidden="true" />
              <span>
                {staff
                  ? account.role === "COMMITTEE"
                    ? "Committee Portal"
                    : "Security Portal"
                  : "Student Portal"}
              </span>
            </div>
            <p className="portal-identity-subtitle">
              {staff
                ? "Incident triage & response"
                : "Incident reporting & follow-up"}
            </p>
          </div>
          <div className="sidebar-section-label">Navigation</div>
          <nav aria-label="Portal navigation">
            {links.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => menu.setOpen(false)}
                aria-current={selected(path, item.href) ? "page" : undefined}
              >
                <item.icon aria-hidden="true" size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <div className="sidebar-note-header">
              <LockKeyhole aria-hidden="true" size={15} />
              <strong>Private & secure</strong>
            </div>
            <p>
              {staff
                ? "Access is strictly limited to your channel."
                : "Your reports are private and visible only to authorized responders."}
            </p>
          </div>
          <div className="portal-account">
            <Link
              href={staff ? "#" : "/profile"}
              className="portal-account-link"
              onClick={() => menu.setOpen(false)}
              aria-current={selected(path, "/profile") ? "page" : undefined}
              title={staff ? account.name ?? "Account" : "View your student profile"}
            >
              <span className="avatar" aria-hidden="true">
                {account.name?.slice(0, 1) ?? "U"}
              </span>
              <span className="account-name">
                <span className="account-display-name">{account.name}</span>
                <small className="account-role-label">
                  {staff
                    ? account.role === "SUPERVISOR"
                      ? "Supervisor"
                      : "Responder"
                    : "Student · My profile"}
                </small>
              </span>
            </Link>
            <SignOutButton />
          </div>
          <span className="prototype-label">OAU course project</span>
        </div>
      </aside>
      <div className="portal-content">
        <PortalHeader path={path} account={account} />
        <div className="portal-main">
          {children}
        </div>
      </div>
    </div>
  );
}
