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
    <div className="auth-wrapper">
      <div className="auth-bg" aria-hidden="true">
        {/* Subtle Architectural Security Grid */}
        <div className="auth-bg-grid" />

        {/* Ambient Soft Animated Glow Orbs */}
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />

        {/* Top-Right Abstract Flowing Wave */}
        <div className="auth-bg-shape-top">
          <svg
            viewBox="0 0 700 450"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M700 0 L700 320 C620 310 520 280 430 200 C320 100 180 60 0 0 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Bottom-Left Layered Flowing Waves */}
        <div className="auth-bg-shape-bottom">
          <svg
            viewBox="0 0 700 500"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 500 L0 180 C120 220 260 320 400 400 C500 450 600 480 700 500 Z"
              fill="currentColor"
            />
            <path
              d="M0 500 L0 300 C140 330 260 400 380 460 C480 500 580 500 700 500 Z"
              fill="currentColor"
              className="shape-layer-front"
            />
          </svg>
        </div>

        {/* Subtle Security Rings Motif Detail */}
        <div className="auth-bg-security-rings">
          <svg
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="150"
              cy="150"
              r="130"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className="security-ring-outer"
            />
            <circle
              cx="150"
              cy="150"
              r="90"
              stroke="currentColor"
              strokeWidth="1"
              className="security-ring-mid"
            />
            <circle
              cx="150"
              cy="150"
              r="50"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 4"
              className="security-ring-inner"
            />
          </svg>
        </div>
      </div>

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
              <Headphones aria-hidden="true" size={20} strokeWidth={2} />
            </span>
            <div>
              <p>Need urgent help? Contact nearby security personnel or call QRS. You can also visit the Senate Building.</p>
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
    </div>
  );
}
