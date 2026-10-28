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
        {/* Top-Left Organic Reference Wave */}
        <div className="auth-bg-wave-tl">
          <svg
            viewBox="0 0 700 450"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0 L0 260 C70 290 160 300 260 230 C360 160 460 80 580 0 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Bottom-Left OAU Campus Landmark Photo */}
        <div className="auth-bg-landmark">
          <img
            src="/images/oau-campus.jpg"
            alt=""
            aria-hidden="true"
            className="auth-bg-landmark-img"
          />
        </div>

        {/* Bottom-Right Layered Reference Waves */}
        <div className="auth-bg-wave-br">
          <svg
            viewBox="0 0 700 600"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M700 600 L700 180 C580 240 440 380 280 480 C180 540 100 580 0 600 H700 Z"
              fill="currentColor"
              className="wave-layer-back"
            />
            <path
              d="M700 600 L700 340 C600 380 480 460 380 520 C300 570 240 590 160 600 H700 Z"
              fill="currentColor"
              className="wave-layer-front"
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
    </div>
  );
}
