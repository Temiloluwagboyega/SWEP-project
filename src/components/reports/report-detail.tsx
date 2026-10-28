import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FilePenLine,
  FileText,
  LockKeyhole,
  MapPin,
} from "lucide-react";
import {
  categoryLabels,
  channelLabels,
  dateLabel,
  statusLabels,
} from "@/lib/constants";
import { StatusBadge, ConfidentialBadge } from "@/components/ui/badge";
import type { ReportView } from "@/types/app";
import { emergencyGuidance } from "@/config/contacts";
import { IncidentMap } from "./incident-map";
export function ReportDetail({
  report,
  staff = false,
  submitted = false,
  actions,
}: {
  report: ReportView;
  staff?: boolean;
  submitted?: boolean;
  actions?: React.ReactNode;
}) {
  const redacted = !report.id;
  return (
    <div className="shell page-content">
      <Link className="back-link" href={staff ? "/staff" : "/reports"}>
        <ArrowLeft aria-hidden="true" size={15} />
        {staff ? "Back to queue" : "My reports"}
      </Link>
      {submitted && !staff && (
        <div className="notice success-notice" role="status">
          <CheckCircle2 aria-hidden="true" size={23} />
          <div>
            <strong>Your report has been saved.</strong>
            <p>
              Reference: {report.ref}. It was sent to{" "}
              {channelLabels[report.channel ?? "SECURITY"]}. The receiving team
              will review it; this does not guarantee an immediate response.
            </p>
          </div>
        </div>
      )}
      <div className="detail-heading">
        <div>
          <div className="eyebrow">{report.ref}</div>
          <h1>{categoryLabels[report.category]}</h1>
          <div className="detail-badges">
            <StatusBadge status={report.status} />
            {(report.confidential || redacted) && <ConfidentialBadge />}
            {report.urgent && <span className="urgent-badge">Urgent</span>}
          </div>
        </div>
        {report.editable && !staff && (
          <Link
            className="button button-outline"
            href={`/reports/${report.ref}/edit`}
          >
            <FilePenLine aria-hidden="true" size={16} />
            Edit report
          </Link>
        )}
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          {redacted ? (
            <section className="panel restricted-panel">
              <span className="large-icon">
                <LockKeyhole aria-hidden="true" size={27} />
              </span>
              <h2>These details are confidential.</h2>
              <p>
                You can see this report’s reference, category, urgency, status,
                and submission time. Full details are available only to its
                assigned handler and authorised Security supervisors.
              </p>
              <p>
                <Clock3 aria-hidden="true" size={15} />
                Submitted {dateLabel(report.createdAt)}
              </p>
              <div className="notice">
                <p>
                  For an unassigned case, mark it under review, then assign it
                  to yourself to begin handling it.
                </p>
              </div>
            </section>
          ) : (
            <>
              <section className="panel">
                <div className="panel-heading">
                  <h2>
                    <FileText aria-hidden="true" size={18} />
                    Incident details
                  </h2>
                  <span className="quiet-badge">{report.ref}</span>
                </div>
                <div className="detail-body">
                  <dl className="detail-facts">
                    <div>
                      <dt>Location</dt>
                      <dd>
                        <MapPin aria-hidden="true" size={15} />
                        {report.location?.name}
                      </dd>
                      {report.locationNote && (
                        <dd className="muted">{report.locationNote}</dd>
                      )}
                    </div>
                    <div>
                      <dt>Incident occurred</dt>
                      <dd>
                        {report.occurredAt && dateLabel(report.occurredAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Receiving channel</dt>
                      <dd>{report.channel && channelLabels[report.channel]}</dd>
                    </div>
                    <div>
                      <dt>Submitted</dt>
                      <dd>{dateLabel(report.createdAt)}</dd>
                    </div>
                  </dl>
                  {report.coordinates && <section className="description-block" aria-label="Attached incident coordinates">
                    <h3>Attached incident coordinates</h3>
                    <IncidentMap coordinates={report.coordinates} />
                  </section>}
                  <div className="description-block">
                    <h3>What happened</h3>
                    <p>{report.description}</p>
                  </div>
                  {staff && report.reporter && (
                    <div className="reporter-block">
                      <h3>Reporter</h3>
                      <p>
                        {report.reporter.name}
                        <br />
                        <span className="muted">{report.reporter.email}</span>
                      </p>
                      <h3>Assigned handler</h3>
                      <p>{report.assignee?.name ?? "Unassigned"}</p>
                    </div>
                  )}
                </div>
              </section>
              <section className="panel timeline-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Status timeline</h2>
                    <p>
                      {staff
                        ? "Public updates and internal notes permitted for your channel."
                        : "Updates shared with you by the receiving team."}
                    </p>
                  </div>
                </div>
                <ol className="timeline">
                  {report.events?.map((event, index) => (
                    <li key={`${event.createdAt}-${index}`}>
                      <span
                        className={`timeline-marker ${index === (report.events?.length ?? 0) - 1 ? "latest" : ""}`}
                      >
                        <CheckCircle2 aria-hidden="true" size={14} />
                      </span>
                      <div>
                        <div className="timeline-event-heading">
                          <h3>
                            {event.action === "REFERRED"
                              ? "Referred to Official Security"
                              : event.action === "EDITED"
                                ? "Report updated"
                                : statusLabels[event.toStatus]}
                          </h3>
                          <time dateTime={event.createdAt}>
                            {dateLabel(event.createdAt)}
                          </time>
                        </div>
                        {event.publicNote && <p>{event.publicNote}</p>}
                        <small>{event.actorLabel}</small>
                        {staff && event.internalNote && (
                          <div className="internal-note">
                            <strong>
                              <LockKeyhole aria-hidden="true" size={12} />
                              Internal note
                            </strong>
                            <p>{event.internalNote}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>
        <aside>
          {actions}
          {!staff && (
            <section className="panel next-panel">
              <span className="mini-icon">
                <Clock3 aria-hidden="true" size={21} />
              </span>
              <h3>What happens next?</h3>
              <p>
                {["RESOLVED", "CLOSED", "REJECTED"].includes(report.status)
                  ? "The receiving team has recorded an outcome. Read your public timeline for details."
                  : "The receiving team reviews your report and assigns a handler. Return here to check public updates."}
              </p>
              {!report.editable && (
                <p className="field-help">
                  Editing is closed after review or assignment.
                </p>
              )}
              <hr />
              <h4>Need urgent help?</h4>
              <p>
                {emergencyGuidance} Don’t wait for an online update.
              </p>
              <Link className="text-link" href="/contacts">
                Emergency contacts →
              </Link>
            </section>
          )}
        </aside>
      </div>
      <p className="list-footnote">
        All times shown in West Africa Time. This app is not monitored 24/7.
      </p>
    </div>
  );
}
