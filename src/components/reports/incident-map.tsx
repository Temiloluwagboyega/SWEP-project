"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { mapLinks } from "@/lib/geo";
import type { Coordinates } from "@/types/app";
import { Button } from "@/components/ui/button";

export function IncidentMap({ coordinates, label = "Incident location" }: {
  coordinates: Coordinates;
  label?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const links = mapLinks(coordinates);
  return <div className="incident-map">
    <p className="location-line"><MapPin aria-hidden="true" size={18} />
      {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
    </p>
    <p className="field-help">{coordinates.accuracy !== null
      ? `Device-reported accuracy: approximately ${Math.round(coordinates.accuracy).toLocaleString("en-NG")} metres. The point may be imprecise.`
      : "Coordinates entered manually; accuracy is unknown."}</p>
    {loaded ? <iframe title={`${label} on OpenStreetMap`} src={links.embed}
      className="map-frame" loading="lazy" referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-popups" />
      : <div className="map-placeholder">
        <MapPin aria-hidden="true" size={28} />
        <p>View the attached incident point on a map.</p>
        <Button variant="outline" onClick={() => setLoaded(true)}>Load map</Button>
      </div>}
    <p className="field-help">Loading or opening the map shares these coordinates with OpenStreetMap.</p>
    <a href={links.external} className="text-link" target="_blank" rel="noreferrer">Open in OpenStreetMap ↗</a>
  </div>;
}
