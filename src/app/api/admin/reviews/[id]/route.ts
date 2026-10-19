import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const { status } = await req.json();
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) return fail("Invalid status", 422);
    const review = await prisma.review.update({ where: { id: params.id }, data: { status } });
    const agg = await prisma.review.aggregate({ where: { productId: review.productId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: review.productId }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
    return ok(review);
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const review = await prisma.review.findUnique({ where: { id: params.id } });
    await prisma.review.delete({ where: { id: params.id } });
    if (review) {
      const agg = await prisma.review.aggregate({ where: { productId: review.productId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
      await prisma.product.update({ where: { id: review.productId }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
    }
    return ok({ deleted: true });
  });
}
