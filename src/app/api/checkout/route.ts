import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { resolveCart, getCartItems } from "@/lib/cart";
import { getCurrentUser } from "@/lib/session";
import { checkoutSchema } from "@/lib/validation";
import { calcShipping, TAX_RATE, generateOrderNumber, SITE } from "@/lib/constants";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
export const dynamic = "force-dynamic";

function computeTotals(subtotal: number, discount: number, shippingMethod: "standard" | "express") {
  const ship = calcShipping(subtotal);
  const shipping = shippingMethod === "express" ? ship.express : ship.standard;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discount + shipping + tax) * 100) / 100);
  return { shipping, tax, total };
}

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const data = parsed.data;

    const { cartId } = await resolveCart();
    const items = await getCartItems(cartId);
    if (!items.length) return fail("Your cart is empty", 422);

    // Validate stock server-side
    for (const it of items) {
      if (it.stock < it.quantity) return fail(`Only ${it.stock} left for ${it.name} (${it.color}/${it.size})`, 422);
    }

    const subtotal = Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;

    // Coupon (re-validated server-side)
    let discount = 0;
    if (data.couponCode) {
      const c = await prisma.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
      if (c && c.active && (!c.expiresAt || c.expiresAt > new Date()) && c.minOrder <= subtotal && (c.maxUses === null || c.usedCount < c.maxUses)) {
        discount = c.type === "PERCENT" ? (subtotal * c.value) / 100 : Math.min(c.value, subtotal);
      } else {
        return fail("Coupon invalid", 422);
      }
      discount = Math.round(discount * 100) / 100;
    }

    const { shipping, tax, total } = computeTotals(subtotal, discount, data.shippingMethod);

    const user = await getCurrentUser();
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber, userId: user?.id ?? null,
        email: data.email, name: data.name, phone: data.phone,
        status: "PENDING", paymentStatus: "PENDING", provider: data.paymentMethod.toUpperCase() as any,
        subtotal, discount, shipping, tax, total, couponCode: data.couponCode?.toUpperCase() || null,
        addressSnapshot: {
          line1: data.address.line1, line2: data.address.line2, city: data.address.city,
          state: data.address.state, postalCode: data.address.postalCode, country: data.address.country
        },
        items: {
          create: items.map((it) => ({
            productId: it.productId, variantId: it.variantId, name: it.name,
            sku: it.variant?.sku ?? "", color: it.color, size: it.size,
            price: it.unitPrice, quantity: it.quantity, image: it.image
          }))
        }
      }
    });

    // Clear cart (reserve is handled on payment success)
    await prisma.cartItem.deleteMany({ where: { cartId } });

    if (data.paymentMethod === "cod") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "CONFIRMED", paymentStatus: "PENDING" } });
      await decrementInventory(items);
      await prisma.payment.create({ data: { orderId: order.id, provider: "COD", providerPaymentId: order.id, amount: total, status: "PENDING", method: "cash_on_delivery" } });
      return ok({ method: "cod", orderId: order.id, orderNumber, total });
    }

    if (data.paymentMethod === "razorpay") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return fail("Razorpay is not configured on this server", 503);
      }
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const rz = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: "INR", receipt: order.orderNumber, notes: { orderId: order.id } })
      });
      const rzData = await rz.json();
      if (!rz.ok) return fail("Could not initiate Razorpay", 502);
      await prisma.payment.create({ data: { orderId: order.id, provider: "RAZORPAY", providerPaymentId: rzData.id, amount: total, status: "PENDING", method: "razorpay" } });
      return ok({ method: "razorpay", orderId: order.id, razorpay: { key: process.env.RAZORPAY_KEY_ID, orderId: rzData.id, amount: rzData.amount, currency: rzData.currency }, total });
    }

    // Default: Stripe (hosted Checkout Session — server-side, verified via webhook)
    if (!isStripeConfigured()) return fail("Stripe is not configured. Use Cash on Delivery for testing.", 503);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(it.unitPrice * 100),
          product_data: { name: `${it.name} (${it.color}/${it.size})` }
        }
      })),
      customer_email: data.email,
      metadata: { orderId: order.id, orderNumber },
      success_url: `${SITE.url}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE.url}/checkout?canceled=true`
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentIntentId: session.id } });
    await prisma.payment.create({ data: { orderId: order.id, provider: "STRIPE", providerPaymentId: session.id, amount: total, status: "PENDING", method: "card" } });
    return ok({ method: "stripe", orderId: order.id, url: session.url, total });
  });
}

export async function decrementInventory(items: { variantId?: string | null; quantity: number }[]) {
  for (const it of items) {
    if (it.variantId) {
      await prisma.$executeRawUnsafe(
        `UPDATE "ProductVariant" SET stock = GREATEST(0, stock - $1) WHERE id = $2`,
        it.quantity, it.variantId
      );
    }
  }
}
