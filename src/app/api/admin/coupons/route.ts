import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { z } from "zod";
export const dynamic = "force-dynamic";

const couponCreate = z.object({
  code: z.string().min(3),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().min(0).optional(),
  maxUses: z.number().int().optional(),
  perUserLimit: z.number().int().min(0).optional(),
  expiresAt: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional()
});

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return ok(coupons);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const parsed = couponCreate.safeParse(await req.json());
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const d = parsed.data;
    const coupon = await prisma.coupon.create({
      data: {
        code: d.code.toUpperCase(), type: d.type, value: d.value,
        minOrder: d.minOrder ?? 0, maxUses: d.maxUses ?? 100, perUserLimit: d.perUserLimit ?? 1,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
        productId: d.productId, categoryId: d.categoryId
      }
    });
    return ok(coupon, 201);
  });
}
