"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, UserRoundCheck } from "lucide-react";
import { transitions } from "@/lib/status";
import { statusLabels } from "@/lib/constants";
import type { Status } from "@prisma/client";
import type { ReportView } from "@/types/app";
export function StaffActions({
  report,
  users,
  userId,
  committee,
}: {
  report: ReportView;
  users: { id: string; name: string }[];
  userId: string;
  committee: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [next, setNext] = useState("");
  const redacted = !report.id;
  const terminal = ["CLOSED", "REJECTED"].includes(report.status);
  async function send(action: string, data: object) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/reports/${report.id ?? report.ref}/${action}`,
        {
          method: action === "status" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error);
        return;
      }
      if (action === "refer") {
        router.push("/staff");
        router.refresh();
        return;
      }
      setMessage("Report updated.");
      setNext("");
      router.refresh();
    } catch {
      setError(
        "Could not confirm the update. Refresh the report before trying again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const options = transitions[report.status as Status].filter(
    (s) =>
      s !== "ASSIGNED" &&
      (!redacted || (report.status === "SUBMITTED" && s === "UNDER_REVIEW")),
  );
  return (
    <section className="panel staff-actions">
      <div className="panel-heading">
        <div>
          <h2>Case actions</h2>
          <p>Changes are recorded in the status history.</p>
        </div>
      </div>
      <div className="action-content">
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="notice success-notice" role="status">
            {message}
          </div>
        )}
        {terminal && (
          <p className="muted">
            This report is {statusLabels[report.status].toLowerCase()}. No
            further actions are available.
          </p>
        )}
        {options.length > 0 && (
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              send("status", {
                toStatus: next,
                ...(!redacted
                  ? {
                      publicNote: String(form.get("publicNote") ?? ""),
                      internalNote: String(form.get("internalNote") ?? ""),
                    }
                  : {}),
              });
            }}
          >
            <h3>Update status</h3>
            <label>
              Next status
              <select
                required
                value={next}
                onChange={(e) => setNext(e.target.value)}
              >
                <option value="">Choose next status</option>
                {options.map((s) => (
                  <option value={s} key={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            {!redacted && (
              <>
                <label>
                  Public update{" "}
                  <span className="optional">(student can see this)</span>
                  <textarea
                    name="publicNote"
                    rows={2}
                    maxLength={500}
                    placeholder="A short, appropriate update for the reporter"
                  />
                </label>
                <label>
                  Internal note{" "}
                  <span className="optional">(permitted staff only)</span>
                  <textarea
                    name="internalNote"
                    rows={2}
                    maxLength={1000}
                    placeholder="Do not add unnecessary personal information"
                  />
                </label>
              </>
            )}
            <button className="button button-primary" disabled={busy || !next}>
              {busy ? <Loader2 size={16} className="spin" /> : null}Update
              status
              <ArrowRight size={16} />
            </button>
          </form>
        )}
        {report.status === "UNDER_REVIEW" && (
          <form
            className="form-stack action-separated"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              send("assign", {
                assigneeId: redacted ? userId : String(form.get("assigneeId")),
              });
            }}
          >
            <h3>
              <UserRoundCheck size={17} />
              Assign a handler
            </h3>
            {redacted ? (
              <p className="muted">
                Claim this confidential case to view its details. Only you can
                claim it from this restricted view.
              </p>
            ) : (
              <label>
                Handler
                <select name="assigneeId" defaultValue={userId} required>
                  {users.map((u) => (
                    <option value={u.id} key={u.id}>
                      {u.name}
                      {u.id === userId ? " (you)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button className="button button-outline" disabled={busy}>
              {redacted ? "Assign to me" : "Assign handler"}
              <ArrowRight size={15} />
            </button>
          </form>
        )}
        {committee &&
          !redacted &&
          !["CLOSED", "REJECTED", "RESOLVED"].includes(report.status) && (
            <form
              className="form-stack action-separated"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                send("refer", { reason: String(form.get("reason") ?? "") });
              }}
            >
              <h3>Refer to Official Security</h3>
              <p className="muted">
                This transfers the report and removes Committee access. The
                referral reason is visible to the reporter.
              </p>
              <label>
                Referral reason
                <textarea
                  name="reason"
                  required
                  minLength={5}
                  maxLength={500}
                  rows={2}
                  placeholder="Explain why official follow-up is needed"
                />
              </label>
              <button className="button button-outline" disabled={busy}>
                Refer report
                <ArrowRight size={16} />
              </button>
            </form>
          )}
      </div>
    </section>
  );
}
