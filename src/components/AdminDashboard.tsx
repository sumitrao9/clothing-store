"use client";

import { useEffect, useState } from "react";

type Tab = "dashboard" | "products" | "orders" | "coupons" | "reviews" | "customers" | "contacts";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [s, p, o, c, r, cu, co, cat] = await Promise.all([
      fetch("/api/admin").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/coupons").then((r) => r.json()),
      fetch("/api/admin/reviews").then((r) => r.json()),
      fetch("/api/admin/customers").then((r) => r.json()),
      fetch("/api/admin/contacts").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json())
    ]);
    setStats(s?.data); setProducts(p?.data || []); setOrders(o?.data || []);
    setCoupons(c?.data || []); setReviews(r?.data || []); setCustomers(cu?.data || []);
    setContacts(co?.data || []); setCategories(cat?.data || []);
  }

  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(""), 2500); };

  async function delProduct(id: string) {
    if (!confirm("Delete product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    flash("Product deleted"); loadAll();
  }
  async function updateOrder(id: string, body: any) {
    await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    flash("Order updated"); loadAll();
  }
  async function modReview(id: string, status: string) {
    await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    flash("Review " + status.toLowerCase()); loadAll();
  }
  async function delReview(id: string) { await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }); loadAll(); }
  async function toggleCoupon(c: any) { await fetch(`/api/admin/coupons/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !c.active }) }); loadAll(); }
  async function delCoupon(id: string) { await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" }); loadAll(); }
  async function resolveContact(id: string, v: boolean) { await fetch(`/api/admin/contacts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resolved: v }) }); loadAll(); }

  const TABS: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" }, { id: "products", label: "Products" }, { id: "orders", label: "Orders" },
    { id: "coupons", label: "Coupons" }, { id: "reviews", label: "Reviews" }, { id: "customers", label: "Customers" }, { id: "contacts", label: "Messages" }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh" }} className="ad-grid">
      <aside style={{ background: "#0a0a0a", color: "#f7f4ef", padding: "1.5rem 1rem" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", letterSpacing: "0.2em", marginBottom: 20 }}>ADMIN</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="upper" style={{ textAlign: "left", background: tab === t.id ? "#9c7c4f" : "none", color: tab === t.id ? "#0a0a0a" : "#f7f4ef", border: "none", padding: "0.6rem 0.8rem", fontSize: "0.7rem", cursor: "pointer" }}>{t.label}</button>
          ))}
          <a href="/" className="upper" style={{ textAlign: "left", color: "#c4a878", padding: "0.6rem 0.8rem", fontSize: "0.7rem" }}>View Site ↗</a>
        </nav>
      </aside>

      <main style={{ padding: "2rem", background: "#faf8f4", overflowX: "auto" }}>
        {note && <div className="notice notice-ok" style={{ marginBottom: "1rem" }}>{note}</div>}

        {tab === "dashboard" && stats && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1rem" }}>
              <Kpi label="Revenue" value={`$${stats.revenue?.toFixed(0) || 0}`} />
              <Kpi label="Orders" value={stats.totalOrders} />
              <Kpi label="Customers" value={stats.customers} />
              <Kpi label="Products" value={stats.products} />
              <Kpi label="Avg Order" value={`$${stats.aov?.toFixed(0) || 0}`} />
              <Kpi label="Open Messages" value={stats.openContacts} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2rem" }} className="ad-cols">
              <div className="card" style={{ padding: "1.2rem" }}>
                <h4 style={{ marginBottom: "0.8rem" }}>Low Stock</h4>
                {stats.lowStock?.map((l: any) => <div key={l.sku} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.3rem 0", borderBottom: "1px solid #eee" }}><span>{l.name}</span><b style={{ color: l.stock === 0 ? "#b4452f" : "#9c7c4f" }}>{l.stock}</b></div>)}
              </div>
              <div className="card" style={{ padding: "1.2rem" }}>
                <h4 style={{ marginBottom: "0.8rem" }}>Best Sellers</h4>
                {stats.bestSellers?.map((b: any) => <div key={b.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.3rem 0", borderBottom: "1px solid #eee" }}><span>{b.product?.name || b.productId}</span><b>{b._sum?.quantity || 0}</b></div>)}
              </div>
            </div>
            <div className="card" style={{ padding: "1.2rem", marginTop: "1.5rem" }}>
              <h4 style={{ marginBottom: "0.8rem" }}>Recent Orders</h4>
              {stats.recentOrders?.slice(0, 6).map((o: any) => <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.4rem 0", borderBottom: "1px solid #eee" }}><span>{o.orderNumber} · {o.email}</span><span>${o.total.toFixed(2)} · {o.status}</span></div>)}
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><h2>Products ({products.length})</h2><ProductModal categories={categories} onSaved={() => loadAll()} /></div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}><th style={{ padding: "0.5rem" }}>Name</th><th>Gender</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>{p.name}</td><td>{p.gender}</td><td>${p.basePrice?.toFixed(2)}</td><td>{p.stock}</td>
                    <td>{p.isActive ? "Active" : "Hidden"}</td>
                    <td style={{ textAlign: "right" }}><button onClick={() => delProduct(p.id)} style={{ color: "#b4452f", background: "none", border: "none", cursor: "pointer" }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2 style={{ marginBottom: "1rem" }}>Orders ({orders.length})</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}><th style={{ padding: "0.5rem" }}>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Tracking</th><th></th></tr></thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.4rem" }}>{o.orderNumber}</td>
                    <td>{o.email}</td><td>${o.total.toFixed(2)}</td>
                    <td>
                      <select defaultValue={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value })} style={{ padding: "0.3rem" }}>
                        {["PENDING","PAID","CONFIRMED","PROCESSING","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","REFUNDED"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><input defaultValue={o.trackingNumber || ""} placeholder="Add tracking" onBlur={(e) => e.target.value && updateOrder(o.id, { trackingNumber: e.target.value })} style={{ width: 120, padding: "0.3rem" }} /></td>
                    <td style={{ fontSize: "0.78rem", color: "#8a8278" }}>{o.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "coupons" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><h2>Coupons</h2><CouponModal onSaved={() => loadAll()} /></div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}><th style={{ padding: "0.5rem" }}>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th><th></th></tr></thead>
              <tbody>
                {coupons.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.4rem" }}>{c.code}</td><td>{c.type}</td><td>{c.type === "PERCENT" ? c.value + "%" : "$" + c.value}</td><td>{c.usedCount}/{c.maxUses ?? "∞"}</td>
                    <td><button onClick={() => toggleCoupon(c)} style={{ background: c.active ? "#3f6b32" : "#bbb", color: "#fff", border: "none", padding: "0.3rem 0.7rem", cursor: "pointer" }}>{c.active ? "On" : "Off"}</button></td>
                    <td><button onClick={() => delCoupon(c.id)} style={{ color: "#b4452f", background: "none", border: "none", cursor: "pointer" }}>Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <h2 style={{ marginBottom: "1rem" }}>Reviews ({reviews.length})</h2>
            {reviews.map((r: any) => (
              <div key={r.id} className="card" style={{ padding: "1rem", marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{r.title || "Review"} — {r.product?.name}</strong>
                  <span style={{ color: "#9c7c4f" }}>{"★".repeat(r.rating)}</span>
                </div>
                <p style={{ fontSize: "0.88rem", margin: "0.4rem 0" }}>{r.body}</p>
                <p style={{ fontSize: "0.75rem", color: "#8a8278" }}>{r.user?.name} · {r.status}{r.verified ? " · ✓" : ""}</p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button className="btn btn-dark" style={{ fontSize: "0.6rem", padding: "0.4rem 0.8rem" }} onClick={() => modReview(r.id, "APPROVED")}>Approve</button>
                  <button className="btn btn-outline" style={{ fontSize: "0.6rem", padding: "0.4rem 0.8rem" }} onClick={() => modReview(r.id, "REJECTED")}>Reject</button>
                  <button className="btn btn-outline" style={{ fontSize: "0.6rem", padding: "0.4rem 0.8rem" }} onClick={() => delReview(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "customers" && (
          <div>
            <h2 style={{ marginBottom: "1rem" }}>Customers ({customers.length})</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}><th style={{ padding: "0.5rem" }}>Name</th><th>Email</th><th>Orders</th><th>Reviews</th></tr></thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.4rem" }}>{c.name || "—"}</td><td>{c.email}</td><td>{c._count?.orders || 0}</td><td>{c._count?.reviews || 0}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "contacts" && (
          <div>
            <h2 style={{ marginBottom: "1rem" }}>Messages ({contacts.length})</h2>
            {contacts.map((m: any) => (
              <div key={m.id} className="card" style={{ padding: "1rem", marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{m.subject} — {m.name}</strong>
                  <button onClick={() => resolveContact(m.id, !m.resolved)} style={{ background: m.resolved ? "#bbb" : "#3f6b32", color: "#fff", border: "none", padding: "0.3rem 0.7rem", cursor: "pointer", fontSize: "0.7rem" }}>{m.resolved ? "Reopen" : "Resolve"}</button>
                </div>
                <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>{m.message}</p>
                <p style={{ fontSize: "0.75rem", color: "#8a8278" }}>{m.email} · {new Date(m.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <style jsx>{`
        @media (max-width: 820px) { .ad-grid { grid-template-columns: 1fr !important; } .ad-cols { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: any }) {
  return <div className="card" style={{ padding: "1.2rem", textAlign: "center" }}><div style={{ fontSize: "1.6rem", fontFamily: "var(--font-serif)" }}>{value}</div><div className="eyebrow" style={{ marginTop: "0.3rem" }}>{label}</div></div>;
}

function ProductModal({ categories, onSaved }: any) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [price, setPrice] = useState(""); const [gender, setGender] = useState("MEN"); const [cat, setCat] = useState(""); const [img, setImg] = useState(""); const [variants, setVariants] = useState([{ color: "Black", size: "M", price: "", stock: "10" }]);
  async function save() {
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, description: desc, basePrice: Number(price), gender, categoryId: cat || undefined,
        images: img ? [{ url: img }] : [],
        variants: variants.map((v) => ({ color: v.color, size: v.size, price: Number(v.price || price), stock: Number(v.stock) }))
      })
    });
    if (res.ok) { setOpen(false); onSaved(); setName(""); setDesc(""); setPrice(""); setImg(""); setVariants([{ color: "Black", size: "M", price: "", stock: "10" }]); }
    else alert("Failed to create");
  }
  return (
    <>
      <button className="btn btn-dark" style={{ fontSize: "0.7rem" }} onClick={() => setOpen(true)}>Add Product</button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: "#fff", padding: "1.5rem", maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "1rem" }}>New Product</h3>
            <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field"><label>Base Price</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
              <div className="field"><label>Gender</label><select value={gender} onChange={(e) => setGender(e.target.value)}><option>MEN</option><option>WOMEN</option><option>ACCESSORIES</option><option>UNISEX</option></select></div>
            </div>
            <div className="field"><label>Category</label><select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">None</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="field"><label>Image URL</label><input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://…" /></div>
            <h4 style={{ margin: "1rem 0 0.5rem" }}>Variants</h4>
            {variants.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input placeholder="Color" value={v.color} onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, color: e.target.value } : x))} style={{ width: 90 }} />
                <input placeholder="Size" value={v.size} onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, size: e.target.value } : x))} style={{ width: 70 }} />
                <input placeholder="Price" value={v.price} onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} style={{ width: 80 }} />
                <input placeholder="Stock" value={v.stock} onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, stock: e.target.value } : x))} style={{ width: 70 }} />
                {variants.length > 1 && <button onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#b4452f", cursor: "pointer" }}>✕</button>}
              </div>
            ))}
            <button onClick={() => setVariants((vs) => [...vs, { color: "Black", size: "M", price: "", stock: "10" }])} style={{ background: "none", border: "none", color: "#9c7c4f", cursor: "pointer", marginBottom: "1rem" }}>+ Add variant</button>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-dark" onClick={save}>Create</button>
              <button className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CouponModal({ onSaved }: any) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(""); const [type, setType] = useState("PERCENT"); const [value, setValue] = useState(""); const [min, setMin] = useState("0"); const [maxUses, setMaxUses] = useState("100");
  async function save() {
    const res = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, type, value: Number(value), minOrder: Number(min), maxUses: Number(maxUses) })
    });
    if (res.ok) { setOpen(false); onSaved(); setCode(""); setValue(""); } else alert("Failed");
  }
  return (
    <>
      <button className="btn btn-dark" style={{ fontSize: "0.7rem" }} onClick={() => setOpen(true)}>Add Coupon</button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: "#fff", padding: "1.5rem", width: 360 }}>
            <h3 style={{ marginBottom: "1rem" }}>New Coupon</h3>
            <div className="field"><label>Code</label><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field"><label>Type</label><select value={type} onChange={(e) => setType(e.target.value)}><option>PERCENT</option><option>FIXED</option></select></div>
              <div className="field"><label>Value</label><input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field"><label>Min Order</label><input type="number" value={min} onChange={(e) => setMin(e.target.value)} /></div>
              <div className="field"><label>Max Uses</label><input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-dark" onClick={save}>Create</button>
              <button className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
