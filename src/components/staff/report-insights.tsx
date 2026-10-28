"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { reportInsights } from "@/lib/analytics";
import { categoryLabels, statusLabels } from "@/lib/constants";
import { IncidentMap } from "@/components/reports/incident-map";
import type { ReportView } from "@/types/app";

export function ReportInsights({ reports, now }: { reports: ReportView[]; now: number | null }) {
  const [selectedRef, setSelectedRef] = useState("");
  // No date-dependent values are rendered until the browser clock is available.
  if (now === null) return <p role="status">Preparing report insights…</p>;
  const insights = reportInsights(reports, now);
  const selected = insights.mapped.find((report) => report.ref === selectedRef) ?? insights.mapped[0];
  const peak = Math.max(1, ...insights.days.map((day) => day.count));
  return <section className="report-insights" aria-label="Report insights">
    <div>
      <h2>Channel insights</h2>
      <p className="field-help">Based on {reports.length} loaded reports and your queue filters. The queue loads up to 200 reports, prioritising urgent and older cases. These are reported incidents, not a measure of campus risk.</p>
    </div>
    <div className="stats-grid insight-stats">
      <div className="stat-card"><span>Resolved or closed</span><strong>{insights.resolutionPercent}%</strong><small>{insights.resolved} of {reports.length} loaded reports</small></div>
      <div className="stat-card"><span>Active over 24 hours</span><strong>{insights.overdue}</strong><small>Time since submission; consider follow-up</small></div>
      <div className="stat-card"><span>Attached coordinates</span><strong>{insights.mapped.length}</strong><small>Only points you are permitted to view</small></div>
    </div>
    <div className="insight-grid">
      <section className="insight-card" aria-labelledby="trend-heading">
        <h3 id="trend-heading">Reports submitted · past 7 days</h3>
        <p className="field-help">Calendar days in West Africa Time</p>
        <ol className="trend-chart">
          {insights.days.map((day) => <li key={day.date}>
            <span className="trend-value">{day.count}</span>
            <span className="trend-track" aria-hidden="true"><span style={{ height: `${day.count / peak * 100}%` }} /></span>
            <time dateTime={day.date}>{new Intl.DateTimeFormat("en-NG", { weekday: "short", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`))}</time>
            <span className="sr-only">{day.date}: {day.count} reports</span>
          </li>)}
        </ol>
      </section>
      <section className="insight-card" aria-labelledby="locations-heading">
        <h3 id="locations-heading">Locations with most reports</h3>
        {insights.locations.length ? <ul className="location-ranking">{insights.locations.slice(0, 5).map((location) => <li key={location.name}>
          <span>{location.name}<small>{location.active} active</small></span><strong>{location.count}</strong>
        </li>)}</ul> : <p className="field-help">No permitted location details in this view.</p>}
        <p className="field-help">Restricted report locations are excluded. {insights.restricted} report{insights.restricted === 1 ? " has" : "s have"} metadata-only access in this view.</p>
      </section>
    </div>
    <section className="insight-card" aria-labelledby="map-heading">
      <h3 id="map-heading">Incident map</h3>
      <p className="field-help">Select a report to view its attached point. Reports without coordinates and restricted points are excluded.</p>
      {selected?.coordinates ? <div className="incident-map-layout">
        <div className="form-stack">
          <label htmlFor="mapped-report">Report to locate</label>
          <select id="mapped-report" value={selected.ref} onChange={(event) => setSelectedRef(event.target.value)}>
            {insights.mapped.map((report) => <option key={report.ref} value={report.ref}>{report.ref} · {report.location?.name}</option>)}
          </select>
          <p><strong>{categoryLabels[selected.category]}</strong><br />{selected.location?.name}<br />{statusLabels[selected.status]}</p>
          <Link href={`/staff/reports/${selected.id}`} className="text-link">Open selected report →</Link>
        </div>
        <IncidentMap key={selected.ref} coordinates={selected.coordinates} label={`Report ${selected.ref}`} />
      </div> : <div className="map-placeholder"><MapPin aria-hidden="true" size={28} /><p>No accessible report coordinates in this view yet.</p><p className="field-help">Students can optionally attach coordinates when reporting.</p></div>}
    </section>
  </section>;
}
