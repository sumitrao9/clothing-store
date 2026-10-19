import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Catalog from "@/components/Catalog";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();
  const [categories, variants] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.productVariant.findMany({ select: { color: true } })
  ]);
  const colors = Array.from(new Set(variants.map((v) => v.color)));

  const titles: any = { MEN: "Men", WOMEN: "Women", ACCESSORIES: "Accessories", UNISEX: "Unisex" };

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p className="eyebrow">Shop</p>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>{titles[category.gender] || category.name}</h1>
        {category.description && <p style={{ color: "#8a8278", marginTop: "0.5rem" }}>{category.description}</p>}
      </div>
      <Suspense fallback={null}>
        <Catalog categories={categories} colors={colors} baseGender={category.gender} baseCategory={category.slug} />
      </Suspense>
    </div>
  );
}
