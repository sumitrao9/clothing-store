"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStore } from "./StoreProvider";

const MENUS = [
  { label: "New Arrivals", href: "/products?new=true" },
  { label: "Men", href: "/categories/men" },
  { label: "Women", href: "/categories/women" },
  { label: "Collections", href: "/collections" },
  { label: "Clothing", href: "/products" },
  { label: "Accessories", href: "/categories/accessories" },
  { label: "Sale", href: "/products?sort=price_asc" }
];

const MEGA: Record<string, { heading: string; links: { label: string; href: string }[] }[]> = {
  Clothing: [
    { heading: "Shop", links: [{ label: "All Clothing", href: "/products" }, { label: "New Arrivals", href: "/products?new=true" }, { label: "Best Sellers", href: "/products?sort=best_selling" }, { label: "Sale", href: "/products?sort=price_asc" }] },
    { heading: "Essentials", links: [{ label: "Trousers", href: "/products?q=trousers" }, { label: "Tees", href: "/products?q=tshirt" }, { label: "Shirts", href: "/products?q=shirt" }, { label: "Jackets", href: "/products?q=jacket" }] }
  ],
  Men: [{ heading: "Men", links: [{ label: "All Men", href: "/categories/men" }, { label: "Trousers", href: "/products?q=trousers" }, { label: "Tees", href: "/products?q=tshirt" }, { label: "Jackets", href: "/products?q=jacket" }] }],
  Women: [{ heading: "Women", links: [{ label: "All Women", href: "/categories/women" }, { label: "Tees", href: "/products?q=tshirt" }, { label: "Shirts", href: "/products?q=shirt" }, { label: "Jackets", href: "/products?q=jacket" }] }],
  Collections: [{ heading: "Collections", links: [{ label: "All Collections", href: "/collections" }, { label: "Summer 26", href: "/collections/summer-26" }] }]
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mega, setMega] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount, wishlistCount, openCart, openPalette } = useStore();

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setShowTop(y > 500);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobile(false); setMega(null); }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <header
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        style={{ background: scrolled ? "" : "transparent" }}
        onMouseLeave={() => setMega(null)}
      >
        <div className="announce">Wholesale daily-wear&nbsp;·&nbsp;Trousers, Tees, Shirts &amp; Jackets — <a href="/products">Browse the line</a></div>
        <div className="container nav-inner">
          <button className="mobile-toggle" aria-label="Menu" style={{ display: "none", background: "none", border: "none", color: "#f7f4ef", fontSize: "1.4rem" }} onClick={() => setMobile((v) => !v)}>☰</button>
          <Link href="/" className="logo" style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", letterSpacing: "0.3em", color: "#f7f4ef" }}>MAISON</Link>

          <nav className="nav-links" style={mobile ? { display: "flex", position: "absolute", top: "100%", left: 0, right: 0, flexDirection: "column", background: "#0a0a0a", padding: "1.5rem" } : undefined}>
            {MENUS.map((m) => (
              <Link key={m.href} href={m.href}
                onMouseEnter={() => MEGA[m.label] && setMega(m.label)}>{m.label}</Link>
            ))}
          </nav>

          <div className="nav-actions" style={{ display: "flex", gap: "1.1rem", alignItems: "center" }}>
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: "none", border: "none", color: "#f7f4ef", fontSize: "1rem", cursor: "pointer" }}>{theme === "dark" ? "☀" : "☾"}</button>
            <button onClick={openPalette} aria-label="Search" style={{ background: "none", border: "none", color: "#f7f4ef", fontSize: "1rem", cursor: "pointer" }}>⌕</button>
            <Link href="/wishlist" aria-label="Wishlist" style={{ color: "#f7f4ef", fontSize: "1rem", position: "relative" }}>
              ♡{wishlistCount > 0 && <span style={{ position: "absolute", top: -8, right: -10, background: "var(--accent)", color: "#0a0a0a", fontSize: "0.6rem", borderRadius: "50%", padding: "0 4px" }}>{wishlistCount}</span>}
            </Link>
            <Link href="/account" aria-label="Account" style={{ color: "#f7f4ef", fontSize: "1rem" }}>{session ? "◍" : "⊕"}</Link>
            <button onClick={openCart} aria-label="Cart" style={{ background: "none", border: "none", color: "#f7f4ef", fontSize: "1rem", position: "relative", cursor: "pointer" }}>
              ⧉{cartCount > 0 && <span style={{ position: "absolute", top: -8, right: -10, background: "var(--accent)", color: "#0a0a0a", fontSize: "0.6rem", borderRadius: "50%", padding: "0 4px" }}>{cartCount}</span>}
            </button>
          </div>
        </div>

        {mega && MEGA[mega] && (
          <div className="mega" onMouseEnter={() => setMega(mega)}>
            <div className="container" style={{ display: "flex", gap: "3rem", padding: "1.6rem 0" }}>
              {MEGA[mega].map((col) => (
                <div key={col.heading}>
                  <p className="eyebrow" style={{ color: "var(--accent)", marginBottom: "0.7rem" }}>{col.heading}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {col.links.map((l) => <Link key={l.href} href={l.href} onClick={() => setMega(null)} style={{ fontSize: "0.95rem", color: "var(--ivory)" }}>{l.label}</Link>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <style jsx>{`
          @media (max-width: 880px) {
            .mobile-toggle { display: block !important; }
            :global(.nav-links) { display: none !important; }
            :global(.mega) { display: none !important; }
          }
        `}</style>
      </header>
      <button className={`back-to-top ${showTop ? "show" : ""}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </>
  );
}
