"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "@/lib/http/client";
import type { ReportView } from "@/types/app";
import { brand } from "@/config/brand";
export function useStaffQueue(initialReports: ReportView[], mine: boolean) {
  const [reports, setReports] = useState(initialReports);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newRefs, setNewRefs] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const known = useRef(new Set(initialReports.map((r) => r.ref)));
  const mounted = useRef(true);
  const version = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++version.current;
    setBusy(true);
    try {
      const result = await request<ReportView[]>(
        `/api/reports${mine ? "?mine=true" : ""}`,
      );
      if (!mounted.current || current !== version.current) return;
      const added = result
        .filter((r) => !known.current.has(r.ref))
        .map((r) => r.ref);
      for (const r of result) known.current.add(r.ref);
      setNewRefs((refs) => [...new Set([...refs, ...added])]);
      setReports(result);
      setError("");
      setNow(Date.now());
      setLastRefresh(
        new Intl.DateTimeFormat("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Lagos",
        }).format(new Date()),
      );
    } catch {
      if (mounted.current && current === version.current)
        setError(
          "Could not refresh the queue. Existing results may be out of date. Please retry.",
        );
    } finally {
      if (mounted.current && current === version.current) setBusy(false);
    }
  }, [mine]);
  useEffect(() => {
    mounted.current = true;
    setNow(Date.now());
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
      version.current++;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  useEffect(() => {
    document.title = `${newRefs.length ? `(${newRefs.length}) ` : ""}Staff queue · ${brand.name}`;
    return () => {
      document.title = `${brand.name} · ${brand.tagline}`;
    };
  }, [newRefs]);
  return {
    reports,
    busy,
    error,
    newRefs,
    lastRefresh,
    now,
    refresh,
    markViewed: () => setNewRefs([]),
  };
}
