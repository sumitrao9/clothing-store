import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order;
  const order = orderNumber ? await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } }) : null;

  return (
    <div className="container" style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center", maxWidth: 640 }}>
      <div style={{ fontSize: "3rem", color: "#9c7c4f" }}>✓</div>
      <h1 style={{ fontSize: "2.2rem", margin: "0.5rem 0" }}>Thank you for your order</h1>
      <p style={{ color: "#8a8278" }}>
        {order ? `Order ${order.orderNumber} has been received.` : "Your payment is being processed."}
        {order?.paymentStatus === "PENDING" && " We'll confirm once payment clears."}
      </p>
      {order && (
        <div style={{ textAlign: "left", border: "1px solid #e2dacd", padding: "1.5rem", marginTop: "2rem" }}>
          {order.items.map((it: any) => (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}>
              <span>{it.name} × {it.quantity}</span><span>${(it.price * it.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.8rem", fontWeight: 500 }}><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      )}
      <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
        {order?.userId && <Link href="/account/orders" className="btn btn-dark">View Orders</Link>}
        <Link href="/products" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
