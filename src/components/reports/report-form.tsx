"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Info,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { categories, categoryLabels, channels } from "@/lib/constants";
import { editSchema, reportSchema } from "@/lib/validation";
import { HttpError, reportUrl, request } from "@/lib/http/client";
import { Button } from "@/components/ui/button";
import { ErrorSummary } from "@/components/ui/error-summary";
import type { ReportView } from "@/types/app";
type Location = { id: string; name: string; area: string };
export function ReportForm({
  locations,
  report,
  initialChannel = "SECURITY",
}: {
  locations: Location[];
  report?: ReportView;
  initialChannel?: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(report?.category ?? "");
  const [channel, setChannel] = useState(
    report?.channel ??
      (channels.includes(initialChannel as (typeof channels)[number])
        ? initialChannel
        : "SECURITY"),
  );
  const [urgent, setUrgent] = useState(report?.urgent ?? false);
  const [confidential, setConfidential] = useState(
    report?.confidential ?? false,
  );
  const [description, setDescription] = useState(report?.description ?? "");
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
      description,
      locationId: String(form.get("locationId") ?? ""),
      locationNote: String(form.get("locationNote") ?? ""),
      urgent,
      confidential,
    };
    const date = new Date(String(form.get("occurredAt") ?? ""));
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
      const body = await request<{ ref: string }>(
        report ? reportUrl(report.id ?? report.ref) : "/api/reports",
        { method: report ? "PATCH" : "POST", body: parsed.data },
      );
      router.push(`/reports/${body.ref}${report ? "" : "?submitted=1"}`);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof HttpError
          ? e.message
          : "Your report could not be confirmed. Check My reports before retrying to avoid submitting twice.",
      );
      if (e instanceof HttpError) setFields(e.fields);
    } finally {
      setBusy(false);
    }
  }
  const a11y = (name: string, hint?: string) => ({
    id: name,
    name,
    "aria-invalid": !!fields[name],
    "aria-describedby":
      [hint, fields[name] ? `${name}-error` : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
  });
  const fieldError = (name: string) =>
    fields[name] ? (
      <p className="field-error" id={`${name}-error`}>
        {fields[name]}
      </p>
    ) : null;
  return (
    <form className="report-form" noValidate onSubmit={submit}>
      <ErrorSummary message={error} fields={fields} />
      <section
        className="panel form-section"
        aria-labelledby="incident-details-heading"
      >
        <div className="form-section-title">
          <span aria-hidden="true">1</span>
          <div>
            <h2 id="incident-details-heading">Incident details</h2>
            <p>Required fields are marked with an asterisk (*).</p>
          </div>
        </div>
        <div className="form-stack">
          <div className="form-field">
            <label htmlFor="category">
              Incident category{" "}
              <span className="required" aria-hidden="true">
                *
              </span>
            </label>
            <select
              {...a11y("category")}
              value={category}
              onChange={(e) => changeCategory(e.target.value)}
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
          </div>
          <div className="form-two-col">
            <div className="form-field">
              <label htmlFor="locationId">
                Campus location{" "}
                <span className="required" aria-hidden="true">
                  *
                </span>
              </label>
              <select
                {...a11y("locationId")}
                required
                defaultValue={report?.location?.id ?? ""}
              >
                <option value="">Choose a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {fieldError("locationId")}
            </div>
            {!report && (
              <div className="form-field">
                <label htmlFor="occurredAt">
                  When did it happen?{" "}
                  <span className="required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  {...a11y("occurredAt", "occurredAt-help")}
                  type="datetime-local"
                  max={now || undefined}
                  required
                />
                <p id="occurredAt-help" className="field-help">
                  Enter the date and time in your local timezone.
                </p>
                {fieldError("occurredAt")}
              </div>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="locationNote">
              Location details <span className="optional">(optional)</span>
            </label>
            <input
              {...a11y("locationNote")}
              autoComplete="off"
              placeholder="For example, behind the main entrance…"
              maxLength={200}
              defaultValue={report?.locationNote ?? ""}
            />
            {fieldError("locationNote")}
          </div>
          <div className="form-field">
            <label htmlFor="description">
              Describe the incident{" "}
              <span className="required" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              {...a11y("description", "description-help")}
              autoComplete="off"
              rows={6}
              minLength={20}
              maxLength={2000}
              required
              placeholder="Describe what happened and the details that may help…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="field-help-row">
              <p id="description-help" className="field-help">
                Use 20–2,000 characters. Include only what you know or observed.
              </p>
              <span className="field-help" aria-hidden="true">
                {description.length.toLocaleString("en-NG")} / 2,000
              </span>
            </div>
            {fieldError("description")}
          </div>
        </div>
      </section>
      {!report && (
        <section
          className="panel form-section"
          aria-labelledby="receiving-channel-heading"
        >
          <div className="form-section-title">
            <span aria-hidden="true">2</span>
            <div>
              <h2 id="receiving-channel-heading">Who should receive it?</h2>
              <p>Your choice determines which channel reviews the report.</p>
            </div>
          </div>
          <fieldset className="channel-options" id="channel" tabIndex={-1}>
            <legend className="sr-only">Receiving channel</legend>
            {[
              {
                id: "COMMITTEE",
                title: "Student Union Security Committee",
                text: "Student disputes, accommodation-agent issues, and civil matters suitable for mediation.",
              },
              {
                id: "SECURITY",
                title: "Official University Security",
                text: "Theft, assault, threats, serious incidents, or concerns involving non-students or off-campus locations.",
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
                  required
                />
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.text}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {fieldError("channel")}
          {channel === "COMMITTEE" &&
            ["THEFT", "PHONE_THEFT", "ASSAULT", "SEXUAL_ASSAULT"].includes(
              category,
            ) && (
              <div className="notice">
                <Info aria-hidden="true" size={20} />
                <p>
                  Official Security usually handles this. You can still send it
                  to the Committee, who can refer it.
                </p>
              </div>
            )}
        </section>
      )}
      <section className="panel form-section" aria-labelledby="privacy-heading">
        <div className="form-section-title">
          <span aria-hidden="true">{report ? "2" : "3"}</span>
          <div>
            <h2 id="privacy-heading">Urgency & privacy</h2>
            <p>Let the receiving team know what this report needs.</p>
          </div>
        </div>
        <label className="check-option">
          <input
            id="urgent"
            type="checkbox"
            name="urgent"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
          />
          <span>
            <strong>
              <Siren aria-hidden="true" size={18} />
              This is happening now or someone is in danger
            </strong>
            <small>
              Urgent reports are highlighted in the queue. This does not
              dispatch help.
            </small>
          </span>
        </label>
        {urgent && (
          <div role="alert" className="notice notice-urgent">
            <Siren aria-hidden="true" size={22} />
            <div>
              <strong>Don’t wait for the app — call/go to the QRS now.</strong>
              <p>
                <MapPin aria-hidden="true" size={16} /> Quick Response Squad,
                Senate Building, OAU.
              </p>
              <a href="/contacts">Emergency contacts</a>
            </div>
          </div>
        )}
        <label className="check-option">
          <input
            id="confidential"
            type="checkbox"
            name="confidential"
            checked={confidential}
            onChange={(e) => setConfidential(e.target.checked)}
          />
          <span>
            <strong>
              <LockKeyhole aria-hidden="true" size={18} />
              Keep this report confidential
            </strong>
            <small>
              Full details are restricted to you, your assigned handler and, in
              the Security channel, authorised supervisors.
            </small>
          </span>
        </label>
        <p className="field-help privacy-help">
          <LockKeyhole aria-hidden="true" size={16} />
          Confidential does not mean anonymous. The handler can see who you are.
        </p>
      </section>
      <div className="form-bottom">
        <p>
          <ShieldCheck aria-hidden="true" size={18} />
          Your report is shared only with permitted responders.
        </p>
        <Button type="submit" loading={busy}>
          {busy ? "Saving report…" : report ? "Save changes" : "Submit report"}
          <ArrowRight aria-hidden="true" size={18} />
        </Button>
      </div>
    </form>
  );
}
