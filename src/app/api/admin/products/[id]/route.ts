import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    const body = await req.json();
    const data: any = {};
    for (const k of ["name", "description", "brand", "basePrice", "gender", "categoryId", "collectionId", "material", "care", "tags", "isActive", "isFeatured", "isBestSeller", "isNew", "isTrending", "isLimited"]) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    const updated = await prisma.product.update({ where: { id: params.id }, data });
    return ok(updated);
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    await requireAdmin();
    await prisma.product.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  });
}
