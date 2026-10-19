"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "./StoreProvider";

const qbtn: React.CSSProperties = { padding: "0.35rem 0.7rem", border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem" };
const qnum: React.CSSProperties = { padding: "0 0.6rem", minWidth: 28, textAlign: "center" };

export default function CartDrawer() {
  const { cartOpen, closeCart } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/cart");
    const j = await res.json();
    setItems(j?.data?.items || []);
    setSubtotal(j?.data?.subtotal || 0);
  };

  useEffect(() => { if (cartOpen) { setLoading(true); load().finally(() => setLoading(false)); } }, [cartOpen]);

  async function updateQty(id: string, q: number) {
    if (q <= 0) return remove(id);
    const res = await fetch(`/api/cart/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: q }) });
    const j = await res.json();
    if (j.ok) { setItems(j.data.items); setSubtotal(j.data.subtotal); }
  }
  async function remove(id: string) {
    const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) { setItems(j.data.items); setSubtotal(j.data.subtotal); }
  }

  const ship = subtotal >= 150 ? 0 : 9.99;
  const total = Math.max(0, subtotal + ship);

  return (
    <>
      <div className={`drawer-scrim ${cartOpen ? "show" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <h3 style={{ fontSize: "1.3rem" }}>Your Bag</h3>
          <button className="drawer-close" onClick={closeCart} aria-label="Close">×</button>
        </div>
        <div className="drawer-body">
          {loading ? <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading…</p> :
            items.length === 0 ? <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Your bag is empty.</p> :
              items.map((it) => (
                <div key={it.id} className="drawer-item">
                  <Image src={it.image || ""} alt={it.name} width={64} height={80} style={{ objectFit: "cover", borderRadius: "var(--r-xs)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                      <Link href={`/product/${it.slug}`} onClick={closeCart} className="serif" style={{ fontSize: "1rem" }}>{it.name}</Link>
                      <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{it.color} / {it.size}{!it.isActive && " · Unavailable"}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
                        <button onClick={() => updateQty(it.id, it.quantity - 1)} style={qbtn}>−</button>
                        <span style={qnum}>{it.quantity}</span>
                        <button onClick={() => updateQty(it.id, it.quantity + 1)} style={qbtn}>＋</button>
                      </div>
                      <button onClick={() => remove(it.id)} style={{ fontSize: "0.75rem", textDecoration: "underline", color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--muted)" }}><span>Shipping</span><span>{ship === 0 ? "Free" : `$${ship.toFixed(2)}`}</span></div>
            <Link href="/checkout" onClick={closeCart} className="btn btn-dark btn-block" style={{ marginTop: "0.8rem" }}>Checkout · ${total.toFixed(2)}</Link>
            <Link href="/cart" onClick={closeCart} className="btn btn-outline btn-block" style={{ marginTop: "0.5rem", fontSize: "0.7rem" }}>View Bag</Link>
          </div>
        )}
      </aside>
    </>
  );
}
