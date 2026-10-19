import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const categories = await prisma.category.findMany({
      orderBy: [{ gender: "asc" }, { sortOrder: "asc" }],
      include: { _count: { select: { products: true } } }
    });
    return ok(categories.map((c) => ({ ...c, productCount: c._count.products })));
  });
}
