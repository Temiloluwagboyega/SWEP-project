import { ApiError } from "./errors";
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw new ApiError(400, "Request origin could not be verified.");
}
