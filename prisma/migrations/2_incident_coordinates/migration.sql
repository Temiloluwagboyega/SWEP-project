ALTER TABLE "Report"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "accuracy" DOUBLE PRECISION;

ALTER TABLE "Report" ADD CONSTRAINT "Report_coordinates_check" CHECK (
  ("latitude" IS NULL AND "longitude" IS NULL AND "accuracy" IS NULL)
  OR ("latitude" IS NOT NULL AND "longitude" IS NOT NULL
      AND "latitude" BETWEEN -90 AND 90
      AND "longitude" BETWEEN -180 AND 180
      AND ("accuracy" IS NULL OR "accuracy" BETWEEN 0 AND 40100000))
);
