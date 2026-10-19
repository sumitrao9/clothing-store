import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

const PER_PAGE = 12;

export async function GET(req: Request) {
  return handle(async () => {
    const { searchParams } = new URL(req.url);
    const p = (k: string) => searchParams.get(k);
    const num = (k: string) => { const v = p(k); return v ? Number(v) : undefined; };

    const q = p("q")?.toLowerCase();
    const gender = p("gender");
    const category = p("category");
    const collection = p("collection");
    const color = p("color");
    const size = p("size");
    const brand = p("brand");
    const rating = num("rating");
    const availability = p("availability");
    const minPrice = num("minPrice");
    const maxPrice = num("maxPrice");
    const tags = p("tags");
    const sort = p("sort") || "featured";
    const page = Math.max(1, num("page") || 1);

    const where: any = { isActive: true };
    if (q) where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
      { sku: { contains: q, mode: "insensitive" } }
    ];
    if (gender) where.gender = gender;
    if (category) where.category = { slug: category };
    if (collection) where.collection = { slug: collection };
    if (brand) where.brand = { contains: brand, mode: "insensitive" };
    if (tags) where.tags = { has: tags };
    if (color) where.variants = { some: { color: { equals: color, mode: "insensitive" } } };
    if (size) where.variants = { ...(where.variants || {}), some: { ...(where.variants?.some || {}), size: { equals: size, mode: "insensitive" } } };
    if (rating) where.ratingAvg = { gte: rating };
    if (availability === "in_stock") where.variants = { ...(where.variants || {}), some: { stock: { gt: 0 } } };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = { ...(where.variants || {}), some: { price: { gte: minPrice ?? 0, lte: maxPrice ?? 1e9 } } };
    }
    if (p("featured")) where.isFeatured = true;
    if (p("best")) where.isBestSeller = true;
    if (p("new")) where.isNew = true;
    if (p("trending")) where.isTrending = true;
    if (p("limited")) where.isLimited = true;

    const priceSort = sort === "price_asc" || sort === "price_desc";
    const orderBy: any[] = [];
    if (sort === "newest") orderBy.push({ createdAt: "desc" });
    else if (sort === "best_selling") orderBy.push({ isBestSeller: "desc" }, { createdAt: "desc" });
    else if (sort === "rating") orderBy.push({ ratingAvg: "desc" });
    else if (!priceSort) orderBy.push({ isFeatured: "desc" }, { createdAt: "desc" });

    const include: Prisma.ProductInclude = {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { price: true, compareAtPrice: true, stock: true, color: true, size: true } }
    };

    const minPriceOf = (pr: any) => {
      const prices = pr.variants.map((v: any) => v.price);
      return prices.length ? Math.min(...prices) : (pr.basePrice ?? 0);
    };

    type ProductWithInclude = Prisma.ProductGetPayload<{ include: typeof include }>;
    let total: number;
    let products: ProductWithInclude[];
    if (priceSort) {
      const all = await prisma.product.findMany({ where, include });
      all.sort((a, b) =>
        sort === "price_asc" ? minPriceOf(a) - minPriceOf(b) : minPriceOf(b) - minPriceOf(a)
      );
      total = all.length;
      products = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    } else {
      [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({ where, orderBy, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include })
      ]);
    }

    const data = products.map((pr) => {
      const prices = pr.variants.map((v) => v.price);
      const compare = pr.variants.map((v) => v.compareAtPrice).filter(Boolean) as number[];
      const min = prices.length ? Math.min(...prices) : pr.basePrice;
      const maxCompare = compare.length ? Math.max(...compare) : null;
      const totalStock = pr.variants.reduce((s, v) => s + v.stock, 0);
      return {
        id: pr.id, slug: pr.slug, name: pr.name, gender: pr.gender,
        image: pr.images[0]?.url ?? null, brand: pr.brand,
        price: min, compareAtPrice: maxCompare,
        rating: pr.ratingAvg, ratingCount: pr.ratingCount,
        inStock: totalStock > 0, colors: Array.from(new Set(pr.variants.map((v) => v.color))), category: pr.category
      };
    });

    return ok({ items: data, total, page, perPage: PER_PAGE, totalPages: Math.ceil(total / PER_PAGE) });
  });
}
