"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
export function SignOutButton() {
  return (
    <button
      className="icon-button"
      onClick={() => signOut({ callbackUrl: "/" })}
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut aria-hidden="true" size={18} />
    </button>
  );
}
