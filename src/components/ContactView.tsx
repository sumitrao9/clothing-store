"use client";

import { useState } from "react";

export default function ContactView() {
  const [msg, setMsg] = useState("");
  const [cls, setCls] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const res = await fetch("/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), subject: fd.get("subject"), message: fd.get("message") })
    });
    setMsg(res.ok ? "Thank you — we'll be in touch shortly." : "Please fill in all required fields.");
    setCls(res.ok ? "notice notice-ok" : "notice notice-err");
    if (res.ok) (e.currentTarget as HTMLFormElement).reset();
  }
  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}><p className="eyebrow">Say Hello</p><h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}>Contact Us</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }} className="contact-grid">
        <form onSubmit={submit}>
          <div className="field"><label>Name</label><input name="name" required /></div>
          <div className="field"><label>Email</label><input type="email" name="email" required /></div>
          <div className="field"><label>Phone</label><input name="phone" /></div>
          <div className="field"><label>Subject</label><input name="subject" required /></div>
          <div className="field"><label>Message</label><textarea name="message" rows={5} required /></div>
          <button className="btn btn-dark" type="submit">Send Message</button>
          {msg && <div className={cls} style={{ marginTop: "1rem" }}>{msg}</div>}
        </form>
        <div>
          <h4 className="eyebrow" style={{ color: "#9c7c4f" }}>Studio</h4>
          <p style={{ fontSize: "1.1rem", fontFamily: "var(--font-serif)" }}>412 Atelier Lane, Bandra West, Mumbai 400050</p>
          <p style={{ color: "#8a8278", marginTop: "0.5rem" }}>+91 22 0000 0000<br />hello@maison-atelier.com</p>
          <h4 className="eyebrow" style={{ color: "#9c7c4f", marginTop: "1.5rem" }}>Hours</h4>
          <p style={{ color: "#8a8278" }}>Mon–Sat: 10:00 AM – 8:00 PM<br />Sun: 11:00 AM – 6:00 PM</p>
          <div style={{ marginTop: "1.5rem" }}>
            <iframe title="Map" src="https://www.openstreetmap.org/export/embed.html?bbox=72.82%2C19.05%2C72.84%2C19.07&layer=mapnik" style={{ width: "100%", height: 240, border: 0, filter: "grayscale(0.3)" }} loading="lazy" />
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 760px) { .contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
