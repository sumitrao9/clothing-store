"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Information", "Shipping", "Delivery", "Payment", "Review"];

export default function CheckoutFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", postalCode: "", country: "India",
    shippingMethod: "standard", paymentMethod: "stripe", couponCode: ""
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/cart");
      const j = await res.json();
      setCart(j?.data || { items: [], subtotal: 0 });
      setLoading(false);
    })();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (loading) return <div style={{ paddingTop: 160, textAlign: "center" }}>Loading…</div>;
  if (!cart || cart.items.length === 0) return (
    <div className="container" style={{ paddingTop: 160, paddingBottom: 80, textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem" }}>Your bag is empty</h1>
      <button className="btn btn-dark" style={{ marginTop: "1.5rem" }} onClick={() => router.push("/products")}>Shop Now</button>
    </div>
  );

  const ship = form.shippingMethod === "express" ? (cart.subtotal >= 150 ? 19.99 : 19.99) : (cart.subtotal >= 150 ? 0 : 9.99);
  const total = cart.subtotal + ship;

  async function placeOrder() {
    setSubmitting(true); setError("");
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, email: form.email, phone: form.phone,
        address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country },
        shippingMethod: form.shippingMethod, couponCode: form.couponCode, paymentMethod: form.paymentMethod
      })
    });
    const j = await res.json();
    setSubmitting(false);
    if (!j.ok) { setError(j.error || "Checkout failed"); return; }

    if (j.data.method === "stripe" && j.data.url) { window.location.href = j.data.url; return; }
    if (j.data.method === "cod") { router.push(`/checkout/success?order=${j.data.orderNumber}`); return; }
    if (j.data.method === "razorpay") {
      const rz = j.data.razorpay;
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        // @ts-ignore
        const rzp = new (window as any).Razorpay({
          key: rz.key, amount: rz.amount, currency: rz.currency, order_id: rz.orderId,
          name: "Maison Atelier", description: "Order " + j.data.orderId,
          handler: () => router.push(`/checkout/success?order=${j.data.orderId}`),
          modal: { ondismiss: () => router.push("/checkout?canceled=true") }
        });
        rzp.open();
      };
      document.body.appendChild(script);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <p className="eyebrow">Secure Checkout</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {STEPS.map((s, i) => (
            <span key={s} className="upper" style={{ fontSize: "0.65rem", color: i === step ? "#0a0a0a" : "#bbb", borderBottom: i === step ? "2px solid #0a0a0a" : "none", paddingBottom: 4 }}>
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem" }} className="co-grid">
        <div>
          {step === 0 && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Customer Information</h3>
              <div className="field"><label>Full Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Shipping Address</h3>
              <div className="field"><label>Address</label><input value={form.line1} onChange={(e) => set("line1", e.target.value)} /></div>
              <div className="field"><label>Apartment / Suite (optional)</label><input value={form.line2} onChange={(e) => set("line2", e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field"><label>City</label><input value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
                <div className="field"><label>State</label><input value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field"><label>Postal Code</label><input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></div>
                <div className="field"><label>Country</label><input value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Delivery Method</h3>
              {["standard", "express"].map((m) => (
                <label key={m} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #ddd5c8", padding: "1rem", marginBottom: "0.8rem", cursor: "pointer", background: form.shippingMethod === m ? "#f3ede4" : "#fff" }}>
                  <span><input type="radio" name="ship" checked={form.shippingMethod === m} onChange={() => set("shippingMethod", m)} /> {m === "standard" ? "Standard (3–5 days)" : "Express (1–2 days)"}</span>
                  <span>{m === "standard" ? (cart.subtotal >= 150 ? "Free" : "$9.99") : "$19.99"}</span>
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Payment</h3>
              {[
                { id: "stripe", label: "Card / Wallets (Stripe)" },
                { id: "razorpay", label: "UPI / Netbanking (Razorpay)" },
                { id: "cod", label: "Cash on Delivery" }
              ].map((p) => (
                <label key={p.id} style={{ display: "flex", gap: "0.6rem", alignItems: "center", border: "1px solid #ddd5c8", padding: "1rem", marginBottom: "0.8rem", cursor: "pointer", background: form.paymentMethod === p.id ? "#f3ede4" : "#fff" }}>
                  <input type="radio" name="pay" checked={form.paymentMethod === p.id} onChange={() => set("paymentMethod", p.id)} /> {p.label}
                </label>
              ))}
              <div className="field" style={{ marginTop: "1rem" }}><label>Coupon Code (optional)</label><input value={form.couponCode} onChange={(e) => set("couponCode", e.target.value)} placeholder="e.g. WELCOME10" /></div>
              <p style={{ fontSize: "0.78rem", color: "#8a8278" }}>Payments are processed securely. We never store your card details.</p>
            </div>
          )}
          {step === 4 && (
            <div>
              <h3 style={{ marginBottom: "1.2rem" }}>Review Your Order</h3>
              {cart.items.map((it: any) => (
                <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 0", borderBottom: "1px solid #e2dacd", fontSize: "0.9rem" }}>
                  <span>{it.name} · {it.color}/{it.size} × {it.quantity}</span>
                  <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#5a554d" }}>
                <p><strong>Ship to:</strong> {form.name}, {form.line1}, {form.city}, {form.state} {form.postalCode}, {form.country}</p>
                <p><strong>Delivery:</strong> {form.shippingMethod === "express" ? "Express" : "Standard"}</p>
                <p><strong>Payment:</strong> {form.paymentMethod.toUpperCase()}</p>
              </div>
            </div>
          )}

          {error && <div className="notice notice-err" style={{ marginTop: "1rem" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.6rem" }}>
            {step > 0 ? <button className="btn btn-outline" onClick={() => setStep((s) => s - 1)} disabled={submitting}>Back</button> : <span />}
            {step < STEPS.length - 1
              ? <button className="btn btn-dark" onClick={() => setStep((s) => s + 1)} disabled={submitting}>Continue</button>
              : <button className="btn btn-gold" onClick={placeOrder} disabled={submitting}>{submitting ? "Processing…" : "Place Order"}</button>}
          </div>
        </div>

        <aside style={{ border: "1px solid #e2dacd", padding: "1.6rem", alignSelf: "flex-start", position: "sticky", top: 100 }}>
          <h3 style={{ marginBottom: "1rem" }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.5rem" }}><span>Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.5rem" }}><span>Shipping</span><span>{ship === 0 ? "Free" : `$${ship.toFixed(2)}`}</span></div>
          <hr className="line" style={{ margin: "0.8rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 500 }}><span>Total</span><span>${total.toFixed(2)}</span></div>
        </aside>
      </div>
      <style jsx>{`
        @media (max-width: 820px) { .co-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
