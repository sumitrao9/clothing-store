import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { couponSchema } from "@/lib/validation";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid request", 422);
    const { code, subtotal } = parsed.data;

    const user = await getCurrentUser();
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) return fail("Invalid or expired coupon", 404);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return fail("Coupon expired", 410);
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return fail("Coupon no longer available", 410);
    if (coupon.minOrder > subtotal) return fail(`Minimum order is $${coupon.minOrder}`, 422);

    if (user && coupon.perUserLimit > 0) {
      // Count this user's paid/created orders using the coupon
      const used = await prisma.order.count({ where: { userId: user.id, couponCode: coupon.code } });
      if (used >= coupon.perUserLimit) return fail("You have already used this coupon", 409);
    }

    let discount = 0;
    if (coupon.type === "PERCENT") discount = (subtotal * coupon.value) / 100;
    else discount = Math.min(coupon.value, subtotal);
    discount = Math.round(discount * 100) / 100;

    return ok({ code: coupon.code, type: coupon.type, value: coupon.value, discount, subtotalAfter: Math.round((subtotal - discount) * 100) / 100 });
  });
}
