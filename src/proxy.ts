import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readSecurityConfig } from "@/lib/security/config";
import { contentSecurityPolicy } from "@/lib/security/headers";
export function proxy(request: NextRequest) {
  const security = readSecurityConfig();
  const origin = new URL(security.origin);
  if (
    process.env.VERCEL === "1" &&
    ["GET", "HEAD"].includes(request.method) &&
    request.headers.get("host")?.toLowerCase() !== origin.host.toLowerCase()
  ) {
    // Deployment aliases must reach the canonical host before rendering forms.
    // Assign path/search separately so a //path cannot change the redirect host.
    origin.pathname = request.nextUrl.pathname;
    origin.search = request.nextUrl.search;
    return NextResponse.redirect(origin, 307);
  }
  const nonce = randomBytes(24).toString("base64");
  const policy = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development",
    origin.protocol === "https:",
  );
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
