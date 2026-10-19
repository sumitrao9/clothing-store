import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return fail("An account with this email already exists", 409);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) }
    });
    return ok({ id: user.id, email: user.email }, 201);
  });
}
