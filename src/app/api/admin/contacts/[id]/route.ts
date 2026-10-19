import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const body = await req.json();
    const updated = await prisma.contactMessage.update({ where: { id: params.id }, data: { resolved: body.resolved ?? false } });
    return ok(updated);
  });
}
