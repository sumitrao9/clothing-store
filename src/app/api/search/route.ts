import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    if (!q) {
      // recent popular searches (top brands/tags) + a few featured products
      const popular = ["oversized tee", "denim jacket", "linen shirt", "pleated trousers", "leather tote", "knit hoodie"];
      const featured = await prisma.product.findMany({
        where: { isActive: true }, orderBy: { isBestSeller: "desc" }, take: 5,
        select: { slug: true, name: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } }
      });
      return ok({ suggestions: [], popular, recent: [], featured: featured.map((f) => ({ slug: f.slug, name: f.name, image: f.images[0]?.url ?? null })) });
    }
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { tags: { has: q } }
        ]
      },
      take: 8,
      select: { slug: true, name: true, gender: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true } } }
    });
    const suggestions = products.map((p) => ({
      slug: p.slug, name: p.name, image: p.images[0]?.url ?? null, price: p.variants[0]?.price
    }));
    return ok({ suggestions, popular: [], recent: [], featured: [] });
  });
}
