import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug }, select: { name: true, description: true, images: { take: 1 } } });
  if (!p) return { title: "Product not found" };
  const img = p.images[0]?.url;
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: { title: p.name, description: p.description.slice(0, 160), images: img ? [img] : [] }
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true, collection: true, images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: [{ stock: "desc" }, { size: "asc" }] },
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true } } } }
    }
  });
  if (!product || !product.isActive) notFound();

  const related = await prisma.product.findMany({
    where: { isActive: true, OR: [{ categoryId: product.categoryId }, { collectionId: product.collectionId }], NOT: { id: product.id } },
    take: 4, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true, stock: true } } }
  });

  const p = {
    ...product,
    price: product.variants[0]?.price ?? product.basePrice,
    related: related.map((r) => ({ id: r.id, slug: r.slug, name: r.name, image: r.images[0]?.url ?? null, price: r.variants[0]?.price ?? r.basePrice, compareAtPrice: null, rating: r.ratingAvg, inStock: r.variants.some((v) => v.stock > 0), colors: [], isNew: r.isNew }))
  };

  return <ProductDetail product={JSON.parse(JSON.stringify(p))} />;
}
