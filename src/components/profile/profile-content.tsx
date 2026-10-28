import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  Mail,
  User as UserIcon,
  Fingerprint,
} from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";

export type ProfileUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role: string;
};

export function ProfileContent({ user }: { user: ProfileUser }) {
  const displayName = user.name?.trim() || "Student User";
  const displayEmail = user.email?.trim() || "No email provided";
  const displayId = user.id ? `${user.id.slice(0, 14)}...` : "Active session";

  return (
    <div className="profile-container">
      <Link href="/reports" className="back-link profile-back-link">
        <ArrowLeft aria-hidden="true" size={16} />
        Back to My reports
      </Link>

      <PageHeading
        eyebrow="Student portal"
        title="My profile"
        description="Verified university credentials, reporting role, and account safety information."
        action={
          <Link className="button button-primary" href="/report/new">
            <FileText aria-hidden="true" size={16} />
            New report
          </Link>
        }
      />

      <div className="profile-layout">
        <Panel className="profile-panel">
          <div className="profile-header">
            <div className="profile-avatar-large" aria-hidden="true">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-header-email">{displayEmail}</p>
              <div className="profile-badges">
                <span className="badge status-badge status-submitted">
                  Verified Student
                </span>
                <span className="profile-verified-tag">
                  <CheckCircle2 aria-hidden="true" size={14} />
                  Active university account
                </span>
              </div>
            </div>
          </div>

          <div className="profile-section-divider" />

          <section aria-labelledby="account-details-heading">
            <h3 id="account-details-heading" className="profile-section-title">
              Account information
            </h3>
            <div className="profile-grid">
              <div className="profile-field">
                <span className="profile-field-label">
                  <UserIcon aria-hidden="true" size={15} />
                  Full name
                </span>
                <span className="profile-field-value">{displayName}</span>
                <span className="profile-field-hint">
                  Synchronized with university registration
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">
                  <Mail aria-hidden="true" size={15} />
                  Institutional email
                </span>
                <span className="profile-field-value">{displayEmail}</span>
                <span className="profile-field-hint">
                  Official OAU communication channel
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">
                  <ShieldCheck aria-hidden="true" size={15} />
                  Portal access role
                </span>
                <span className="profile-field-value">
                  Student (Incident Reporter)
                </span>
                <span className="profile-field-hint">
                  Authorized to submit reports & track personal incidents
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">
                  <Building2 aria-hidden="true" size={15} />
                  Institution
                </span>
                <span className="profile-field-value">
                  Obafemi Awolowo University
                </span>
                <span className="profile-field-hint">
                  Division of Student Affairs & Campus Security
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">
                  <Fingerprint aria-hidden="true" size={15} />
                  Account reference
                </span>
                <span className="profile-field-value profile-field-mono">
                  {displayId}
                </span>
                <span className="profile-field-hint">
                  Unique cryptographic audit identifier
                </span>
              </div>
            </div>
          </section>

          <div className="profile-notice-box" id="edit" role="region" aria-label="Profile updates notice">
            <div className="profile-notice-header">
              <AlertCircle aria-hidden="true" size={18} />
              <h4>Account modifications & self-service updates</h4>
            </div>
            <p className="profile-notice-text">
              Direct self-service profile editing is currently disabled. Because student credentials are authenticated against institutional university records, profile modifications (such as name corrections or email updates) require backend service support (<code>PATCH /api/user/profile</code>) or coordination with the OAU ICT center.
            </p>
            <div className="profile-notice-action">
              <button
                type="button"
                className="button button-outline profile-edit-disabled"
                disabled
                title="Profile editing requires backend account update API (PATCH /api/user/profile)"
              >
                Edit profile (Requires backend API)
              </button>
            </div>
          </div>

          <div className="profile-safety-box" role="region" aria-label="Privacy guarantee">
            <div className="profile-safety-header">
              <ShieldCheck aria-hidden="true" size={18} />
              <h4>Confidentiality & reporting privacy</h4>
            </div>
            <p className="profile-safety-text">
              All incident reports submitted from your account are strictly confidential. Only authorized university responders assigned to your report channel (Campus Security or Student Affairs Committee) have access to case details. Your personal information is never disclosed publicly.
            </p>
          </div>

          <div className="profile-footer-actions">
            <Link href="/reports" className="button button-outline">
              View my submitted reports
            </Link>
            <Link href="/contacts" className="button button-ghost">
              Emergency contacts & hotlines
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
