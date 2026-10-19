"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useStore } from "./StoreProvider";
import ProductCard from "./ProductCard";

export default function ProductDetail({ product }: { product: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toggleWishlist, addToCart } = useStore();

  const colors: string[] = Array.from(new Set(product.variants.map((v: any) => v.color)));
  const sizes: string[] = Array.from(new Set(product.variants.map((v: any) => v.size)));

  const [color, setColor] = useState<string>(colors[0] ?? "");
  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("description");
  const [wished, setWished] = useState(false);
  const [msg, setMsg] = useState("");
  const [zoom, setZoom] = useState(false);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const variant = useMemo(
    () => product.variants.find((v: any) => v.color === color && v.size === size) || product.variants[0],
    [color, size, product.variants]
  );

  const price = variant?.price ?? product.price;
  const compare = variant?.compareAtPrice ?? null;
  const stock = variant?.stock ?? 0;
  const inStock = stock > 0;

  async function handleAdd() {
    if (!inStock) return;
    const j = await addToCart({ productId: product.id, variantId: variant.id, quantity: qty });
    setMsg(j?.ok ? "Added to bag ✓" : (j?.error || "Could not add"));
  }

  async function handleBuyNow() {
    if (!inStock) return;
    await addToCart({ productId: product.id, variantId: variant.id, quantity: qty });
    router.push("/checkout");
  }

  async function handleWish() {
    const ok = await toggleWishlist(product.id);
    setWished(ok ?? !wished);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const res = await fetch("/api/reviews", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, rating: Number(fd.get("rating")), title: fd.get("title"), body: fd.get("body") })
    });
    const j = await res.json();
    setMsg(j.ok ? "Review submitted for moderation." : j.error);
    if (j.ok) (e.currentTarget as HTMLFormElement).reset();
  }

  const images = product.images.length ? product.images : [{ url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", alt: product.name }];

  return (
    <div className="container" style={{ paddingTop: 110, paddingBottom: 60 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }} className="pd-grid">
        {/* Gallery */}
        <div>
          <div
            onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}
            style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", background: "#efe9e1", cursor: "zoom-in" }}
          >
            <Image src={images[activeImg]?.url} alt={images[activeImg]?.alt || product.name}
              fill sizes="(max-width:720px) 100vw, 50vw" style={{ objectFit: "cover", transform: zoom ? "scale(1.6)" : "scale(1)", transition: "transform 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem", overflowX: "auto" }}>
            {images.map((img: any, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ position: "relative", width: 70, height: 88, border: activeImg === i ? "2px solid #0a0a0a" : "1px solid #ddd5c8", padding: 0, flexShrink: 0 }}>
                <Image src={img.url} alt="" fill sizes="70px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{product.brand} · {product.gender}</p>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: "0.4rem 0" }}>{product.name}</h1>
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.5rem" }}>${price.toFixed(2)}</span>
            {compare && <span style={{ color: "#b4452f", textDecoration: "line-through" }}>${compare.toFixed(2)}</span>}
            {product.ratingAvg > 0 && <span style={{ color: "#8a8278", fontSize: "0.85rem" }}>★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})</span>}
          </div>

          <p style={{ color: "#5a554d" }}>{product.description}</p>

          {/* Color */}
          <div style={{ marginTop: "1.6rem" }}>
            <p className="eyebrow" style={{ marginBottom: "0.6rem" }}>Color — {color}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {colors.map((c: string) => (
                <button key={c} onClick={() => setColor(c)} title={c}
                  style={{ width: 34, height: 34, borderRadius: "50%", border: color === c ? "2px solid #0a0a0a" : "1px solid #ddd5c8", background: c.toLowerCase(), boxShadow: color === c ? "0 0 0 2px #fff inset" : "none" }} />
              ))}
            </div>
          </div>

          {/* Size */}
          <div style={{ marginTop: "1.4rem" }}>
            <p className="eyebrow" style={{ marginBottom: "0.6rem" }}>Size — {size}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {sizes.map((s: string) => {
                const available = product.variants.some((v: any) => v.size === s && v.color === color && v.stock > 0);
                return (
                  <button key={s} onClick={() => setSize(s)} disabled={!available}
                    style={{ minWidth: 48, padding: "0.6rem 0.8rem", border: size === s ? "1px solid #0a0a0a" : "1px solid #ddd5c8", background: size === s ? "#0a0a0a" : "#fff", color: size === s ? "#f7f4ef" : "#0a0a0a", opacity: available ? 1 : 0.4, cursor: available ? "pointer" : "not-allowed" }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock + Qty */}
          <div style={{ marginTop: "1.4rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", color: inStock ? "#3f6b32" : "#b4452f" }}>{inStock ? (stock < 10 ? `Only ${stock} left` : "In stock") : "Out of stock"}</span>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd5c8" }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ padding: "0.5rem 0.9rem", background: "#fff", border: "none" }}>−</button>
              <span style={{ padding: "0 1rem", minWidth: 40, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(stock || 1, q + 1))} style={{ padding: "0.5rem 0.9rem", background: "#fff", border: "none" }}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.6rem", flexWrap: "wrap" }}>
            <button className="btn btn-dark" style={{ flex: 1, minWidth: 160 }} disabled={!inStock} onClick={handleAdd}>{inStock ? "Add to Cart" : "Sold Out"}</button>
            <button className="btn btn-gold" style={{ flex: 1, minWidth: 160 }} disabled={!inStock} onClick={handleBuyNow}>Buy Now</button>
            <button className={`wishlist-btn ${wished ? "active" : ""}`} onClick={handleWish} aria-label="Wishlist" style={{ position: "static", width: 50, height: 50 }}><span style={{ fontSize: "1.2rem" }}>♡</span></button>
          </div>
          {msg && <div className="notice notice-ok" style={{ marginTop: "1rem" }}>{msg}</div>}

          {/* Tabs */}
          <div style={{ marginTop: "2.5rem", borderTop: "1px solid #e2dacd", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid #e2dacd", marginBottom: "1.2rem", flexWrap: "wrap" }}>
              {["description", "materials", "shipping", "sizeguide", "reviews"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className="upper" style={{ background: "none", border: "none", padding: "0.4rem 0", fontSize: "0.7rem", color: tab === t ? "#0a0a0a" : "#8a8278", borderBottom: tab === t ? "1px solid #0a0a0a" : "none" }}>
                  {t === "sizeguide" ? "Size Guide" : t}
                </button>
              ))}
            </div>
            {tab === "description" && <p style={{ color: "#5a554d" }}>{product.description}</p>}
            {tab === "materials" && <p style={{ color: "#5a554d" }}>{product.material || "Premium fabrics, responsibly sourced."}<br />{product.care || "Dry clean or cold hand wash. Lay flat to dry."}</p>}
            {tab === "shipping" && <p style={{ color: "#5a554d" }}>{product.shippingInfo || "Free express shipping over $150. Dispatched within 24–48h. 30-day easy returns."}</p>}
            {tab === "sizeguide" && <SizeGuide gender={product.gender} />}
            {tab === "reviews" && (
              <div>
                <h4 style={{ marginBottom: "1rem" }}>Customer Reviews ({product.reviews.length})</h4>
                {product.reviews.length === 0 && <p style={{ color: "#8a8278" }}>No reviews yet. Be the first.</p>}
                {product.reviews.map((r: any) => (
                  <div key={r.id} style={{ borderBottom: "1px solid #e2dacd", padding: "1rem 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{r.title || "Review"}</strong>
                      <span style={{ color: "#9c7c4f" }}>{"★".repeat(r.rating)}</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#5a554d" }}>{r.body}</p>
                    <p style={{ fontSize: "0.75rem", color: "#8a8278" }}>{r.user?.name || "Customer"}{r.verified ? " · ✓ Verified" : ""} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                <ReviewForm purchased={true} onSubmit={submitReview} session={session} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {product.related?.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: 24 }}>You May Also Like</h2>
          <div className="grid-cols-products">
            {product.related.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {sticky && (
        <div className="pdp-sticky">
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", minWidth: 0 }}>
              <Image src={product.images?.[0]?.url || ""} alt="" width={40} height={50} style={{ objectFit: "cover", borderRadius: "var(--r-xs)" }} />
              <div style={{ minWidth: 0 }}>
                <div className="serif" style={{ fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</div>
                <div style={{ fontSize: "0.9rem" }}>${price.toFixed(2)}</div>
              </div>
            </div>
            <button className="btn btn-dark" disabled={!inStock} onClick={handleAdd}>{inStock ? "Add to Bag" : "Sold Out"}</button>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 820px) {
          .pd-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SizeGuide({ gender }: { gender: string }) {
  const rows: any = {
    MEN: [["XS", "34", "27"], ["S", "36", "29"], ["M", "38", "31"], ["L", "40", "33"], ["XL", "42", "35"], ["XXL", "44", "37"]],
    WOMEN: [["XS", "32", "25"], ["S", "34", "27"], ["M", "36", "29"], ["L", "38", "31"], ["XL", "40", "33"]],
    ACCESSORIES: [["ONE SIZE", "—", "—"]]
  };
  const data = rows[gender] || rows.MEN;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
      <thead><tr style={{ textAlign: "left", borderBottom: "1px solid #ddd5c8" }}><th style={{ padding: "0.5rem 0" }}>Size</th><th>Chest (in)</th><th>Waist (in)</th></tr></thead>
      <tbody>{data.map((r: any) => <tr key={r[0]} style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem 0" }}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
    </table>
  );
}

function ReviewForm({ purchased, onSubmit, session }: any) {
  if (!session?.user) return <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}><a href="/account/login" style={{ color: "#9c7c4f" }}>Sign in</a> to write a review.</p>;
  return (
    <form onSubmit={onSubmit} style={{ marginTop: "1.5rem", border: "1px solid #e2dacd", padding: "1.2rem" }}>
      <p className="eyebrow" style={{ marginBottom: "0.8rem" }}>Write a Review</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <select name="rating" required defaultValue="5" style={{ padding: "0.6rem" }} className="field-input">
          <option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option>
        </select>
        <input name="title" placeholder="Title (optional)" style={{ flex: 1, minWidth: 200, padding: "0.6rem" }} className="field-input" />
      </div>
      <textarea name="body" required placeholder="Share your experience…" rows={3} style={{ width: "100%", marginTop: "0.8rem", padding: "0.6rem", border: "1px solid #ddd5c8" }} />
      <button className="btn btn-dark" type="submit" style={{ marginTop: "0.8rem" }}>Submit Review</button>
    </form>
  );
}
