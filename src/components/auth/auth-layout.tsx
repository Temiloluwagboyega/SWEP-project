import {
  ClipboardCheck,
  Headphones,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";

export function AuthLayout({
  register = false,
  children,
}: {
  register?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="shell auth-layout">
      <section className="auth-intro">
        <div className="auth-community-badge page-context">
          <ShieldCheck aria-hidden="true" size={17} strokeWidth={2} />
          <span>For the OAU community</span>
        </div>
        <h1>
          {register ? (
            "A place to raise your concern."
          ) : (
            <>
              Your reports.
              <br />
              Your next step.
            </>
          )}
        </h1>
        <p className="auth-lead">
          {register
            ? "Create a student account to submit concerns and follow their progress. You choose who receives your report."
            : "Sign in to report an incident or check an update. Responders use the same sign-in to access their own channel."}
        </p>
        <ul className="auth-benefits">
          <li>
            <span className="auth-benefit-icon">
              <ClipboardCheck aria-hidden="true" size={20} strokeWidth={2} />
            </span>
            <div>
              <strong>A clear record to follow</strong>
              <span>Every saved report gets a unique reference.</span>
            </div>
          </li>
          <li>
            <span className="auth-benefit-icon">
              <LockKeyhole aria-hidden="true" size={20} strokeWidth={2} />
            </span>
            <div>
              <strong>Careful access to your information</strong>
              <span>Other students cannot see your reports.</span>
            </div>
          </li>
        </ul>
        <div className="auth-emergency-note">
          <span className="auth-emergency-icon">
            <Headphones aria-hidden="true" size={18} />
          </span>
          <div>
            <p>Need urgent help? Go directly to the QRS, Senate Building.</p>
            <p>This app is not monitored 24/7.</p>
          </div>
        </div>
      </section>
      <section className="panel auth-panel">
        <div className="auth-panel-heading">
          <h2>
            {register
              ? "Create your student account"
              : `Sign in to ${brand.name}`}
          </h2>
          <p>
            {register
              ? "Use an email address you can access."
              : "Welcome back. Enter your account details."}
          </p>
        </div>
        {children}
      </section>
    </div>
  );
}
