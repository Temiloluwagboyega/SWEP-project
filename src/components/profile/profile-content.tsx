"use client";

import Link from "next/link";
import { useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  Fingerprint,
  Mail,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User as UserIcon,
  X,
} from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";

export type ProfileUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role: string;
  image?: string | null;
};

export function ProfileContent({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentImage, setCurrentImage] = useState<string | null>(
    user.image ?? null,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const displayName = user.name?.trim() || "User Account";
  const displayEmail = user.email?.trim() || "No email on record";
  const displayId = user.id ? `${user.id.slice(0, 14)}...` : "Active session";

  const staff = user.role !== "STUDENT";
  const roleLabel =
    user.role === "SUPERVISOR"
      ? "Security Operations Supervisor"
      : user.role === "COMMITTEE"
        ? "Student Affairs Committee Responder"
        : user.role === "SECURITY"
          ? "Campus Security Responder"
          : "Student (Incident Reporter)";
  const badgeLabel =
    user.role === "SUPERVISOR"
      ? "Authorized Supervisor"
      : user.role === "COMMITTEE"
        ? "Committee Responder"
        : user.role === "SECURITY"
          ? "Security Responder"
          : "Verified Student";
  const roleHint = staff
    ? "Authorized campus incident responder & follow-up"
    : "Authorized to submit reports & track personal incidents";
  const backHref = staff ? "/staff" : "/reports";
  const backText = staff ? "Back to staff queue" : "Back to My reports";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a valid JPG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        "File exceeds the 2 MB upload limit. Please select a smaller photo.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.onerror = () => {
      setError("Could not read the selected image. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleSavePicture = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Failed to save profile picture.");
      }

      setCurrentImage(preview);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Profile picture updated and saved successfully.");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save picture.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Failed to remove profile picture.");
      }

      setCurrentImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Profile picture removed. Reverted to default avatar.");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove picture.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="profile-container">
      <Link href={backHref} className="back-link profile-back-link">
        <ArrowLeft aria-hidden="true" size={16} />
        {backText}
      </Link>

      <PageHeading
        eyebrow={staff ? "Responder portal" : "Student portal"}
        title="My profile"
        description="Verified university credentials, reporting role, and account safety information."
        action={
          staff ? (
            <Link className="button button-outline" href="/staff">
              <ShieldCheck aria-hidden="true" size={16} />
              View report queue
            </Link>
          ) : (
            <Link className="button button-primary" href="/report/new">
              <FileText aria-hidden="true" size={16} />
              New report
            </Link>
          )
        }
      />

      <div className="profile-layout">
        <Panel className="profile-panel">
          <div className="profile-header">
            <div className="profile-avatar-large" aria-hidden="true">
              {preview || currentImage ? (
                <img
                  src={preview || currentImage!}
                  alt={displayName}
                  className="profile-avatar-img"
                />
              ) : (
                displayName.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="profile-header-info">
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-header-email">{displayEmail}</p>
              <div className="profile-badges">
                <span className="badge status-badge status-submitted">
                  {badgeLabel}
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
                <span className="profile-field-value">{roleLabel}</span>
                <span className="profile-field-hint">{roleHint}</span>
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

          <div
            className="profile-notice-box"
            id="picture"
            role="region"
            aria-label="Profile picture management"
          >
            <div className="profile-notice-header">
              <Camera aria-hidden="true" size={18} />
              <h4>Profile picture & avatar</h4>
            </div>
            <p className="profile-notice-text">
              Upload a personal photo to display on your header, profile dropdown, and account records.
              Supported formats: JPG, PNG, and WebP up to 2 MB.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              id="avatar-file-input"
            />

            {error && (
              <div className="profile-message-error" role="alert">
                <AlertCircle aria-hidden="true" size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="profile-message-success" role="status">
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>{success}</span>
              </div>
            )}

            {preview ? (
              <div className="profile-preview-card">
                <div className="profile-preview-thumb">
                  <img src={preview} alt="Selected preview" />
                </div>
                <div className="profile-preview-details">
                  <strong>Previewing selected picture</strong>
                  <p>Save changes to update your profile and header avatar.</p>
                  <div className="profile-action-buttons">
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={handleSavePicture}
                      disabled={loading}
                    >
                      <UploadCloud aria-hidden="true" size={15} />
                      {loading ? "Saving..." : "Save picture"}
                    </button>
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={handleCancelPreview}
                      disabled={loading}
                    >
                      <X aria-hidden="true" size={15} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-action-buttons">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Camera aria-hidden="true" size={15} />
                  {currentImage ? "Change photo" : "Upload photo"}
                </button>
                {currentImage && (
                  <button
                    type="button"
                    className="button button-outline profile-remove-btn"
                    onClick={handleRemovePicture}
                    disabled={loading}
                  >
                    <Trash2 aria-hidden="true" size={15} />
                    {loading ? "Removing..." : "Remove photo"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            className="profile-notice-box"
            id="edit"
            role="region"
            aria-label="Profile updates notice"
          >
            <div className="profile-notice-header">
              <AlertCircle aria-hidden="true" size={18} />
              <h4>Account modifications & self-service updates</h4>
            </div>
            <p className="profile-notice-text">
              Direct modification of full name and institutional email is managed via OAU Registry synchronization. Contact the Division of Student Affairs or Campus Security ICT administration for official credential corrections.
            </p>
          </div>

          <div
            className="profile-safety-box"
            role="region"
            aria-label="Privacy guarantee"
          >
            <div className="profile-safety-header">
              <ShieldCheck aria-hidden="true" size={18} />
              <h4>Confidentiality & reporting privacy</h4>
            </div>
            <p className="profile-safety-text">
              All incident reports submitted from your account are strictly confidential. Only authorized university responders assigned to your report channel (Campus Security or Student Affairs Committee) have access to case details. Your personal information is never disclosed publicly.
            </p>
          </div>

          <div className="profile-footer-actions">
            <Link href={backHref} className="button button-outline">
              {staff ? "Go to staff queue" : "View my submitted reports"}
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
