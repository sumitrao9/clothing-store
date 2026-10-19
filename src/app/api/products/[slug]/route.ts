import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        collection: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ stock: "desc" }, { size: "asc" }] },
        reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 12, include: { user: { select: { name: true } } } }
      }
    });
    if (!product || !product.isActive) return fail("Product not found", 404);

    const related = await prisma.product.findMany({
      where: { isActive: true, OR: [{ categoryId: product.categoryId }, { collectionId: product.collectionId }], NOT: { id: product.id } },
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true, stock: true } } }
    });

    const colors = Array.from(new Set(product.variants.map((v) => v.color)));
    const sizes = Array.from(new Set(product.variants.map((v) => v.size)));

    return ok({
      ...product,
      colors, sizes,
      related: related.map((r) => ({
        id: r.id, slug: r.slug, name: r.name, image: r.images[0]?.url ?? null,
        price: r.variants[0]?.price ?? r.basePrice, inStock: r.variants.some((v) => v.stock > 0)
      }))
    });
  });
}
