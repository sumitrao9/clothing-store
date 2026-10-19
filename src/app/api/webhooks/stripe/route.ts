import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { decrementInventory } from "../../checkout/route";
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handle(async () => {
    if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response("Webhook not configured", { status: 503 });
    }
    const stripe = getStripe();
    const raw = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("Missing signature", { status: 400 });

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (e: any) {
      return new Response(`Webhook error: ${e.message}`, { status: 400 });
    }

    const obj = event.data.object;
    const orderId = obj.metadata?.orderId || (await prisma.order.findFirst({ where: { paymentIntentId: obj.id } }))?.id;

    if (event.type === "payment_intent.succeeded" && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (order && order.paymentStatus !== "SUCCEEDED") {
        await prisma.$transaction([
          prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "SUCCEEDED", status: "PAID" } }),
          prisma.payment.updateMany({ where: { orderId, providerPaymentId: obj.id }, data: { status: "SUCCEEDED" } }),
          prisma.shipment.create({ data: { orderId, status: "PREPARING" } })
        ]);
        await decrementInventory(order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
        if (order.couponCode) {
          await prisma.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } });
        }
        if (order.userId) {
          await prisma.notification.create({ data: { userId: order.userId, type: "ORDER_PAID", message: `Payment received for order ${order.orderNumber}` } });
        }
      }
    }

    if (event.type === "payment_intent.payment_failed" && orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
      await prisma.payment.updateMany({ where: { orderId, providerPaymentId: obj.id }, data: { status: "FAILED" } });
    }

    // Stripe hosted Checkout Sessions
    if (event.type === "checkout.session.completed" && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (order && order.paymentStatus !== "SUCCEEDED") {
        await prisma.$transaction([
          prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "SUCCEEDED", status: "PAID" } }),
          prisma.payment.updateMany({ where: { orderId, providerPaymentId: obj.id }, data: { status: "SUCCEEDED" } }),
          prisma.shipment.create({ data: { orderId, status: "PREPARING" } })
        ]);
        await decrementInventory(order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
        if (order.couponCode) await prisma.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } });
        if (order.userId) await prisma.notification.create({ data: { userId: order.userId, type: "ORDER_PAID", message: `Payment received for order ${order.orderNumber}` } });
      }
    }

    if ((event.type === "charge.refunded" || event.type === "payment_intent.canceled") && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (order && order.paymentStatus !== "REFUNDED") {
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "REFUNDED", status: "REFUNDED" } });
        await prisma.payment.updateMany({ where: { orderId }, data: { status: "REFUNDED" } });
        // Restore inventory
        for (const it of order.items) {
          if (it.variantId) {
            await prisma.$executeRawUnsafe(`UPDATE "ProductVariant" SET stock = stock + $1 WHERE id = $2`, it.quantity, it.variantId);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  });
}
