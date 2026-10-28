import type { Coordinates } from "../types/app";

export function mapLinks({ latitude, longitude }: Coordinates) {
  const point = `${latitude},${longitude}`;
  const bounds = [
    Math.max(-180, longitude - 0.008),
    Math.max(-90, latitude - 0.005),
    Math.min(180, longitude + 0.008),
    Math.min(90, latitude + 0.005),
  ].join(",");
  return {
    embed: `https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({ bbox: bounds, layer: "mapnik", marker: point })}`,
    external: `https://www.openstreetmap.org/?${new URLSearchParams({ mlat: String(latitude), mlon: String(longitude) })}#map=17/${latitude}/${longitude}`,
  };
}
