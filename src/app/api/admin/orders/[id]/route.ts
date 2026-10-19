import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true, payments: true, shipments: true, refunds: true, user: { select: { name: true, email: true } } }
    });
    if (!order) return fail("Order not found", 404);
    return ok(order);
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const body = await req.json();
    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.trackingNumber) data.trackingNumber = body.trackingNumber;
    if (body.status === "SHIPPED" && !data.shippedAt) data.shippedAt = new Date();
    if (body.status === "DELIVERED") data.deliveredAt = new Date();
    const updated = await prisma.order.update({ where: { id: params.id }, data });
    if (body.trackingNumber) {
      await prisma.shipment.upsert({
        where: { orderId: params.id },
        update: { trackingNumber: body.trackingNumber, status: "IN_TRANSIT" },
        create: { orderId: params.id, trackingNumber: body.trackingNumber, status: "IN_TRANSIT" }
      });
    }
    return ok(updated);
  });
}
