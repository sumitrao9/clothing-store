import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Catalog from "@/components/Catalog";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await prisma.collection.findUnique({ where: { slug: params.slug } });
  if (!collection || !collection.active) notFound();
  const [categories, variants] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.productVariant.findMany({ select: { color: true } })
  ]);
  const colors = Array.from(new Set(variants.map((v) => v.color)));

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ position: "relative", height: 360, marginBottom: 40, overflow: "hidden", color: "#f7f4ef" }}>
        <div style={{ position: "absolute", inset: 0, background: `url('${collection.heroImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"}') center/cover`, filter: "brightness(0.6)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "1rem" }}>
          <p className="eyebrow" style={{ color: "#c4a878" }}>{collection.season || "Collection"}</p>
          <h1 style={{ fontSize: "clamp(2.4rem,6vw,4rem)" }}>{collection.name}</h1>
          {collection.description && <p className="serif" style={{ fontStyle: "italic", color: "#efe9e1", marginTop: "0.5rem" }}>{collection.description}</p>}
        </div>
      </div>
      <Suspense fallback={null}>
        <Catalog categories={categories} colors={colors} baseCollection={collection.slug} />
      </Suspense>
    </div>
  );
}
