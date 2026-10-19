import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { productCreateSchema } from "@/lib/validation";
import { slugify } from "@/lib/constants";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { stock: true } }, _count: { select: { reviews: true } } }
    });
    return ok(products.map((p) => ({
      ...p, image: p.images[0]?.url ?? null, stock: p.variants.reduce((s, v) => s + v.stock, 0)
    })));
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const d = parsed.data;

    let slug = slugify(d.name);
    if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Math.floor(Math.random() * 9999)}`;

    const product = await prisma.product.create({
      data: {
        slug, name: d.name, description: d.description, brand: d.brand || "Maison Atelier",
        basePrice: d.basePrice, gender: d.gender, categoryId: d.categoryId || null,
        collectionId: d.collectionId || null, material: d.material, care: d.care,
        tags: d.tags || [], isFeatured: d.isFeatured, isBestSeller: d.isBestSeller,
        isNew: d.isNew, isLimited: d.isLimited,
        images: { create: (d.images || []).map((img, i) => ({ url: img.url, alt: img.alt, isVideo: img.isVideo, sortOrder: i })) },
        variants: {
          create: d.variants.map((v) => ({
            sku: v.sku || `${slug}-${v.color}-${v.size}`.toUpperCase(),
            color: v.color, size: v.size, price: v.price,
            compareAtPrice: v.compareAtPrice, stock: v.stock, weight: v.weight
          }))
        }
      }
    });
    return ok(product, 201);
  });
}
