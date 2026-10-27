import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { staffChannel } from "@/lib/access";
import { ApiError } from "@/lib/http/errors";
import { apiError } from "@/lib/http/response";
import { checkOrigin } from "@/lib/http/origin";
import { readJson } from "@/lib/http/body";
import { clientAddress, consumeLimit } from "@/lib/security/rate-limit";
import { privateResponse } from "@/lib/http/response";
import { registerSchema } from "@/lib/validation";
import { sendWelcome } from "@/lib/email";
import {
  listReports,
  getReport,
  createReport,
  editReport,
  changeStatus,
  assignReport,
  referReport,
} from "@/lib/reports";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function route(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    const target = path.join("/");
    if (request.method !== "GET") checkOrigin(request);
    if (request.method === "GET" && target === "locations") {
      await consumeLimit("publicRead", clientAddress(request.headers));
      return NextResponse.json(
        await db.location.findMany({ orderBy: { name: "asc" } }),
      );
    }
    if (request.method === "POST" && target === "register") {
      await consumeLimit("register", clientAddress(request.headers));
      const data = registerSchema.parse(await readJson(request));
      if (await db.user.findUnique({ where: { email: data.email } }))
        throw new ApiError(
          400,
          "Unable to register with these details. Try signing in or use a different email.",
        );
      await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: await hash(data.password, 12),
          role: "STUDENT",
        },
      });
      await sendWelcome(data.email);
      return NextResponse.json({ success: true }, { status: 201 });
    }
    const user = await getSessionUser();
    if (!user) {
      await consumeLimit("unauthenticated", clientAddress(request.headers));
      throw new ApiError(401, "Please sign in to continue.");
    }
    await consumeLimit(
      request.method === "GET" ? "apiRead" : "apiWrite",
      user.id,
    );
    if (request.method === "GET" && target === "staff/users") {
      const channel = staffChannel(user);
      if (!channel) throw new ApiError(404, "Not found.");
      return NextResponse.json(
        await db.user.findMany({
          where: {
            isActive: true,
            role: {
              in:
                channel === "COMMITTEE"
                  ? ["COMMITTEE"]
                  : ["SECURITY", "SUPERVISOR"],
            },
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      );
    }
    if (path[0] !== "reports") throw new ApiError(404, "Not found.");
    if (path.length === 1) {
      if (request.method === "GET")
        return NextResponse.json(
          await listReports(user, new URL(request.url).searchParams),
        );
      if (request.method === "POST")
        return NextResponse.json(
          await createReport(user, await readJson(request)),
          { status: 201 },
        );
    }
    if (path.length === 2) {
      if (request.method === "GET")
        return NextResponse.json(await getReport(user, path[1]));
      if (request.method === "PATCH")
        return NextResponse.json(
          await editReport(user, path[1], await readJson(request)),
        );
    }
    if (path.length === 3) {
      if (request.method === "PATCH" && path[2] === "status")
        return NextResponse.json(
          await changeStatus(user, path[1], await readJson(request)),
        );
      if (request.method === "POST" && path[2] === "assign")
        return NextResponse.json(
          await assignReport(user, path[1], await readJson(request)),
        );
      if (request.method === "POST" && path[2] === "refer")
        return NextResponse.json(
          await referReport(user, path[1], await readJson(request)),
        );
    }
    throw new ApiError(404, "Not found.");
  } catch (error) {
    return apiError(error);
  }
}
async function securedRoute(request: Request, context: Context) {
  return privateResponse(await route(request, context));
}
export { securedRoute as GET, securedRoute as POST, securedRoute as PATCH };
