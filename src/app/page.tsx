import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [featured, news, best, collections] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true, isFeatured: true }, take: 4, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true, stock: true } } } }),
    prisma.product.findMany({ where: { isActive: true, isNew: true }, take: 8, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true, stock: true } } } }),
    prisma.product.findMany({ where: { isActive: true, isBestSeller: true }, take: 4, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { price: true, stock: true } } } }),
    prisma.collection.findMany({ where: { active: true }, take: 4, include: { products: { where: { isActive: true }, take: 1, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } })
  ]);
  const map = (p: any) => ({ id: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? null, price: p.variants[0]?.price ?? p.basePrice, compareAtPrice: p.variants[0]?.compareAtPrice ?? null, rating: p.ratingAvg, inStock: p.variants.some((v: any) => v.stock > 0), colors: Array.from(new Set(p.variants.map((v: any) => v.color))), isNew: p.isNew });
  return {
    featured: featured.map(map), news: news.map(map), best: best.map(map),
    collections: collections.map((c) => ({ ...c, cover: c.products[0]?.images[0]?.url ?? null }))
  };
}

export default async function Home() {
  const data = await getHomeData();
  return (
    <>
      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#f7f4ef", overflow: "hidden" }}>
        <div className="hero-bg" style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80') center/cover", filter: "brightness(0.6)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.4), rgba(10,10,10,0.7))" }} />
        <div style={{ position: "relative", zIndex: 2, padding: "0 1.5rem", maxWidth: 900 }}>
          <p className="eyebrow" style={{ color: "#a9794f" }}>Daily Wear · Wholesale 2026</p>
          <h1 className="hero-title" style={{ marginTop: "1rem" }}>MADE FOR<br />EVERY DAY.</h1>
          <p className="serif" style={{ fontSize: "clamp(1.1rem, 3vw, 1.6rem)", fontStyle: "italic", marginTop: "1.2rem", color: "#efe9e1" }}>
            Premium trousers, tees, shirts & jackets — built for daily wear, priced for wholesale.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2.4rem", flexWrap: "wrap" }}>
            <Link href="/products?q=trousers" className="btn btn-gold">Shop Trousers</Link>
            <Link href="/products?q=tshirt" className="btn btn-outline" style={{ color: "#f7f4ef", borderColor: "#f7f4ef" }}>Shop Tees</Link>
            <Link href="/products?q=jacket" className="btn btn-outline" style={{ color: "#f7f4ef", borderColor: "#f7f4ef" }}>Shop Jackets</Link>
          </div>
        </div>
      </section>

      {/* PROMO */}
      <section style={{ background: "#1c140d", color: "#f7f4ef", textAlign: "center", padding: "4rem 1.5rem" }}>
        <p className="eyebrow" style={{ color: "#a9794f" }}>Wholesale Pricing</p>
        <h2 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", margin: "0.5rem 0" }}>STOCK UP &amp; SAVE</h2>
        <p className="serif" style={{ fontSize: "1.2rem", fontStyle: "italic", color: "#efe9e1" }}>Everyday essentials, premium finish.</p>
        <Link href="/products" className="btn btn-gold" style={{ marginTop: "1.5rem" }}>Browse Daily Wear</Link>
      </section>

      {/* NEW ARRIVALS */}
      <section className="section container">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p className="eyebrow">Just Landed</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>New Arrivals</h2>
          </div>
        </Reveal>
        <div className="grid-cols-products">
          {data.news.map((p: any, i: number) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/products?new=true" className="btn btn-outline">View All New</Link>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="section container">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p className="eyebrow">Editorial Drops</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>Collections</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem" }}>
          {data.collections.map((c: any) => (
            <Link key={c.id} href={`/collections/${c.slug}`} style={{ position: "relative", display: "block", aspectRatio: "3/4", overflow: "hidden", color: "#f7f4ef", borderRadius: "var(--r-lg)", boxShadow: "var(--sh)" }}>
              <div style={{ position: "absolute", inset: 0, background: `url('${c.cover || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"}') center/cover`, filter: "brightness(0.65)", transition: "transform 0.8s" }} className="coll-img" />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <h3 style={{ fontSize: "1.8rem", letterSpacing: "0.1em" }}>{c.name}</h3>
                <span className="eyebrow" style={{ color: "#c4a878", marginTop: "0.5rem" }}>Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="section container" style={{ background: "#efe9e1" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p className="eyebrow">Loved By Many</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>Best Sellers</h2>
          </div>
        </Reveal>
        <div className="grid-cols-products">
          {data.best.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="section container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", minHeight: 420 }} className="split">
          <div style={{ background: "url('https://images.unsplash.com/photo-1485231183945-fffde7cc051e?auto=format&fit=crop&w=900&q=80') center/cover" }} />
          <div style={{ background: "#0a0a0a", color: "#f7f4ef", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem" }}>
            <p className="eyebrow" style={{ color: "#c4a878" }}>Our Ethos</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>Designed to Outlast Trends</h2>
            <p style={{ color: "#8a8278", marginTop: "1rem", maxWidth: 380 }}>Considered cuts, responsible materials, and finishes made to be worn for years — not seasons.</p>
            <Link href="/about" className="btn btn-gold" style={{ marginTop: "1.5rem", alignSelf: "flex-start" }}>Our Story</Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section container" style={{ textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>Join the Inner Circle</h2>
          <p style={{ color: "#8a8278", marginTop: "0.5rem" }}>Early access to drops, private sales, and styling notes.</p>
          <Newsletter />
        </Reveal>
      </section>

      <style>{`
        @media (max-width: 760px) {
          .split { grid-template-columns: 1fr !important; }
        }
        .coll-img:hover { transform: scale(1.06); }
      `}</style>
    </>
  );
}
