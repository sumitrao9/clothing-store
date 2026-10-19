import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const body = await req.json();
    const data: any = {};
    if (body.active !== undefined) data.active = body.active;
    if (body.value !== undefined) data.value = body.value;
    const updated = await prisma.coupon.update({ where: { id: params.id }, data });
    return ok(updated);
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    await prisma.coupon.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  });
}
