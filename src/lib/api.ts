import { NextResponse } from "next/server";

export function ok(data: any, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400, extra?: any) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function handle(fn: () => Promise<any>) {
  try {
    return await fn();
  } catch (err: any) {
    const msg = err?.message || "Something went wrong";
    if (msg === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (msg === "FORBIDDEN") return fail("Admin access required", 403);
    if (msg.includes("Unique constraint") || msg.includes("unique")) return fail("Already exists", 409);
    console.error("[api error]", err);
    return fail(msg, 500);
  }
}
