import { db } from "../db";
export const SESSION_MAX_MS = 8 * 60 * 60_000;
export const SESSION_IDLE_MS = 30 * 60_000;
export function sessionIsFresh(
  session: { createdAt: Date; lastSeenAt: Date; expiresAt: Date },
  now = Date.now(),
) {
  return (
    session.createdAt.getTime() <= now &&
    now < session.expiresAt.getTime() &&
    now - session.createdAt.getTime() < SESSION_MAX_MS &&
    now - session.lastSeenAt.getTime() < SESSION_IDLE_MS
  );
}
export async function createLoginSession(userId: string) {
  const now = new Date();
  await db.loginSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lte: now } },
        { lastSeenAt: { lte: new Date(now.getTime() - SESSION_IDLE_MS) } },
      ],
    },
  });
  return db.loginSession.create({
    data: {
      userId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + SESSION_MAX_MS),
    },
  });
}
export async function validateLoginSession(
  sessionId: string,
  userId: string,
  version: number,
  now = Date.now(),
) {
  const record = await db.loginSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: { id: true, role: true, isActive: true, sessionVersion: true },
      },
    },
  });
  if (
    !record ||
    record.userId !== userId ||
    !record.user.isActive ||
    record.user.sessionVersion !== version ||
    !sessionIsFresh(record, now)
  )
    return null;
  const touched = await db.loginSession.updateMany({
    where: {
      id: sessionId,
      lastSeenAt: record.lastSeenAt,
      expiresAt: { gt: new Date(now) },
    },
    data: { lastSeenAt: new Date(now) },
  });
  // Concurrent reads may already have refreshed this same session; revocation remains checked on every access.
  if (
    !touched.count &&
    !(await db.loginSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    }))
  )
    return null;
  return record.user;
}
