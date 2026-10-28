import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";
declare module "next-auth" {
  interface User {
    role: Role;
    sessionVersion: number;
    image?: string | null;
  }
  interface Session {
    user: { id: string; role: Role; image?: string | null } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    sessionVersion: number;
    sessionId: string;
    image?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    sessionVersion: number;
    sessionId: string;
    image?: string | null;
  }
}
