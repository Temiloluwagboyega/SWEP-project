"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  categories,
  categoryLabels,
  dateLabel,
  shortChannel,
} from "@/lib/constants";
import { StatusBadge, ConfidentialBadge } from "@/components/ui/badge";
import type { ReportView } from "@/types/app";

export function ReportsList({ reports }: { reports: ReportView[] }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const active = reports.filter(
    (r) => !["RESOLVED", "CLOSED", "REJECTED"].includes(r.status),
  );
  const resolved = reports.filter((r) =>
    ["RESOLVED", "CLOSED"].includes(r.status),
  );

  const filtered = reports.filter((r) => {
    if (tab === "active") {
      if (!active.includes(r)) return false;
    } else if (tab === "completed") {
      if (!["RESOLVED", "CLOSED", "REJECTED"].includes(r.status)) return false;
    }

    if (category && r.category !== category) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const searchableText = `${r.ref} ${categoryLabels[r.category] ?? ""} ${r.location?.name ?? ""}`.toLowerCase();
      if (!searchableText.includes(q)) return false;
    }

    return true;
  });

  return (
    <>
      <div className="stats-grid" role="region" aria-label="Incident summary statistics">
        <div className="stat-card stat-card-total">
          <div className="stat-card-header">
            <span className="stat-card-label">Total reports</span>
            <span className="stat-card-icon" aria-hidden="true">
              <ClipboardList size={18} strokeWidth={2} />
            </span>
          </div>
          <strong className="stat-card-value">{reports.length}</strong>
          <span className="stat-card-description">All your submitted concerns</span>
        </div>

        <div className="stat-card stat-card-active">
          <div className="stat-card-header">
            <span className="stat-card-label">Being handled</span>
            <span className="stat-card-icon stat-icon-active" aria-hidden="true">
              <Clock size={18} strokeWidth={2} />
            </span>
          </div>
          <strong className="stat-card-value">
            {active.length}
            {active.length > 0 && <span className="stat-pulse-dot" aria-hidden="true" />}
          </strong>
          <span className="stat-card-description">Awaiting review or in progress</span>
        </div>

        <div className="stat-card stat-card-resolved">
          <div className="stat-card-header">
            <span className="stat-card-label">Resolved & closed</span>
            <span className="stat-card-icon stat-icon-resolved" aria-hidden="true">
              <CheckCircle2 size={18} strokeWidth={2} />
            </span>
          </div>
          <strong className="stat-card-value">{resolved.length}</strong>
          <span className="stat-card-description">With a recorded outcome</span>
        </div>
      </div>

      <section className="panel reports-panel">
        <div className="panel-heading">
          <div>
            <h2>Your reports</h2>
            <p>View references, receiving channels, and recent status updates.</p>
          </div>
          <span className="quiet-badge count-badge">
            <FileText aria-hidden="true" size={13} />
            {reports.length} {reports.length === 1 ? "report" : "reports"}
          </span>
        </div>

        <div className="list-toolbar">
          <div className="tabs" role="group" aria-label="Filter reports">
            {[
              { id: "all", text: "All reports", count: reports.length },
              { id: "active", text: "Active", count: active.length },
              {
                id: "completed",
                text: "Completed",
                count: reports.length - active.length,
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`tab-btn ${tab === t.id ? "active" : ""}`}
              >
                <span>{t.text}</span>
                <span className="tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="list-controls">
            <div className="search-field">
              <Search aria-hidden="true" size={16} />
              <label htmlFor="search-reports" className="sr-only">
                Search reports
              </label>
              <input
                id="search-reports"
                name="search"
                type="search"
                autoComplete="off"
                placeholder="Search reference, category, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
                  aria-label="Clear search text"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="category-filter-wrap">
              <label htmlFor="filter-category" className="sr-only">
                Filter by category
              </label>
              <select
                id="filter-category"
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
            </div>

            {(search || category || tab !== "all") && (
              <button
                type="button"
                className="button-reset-filters"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setTab("all");
                }}
                title="Reset filters"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {filtered.length ? (
          <div className="report-card-list">
            {filtered.map((r) => (
              <Link
                href={`/reports/${r.ref}`}
                className="report-list-card"
                key={r.ref}
              >
                <span className="report-list-icon" aria-hidden="true">
                  <FileText size={20} strokeWidth={1.75} />
                </span>
                <div className="report-list-body">
                  <div className="report-card-top">
                    <span className="reference-pill">{r.ref}</span>
                    <span className="channel-tag">
                      <ShieldCheck aria-hidden="true" size={12} />
                      {shortChannel(r.channel ?? "SECURITY")}
                    </span>
                    {r.confidential && <ConfidentialBadge />}
                    {r.urgent && <span className="urgent-badge">Urgent</span>}
                  </div>
                  <h3 className="report-card-title">{categoryLabels[r.category]}</h3>
                  <div className="report-list-meta">
                    <span className="meta-item">
                      <MapPin aria-hidden="true" size={13} />
                      {r.location?.name}
                    </span>
                    <span className="meta-dot">·</span>
                    <span className="meta-item">
                      <Clock aria-hidden="true" size={12} />
                      Updated {dateLabel(r.updatedAt ?? r.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="report-card-end">
                  <StatusBadge status={r.status} />
                  <span className="card-arrow" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {reports.length ? (
              <>
                <div className="empty-state-icon" aria-hidden="true">
                  <Search size={30} strokeWidth={1.6} />
                </div>
                <h3>No matching reports</h3>
                <p>
                  No reports matched your search or category filter. Try clearing your
                  filters to see all submitted reports.
                </p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setTab("all");
                  }}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <div className="empty-state-icon" aria-hidden="true">
                  <ClipboardList size={32} strokeWidth={1.5} />
                </div>
                <h3>Your reports will appear here</h3>
                <p>
                  When you submit a campus concern or safety incident, you can follow its
                  progress, assigned department, and status updates right here.
                </p>
                <Link className="button button-primary" href="/report/new">
                  Create your first report{" "}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </>
            )}
          </div>
        )}
      </section>

      <p className="list-footnote">
        Only you and permitted responders can access these reports. All times
        shown in West Africa Time.
      </p>
    </>
  );
}
