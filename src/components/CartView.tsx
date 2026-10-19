"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartView() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/cart");
    const j = await res.json();
    setItems(j?.data?.items || []);
    setSubtotal(j?.data?.subtotal || 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id);
    const res = await fetch(`/api/cart/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: qty }) });
    const j = await res.json();
    if (j.ok) { setItems(j.data.items); setSubtotal(j.data.subtotal); window.dispatchEvent(new Event("cart-updated")); }
  }

  async function removeItem(id: string) {
    const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) { setItems(j.data.items); setSubtotal(j.data.subtotal); window.dispatchEvent(new Event("cart-updated")); }
  }

  async function applyCoupon() {
    const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon, subtotal }) });
    const j = await res.json();
    if (j.ok) { setDiscount(j.data.discount); setCouponMsg(`Saved $${j.data.discount.toFixed(2)}`); }
    else setCouponMsg(j.error || "Invalid coupon");
  }

  const ship = subtotal >= 150 ? 0 : 9.99;
  const total = Math.max(0, subtotal - discount + ship);

  if (loading) return <div style={{ paddingTop: 160, textAlign: "center" }}>Loading…</div>;

  if (items.length === 0) return (
    <div className="container" style={{ paddingTop: 160, paddingBottom: 80, textAlign: "center" }}>
      <h1 style={{ fontSize: "2.2rem" }}>Your cart is empty</h1>
      <p style={{ color: "#8a8278", margin: "1rem 0 2rem" }}>Discover pieces made to last.</p>
      <Link href="/products" className="btn btn-dark">Shop Now</Link>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", marginBottom: 30 }}>Shopping Bag</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem" }} className="cart-grid">
        <div>
          {items.map((it) => (
            <div key={it.id} style={{ display: "flex", gap: "1.2rem", padding: "1.2rem 0", borderBottom: "1px solid #e2dacd" }}>
              <Image src={it.image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80"} alt={it.name} width={110} height={140} style={{ objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Link href={`/product/${it.slug}`} className="serif" style={{ fontSize: "1.2rem" }}>{it.name}</Link>
                  <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                </div>
                <p style={{ color: "#8a8278", fontSize: "0.82rem" }}>{it.color} / {it.size}{!it.isActive && " · Unavailable"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.8rem" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd5c8" }}>
                    <button onClick={() => updateQty(it.id, it.quantity - 1)} style={{ padding: "0.4rem 0.8rem", border: "none", background: "#fff" }}>−</button>
                    <span style={{ padding: "0 0.8rem" }}>{it.quantity}</span>
                    <button onClick={() => updateQty(it.id, it.quantity + 1)} style={{ padding: "0.4rem 0.8rem", border: "none", background: "#fff" }}>＋</button>
                  </div>
                  <button onClick={() => removeItem(it.id)} style={{ fontSize: "0.75rem", textDecoration: "underline", color: "#8a8278", background: "none", border: "none" }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside style={{ border: "1px solid #e2dacd", padding: "1.6rem", alignSelf: "flex-start", position: "sticky", top: 100 }}>
          <h3 style={{ marginBottom: "1rem" }}>Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.6rem" }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" style={{ flex: 1, padding: "0.7rem", border: "1px solid #ddd5c8" }} />
            <button className="btn btn-outline" style={{ fontSize: "0.65rem", padding: "0.7rem 1rem" }} onClick={applyCoupon}>Apply</button>
          </div>
          {couponMsg && <p style={{ fontSize: "0.8rem", color: discount ? "#3f6b32" : "#b4452f" }}>{couponMsg}</p>}
          {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.6rem", color: "#3f6b32" }}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.6rem" }}><span>Shipping</span><span>{ship === 0 ? "Free" : `$${ship.toFixed(2)}`}</span></div>
          <hr className="line" style={{ margin: "1rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 500 }}><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-dark btn-block" style={{ marginTop: "1.4rem" }} onClick={() => router.push("/checkout")}>Proceed to Checkout</button>
          <Link href="/products" className="btn btn-outline btn-block" style={{ marginTop: "0.6rem", fontSize: "0.7rem" }}>Continue Shopping</Link>
        </aside>
      </div>
      <style jsx>{`
        @media (max-width: 820px) { .cart-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
