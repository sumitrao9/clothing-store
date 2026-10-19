"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

type Tab = "overview" | "orders" | "addresses" | "wishlist" | "profile" | "security" | "reviews";

export default function AccountDashboard() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [selOrder, setSelOrder] = useState<any>(null);

  const user = (session as any)?.user;

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [o, a, w] = await Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/account/addresses").then((r) => r.json()),
      fetch("/api/wishlist").then((r) => r.json())
    ]);
    setOrders(o?.data || []);
    setAddresses(a?.data || []);
    setWishlist(w?.data?.items || []);
    setProfile({ name: user.name || "", email: user.email || "", phone: "" });
  }, [user]);
  useEffect(() => { loadAll(); }, [loadAll]);

  async function viewOrder(id: string) {
    const r = await fetch(`/api/orders/${id}`);
    const j = await r.json();
    setSelOrder(j?.data);
  }

  async function removeWish(id: string) {
    await fetch("/api/wishlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id }) });
    loadAll();
  }
  async function wishToCart(id: string) {
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, quantity: 1 }) });
    removeWish(id);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    alert("Profile updated");
  }
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const r = await fetch("/api/account/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: fd.get("current"), next: fd.get("next") }) });
    const j = await r.json();
    alert(j.ok ? "Password changed" : (j.error || "Failed"));
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" }, { id: "orders", label: "Orders" }, { id: "addresses", label: "Addresses" },
    { id: "wishlist", label: "Wishlist" }, { id: "profile", label: "Profile" }, { id: "security", label: "Security" }, { id: "reviews", label: "Reviews" }
  ];

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "2.5rem" }} className="ac-grid">
        <aside>
          <h2 style={{ fontSize: "1.6rem" }}>My Account</h2>
          <p style={{ color: "#8a8278", fontSize: "0.85rem", marginBottom: "1.2rem" }}>{user?.email}</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className="upper" style={{ textAlign: "left", background: tab === t.id ? "#0a0a0a" : "none", color: tab === t.id ? "#f7f4ef" : "#0a0a0a", border: "none", padding: "0.7rem 1rem", fontSize: "0.72rem", cursor: "pointer" }}>{t.label}</button>
            ))}
            <button onClick={() => signOut({ callbackUrl: "/" })} className="upper" style={{ textAlign: "left", background: "none", color: "#b4452f", border: "none", padding: "0.7rem 1rem", fontSize: "0.72rem", cursor: "pointer" }}>Sign Out</button>
          </nav>
        </aside>

        <section>
          {tab === "overview" && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Welcome back{user?.name ? `, ${user.name}` : ""}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem" }}>
                <Stat label="Orders" value={orders.length} />
                <Stat label="Wishlist" value={wishlist.length} />
                <Stat label="Addresses" value={addresses.length} />
                <Stat label="Reviews" value={reviews.length} />
              </div>
              <div style={{ marginTop: "2rem", display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                <button className="btn btn-dark" onClick={() => setTab("orders")}>View Orders</button>
                <Link href="/products" className="btn btn-outline">Shop</Link>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Order History</h3>
              {orders.length === 0 && <p style={{ color: "#8a8278" }}>No orders yet.</p>}
              {orders.map((o: any) => (
                <div key={o.id} style={{ border: "1px solid #e2dacd", padding: "1rem", marginBottom: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong>{o.orderNumber}</strong>
                    <div style={{ fontSize: "0.8rem", color: "#8a8278" }}>{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s) · ${o.total.toFixed(2)}</div>
                    <div style={{ fontSize: "0.75rem", marginTop: "0.2rem" }}>Status: <b>{o.status}</b> · Payment: {o.paymentStatus}</div>
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: "0.65rem", padding: "0.6rem 1rem" }} onClick={() => viewOrder(o.id)}>View</button>
                </div>
              ))}
              {selOrder && <OrderModal order={selOrder} onClose={() => setSelOrder(null)} />}
            </div>
          )}

          {tab === "addresses" && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Addresses</h3>
              <AddressManager addresses={addresses} reload={loadAll} />
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Wishlist ({wishlist.length})</h3>
              {wishlist.length === 0 && <p style={{ color: "#8a8278" }}>Your wishlist is empty.</p>}
              <div className="grid-cols-products">
                {wishlist.map((w: any) => (
                  <div key={w.id} className="product-card">
                    <Link href={`/product/${w.slug}`}><div className="img-wrap"><Image src={w.image} alt={w.name} fill sizes="(max-width:720px) 50vw, 25vw" style={{ objectFit: "cover" }} /></div></Link>
                    <div style={{ padding: "0.8rem 0.2rem" }}>
                      <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>{w.name}</h4>
                      <p style={{ fontSize: "0.9rem" }}>${w.price.toFixed(2)}</p>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                        <button className="btn btn-dark" style={{ fontSize: "0.6rem", padding: "0.5rem 0.8rem" }} onClick={() => wishToCart(w.productId)}>Move to Cart</button>
                        <button className="btn btn-outline" style={{ fontSize: "0.6rem", padding: "0.5rem 0.8rem" }} onClick={() => removeWish(w.productId)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div className="narrow" style={{ width: "100%" }}>
              <h3 style={{ marginBottom: "1.2rem" }}>Profile</h3>
              <form onSubmit={saveProfile}>
                <div className="field"><label>Name</label><input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className="field"><label>Email</label><input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="field"><label>Phone</label><input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
                <button className="btn btn-dark" type="submit">Save Changes</button>
              </form>
            </div>
          )}

          {tab === "security" && (
            <div className="narrow" style={{ width: "100%" }}>
              <h3 style={{ marginBottom: "1.2rem" }}>Change Password</h3>
              <form onSubmit={changePassword}>
                <div className="field"><label>Current Password</label><input type="password" name="current" required /></div>
                <div className="field"><label>New Password</label><input type="password" name="next" required minLength={8} /></div>
                <button className="btn btn-dark" type="submit">Update Password</button>
              </form>
            </div>
          )}

          {tab === "reviews" && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>My Reviews</h3>
              <p style={{ color: "#8a8278" }}>Reviews you submit on purchased products appear here after moderation.</p>
            </div>
          )}
        </section>
      </div>
      <style jsx>{`
        @media (max-width: 760px) { .ac-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: "1px solid #e2dacd", padding: "1.2rem", textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem", fontFamily: "var(--font-serif)" }}>{value}</div>
      <div className="eyebrow" style={{ marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}

function OrderModal({ order, onClose }: { order: any; onClose: () => void }) {
  function downloadInvoice() {
    const html = `<h1>Invoice ${order.orderNumber}</h1><p>${order.name}, ${order.email}</p><ul>${order.items.map((i: any) => `<li>${i.name} x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}</li>`).join("")}</ul><p>Total: $${order.total.toFixed(2)}</p>`;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `invoice-${order.orderNumber}.html`; a.click();
  }
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: "#fff", padding: "2rem", maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Order {order.orderNumber}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#8a8278" }}>Placed {new Date(order.createdAt).toLocaleString()}</p>
        <p>Status: <b>{order.status}</b> · Payment: {order.paymentStatus}</p>
        {order.trackingNumber && <p>Tracking: <b>{order.trackingNumber}</b></p>}
        <hr className="line" style={{ margin: "1rem 0" }} />
        {order.items.map((i: any) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}>
            <span>{i.name} ({i.color}/{i.size}) × {i.quantity}</span><span>${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.8rem", fontWeight: 500 }}><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        <button className="btn btn-outline btn-block" style={{ marginTop: "1.2rem", fontSize: "0.7rem" }} onClick={downloadInvoice}>Download Invoice</button>
        {(order.status === "PAID" || order.status === "CONFIRMED") && (
          <button className="btn btn-dark btn-block" style={{ marginTop: "0.6rem", fontSize: "0.7rem" }} onClick={() => alert("Return request sent to support.")}>Request Return / Refund</button>
        )}
      </div>
    </div>
  );
}

function AddressManager({ addresses, reload }: { addresses: any[]; reload: () => void }) {
  const [form, setForm] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", isDefault: false });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", isDefault: false }); reload(); }
  }
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {addresses.map((a: any) => (
          <div key={a.id} style={{ border: "1px solid #e2dacd", padding: "1rem" }}>
            <p style={{ fontWeight: 500 }}>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
            <p style={{ fontSize: "0.82rem", color: "#8a8278" }}>{a.city}, {a.state} {a.postalCode}, {a.country}</p>
            {a.isDefault && <span className="eyebrow" style={{ color: "#9c7c4f" }}>Default</span>}
          </div>
        ))}
      </div>
      <h4 style={{ marginBottom: "0.8rem" }}>Add Address</h4>
      <form onSubmit={add} style={{ maxWidth: 480 }}>
        <div className="field"><label>Address</label><input value={form.line1} onChange={(e) => set("line1", e.target.value)} required /></div>
        <div className="field"><label>Apartment (optional)</label><input value={form.line2} onChange={(e) => set("line2", e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="field"><label>City</label><input value={form.city} onChange={(e) => set("city", e.target.value)} required /></div>
          <div className="field"><label>State</label><input value={form.state} onChange={(e) => set("state", e.target.value)} required /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="field"><label>Postal Code</label><input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} required /></div>
          <div className="field"><label>Country</label><input value={form.country} onChange={(e) => set("country", e.target.value)} required /></div>
        </div>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}><input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} /> Set as default</label>
        <button className="btn btn-dark" type="submit">Save Address</button>
      </form>
    </div>
  );
}
