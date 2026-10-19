import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
export const dynamic = "force-dynamic";

async function getWishlist(userId: string) {
  return prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });
}

export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to view wishlist", 401);
    const w = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, slug: true, name: true, gender: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true, stock: true } } } }
          }
        }
      }
    });
    const items = (w?.items || []).map((it) => ({
      id: it.id, productId: it.productId, slug: it.product.slug, name: it.product.name,
      image: it.product.images[0]?.url ?? null, price: it.product.variants[0]?.price ?? 0,
      inStock: it.product.variants.some((v) => v.stock > 0)
    }));
    return ok({ items, count: items.length });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to add to wishlist", 401);
    const { productId } = await req.json();
    if (!productId) return fail("productId required", 422);
    const w = await getWishlist(user.id);
    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: w.id, productId } }
    });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return ok({ added: false });
    }
    await prisma.wishlistItem.create({ data: { wishlistId: w.id, productId } });
    return ok({ added: true });
  });
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required", 401);
    const { productId } = await req.json();
    const w = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (w) await prisma.wishlistItem.deleteMany({ where: { wishlistId: w.id, productId } });
    return ok({ removed: true });
  });
}
