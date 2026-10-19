import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    const orders = await prisma.order.findMany({
      where, orderBy: { createdAt: "desc" }, take: 200,
      include: { items: true, user: { select: { name: true, email: true } }, shipments: true }
    });
    return ok(orders);
  });
}
