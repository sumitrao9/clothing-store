import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Catalog from "@/components/Catalog";

export const dynamic = "force-dynamic";

async function getFilters() {
  const [categories, variants] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.productVariant.findMany({ select: { color: true } })
  ]);
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  return { categories, colors };
}

export default async function ProductsPage() {
  const { categories, colors } = await getFilters();
  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p className="eyebrow">The Store</p>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>All Products</h1>
      </div>
      <Suspense fallback={null}>
        <Catalog categories={categories} colors={colors} />
      </Suspense>
    </div>
  );
}
