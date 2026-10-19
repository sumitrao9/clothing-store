import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true, shipments: true }
    });
    return ok(orders);
  });
}
