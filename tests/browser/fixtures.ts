import { test as base, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

export const test = base.extend<{ isolatedLimits: void }>({
  isolatedLimits: [async ({}, use) => {
    const url = new URL(process.env.DATABASE_URL!);
    if (!/^test_browser_[a-f0-9]{12}$/.test(url.searchParams.get("schema") ?? ""))
      throw new Error("Run npm run test:e2e to provision an isolated browser database.");
    const db = new PrismaClient();
    try {
      // Test cases must not consume one another's login/report rate allowances.
      await db.rateLimitBucket.deleteMany();
      await use();
    } finally { await db.$disconnect(); }
  }, { auto: true }],
});
export { expect };
export type { Page } from "@playwright/test";
