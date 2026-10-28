"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Camera,
  ChevronDown,
  Edit3,
  LifeBuoy,
  LogOut,
  User,
} from "lucide-react";
import type { Account } from "./app-shell";

export function ProfileMenu({
  account,
}: {
  account: NonNullable<Account>;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const staff = account.role !== "STUDENT";
  const displayName = account.name || (staff ? "Responder" : "Student");
  const displayEmail = account.email || "No email on record";

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="portal-profile-menu-container" ref={menuRef}>
      <button
        type="button"
        className="portal-profile-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`User menu for ${displayName}`}
      >
        <span className="avatar portal-header-avatar" aria-hidden="true">
          {account.image ? (
            <img
              src={account.image}
              alt={displayName}
              className="portal-avatar-img"
            />
          ) : (
            displayName.slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="portal-header-text">
          <span className="portal-header-name">{displayName}</span>
          <span className="portal-header-badge">
            {staff
              ? account.role === "SUPERVISOR"
                ? "Supervisor"
                : account.role === "COMMITTEE"
                  ? "Committee"
                  : "Responder"
              : "Student"}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          size={14}
          className={`portal-profile-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div
          className="portal-profile-dropdown"
          role="menu"
          aria-label="Student profile menu"
        >
          <div className="portal-dropdown-identity">
            <span className="avatar portal-dropdown-avatar" aria-hidden="true">
              {account.image ? (
                <img
                  src={account.image}
                  alt={displayName}
                  className="portal-avatar-img"
                />
              ) : (
                displayName.slice(0, 1).toUpperCase()
              )}
            </span>
            <div className="portal-dropdown-user-text">
              <strong className="portal-dropdown-name">{displayName}</strong>
              <span className="portal-dropdown-email">{displayEmail}</span>
              <span className="portal-dropdown-badge">
                {staff ? "Authorized Responder" : "Verified Student"}
              </span>
            </div>
          </div>

          <div className="portal-dropdown-divider" role="separator" />

          <div className="portal-dropdown-links">
            <Link
              href="/profile"
              role="menuitem"
              className="portal-dropdown-item"
              onClick={() => setOpen(false)}
              title="View your profile"
            >
              <User aria-hidden="true" size={15} />
              <span>View your profile</span>
            </Link>

            <Link
              href="/profile#edit"
              role="menuitem"
              className="portal-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <Edit3 aria-hidden="true" size={15} />
              <span>Edit profile</span>
            </Link>

            <Link
              href="/profile#picture"
              role="menuitem"
              className="portal-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <Camera aria-hidden="true" size={15} />
              <span>Change profile picture</span>
            </Link>

            <Link
              href="/contacts"
              role="menuitem"
              className="portal-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <LifeBuoy aria-hidden="true" size={15} />
              <span>Emergency contacts</span>
            </Link>
          </div>

          <div className="portal-dropdown-divider" role="separator" />

          <div className="portal-dropdown-footer">
            <button
              type="button"
              role="menuitem"
              className="portal-dropdown-item portal-signout-item"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut aria-hidden="true" size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
