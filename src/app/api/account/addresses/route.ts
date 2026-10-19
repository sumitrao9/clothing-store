import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } });
    return ok(addresses);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const body = await req.json();
    const { type, line1, line2, city, state, postalCode, country, phone, isDefault } = body;
    if (!line1 || !city || !state || !postalCode || !country) return fail("Missing required address fields", 422);
    if (isDefault) await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    const addr = await prisma.address.create({
      data: { userId: user.id, type: type || "shipping", line1, line2, city, state, postalCode, country, phone, isDefault: Boolean(isDefault) }
    });
    return ok(addr, 201);
  });
}
