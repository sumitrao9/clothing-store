import { prisma } from "@/lib/prisma";
import { ok, fail, handle } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.errors[0].message, 422);
    const { name, email, phone, subject, message } = parsed.data;
    await prisma.contactMessage.create({ data: { name, email, phone, subject, message } });
    return ok({ received: true });
  });
}
