import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { db } from "../db";
import { ApiError } from "../http/errors";
import { readSecurityConfig } from "./config";
export const limits = {
  loginIp: { count: 10, window: 15 * 60_000 },
  loginAccount: { count: 10, window: 15 * 60_000 },
  register: { count: 3, window: 60 * 60_000 },
  report: { count: 5, window: 60 * 60_000 },
  authRead: { count: 120, window: 60_000 },
  publicRead: { count: 120, window: 60_000 },
  apiRead: { count: 240, window: 60_000 },
  apiWrite: { count: 60, window: 60_000 },
  unauthenticated: { count: 60, window: 60_000 },
} as const;
export function clientAddress(headers: Headers): string {
  const header = readSecurityConfig().trustedIpHeader;
  // An arbitrary x-forwarded-for is not an authenticated client address.
  if (!header) return "unverified-client";
  const value = headers.get(header)?.trim() ?? "";
  return isIP(value) ? value : "unverified-client";
}
export function opaqueLimitKey(
  kind: string,
  identity: string,
  windowId: number,
) {
  return createHmac("sha256", readSecurityConfig().secret)
    .update(JSON.stringify(["campusguard-rate", kind, identity, windowId]))
    .digest("hex");
}
export async function consumeLimit(
  kind: keyof typeof limits,
  identity: string,
  now = Date.now(),
) {
  const policy = limits[kind],
    windowId = Math.floor(now / policy.window),
    expiresAt = new Date((windowId + 1) * policy.window);
  const id = opaqueLimitKey(kind, identity, windowId);
  let count: number;
  try {
    // Indexed pruning bounds retention. The atomic database upsert is authoritative across instances.
    await db.rateLimitBucket.deleteMany({
      where: { expiresAt: { lte: new Date(now) } },
    });
    count = (
      await db.rateLimitBucket.upsert({
        where: { id },
        create: { id, count: 1, expiresAt },
        update: { count: { increment: 1 } },
      })
    ).count;
  } catch {
    throw new ApiError(
      503,
      "Unable to verify request limits. Please try again.",
    );
  }
  if (count > policy.count)
    throw new ApiError(
      429,
      "Too many attempts. Please wait before trying again.",
      {
        "Retry-After": String(
          Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
        ),
      },
    );
}
