import { ClipboardCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
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
        <span className="auth-symbol">
          <ShieldCheck aria-hidden="true" size={40} strokeWidth={1.5} />
        </span>
        <p className="page-context">For the OAU community</p>
        <h1>
          {register
            ? "A place to raise your concern."
            : "Your reports. Your next step."}
        </h1>
        <p>
          {register
            ? "Create a student account to submit concerns and follow their progress. You choose who receives your report."
            : "Sign in to report an incident or check an update. Responders use the same sign-in to access their own channel."}
        </p>
        <ul className="auth-benefits">
          <li>
            <ClipboardCheck aria-hidden="true" size={21} />
            <div>
              <strong>A clear record to follow</strong>
              <span>Every saved report gets a unique reference.</span>
            </div>
          </li>
          <li>
            <LockKeyhole aria-hidden="true" size={21} />
            <div>
              <strong>Careful access to your information</strong>
              <span>Other students cannot see your reports.</span>
            </div>
          </li>
        </ul>
        <p className="auth-emergency-note">
          Need urgent help? Go directly to the QRS, Senate Building. This app is
          not monitored 24/7.
        </p>
      </section>
      <section className="panel auth-panel">
        <div className="auth-panel-heading">
          <h2>
            {register
              ? "Create your student account"
              : "Sign in to CampusGuard"}
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
