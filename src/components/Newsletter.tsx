"use client";

import { useState } from "react";

export default function Newsletter() {
  const [note, setNote] = useState("");
  const [cls, setCls] = useState("");

  return (
    <>
      <form
        style={{ display: "flex", gap: "0.6rem", maxWidth: 460, margin: "1.8rem auto 0", flexWrap: "wrap" }}
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email") }) });
          setNote(res.ok ? "Thank you — you're in." : "Please enter a valid email.");
          setCls(res.ok ? "notice notice-ok" : "notice notice-err");
        }}
      >
        <input name="email" type="email" required placeholder="Your email" style={{ flex: 1, minWidth: 220, padding: "0.9rem 1rem", border: "1px solid #ddd5c8" }} />
        <button className="btn btn-dark" type="submit">Subscribe</button>
      </form>
      {note && <div className={cls} style={{ maxWidth: 460, margin: "0.8rem auto 0" }}>{note}</div>}
    </>
  );
}
