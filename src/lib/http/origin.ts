import { ApiError } from "./errors";
import { readSecurityConfig } from "../security/config";
export function checkOrigin(request: Request) {
  if (
    request.headers.get("origin") !== readSecurityConfig().origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ApiError(400, "Request origin could not be verified.");
}
