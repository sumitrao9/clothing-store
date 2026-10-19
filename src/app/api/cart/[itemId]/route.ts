import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { resolveCart, getCartItems } from "@/lib/cart";
import { updateCartSchema } from "@/lib/validation";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  return handle(async () => {
    const body = await req.json();
    const parsed = updateCartSchema.safeParse({ itemId: params.itemId, ...body });
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const { quantity } = parsed.data;

    const { cartId } = await resolveCart();
    const item = await prisma.cartItem.findFirst({ where: { id: params.itemId, cartId }, include: { variant: true } });
    if (!item) return fail("Item not found", 404);

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      if (item.variant && item.variant.stock < quantity) return fail("Not enough stock", 422);
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    }
    const items = await getCartItems(cartId);
    return ok({ items, subtotal: items.reduce((s, i) => s + i.lineTotal, 0), count: items.reduce((s, i) => s + i.quantity, 0) });
  });
}

export async function DELETE(_req: Request, { params }: { params: { itemId: string } }) {
  return handle(async () => {
    const { cartId } = await resolveCart();
    await prisma.cartItem.deleteMany({ where: { id: params.itemId, cartId } });
    const items = await getCartItems(cartId);
    return ok({ items, subtotal: items.reduce((s, i) => s + i.lineTotal, 0), count: items.reduce((s, i) => s + i.quantity, 0) });
  });
}
