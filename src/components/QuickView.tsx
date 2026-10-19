"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "./StoreProvider";

export default function QuickViewModal() {
  const { quickView, closeQuickView, addToCart } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  useEffect(() => {
    if (!quickView?.slug) return;
    setLoading(true); setProduct(null);
    fetch(`/api/products/${quickView.slug}`)
      .then((r) => r.json())
      .then((j) => { setProduct(j?.data ?? null); })
      .finally(() => setLoading(false));
  }, [quickView]);

  const colors: string[] = product ? (Array.from(new Set(product.variants.map((v: any) => v.color))) as string[]) : [];
  const sizes: string[] = product ? (Array.from(new Set(product.variants.map((v: any) => v.size))) as string[]) : [];
  const variant = product?.variants?.find((v: any) => v.color === color && v.size === size) || product?.variants?.[0];
  const price = variant?.price ?? product?.price ?? 0;
  const inStock = (variant?.stock ?? 0) > 0;

  async function add() {
    if (!product || !variant) return;
    await addToCart({ productId: product.id, variantId: variant.id, quantity: 1 });
    closeQuickView();
  }

  return (
    <>
      <div className={`modal-scrim ${quickView ? "show" : ""}`} onClick={closeQuickView} />
      <div className={`modal quick-modal ${quickView ? "open" : ""}`} role="dialog" aria-modal="true">
        {!quickView ? null : loading || !product ? (
          <p style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>Loading…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="qv-grid">
            <div className="img-wrap" style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", borderRadius: "var(--r)", background: "var(--sand)" }}>
              <Image src={product.images?.[0]?.url || product.image || ""} alt={product.name} fill sizes="(max-width:720px) 100vw, 40vw" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="eyebrow">{product.brand} · {product.gender}</p>
              <h2 style={{ fontSize: "1.8rem", margin: "0.3rem 0" }}>{product.name}</h2>
              <div style={{ fontSize: "1.3rem", marginBottom: "0.6rem" }}>${price.toFixed(2)}</div>
              <p style={{ color: "var(--muted-2)", fontSize: "0.92rem" }}>{product.description}</p>
              {colors.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p className="eyebrow" style={{ marginBottom: "0.4rem" }}>Color</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {colors.map((c: string) => (
                      <button key={c} onClick={() => setColor(c)} title={c} style={{ width: 30, height: 30, borderRadius: "50%", border: color === c ? "2px solid var(--ink)" : "1px solid var(--line)", background: c.toLowerCase() }} />
                    ))}
                  </div>
                </div>
              )}
              {sizes.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p className="eyebrow" style={{ marginBottom: "0.4rem" }}>Size</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {sizes.map((s: string) => (
                      <button key={s} onClick={() => setSize(s)} style={{ minWidth: 44, padding: "0.5rem 0.7rem", border: size === s ? "1px solid var(--ink)" : "1px solid var(--line)", background: size === s ? "var(--ink)" : "#fff", color: size === s ? "var(--ivory)" : "var(--ink)" }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn btn-dark" style={{ marginTop: "1.4rem" }} disabled={!inStock} onClick={add}>{inStock ? "Add to Bag" : "Sold Out"}</button>
              <a href={`/product/${product.slug}`} onClick={closeQuickView} className="upper" style={{ marginTop: "0.8rem", fontSize: "0.72rem", color: "var(--accent)" }}>View full details</a>
            </div>
          </div>
        )}
        {quickView && <button className="modal-close" onClick={closeQuickView} aria-label="Close">×</button>}
      </div>
    </>
  );
}
