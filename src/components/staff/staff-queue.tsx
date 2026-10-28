"use client";
import { useState } from "react";
import { FileText, RefreshCw, Search } from "lucide-react";
import {
  categories,
  categoryLabels,
  statuses,
  statusLabels,
} from "@/lib/constants";
import { useStaffQueue } from "@/hooks/use-staff-queue";
import { Button } from "@/components/ui/button";
import { ReportTable } from "./report-table";
import { ReportInsights } from "./report-insights";
import type { ReportView } from "@/types/app";
export function StaffQueue({
  initialReports,
  channel,
}: {
  initialReports: ReportView[];
  channel: string;
}) {
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"queue" | "insights">("queue");
  const {
    reports,
    busy,
    error,
    newRefs,
    lastRefresh,
    now,
    refresh,
    markViewed,
  } = useStaffQueue(initialReports, mine);
  const filtered = reports.filter(
    (r) =>
      (!status || r.status === status) &&
      (!category || r.category === category) &&
      (!urgent || r.urgent) &&
      `${r.ref} ${categoryLabels[r.category]}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span>{mine ? "Assigned to you" : "Channel reports"}</span>
          <strong>{reports.length}</strong>
          <small>{channel} receiving channel</small>
        </div>
        <div className="stat-card">
          <span>Awaiting review</span>
          <strong>
            {reports.filter((r) => r.status === "SUBMITTED").length}
          </strong>
          <small>Ready for first review</small>
        </div>
        <div className="stat-card">
          <span>Urgent & active</span>
          <strong className="urgent-text">
            {
              reports.filter(
                (r) =>
                  r.urgent &&
                  !["RESOLVED", "CLOSED", "REJECTED"].includes(r.status),
              ).length
            }
          </strong>
          <small>Prioritised in this queue</small>
        </div>
      </div>
      <section className="panel reports-panel">
        <div className="panel-heading">
          <div>
            <h2>{channel} reports</h2>
            <p>
              Urgent first, then oldest first. Confidential details stay
              restricted.
            </p>
          </div>
          <Button variant="outline" loading={busy} onClick={refresh}>
            <RefreshCw aria-hidden="true" size={17} />
            Refresh
          </Button>
        </div>
        <div className="queue-view-switch" role="group" aria-label="Dashboard view">
          <Button variant={view === "queue" ? "primary" : "outline"} aria-pressed={view === "queue"} onClick={() => setView("queue")}>Report queue</Button>
          <Button variant={view === "insights" ? "primary" : "outline"} aria-pressed={view === "insights"} onClick={() => setView("insights")}>Insights & map</Button>
        </div>
        <div className="queue-filters">
          <label className="search-field">
            <Search aria-hidden="true" size={18} />
            <span className="sr-only">Search queue</span>
            <input
              name="search"
              type="search"
              autoComplete="off"
              placeholder="Search reference or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter status</span>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter category</span>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-checkbox">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            Urgent only
          </label>
          <label className="inline-checkbox">
            <input
              type="checkbox"
              checked={mine}
              onChange={(e) => setMine(e.target.checked)}
            />
            Assigned to me
          </label>
        </div>
        {error && (
          <div role="alert" className="form-error queue-error">
            {error}
          </div>
        )}
        {newRefs.length > 0 && (
          <div className="new-banner">
            <p role="status" aria-atomic="true">
              {newRefs.length} new report{newRefs.length === 1 ? "" : "s"} since
              you opened this queue.
            </p>
            <button type="button" onClick={markViewed}>
              Mark as seen
            </button>
          </div>
        )}
        <div className="queue-list">
          {view === "insights" ? <ReportInsights reports={filtered} now={now} /> : filtered.length ? (
            <ReportTable reports={filtered} newRefs={newRefs} now={now} />
          ) : (
            <div className="empty-state">
              <FileText aria-hidden="true" size={34} strokeWidth={1.5} />
              <h3>No reports in this view</h3>
              <p>
                Try changing the filters. New submissions appear automatically.
              </p>
            </div>
          )}
        </div>
        <div className="queue-footer">
          <span>
            <span className="green-dot" aria-hidden="true" />
            Refreshes every 30 seconds while this tab is visible
          </span>
          <span>
            {lastRefresh ? `Last refreshed ${lastRefresh} WAT` : "Connecting…"}
          </span>
        </div>
      </section>
    </>
  );
}
