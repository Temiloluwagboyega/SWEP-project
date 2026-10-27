import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { readSecurityConfig } from "@/lib/security/config";
import { clientAddress, consumeLimit } from "@/lib/security/rate-limit";
import { boundedText } from "@/lib/http/body";
import { checkOrigin } from "@/lib/http/origin";
import { ApiError } from "@/lib/http/errors";
import { apiError, privateResponse } from "@/lib/http/response";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    if (new URL(request.url).origin !== readSecurityConfig().origin)
      throw new ApiError(400, "Use the configured application address.");
    await consumeLimit("authRead", clientAddress(request.headers));
    return privateResponse(await handlers.GET(request));
  } catch (error) {
    return privateResponse(apiError(error));
  }
}
export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const path = new URL(request.url).pathname;
    await consumeLimit(
      path.endsWith("/callback/credentials") ? "loginIp" : "authRead",
      clientAddress(request.headers),
    );
    const type = request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();
    if (
      type !== "application/x-www-form-urlencoded" &&
      type !== "application/json"
    )
      throw new ApiError(415, "Unsupported authentication request format.");
    const body = await boundedText(request, 8 * 1024);
    const bounded = new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body,
    });
    return privateResponse(await handlers.POST(bounded));
  } catch (error) {
    const response = apiError(error);
    if (request.headers.get("x-auth-return-redirect") === "1") {
      // next-auth/react expects a URL even for rejected/rate-limited submissions.
      const url = new URL("/login", readSecurityConfig().origin);
      url.searchParams.set("error", "CredentialsSignin");
      url.searchParams.set(
        "code",
        error instanceof ApiError && error.status === 429
          ? "rate_limited"
          : "request_rejected",
      );
      return privateResponse(
        NextResponse.json(
          { url: url.href },
          { status: response.status, headers: response.headers },
        ),
      );
    }
    return privateResponse(response);
  }
}
