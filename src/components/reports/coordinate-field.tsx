"use client";
import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Coordinates } from "@/types/app";

export function CoordinateField({ initial, fields }: {
  initial?: Coordinates | null;
  fields: Record<string, string>;
}) {
  const [latitude, setLatitude] = useState(initial ? String(initial.latitude) : "");
  const [longitude, setLongitude] = useState(initial ? String(initial.longitude) : "");
  const [accuracy, setAccuracy] = useState<number | null>(initial?.accuracy ?? null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  function cancel() { generation.current++; setBusy(false); setAccuracy(null); setMessage(""); }
  function locate() {
    const current = ++generation.current;
    if (!navigator.geolocation) {
      setMessage("Your browser cannot share location. Choose a campus location or enter coordinates below.");
      return;
    }
    setBusy(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition((position) => {
      if (current !== generation.current) return;
      setLatitude(String(position.coords.latitude));
      setLongitude(String(position.coords.longitude));
      setAccuracy(position.coords.accuracy);
      setMessage("Current position attached. Check that this is where the incident happened.");
      setBusy(false);
    }, (error) => {
      if (current !== generation.current) return;
      setBusy(false);
      setMessage(error.code === 1
        ? "Location permission was denied. You can still report using the campus location list or enter coordinates below."
        : "Could not obtain your position. Try again, enter coordinates, or continue with the campus location list.");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }
  return <fieldset className="coordinate-field">
    <legend>Incident coordinates <span className="optional">(optional)</span></legend>
    <p className="field-help" id="coordinates-help">Attach your current position only if you are at the incident location. It is saved with your report and follows the same access restrictions. This does not request a dispatch.</p>
    <div className="coordinate-actions">
      <Button variant="outline" onClick={locate} loading={busy}><LocateFixed aria-hidden="true" size={18} />{busy ? "Getting location…" : "Use my current location"}</Button>
      {(latitude || longitude || busy) && <Button variant="quiet" onClick={() => { cancel(); setLatitude(""); setLongitude(""); }}>Remove coordinates</Button>}
    </div>
    <p role="status" className="field-help">{message}</p>
    <div className="form-two-col">
      {(["latitude", "longitude"] as const).map((name) => {
        const error = fields[`coordinates.${name}`];
        return <div className="form-field" key={name}>
          <label htmlFor={`coordinates.${name}`}>{name === "latitude" ? "Latitude" : "Longitude"}</label>
          <input id={`coordinates.${name}`} name={name} type="number" step="any"
            min={name === "latitude" ? -90 : -180} max={name === "latitude" ? 90 : 180}
            value={name === "latitude" ? latitude : longitude} inputMode="decimal"
            aria-invalid={!!error} aria-describedby={`coordinates-help${error ? ` coordinates.${name}-error` : ""}`}
            onChange={(event) => { cancel(); (name === "latitude" ? setLatitude : setLongitude)(event.target.value); }} />
          {error && <p className="field-error" id={`coordinates.${name}-error`}>{error}</p>}
        </div>;
      })}
    </div>
    <input type="hidden" name="accuracy" value={accuracy ?? ""} />
    {accuracy !== null && <p className="field-help">Device-reported accuracy: approximately {Math.round(accuracy)} metres.</p>}
  </fieldset>;
}
