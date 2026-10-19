import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const collections = await prisma.collection.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } }
    });
    return ok(collections.map((c) => ({ ...c, productCount: c._count.products })));
  });
}
