"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "./StoreProvider";

export default function ProductCard({ product, priority = false }: { product: any; priority?: boolean }) {
  const { toggleWishlist, addToCart, openQuickView } = useStore();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const onWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    const ok = await toggleWishlist(product.id);
    setWished(ok ?? !wished);
  };

  const onQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart({ productId: product.id, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const off = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link href={`/product/${product.slug}`} className="product-card" style={{ display: "block", color: "inherit" }}>
      <div className="img-wrap">
        {product.isNew && <span className="badge" style={{ background: "var(--accent)" }}>New</span>}
        {off && !product.isNew && <span className="badge">Sale</span>}
        <button className={`wishlist-btn ${wished ? "active" : ""}`} onClick={onWish} aria-label="Wishlist">♡</button>
        <button className="qv-btn" onClick={(e) => { e.preventDefault(); openQuickView(product); }} aria-label="Quick view">⌕</button>
        <Image src={product.image || "/placeholder.png"} alt={product.name} fill sizes="(max-width:720px) 50vw, 25vw" style={{ objectFit: "cover" }} loading={priority ? "eager" : "lazy"} />
      </div>
      <div style={{ padding: "1rem 0.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ fontSize: "1.15rem", fontFamily: "var(--font-serif)" }} className="serif">{product.name}</h3>
          {product.rating > 0 && <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>★ {product.rating}</span>}
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginTop: "0.3rem" }}>
          <span style={{ fontSize: "0.95rem" }}>${product.price.toFixed(2)}</span>
          {off && <span style={{ fontSize: "0.82rem", color: "var(--err)", textDecoration: "line-through" }}>${product.compareAtPrice.toFixed(2)}</span>}
        </div>
        {product.colors?.length > 0 && (
          <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.6rem" }}>
            {product.colors.slice(0, 5).map((c: string) => (
              <span key={c} title={c} style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid var(--line)", background: c.toLowerCase() }} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
          <button onClick={onQuickAdd} className="btn btn-outline" style={{ flex: 1, padding: "0.6rem", fontSize: "0.65rem" }}>
            {added ? "Added ✓" : "Quick Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
