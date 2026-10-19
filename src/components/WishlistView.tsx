"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function WishlistView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (status === "authenticated") {
      fetch("/api/wishlist").then((r) => r.json()).then((j) => { setItems(j?.data?.items || []); setLoading(false); });
    }
  }, [status]);

  async function remove(id: string) { await fetch("/api/wishlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id }) }); setItems((i) => i.filter((x) => x.productId !== id)); }
  async function toCart(id: string) { await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, quantity: 1 }) }); remove(id); }

  if (status === "unauthenticated") return (
    <div className="container" style={{ paddingTop: 160, paddingBottom: 80, textAlign: "center" }}>
      <h1 style={{ fontSize: "2.2rem" }}>Your Wishlist</h1>
      <p style={{ color: "#8a8278", margin: "1rem 0 2rem" }}>Sign in to view your saved pieces.</p>
      <button className="btn btn-dark" onClick={() => router.push("/account/login")}>Sign In</button>
    </div>
  );
  if (loading) return <div style={{ paddingTop: 160, textAlign: "center" }}>Loading…</div>;

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", marginBottom: 30 }}>Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <p style={{ color: "#8a8278" }}>Nothing saved yet. <Link href="/products" style={{ color: "#9c7c4f" }}>Explore products</Link>.</p>
      ) : (
        <div className="grid-cols-products">
          {items.map((w: any) => (
            <div key={w.id} className="product-card">
              <Link href={`/product/${w.slug}`}><div className="img-wrap"><Image src={w.image} alt={w.name} fill sizes="(max-width:720px) 50vw, 25vw" style={{ objectFit: "cover" }} /></div></Link>
              <div style={{ padding: "0.8rem 0.2rem" }}>
                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>{w.name}</h4>
                <p style={{ fontSize: "0.9rem" }}>${w.price.toFixed(2)}</p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                  <button className="btn btn-dark" style={{ fontSize: "0.6rem", padding: "0.5rem 0.8rem" }} onClick={() => toCart(w.productId)} disabled={!w.inStock}>{w.inStock ? "Add to Cart" : "Sold Out"}</button>
                  <button className="btn btn-outline" style={{ fontSize: "0.6rem", padding: "0.5rem 0.8rem" }} onClick={() => remove(w.productId)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
