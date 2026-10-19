import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return ok(messages);
  });
}
