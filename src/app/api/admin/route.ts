import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const [
      revenueAgg, orders, customers, products, lowStock, recentOrders, bestSellers, contactCount
    ] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: "SUCCEEDED" }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.productVariant.findMany({ where: { stock: { lt: 10 } }, include: { product: { select: { name: true, slug: true } } }, take: 10 }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: true } }),
      prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
      prisma.contactMessage.count({ where: { resolved: false } })
    ]);
    const paidOrders = await prisma.order.findMany({ where: { paymentStatus: "SUCCEEDED" }, select: { total: true } });
    const aov = paidOrders.length ? paidOrders.reduce((s, o) => s + o.total, 0) / paidOrders.length : 0;
    const topIds = bestSellers.map((b) => b.productId);
    const topProducts = topIds.length ? await prisma.product.findMany({ where: { id: { in: topIds } }, select: { id: true, name: true, slug: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } } }) : [];
    return ok({
      revenue: revenueAgg._sum.total ?? 0,
      totalOrders: orders, customers, products,
      aov: Math.round(aov * 100) / 100,
      lowStock: lowStock.map((l) => ({ name: l.product.name, slug: l.product.slug, stock: l.stock, sku: l.sku })),
      recentOrders,
      bestSellers: bestSellers.map((b) => ({ ...b, product: topProducts.find((p) => p.id === b.productId) })),
      openContacts: contactCount
    });
  });
}
