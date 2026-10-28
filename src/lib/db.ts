import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient({
  // Online database connections may queue briefly during concurrent case reads.
  // Keep transaction execution at Prisma's default timeout; bound pool waiting.
  transactionOptions: { maxWait: 10_000 },
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
