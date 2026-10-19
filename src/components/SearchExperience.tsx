"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

export default function SearchExperience() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") || "";
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQ(initial);
    runSearch(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  async function runSearch(term: string) {
    setLoading(true);
    const res = await fetch(`/api/products?q=${encodeURIComponent(term)}&take=24`);
    const j = await res.json();
    setItems(j?.data?.items || []);
    setTotal(j?.data?.total || 0);
    setLoading(false);
    if (term) {
      const s = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const sj = await s.json();
      setSuggestions(sj?.data?.suggestions || []);
    } else {
      const s = await fetch(`/api/search`);
      const sj = await s.json();
      setPopular(sj?.data?.popular || []);
      setSuggestions([]);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q)}`);
    runSearch(q);
  }

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 60 }}>
      <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", textAlign: "center" }}>Search</h1>
      <form onSubmit={submit} style={{ display: "flex", gap: "0.6rem", maxWidth: 560, margin: "1.5rem auto 2rem", flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands, tags…" style={{ flex: 1, minWidth: 240, padding: "0.9rem 1rem", border: "1px solid #ddd5c8" }} />
        <button className="btn btn-dark" type="submit">Search</button>
      </form>

      {!initial && popular.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <p className="eyebrow">Popular Searches</p>
          <div className="tag-row" style={{ justifyContent: "center", marginTop: 10 }}>
            {popular.map((p) => <button key={p} className="chip" onClick={() => { setQ(p); router.push(`/search?q=${encodeURIComponent(p)}`); runSearch(p); }}>{p}</button>)}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <p className="eyebrow">Suggestions</p>
          <div className="tag-row" style={{ marginTop: 10 }}>
            {suggestions.map((s) => (
              <button key={s.slug} className="chip" onClick={() => { setQ(s.name); router.push(`/search?q=${encodeURIComponent(s.name)}`); runSearch(s.name); }}>{s.name}</button>
            ))}
          </div>
        </div>
      )}

      <p style={{ color: "#8a8278", fontSize: "0.85rem", marginBottom: 20 }}>{total} {total === 1 ? "result" : "results"}{initial ? ` for “${initial}”` : ""}</p>

      {loading ? (
        <div className="grid-cols-products">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: "3/4" }} />)}</div>
      ) : items.length === 0 ? (
        <div className="notice notice-err" style={{ textAlign: "center", padding: "3rem" }}>No results found. Try a different term.</div>
      ) : (
        <div className="grid-cols-products">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
