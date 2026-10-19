import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { active: true },
    include: { products: { where: { isActive: true }, take: 1, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } }
  });
  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p className="eyebrow">Editorial</p>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>Collections</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: "1.5rem" }}>
        {collections.map((c: any) => (
          <Link key={c.id} href={`/collections/${c.slug}`} style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", color: "#f7f4ef", display: "block" }}>
            <div style={{ position: "absolute", inset: 0, background: `url('${c.heroImage || c.products[0]?.images[0]?.url || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"}') center/cover`, filter: "brightness(0.62)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "2rem" }}>
              <p className="eyebrow" style={{ color: "#c4a878" }}>{c.season || "Collection"}</p>
              <h2 style={{ fontSize: "2.2rem", letterSpacing: "0.05em" }}>{c.name}</h2>
              {c.description && <p className="serif" style={{ fontStyle: "italic", color: "#efe9e1" }}>{c.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
