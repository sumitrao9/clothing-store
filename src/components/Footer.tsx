import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#0a0a0a", color: "#8a8278", paddingTop: "4rem", paddingBottom: "2rem", marginTop: "4rem" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", letterSpacing: "0.3em", color: "#f7f4ef" }}>MAISON</div>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", maxWidth: "260px" }}>Contemporary clothing designed for people who refuse ordinary.</p>
        </div>
        <div>
          <h5 className="eyebrow" style={{ color: "#c4a878" }}>Shop</h5>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            <Link href="/categories/men">Men</Link>
            <Link href="/categories/women">Women</Link>
            <Link href="/categories/accessories">Accessories</Link>
            <Link href="/products?new=true">New Arrivals</Link>
            <Link href="/collections">Collections</Link>
          </div>
        </div>
        <div>
          <h5 className="eyebrow" style={{ color: "#c4a878" }}>Company</h5>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/account/orders">Orders</Link>
            <Link href="/lookbook">Lookbook</Link>
          </div>
        </div>
        <div>
          <h5 className="eyebrow" style={{ color: "#c4a878" }}>Stay Close</h5>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>Instagram · Pinterest · TikTok</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>hello@maison-atelier.com</p>
        </div>
      </div>
      <hr className="line" style={{ margin: "2.5rem auto", width: "92vw", background: "#222" }} />
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", fontSize: "0.78rem" }}>
        <span>© {new Date().getFullYear()} Maison Atelier. All rights reserved.</span>
        <span style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
