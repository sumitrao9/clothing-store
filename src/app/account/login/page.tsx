"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const j = await res.json();
      if (!j.ok) { setError(j.error); setLoading(false); return; }
    }
    const r = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (r?.error) setError("Invalid email or password");
    else router.push("/account");
  }

  return (
    <div className="container" style={{ paddingTop: 140, paddingBottom: 80, maxWidth: 440 }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <p className="eyebrow">{mode === "login" ? "Welcome Back" : "Join Maison"}</p>
        <h1 style={{ fontSize: "2.2rem" }}>{mode === "login" ? "Sign In" : "Create Account"}</h1>
      </div>
      <form onSubmit={onSubmit} className="card" style={{ padding: "2rem" }}>
        {mode === "register" && (
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} required={mode === "register"} /></div>
        )}
        <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
        <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
        {error && <div className="notice notice-err" style={{ marginBottom: "1rem" }}>{error}</div>}
        <button className="btn btn-dark btn-block" type="submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}</button>
      </form>

      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <button className="btn btn-outline btn-block" style={{ marginTop: "0.8rem" }} onClick={() => signIn("google", { callbackUrl: "/account" })}>Continue with Google</button>
      )}

      <p style={{ textAlign: "center", marginTop: "1.4rem", fontSize: "0.88rem", color: "#8a8278" }}>
        {mode === "login" ? "New here? " : "Already have an account? "}
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ background: "none", border: "none", color: "#9c7c4f", textDecoration: "underline", cursor: "pointer" }}>
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
