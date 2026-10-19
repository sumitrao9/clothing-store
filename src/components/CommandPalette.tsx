"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "./StoreProvider";

export default function CommandPalette() {
  const { paletteOpen, closePalette } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paletteOpen) return;
    setQ(""); setResults([]);
  }, [paletteOpen]);

  useEffect(() => {
    if (!paletteOpen || q.trim().length === 0) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&take=6`);
      const j = await res.json();
      setResults(j?.data?.items || []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, paletteOpen]);

  function go(href: string) { closePalette(); router.push(href); }

  const links = [
    { label: "Shop All", href: "/products" },
    { label: "New Arrivals", href: "/products?new=true" },
    { label: "Trousers", href: "/products?q=trousers" },
    { label: "Tees", href: "/products?q=tshirt" },
    { label: "Jackets", href: "/products?q=jacket" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
    { label: "Account", href: "/account" }
  ];

  return (
    <>
      <div className={`modal-scrim ${paletteOpen ? "show" : ""}`} onClick={closePalette} />
      <div className={`modal palette ${paletteOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="palette-input">
          <span style={{ color: "var(--muted)", marginRight: "0.5rem" }}>⌕</span>
          <input autoFocus={paletteOpen} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or jump to…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "1rem", color: "var(--ink)" }} />
          <kbd style={{ fontSize: "0.7rem", color: "var(--muted)", border: "1px solid var(--line)", padding: "0.1rem 0.4rem", borderRadius: 6 }}>ESC</kbd>
        </div>
        <div className="palette-body">
          {q.trim() === "" && (
            <div className="palette-section">
              <p className="eyebrow" style={{ margin: "0.5rem 0.25rem" }}>Quick Links</p>
              {links.map((l) => (
                <button key={l.href} className="palette-row" onClick={() => go(l.href)}>
                  <span>{l.label}</span><span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>→</span>
                </button>
              ))}
            </div>
          )}
          {q.trim() !== "" && (
            <div className="palette-section">
              <p className="eyebrow" style={{ margin: "0.5rem 0.25rem" }}>{loading ? "Searching…" : `Results (${results.length})`}</p>
              {results.map((p) => (
                <button key={p.id} className="palette-row" onClick={() => go(`/product/${p.slug}`)}>
                  <Image src={p.image || ""} alt="" width={36} height={44} style={{ objectFit: "cover", borderRadius: 6 }} />
                  <span style={{ flex: 1, textAlign: "left" }}>{p.name}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>${p.price?.toFixed(2)}</span>
                </button>
              ))}
              {!loading && results.length === 0 && <p style={{ padding: "1rem", color: "var(--muted)" }}>No matches.</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
