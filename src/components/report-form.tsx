"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Info,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Siren,
  Users,
  Loader2,
} from "lucide-react";
import { categories, categoryLabels } from "@/lib/constants";
import { editSchema, reportSchema } from "@/lib/validation";
import type { ReportView } from "@/types/app";
type Location = { id: string; name: string; area: string };
export function ReportForm({
  locations,
  report,
}: {
  locations: Location[];
  report?: ReportView;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(report?.category ?? "");
  const [channel, setChannel] = useState(report?.channel ?? "SECURITY");
  const [urgent, setUrgent] = useState(report?.urgent ?? false);
  const [confidential, setConfidential] = useState(
    report?.confidential ?? false,
  );
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState("");
  useEffect(() => {
    const local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    setNow(local.toISOString().slice(0, 16));
  }, []);
  function changeCategory(value: string) {
    setCategory(value);
    if (["ASSAULT", "SEXUAL_ASSAULT"].includes(value)) setConfidential(true);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFields({});
    const form = new FormData(event.currentTarget);
    const editable = {
      category,
      locationId: String(form.get("locationId") ?? ""),
      locationNote: String(form.get("locationNote") ?? ""),
      description: String(form.get("description") ?? ""),
      urgent,
      confidential,
    };
    const time = String(form.get("occurredAt") ?? "");
    const date = new Date(time);
    const values = report
      ? editable
      : {
          ...editable,
          channel,
          occurredAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
        };
    const parsed = (report ? editSchema : reportSchema).safeParse(values);
    if (!parsed.success) {
      setFields(
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        report ? `/api/reports/${report.id}` : "/api/reports",
        {
          method: report ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        setError(body.error);
        setFields(body.fields ?? {});
        return;
      }
      router.push(`/reports/${body.ref}${report ? "" : "?submitted=1"}`);
      router.refresh();
    } catch {
      setError(
        "Your report could not be confirmed. Check your reports before trying again to avoid submitting twice.",
      );
    } finally {
      setBusy(false);
    }
  }
  const fieldError = (name: string) =>
    fields[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {fields[name]}
      </span>
    ) : null;
  const a11y = (name: string) => ({
    "aria-invalid": !!fields[name],
    "aria-describedby": fields[name] ? `${name}-error` : undefined,
  });
  return (
    <form className="report-form" onSubmit={submit} noValidate>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <section className="panel form-section">
        <div className="form-section-title">
          <span>01</span>
          <div>
            <h2>What happened?</h2>
            <p>
              A few details help the receiving team understand your concern.
            </p>
          </div>
        </div>
        <div className="form-stack">
          <label>
            Incident category <span className="required">*</span>
            <select
              name="category"
              value={category}
              onChange={(e) => changeCategory(e.target.value)}
              {...a11y("category")}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
            {fieldError("category")}
          </label>
          <div className="form-two-col">
            <label>
              Campus location <span className="required">*</span>
              <select
                name="locationId"
                defaultValue={report?.location?.id ?? ""}
                {...a11y("locationId")}
                required
              >
                <option value="">Choose a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {fieldError("locationId")}
            </label>
            {!report && (
              <label>
                When did it happen? <span className="required">*</span>
                <input
                  type="datetime-local"
                  name="occurredAt"
                  max={now || undefined}
                  {...a11y("occurredAt")}
                  required
                />
                {fieldError("occurredAt")}
              </label>
            )}
          </div>
          <label>
            Location details <span className="optional">(optional)</span>
            <input
              name="locationNote"
              placeholder="For example, behind the main entrance"
              maxLength={200}
              defaultValue={report?.locationNote ?? ""}
              {...a11y("locationNote")}
            />
            {fieldError("locationNote")}
          </label>
          <label>
            Describe the incident <span className="required">*</span>
            <textarea
              name="description"
              rows={5}
              minLength={20}
              maxLength={2000}
              placeholder="Tell us what happened and any details that may help. Avoid sharing unnecessary personal information about others."
              defaultValue={report?.description ?? ""}
              {...a11y("description")}
              required
            />
            <span className="field-help">
              20–2,000 characters. Please describe only what you know or
              observed.
            </span>
            {fieldError("description")}
          </label>
        </div>
      </section>
      {!report && (
        <section className="panel form-section">
          <div className="form-section-title">
            <span>02</span>
            <div>
              <h2>Who should receive it?</h2>
              <p>
                You choose the receiving channel. We’ll help you find the right
                fit.
              </p>
            </div>
          </div>
          <fieldset className="channel-options">
            <legend className="sr-only">Receiving channel</legend>
            {[
              {
                id: "COMMITTEE",
                icon: Users,
                title: "Student Union Security Committee",
                text: "Disputes between students, accommodation-agent issues, and civil matters suitable for mediation.",
              },
              {
                id: "SECURITY",
                icon: ShieldCheck,
                title: "Official University Security",
                text: "Theft, assault, threats, serious incidents, non-students, or concerns off campus.",
              },
            ].map((c) => (
              <label
                className={`channel-option ${channel === c.id ? "selected" : ""}`}
                key={c.id}
              >
                <input
                  type="radio"
                  name="channel"
                  value={c.id}
                  checked={channel === c.id}
                  onChange={() => setChannel(c.id)}
                />
                <c.icon size={24} strokeWidth={1.6} />
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.text}</small>
                </span>
                {channel === c.id && <Check size={18} />}
              </label>
            ))}
          </fieldset>
          {fieldError("channel")}
          {channel === "COMMITTEE" &&
            ["THEFT", "PHONE_THEFT", "ASSAULT", "SEXUAL_ASSAULT"].includes(
              category,
            ) && (
              <div className="notice">
                <Info size={18} />
                <p>
                  Official Security usually handles this. You can still send it
                  to the Committee, who can refer it.
                </p>
              </div>
            )}
        </section>
      )}
      <section className="panel form-section">
        <div className="form-section-title">
          <span>{report ? "02" : "03"}</span>
          <div>
            <h2>Urgency & privacy</h2>
            <p>Let the receiving team know what your report needs.</p>
          </div>
        </div>
        <label className="check-option">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            name="urgent"
          />
          <span>
            <strong>
              <Siren size={17} />
              This is happening now or someone is in danger
            </strong>
            <small>
              Urgent reports are highlighted in the staff queue. This does not
              dispatch help.
            </small>
          </span>
        </label>
        {urgent && (
          <div className="notice notice-urgent" role="alert">
            <Siren size={20} />
            <div>
              <strong>Don’t wait for the app — call/go to the QRS now.</strong>
              <p>
                <MapPin size={14} /> Quick Response Squad, Senate Building, OAU.{" "}
                <a href="/contacts">Emergency contacts →</a>
              </p>
            </div>
          </div>
        )}
        <label className="check-option">
          <input
            type="checkbox"
            checked={confidential}
            onChange={(e) => setConfidential(e.target.checked)}
            name="confidential"
          />
          <span>
            <strong>
              <LockKeyhole size={16} />
              Keep this report confidential
            </strong>
            <small>
              Full details are restricted to you, your assigned handler and, in
              the Security channel, authorised supervisors.
            </small>
          </span>
        </label>
        <div className="field-help privacy-help">
          <LockKeyhole size={13} />
          Confidential does not mean anonymous. The handler can see who you are.
        </div>
      </section>
      <div className="form-bottom">
        <p>
          <ShieldCheck size={16} />
          Your report is shared only with permitted responders.
        </p>
        <button className="button button-primary" disabled={busy}>
          {busy ? <Loader2 size={17} className="spin" /> : null}
          {busy ? "Saving report…" : report ? "Save changes" : "Submit report"}
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}
