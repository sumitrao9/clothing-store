import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getCurrentUser } from "./session";

const GUEST_COOKIE = "maison_cart";

export async function resolveCart(): Promise<{ cartId: string; guestCookie?: string }> {
  const user = await getCurrentUser();
  if (user) {
    const existing = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (existing) return { cartId: existing.id };
    const created = await prisma.cart.create({ data: { userId: user.id } });
    return { cartId: created.id };
  }

  const store = cookies();
  let sid = store.get(GUEST_COOKIE)?.value;
  if (!sid) {
    sid = crypto.randomUUID();
    store.set(GUEST_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return { cartId: (await prisma.cart.create({ data: { sessionId: sid } })).id, guestCookie: sid };
  }
  const existing = await prisma.cart.findUnique({ where: { sessionId: sid } });
  if (existing) return { cartId: existing.id };
  const created = await prisma.cart.create({ data: { sessionId: sid } });
  return { cartId: created.id };
}

export async function getCartItems(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        select: {
          id: true, slug: true, name: true, gender: true, isActive: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 }
        }
      },
      variant: { select: { id: true, sku: true, stock: true, price: true, compareAtPrice: true, color: true, size: true } }
    }
  });
  return items.map((it) => ({
    id: it.id,
    productId: it.productId,
    variantId: it.variantId,
    quantity: it.quantity,
    size: it.size,
    color: it.color,
    slug: it.product.slug,
    name: it.product.name,
    image: it.product.images[0]?.url ?? "",
    isActive: it.product.isActive,
    variant: it.variant,
    unitPrice: it.variant?.price ?? 0,
    compareAtPrice: it.variant?.compareAtPrice ?? null,
    stock: it.variant?.stock ?? 0,
    lineTotal: (it.variant?.price ?? 0) * it.quantity
  }));
}
