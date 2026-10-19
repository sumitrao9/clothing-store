import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { resolveCart, getCartItems } from "@/lib/cart";
import { addToCartSchema } from "@/lib/validation";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const { cartId } = await resolveCart();
    const items = await getCartItems(cartId);
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    return ok({ items, subtotal, count: items.reduce((s, i) => s + i.quantity, 0) });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const { productId, variantId, size, color, quantity } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
    if (!product || !product.isActive) return fail("Product unavailable", 404);

    let variant = variantId
      ? product.variants.find((v) => v.id === variantId)
      : product.variants.find((v) => (!size || v.size === size) && (!color || v.color === color));
    if (!variant) return fail("Selected combination is unavailable", 422);

    if (variant.stock < quantity) return fail("Not enough stock", 422);

    const { cartId } = await resolveCart();

    const existing = await prisma.cartItem.findFirst({ where: { cartId, variantId: variant.id } });
    if (existing) {
      const next = existing.quantity + quantity;
      if (variant.stock < next) return fail("Not enough stock", 422);
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: next } });
    } else {
      await prisma.cartItem.create({
        data: { cartId, productId, variantId: variant.id, quantity, size: variant.size, color: variant.color }
      });
    }
    const items = await getCartItems(cartId);
    return ok({ items, subtotal: items.reduce((s, i) => s + i.lineTotal, 0), count: items.reduce((s, i) => s + i.quantity, 0) });
  });
}

export async function DELETE() {
  return handle(async () => {
    const { cartId } = await resolveCart();
    await prisma.cartItem.deleteMany({ where: { cartId } });
    return ok({ items: [], subtotal: 0, count: 0 });
  });
}
