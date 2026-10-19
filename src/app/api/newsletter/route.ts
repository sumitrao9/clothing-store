import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { z } from "zod";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail("Invalid email", 422);
    const email = parsed.data.email.toLowerCase();
    await prisma.newsletter.upsert({
      where: { email },
      update: { active: true },
      create: { email }
    });
    return ok({ subscribed: true });
  });
}
