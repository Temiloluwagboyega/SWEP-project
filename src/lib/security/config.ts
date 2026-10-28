export type SecurityConfig = {
  secret: string;
  origin: string;
  production: boolean;
  trustedIpHeader?: string;
};
export function readAppOrigin(
  env: Record<string, string | undefined> = process.env,
): string {
  const production =
    env.APP_ENV === "production" ||
    (env.NODE_ENV === "production" && env.APP_ENV !== "local");
  const explicit = env.AUTH_URL?.trim() || env.NEXTAUTH_URL?.trim();
  const vercelHost = env.VERCEL === "1"
    ? env.VERCEL_ENV === "production"
      ? env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL
      : env.VERCEL_URL
    : undefined;
  let url: URL;
  try {
    url = new URL(explicit || (vercelHost ? `https://${vercelHost}` : production ? "" : "http://localhost:3000"));
  } catch {
    throw new Error(
      "Configure AUTH_URL as the canonical application origin, or enable Vercel system environment variables.",
    );
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash || url.pathname !== "/"
  ) throw new Error(
    "AUTH_URL must be an HTTP(S) origin without credentials, paths or query parameters.",
  );
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (env.APP_ENV === "local" && !local)
    throw new Error("Local mode requires a localhost AUTH_URL. Use production mode for hosting.");
  if ((production || env.VERCEL === "1") && (url.protocol !== "https:" || local))
    throw new Error("Production requires a public HTTPS AUTH_URL.");
  return url.origin;
}
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
  const origin = readAppOrigin(env);
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
  return { secret, origin, production, trustedIpHeader };
}
