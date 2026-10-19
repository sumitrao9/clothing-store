import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: user.id },
      include: { items: true, payments: true, shipments: true, refunds: true }
    });
    if (!order) return fail("Order not found", 404);
    return ok(order);
  });
}
