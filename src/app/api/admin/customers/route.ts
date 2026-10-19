import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const where: any = { role: "CUSTOMER" };
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }];
    const customers = await prisma.user.findMany({
      where, orderBy: { createdAt: "desc" }, take: 200,
      include: { _count: { select: { orders: true, reviews: true } }, orders: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
    return ok(customers);
  });
}
