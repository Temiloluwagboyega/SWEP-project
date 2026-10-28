import { cache } from "react";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { loginSchema } from "./validation";
import type { SessionUser } from "./access";
import { readSecurityConfig } from "./security/config";
import { consumeLimit } from "./security/rate-limit";
import {
  createLoginSession,
  validateLoginSession,
  SESSION_MAX_MS,
} from "./security/sessions";
import { ApiError } from "./http/errors";
class RateLimitedSignIn extends CredentialsSignin {
  code = "rate_limited";
}
const security = readSecurityConfig();
// Normalise once at startup so Auth.js uses the same trusted origin as our
// request checks, including when it came from Vercel or legacy configuration.
process.env.AUTH_URL = security.origin;
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: security.secret,
  trustHost: true, // Canonical AUTH_URL and route origin checks define the actual trust boundary.
  useSecureCookies: new URL(security.origin).protocol === "https:",
  session: { strategy: "jwt", maxAge: SESSION_MAX_MS / 1000 },
  pages: { signIn: "/login" },
  logger: {
    error(error) {
      const type =
        "type" in error && typeof error.type === "string"
          ? error.type
          : "AuthError";
      if (type !== "CredentialsSignin")
        console.error("Authentication error", type);
    },
    warn(code) {
      console.warn("Authentication warning", code);
    },
    debug() {},
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;
        try {
          await consumeLimit("loginAccount", parsed.data.email);
        } catch (error) {
          if (error instanceof ApiError && error.status === 429)
            throw new RateLimitedSignIn();
          throw error;
        }
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        const valid = await compare(
          parsed.data.password,
          user?.passwordHash ??
            "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        );
        if (!user || !valid || !user.isActive) return null;
        if (
          security.production &&
          (user.email.endsWith("@demo.test") ||
            parsed.data.password === "Demo#2026")
        )
          return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const session = await createLoginSession(user.id!);
        token.id = user.id!;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.sessionId = session.id;
        token.image = user.image ?? null;
        return token;
      }
      if (
        typeof token.id !== "string" ||
        typeof token.sessionId !== "string" ||
        typeof token.sessionVersion !== "number"
      )
        return null;
      const account = await validateLoginSession(
        token.sessionId,
        token.id,
        token.sessionVersion,
      );
      if (!account) return null;
      token.role = account.role;
      token.image = account.image ?? null;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.image = token.image ?? null;
      return session;
    },
    redirect({ url }) {
      try {
        const target = new URL(url, security.origin);
        return target.origin === security.origin
          ? target.href
          : security.origin;
      } catch {
        return security.origin;
      }
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && typeof message.token?.sessionId === "string")
        await db.loginSession.deleteMany({
          where: { id: message.token.sessionId },
        });
    },
  },
});
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true, isActive: true, image: true },
  });
  if (!user?.isActive) return null;
  return { id: user.id, role: user.role, name: user.name, email: user.email, image: user.image };
});
