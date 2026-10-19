import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validation";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return fail("productId required", 422);
    const reviews = await prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } }
    });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
    return ok({ reviews, average: Math.round(avg * 10) / 10, count: reviews.length });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to review", 401);
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const { productId, rating, title, body: text } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return fail("Product not found", 404);

    const purchased = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: user.id, paymentStatus: { in: ["SUCCEEDED"] } } }
    });
    const verified = Boolean(purchased);

    const review = await prisma.review.create({
      data: { userId: user.id, productId, rating, title, body: text, verified, status: "PENDING" }
    });

    // Update product aggregate
    const agg = await prisma.review.aggregate({ where: { productId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: productId }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });

    return ok({ review, message: "Review submitted for moderation" }, 201);
  });
}
