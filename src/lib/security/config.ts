export type SecurityConfig = {
  secret: string;
  origin: string;
  production: boolean;
  trustedIpHeader?: string;
};
export function readSecurityConfig(
  env: Record<string, string | undefined> = process.env,
): SecurityConfig {
  const secret = env.AUTH_SECRET ?? "";
  if (
    secret.length < 32 ||
    /^(.)\1+$/.test(secret) ||
    /replace|changeme|example|password/i.test(secret)
  )
    throw new Error(
      "Configure a random AUTH_SECRET of at least 32 characters. Run npm run env:setup.",
    );
  if (env.APP_ENV && !["local", "production"].includes(env.APP_ENV))
    throw new Error("APP_ENV must be local or production.");
  const production =
    env.APP_ENV === "production" ||
    (env.NODE_ENV === "production" && env.APP_ENV !== "local");
  let url: URL;
  try {
    url = new URL(env.AUTH_URL ?? (production ? "" : "http://localhost:3000"));
  } catch {
    throw new Error("Configure AUTH_URL as the canonical application origin.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error(
      "AUTH_URL must be an HTTP(S) origin without credentials, paths or query parameters.",
    );
  if (
    env.APP_ENV === "local" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  )
    throw new Error(
      "Local mode requires a localhost AUTH_URL. Use production mode for hosting.",
    );
  if (
    production &&
    (url.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
  )
    throw new Error("Production requires a public HTTPS AUTH_URL.");
  if (
    production &&
    !env.DATABASE_URL?.startsWith("postgresql:") &&
    !env.DATABASE_URL?.startsWith("postgres:")
  )
    throw new Error("Production requires a configured PostgreSQL database.");
  const trustedIpHeader =
    env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase() || undefined;
  if (trustedIpHeader && !/^[a-z0-9-]+$/.test(trustedIpHeader))
    throw new Error(
      "TRUSTED_CLIENT_IP_HEADER must name one trusted proxy header.",
    );
  return { secret, origin: url.origin, production, trustedIpHeader };
}
