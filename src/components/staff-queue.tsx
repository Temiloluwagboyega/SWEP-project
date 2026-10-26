"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  LockKeyhole,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  categories,
  categoryLabels,
  statuses,
  statusLabels,
} from "@/lib/constants";
import { StatusBadge } from "./ui";
import type { ReportView } from "@/types/app";
function age(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  return minutes < 60
    ? `${minutes}m ago`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h ago`
      : `${Math.floor(minutes / 1440)}d ago`;
}
export function StaffQueue({
  initialReports,
  channel,
}: {
  initialReports: ReportView[];
  channel: string;
}) {
  const [reports, setReports] = useState(initialReports);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newRefs, setNewRefs] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const known = useRef(new Set(initialReports.map((r) => r.ref)));
  const mounted = useRef(true);
  const requestVersion = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    setBusy(true);
    try {
      const response = await fetch(`/api/reports${mine ? "?mine=true" : ""}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("refresh");
      const result: ReportView[] = await response.json();
      if (!mounted.current || version !== requestVersion.current) return;
      const added = result
        .filter((r) => !known.current.has(r.ref))
        .map((r) => r.ref);
      for (const r of result) known.current.add(r.ref);
      setNewRefs((refs) => [...new Set([...refs, ...added])]);
      setReports(result);
      setError("");
      setLastRefresh(
        new Intl.DateTimeFormat("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Lagos",
        }).format(new Date()),
      );
    } catch {
      if (mounted.current && version === requestVersion.current)
        setError(
          "Could not refresh the queue. Existing results may be out of date. Please retry.",
        );
    } finally {
      if (mounted.current && version === requestVersion.current) setBusy(false);
    }
  }, [mine]);
  useEffect(() => {
    mounted.current = true;
    if (document.visibilityState === "visible") refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 30000);
    const visible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      mounted.current = false;
      requestVersion.current++;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  useEffect(() => {
    document.title = `${newRefs.length ? `(${newRefs.length}) ` : ""}Staff queue · CampusGuard`;
    return () => {
      document.title = "CampusGuard · OAU Campus Security";
    };
  }, [newRefs]);
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
          <span>Channel reports</span>
          <strong>{reports.length}</strong>
          <small>
            {channel} queue{mine ? " · assigned to you" : ""}
          </small>
        </div>
        <div className="stat-card">
          <span>Awaiting review</span>
          <strong>
            {reports.filter((r) => r.status === "SUBMITTED").length}
          </strong>
          <small>Reports ready for first review</small>
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
          <small>Prioritise review; response is not guaranteed</small>
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
          <button
            className="button button-outline button-small"
            disabled={busy}
            onClick={refresh}
          >
            <RefreshCw size={15} className={busy ? "spin" : ""} />
            Refresh
          </button>
        </div>
        <div className="queue-filters">
          <label className="search-field">
            <Search size={15} />
            <span className="sr-only">Search queue</span>
            <input
              placeholder="Search reference or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
              onChange={(e) => {
                setMine(e.target.checked);
              }}
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
          <div className="new-banner" role="status">
            {newRefs.length} new report{newRefs.length === 1 ? "" : "s"} since
            you opened this queue.
            <button onClick={() => setNewRefs([])}>Mark as seen</button>
          </div>
        )}
        <div className="queue-list">
          <div className="queue-row queue-header">
            <span>REPORT / CATEGORY</span>
            <span>LOCATION</span>
            <span>STATUS</span>
            <span>HANDLER</span>
            <span>RECEIVED</span>
            <span />
          </div>
          {filtered.map((r) => {
            const hours =
              (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
            const ageClass =
              (r.urgent && hours >= 1) || hours >= 48
                ? "age-red"
                : hours >= 24
                  ? "age-amber"
                  : "";
            return (
              <Link
                key={r.ref}
                className="queue-row"
                href={`/staff/reports/${r.id ?? r.ref}`}
              >
                <div>
                  <div className="report-card-top">
                    <span className="reference">{r.ref}</span>
                    {newRefs.includes(r.ref) && (
                      <span className="new-badge">New</span>
                    )}
                  </div>
                  <strong>{categoryLabels[r.category]}</strong>
                  <div className="row-badges">
                    {r.urgent && <span className="urgent-badge">Urgent</span>}
                    {(!r.id || r.confidential) && (
                      <span className="quiet-badge">
                        <LockKeyhole size={11} />
                        Confidential
                      </span>
                    )}
                  </div>
                </div>
                <span className={!r.id ? "redacted-cell" : ""}>
                  {r.location?.name ?? "Restricted"}
                </span>
                <span>
                  <StatusBadge status={r.status} />
                </span>
                <span>
                  {!r.id ? "Restricted" : (r.assignee?.name ?? "Unassigned")}
                </span>
                <span className={`queue-age ${ageClass}`}>
                  <Clock3 size={13} />
                  {age(r.createdAt)}
                </span>
                <ArrowUpRight size={17} />
              </Link>
            );
          })}
          {!filtered.length && (
            <div className="empty-state">
              <FileText size={30} />
              <h3>No reports in this view</h3>
              <p>
                Try changing the filters. New submissions appear automatically.
              </p>
            </div>
          )}
        </div>
        <div className="queue-footer">
          <span>
            <span className="green-dot" />
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
