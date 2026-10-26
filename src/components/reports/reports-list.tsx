"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, Search, MapPin } from "lucide-react";
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
  const filtered = reports.filter(
    (r) =>
      (tab === "all" ||
        (tab === "active"
          ? active.includes(r)
          : ["RESOLVED", "CLOSED", "REJECTED"].includes(r.status))) &&
      (!category || r.category === category) &&
      `${r.ref} ${categoryLabels[r.category]}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total reports</span>
          <strong>{reports.length}</strong>
          <small>All your submitted concerns</small>
        </div>
        <div className="stat-card">
          <span>Being handled</span>
          <strong>
            {active.length}
            <i className="stat-dot" />
          </strong>
          <small>Awaiting review or in progress</small>
        </div>
        <div className="stat-card">
          <span>Resolved & closed</span>
          <strong>
            {
              reports.filter((r) => ["RESOLVED", "CLOSED"].includes(r.status))
                .length
            }
          </strong>
          <small>With a recorded outcome</small>
        </div>
      </div>
      <section className="panel reports-panel">
        <div className="panel-heading">
          <div>
            <h2>Your reports</h2>
            <p>Your references, receiving channels, and latest updates.</p>
          </div>
          <span className="quiet-badge">
            <FileText aria-hidden="true" size={13} />
            {reports.length} reports
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
                className={tab === t.id ? "active" : ""}
              >
                {t.text}
                <span>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="list-controls">
            <label className="search-field">
              <Search aria-hidden="true" size={16} />
              <span className="sr-only">Search reports</span>
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
              <span className="sr-only">Filter by category</span>
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
                <span className="report-list-icon">
                  <FileText aria-hidden="true" size={22} strokeWidth={1.4} />
                </span>
                <div className="report-list-body">
                  <div className="report-card-top">
                    <span className="reference">{r.ref}</span>
                    {r.confidential && <ConfidentialBadge />}
                    {r.urgent && <span className="urgent-badge">Urgent</span>}
                  </div>
                  <h3>{categoryLabels[r.category]}</h3>
                  <p>
                    <MapPin aria-hidden="true" size={13} />
                    {r.location?.name}
                    <span>·</span>
                    {shortChannel(r.channel ?? "SECURITY")}
                  </p>
                  <small>Updated {dateLabel(r.updatedAt ?? r.createdAt)}</small>
                </div>
                <div className="report-card-end">
                  <StatusBadge status={r.status} />
                  <ArrowUpRight aria-hidden="true" size={18} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText aria-hidden="true" size={34} strokeWidth={1.2} />
            <h3>
              {reports.length
                ? "No matching reports"
                : "Your reports will appear here"}
            </h3>
            <p>
              {reports.length
                ? "Try a different filter or search."
                : "When you submit a concern, you can follow its progress here."}
            </p>
            {!reports.length && (
              <Link className="button button-primary" href="/report/new">
                Create your first report{" "}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
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
