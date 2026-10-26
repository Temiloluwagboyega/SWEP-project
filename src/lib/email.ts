import { Resend } from "resend";
import type { Channel, Status } from "@prisma/client";
import { db } from "./db";
import { statusLabels } from "./constants";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const from = process.env.EMAIL_FROM ?? "Campus Security <onboarding@resend.dev>";
const appUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Emails only carry the reference, status and a link: reports can be sensitive,
// so details stay behind sign-in.
function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
function layout(heading: string, lines: string[], link: string, label: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;color:#1a1a1a">
  <h2 style="font-size:18px">${escape(heading)}</h2>
  ${lines.map((line) => `<p>${escape(line)}</p>`).join("")}
  <p><a href="${link}" style="color:#0b5cad">${escape(label)}</a></p>
  <p style="color:#666;font-size:12px">In an emergency, call campus security directly. Do not reply to this email.</p>
</div>`;
}

// Delivery failures are logged, never thrown, so a mail outage cannot undo a report action.
async function send(to: string, subject: string, html: string) {
  if (!resend) {
    if (process.env.NODE_ENV !== "test")
      console.info(`[email skipped: RESEND_API_KEY not set] ${subject}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) console.error("Resend error:", error.message);
  } catch (error) {
    console.error("Email delivery failed:", error);
  }
}

export async function sendWelcome(to: string, name: string) {
  await send(
    to,
    "Welcome to Campus Security Reporting",
    layout(
      `Welcome, ${name}`,
      [
        "Your account is ready. You can submit reports and follow their progress from your dashboard.",
      ],
      `${appUrl}/login`,
      "Sign in",
    ),
  );
}

export async function sendReportReceived(to: string, ref: string) {
  await send(
    to,
    `Report received: ${ref}`,
    layout(
      "We have received your report",
      [
        `Your reference is ${ref}.`,
        "You will get an email when its status changes.",
      ],
      `${appUrl}/reports/${ref}`,
      "View your report",
    ),
  );
}

export async function sendStatusUpdate(to: string, ref: string, status: Status) {
  const label = statusLabels[status] ?? status;
  await send(
    to,
    `Report ${ref}: ${label}`,
    layout(
      "Your report has been updated",
      [`Report ${ref} is now: ${label}.`],
      `${appUrl}/reports/${ref}`,
      "View the update",
    ),
  );
}

export async function sendUrgentAlert(channel: Channel, ref: string) {
  const staff = await db.user.findMany({
    where: {
      role: { in: channel === "COMMITTEE" ? ["COMMITTEE"] : ["SECURITY", "SUPERVISOR"] },
    },
    select: { email: true },
  });
  const html = layout(
    "An urgent report needs attention",
    [`Report ${ref} was marked urgent and is waiting in your queue.`],
    `${appUrl}/staff`,
    "Open the staff queue",
  );
  // One email per recipient so staff addresses are not exposed to each other.
  await Promise.all(staff.map(({ email }) => send(email, `URGENT report ${ref}`, html)));
}
