import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const body = await req.json();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined && body.email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email: body.email } });
      if (exists) return fail("Email already in use", 409);
      data.email = body.email;
    }
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return ok({ name: updated.name, email: updated.email, phone: updated.phone });
  });
}

export async function POST(req: Request) {
  // change password
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const { current, next } = await req.json();
    if (!user.passwordHash) return fail("Set a password via account recovery first", 422);
    const okPass = await bcrypt.compare(current, user.passwordHash);
    if (!okPass) return fail("Current password is incorrect", 422);
    if (!next || next.length < 8) return fail("New password must be at least 8 characters", 422);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
    return ok({ changed: true });
  });
}
