import { test } from "node:test";
import assert from "node:assert/strict";
import { scopeFor, canViewReport, canEdit, type SessionUser } from "../src/lib/access";
import type { Report } from "@prisma/client";

test("student data isolation: two students never see or edit each other's reports", () => {
  const studentA: SessionUser = {
    id: "student-uuid-aaa",
    role: "STUDENT",
    name: "Student Alpha",
    email: "alpha@campus.oau.edu.ng",
  };

  const studentB: SessionUser = {
    id: "student-uuid-bbb",
    role: "STUDENT",
    name: "Student Beta",
    email: "beta@campus.oau.edu.ng",
  };

  // Scope verification
  const scopeA = scopeFor(studentA);
  const scopeB = scopeFor(studentB);

  assert.deepEqual(scopeA, { reporterId: studentA.id });
  assert.deepEqual(scopeB, { reporterId: studentB.id });
  assert.notDeepEqual(scopeA, scopeB, "Students must have strictly separate query scopes");

  // Report belonging to Student A
  const reportA: Report = {
    id: "rep-001",
    ref: "SCS-2026-000001",
    channel: "SECURITY",
    category: "THEFT",
    description: "Details of incident",
    locationNote: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    status: "SUBMITTED",
    confidential: false,
    urgent: false,
    locationId: "loc-1",
    reporterId: studentA.id,
    assigneeId: null,
    occurredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Report belonging to Student B
  const reportB: Report = {
    id: "rep-002",
    ref: "SCS-2026-000002",
    channel: "SECURITY",
    category: "SAFETY_HAZARD",
    description: "Details of incident",
    locationNote: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    status: "SUBMITTED",
    confidential: false,
    urgent: false,
    locationId: "loc-2",
    reporterId: studentB.id,
    assigneeId: null,
    occurredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Student A can view and edit their own report
  assert.equal(canViewReport(studentA, reportA), true);
  assert.equal(canEdit(studentA, reportA), true);

  // Student A CANNOT view or edit Student B's report
  assert.equal(canViewReport(studentA, reportB), false);
  assert.equal(canEdit(studentA, reportB), false);

  // Student B CANNOT view or edit Student A's report
  assert.equal(canViewReport(studentB, reportA), false);
  assert.equal(canEdit(studentB, reportA), false);
});

test("staff role isolation: security and committee responders access only permitted channels", () => {
  const securityResponder: SessionUser = {
    id: "staff-sec-01",
    role: "SECURITY",
    name: "Security Officer One",
    email: "security1@campus.oau.edu.ng",
  };

  const committeeResponder: SessionUser = {
    id: "staff-com-01",
    role: "COMMITTEE",
    name: "Committee Member One",
    email: "committee1@campus.oau.edu.ng",
  };

  const securityReport: Report = {
    id: "rep-sec",
    ref: "SCS-2026-000010",
    channel: "SECURITY",
    category: "THEFT",
    description: "Details",
    locationNote: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    status: "SUBMITTED",
    confidential: false,
    urgent: false,
    locationId: "loc-1",
    reporterId: "student-any",
    assigneeId: null,
    occurredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const committeeReport: Report = {
    id: "rep-com",
    ref: "SCS-2026-000020",
    channel: "COMMITTEE",
    category: "CIVIL_MATTER",
    description: "Details",
    locationNote: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    status: "SUBMITTED",
    confidential: false,
    urgent: false,
    locationId: "loc-1",
    reporterId: "student-any",
    assigneeId: null,
    occurredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assert.equal(canViewReport(securityResponder, securityReport), true);
  assert.equal(canViewReport(securityResponder, committeeReport), false);

  assert.equal(canViewReport(committeeResponder, committeeReport), true);
  assert.equal(canViewReport(committeeResponder, securityReport), false);
});

test("profile picture validation: formats and 2 MB limit", () => {
  const allowedHeaderPattern = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;

  // Valid formats
  const validJpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  const validPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const validWebp = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";

  assert.equal(allowedHeaderPattern.test(validJpeg), true, "JPEG must be allowed");
  assert.equal(allowedHeaderPattern.test(validPng), true, "PNG must be allowed");
  assert.equal(allowedHeaderPattern.test(validWebp), true, "WebP must be allowed");

  // Disallowed formats
  const svgData = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
  const gifData = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const htmlData = "data:text/html;base64,PGgxPkhlbGxvPC9oMT4=";

  assert.equal(allowedHeaderPattern.test(svgData), false, "SVG must be rejected");
  assert.equal(allowedHeaderPattern.test(gifData), false, "GIF must be rejected");
  assert.equal(allowedHeaderPattern.test(htmlData), false, "HTML must be rejected");

  // 2 MB Size Enforcement Check
  const maxBytes = 2 * 1024 * 1024; // 2,097,152 bytes

  function checkSize(dataUrl: string): boolean {
    const match = dataUrl.match(allowedHeaderPattern);
    if (!match) return false;
    const base64Data = match[2];
    const approxSizeBytes = Math.ceil((base64Data.length * 3) / 4);
    return approxSizeBytes <= maxBytes;
  }

  // Small image
  assert.equal(checkSize(validPng), true, "Small PNG passes limit");

  // 2.5 MB image simulation
  const largeBase64 = "A".repeat(Math.ceil((2.5 * 1024 * 1024 * 4) / 3));
  const oversizedDataUrl = `data:image/jpeg;base64,${largeBase64}`;
  assert.equal(checkSize(oversizedDataUrl), false, "Over 2MB must be rejected");
});
