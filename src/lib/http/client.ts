/** Browser requests never persist report contents in local/session storage. */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "HttpError";
  }
}
type JsonOptions = Omit<RequestInit, "body"> & { body?: unknown };
export async function request<T>(
  url: string,
  options: JsonOptions = {},
): Promise<T> {
  if (!url.startsWith("/api/")) throw new Error("Use a same-origin API path.");
  const { body, ...init } = options;
  const headers = new Headers(options.headers);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  const details =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const fields =
    details.fields &&
    typeof details.fields === "object" &&
    !Array.isArray(details.fields)
      ? Object.fromEntries(
          Object.entries(details.fields).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  if (!response.ok)
    throw new HttpError(
      typeof details.error === "string"
        ? details.error
        : "Unable to complete this request. Please try again.",
      response.status,
      fields,
    );
  if (payload === null)
    throw new HttpError(
      "The server returned an incomplete response. Please try again.",
      response.status,
    );
  return payload as T;
}
export function reportUrl(key: string, action?: "status" | "assign" | "refer") {
  return `/api/reports/${encodeURIComponent(key)}${action ? `/${action}` : ""}`;
}
