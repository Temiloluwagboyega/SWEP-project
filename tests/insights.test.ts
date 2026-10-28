import { test } from "node:test";
import assert from "node:assert/strict";
import { reportInsights } from "../src/lib/analytics";
import { mapLinks } from "../src/lib/geo";
import { reports, redacted } from "./fixtures/design";

test("insights count WAT calendar dates, active ageing, resolution and only accessible locations", () => {
  const now = Date.parse("2026-10-28T00:15:00+01:00");
  const sample = [
    { ...reports[0], createdAt: "2026-10-27T23:05:00Z", coordinates: { latitude: 7.518, longitude: 4.525, accuracy: 12 } },
    { ...reports[2], createdAt: "2026-10-26T12:00:00Z" },
    { ...redacted, createdAt: "2026-10-27T09:00:00Z" },
    { ...reports[1], createdAt: "2026-10-26T08:00:00Z" },
  ];
  const result = reportInsights(sample, now);
  assert.equal(result.days.length, 7);
  assert.deepEqual(result.days.at(-1), { date: "2026-10-28", count: 1 });
  assert.equal(result.days.at(-2)?.count, 1);
  assert.equal(result.resolutionPercent, 25);
  assert.equal(result.overdue, 1);
  assert.equal(result.restricted, 1);
  assert.equal(result.mapped.length, 1);
  assert.equal(result.locations.reduce((sum, location) => sum + location.count, 0), 3);
  const empty = reportInsights([], now);
  assert.equal(empty.resolutionPercent, 0);
  assert.equal(empty.mapped.length, 0);
  assert.ok(empty.days.every((day) => day.count === 0));
});

test("map URLs keep coordinates in the expected order and bound map extents", () => {
  const links = mapLinks({ latitude: 7.518, longitude: 4.525, accuracy: null });
  assert.equal(new URL(links.embed).searchParams.get("marker"), "7.518,4.525");
  assert.match(links.external, /#map=17\/7.518\/4.525$/);
  const polar = new URL(mapLinks({ latitude: 90, longitude: -180, accuracy: null }).embed);
  const bounds = polar.searchParams.get("bbox")!.split(",").map(Number);
  assert.ok(bounds[0] >= -180 && bounds[3] <= 90);
});
