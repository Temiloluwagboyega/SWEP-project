import nodemailer from "nodemailer";
import { after } from "next/server";
import type { Channel, Status } from "@prisma/client";
import { db } from "./db";
import { statusLabels } from "./constants";
import { brand } from "../config/brand";
import { readAppOrigin } from "./security/config";

// Any SMTP server works; defaults suit Gmail with an app password.
const user = process.env.SMTP_USER;
const transport =
  user && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: Number(process.env.SMTP_PORT ?? 465) === 465,
        requireTLS: true,
        disableFileAccess: true,
        disableUrlAccess: true,
        auth: { user, pass: process.env.SMTP_PASS },
        // Pooled, with short timeouts, so a slow mail server cannot pile up connections.
        pool: true,
        maxConnections: 3,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      })
    : null;
const from = process.env.EMAIL_FROM ?? `${brand.name} <${user}>`;
const appUrl = readAppOrigin();

// Emails only carry the reference, status and a link: reports can be sensitive,
// so details stay behind sign-in.
function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
function layout(heading: string, lines: string[], link: string, label: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;color:#1a1a1a">
  <h2 style="font-size:18px">${escape(heading)}</h2>
  ${lines.map((line) => `<p>${escape(line)}</p>`).join("")}
  <p><a href="${escape(link)}" style="color:#0b5cad">${escape(label)}</a></p>
  <p style="color:#666;font-size:12px">In an emergency, call campus security directly. Do not reply to this email.</p>
</div>`;
}

// Never log SMTP response/error objects: they may contain addresses or credentials.
function logFailure() {
  console.error("Email notification failed");
}
async function deliver(to: string, subject: string, html: string) {
  if (!transport) return;
  try {
    await transport.sendMail({ from, to, subject, html });
  } catch {
    logFailure();
  }
}

// Database lookups and delivery both run after the response. Every failure is contained.
async function background(action: () => Promise<void>) {
  const task = async () => {
    try {
      await action();
    } catch {
      logFailure();
    }
  };
  try {
    after(task);
  } catch {
    await task();
  }
}
async function send(to: string, subject: string, html: string) {
  if (!transport) return;
  await background(() => deliver(to, subject, html));
}

// The name is user-supplied and the address unverified, so it is left out of the email.
export async function sendWelcome(to: string) {
  await send(
    to,
    `Welcome to ${brand.name}`,
    layout(
      `Welcome to ${brand.name}`,
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

export async function sendStatusUpdate(
  to: string,
  ref: string,
  status: Status,
) {
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
  if (!transport) return;
  await background(async () => {
    const staff = await db.user.findMany({
      where: {
        role: {
          in:
            channel === "COMMITTEE"
              ? ["COMMITTEE"]
              : ["SECURITY", "SUPERVISOR"],
        },
        isActive: true,
      },
      select: { email: true },
    });
    const html = layout(
      "An urgent report needs attention",
      [`Report ${ref} was marked urgent and is waiting in your queue.`],
      `${appUrl}/staff`,
      "Open the staff queue",
    );
    // Separate envelopes prevent staff recipients seeing each other's addresses.
    await Promise.all(
      staff.map(({ email }) => deliver(email, `URGENT report ${ref}`, html)),
    );
  });
}
