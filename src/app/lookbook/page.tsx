import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOOKS = [
  { image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1400&q=80", title: "The Tailored Edit", season: "Autumn Editorial" },
  { image: "https://images.unsplash.com/photo-1496747611176-84322221f729?auto=format&fit=crop&w=1400&q=80", title: "Soft Power", season: "Studio Series" },
  { image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80", title: "After Dark", season: "Midnight Collection" }
];

export default async function LookbookPage() {
  const products = await prisma.product.findMany({ where: { isActive: true }, take: 12, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } });
  const picks = (n: number) => products.slice(n, n + 3);

  return (
    <div style={{ paddingTop: 120 }}>
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <p className="eyebrow">Visual Diary</p>
        <h1 style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}>Lookbook</h1>
      </div>
      {LOOKS.map((look, idx) => {
        const items = picks(idx * 3);
        const spots = [
          { top: "30%", left: "22%" }, { top: "55%", left: "55%" }, { top: "42%", left: "78%" }
        ];
        return (
          <section key={look.title} style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "flex-end", color: "#f7f4ef", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `url('${look.image}') center/cover`, filter: "brightness(0.7)" }} />
            <div style={{ position: "absolute", inset: 0, padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <p className="eyebrow" style={{ color: "#c4a878" }}>{look.season}</p>
              <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>{look.title}</h2>
              {items.map((p, i) => (
                <Link key={p.id} href={`/product/${p.slug}`}
                  style={{ position: "absolute", top: spots[i].top, left: spots[i].left, width: 22, height: 22, borderRadius: "50%", background: "#c4a878", border: "3px solid #fff", boxShadow: "0 0 0 6px rgba(255,255,255,0.25)", transition: "transform 0.3s" }}
                  className="hotspot" aria-label={p.name} title={p.name} />
              ))}
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {items.map((p) => <Link key={p.id} href={`/product/${p.slug}`} className="btn btn-gold" style={{ fontSize: "0.65rem" }}>{p.name}</Link>)}
              </div>
            </div>
          </section>
        );
      })}
      <div style={{ textAlign: "center", padding: "3rem" }}><Link href="/products" className="btn btn-dark">Shop The Collection</Link></div>
      <style>{`.hotspot:hover { transform: scale(1.3); }`}</style>
    </div>
  );
}
