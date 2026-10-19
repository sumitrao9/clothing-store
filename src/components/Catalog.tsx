"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

export default function Catalog({ categories = [], colors = [], baseGender, baseCategory, baseCollection }: any) {
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [filters, setFilters] = useState({
    gender: baseGender || "",
    category: baseCategory || params.get("category") || "",
    color: "", size: "", minPrice: "", maxPrice: "", q: params.get("q") || "", new: params.get("new") === "true"
  });

  const buildQuery = useCallback(() => {
    const qs = new URLSearchParams();
    if (baseCollection) qs.set("collection", baseCollection);
    if (filters.gender) qs.set("gender", filters.gender);
    if (filters.category) qs.set("category", filters.category);
    if (filters.color) qs.set("color", filters.color);
    if (filters.size) qs.set("size", filters.size);
    if (filters.minPrice) qs.set("minPrice", filters.minPrice);
    if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice);
    if (filters.q) qs.set("q", filters.q);
    if (filters.new) qs.set("new", "true");
    qs.set("sort", sort);
    qs.set("page", String(page));
    return qs.toString();
  }, [filters, sort, page, baseCollection]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/products?${buildQuery()}`);
    const j = await res.json();
    setItems(j?.data?.items || []);
    setTotal(j?.data?.total || 0);
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => { load(); }, [load]);

  const setF = (k: string, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 240px) 1fr", gap: "2.5rem" }} className="catalog-grid">
      <aside style={{ fontSize: "0.85rem" }}>
        <input
          className="field-input"
          placeholder="Search products"
          defaultValue={filters.q}
          onChange={(e) => setF("q", e.target.value)}
          style={{ width: "100%", padding: "0.7rem 1rem", border: "1px solid #ddd5c8", marginBottom: "1.5rem" }}
        />
        <FilterGroup title="Gender">
          {["", "MEN", "WOMEN", "ACCESSORIES", "UNISEX"].map((g) => (
            <label key={g} style={{ display: "flex", gap: "0.5rem", padding: "0.25rem 0", cursor: "pointer" }}>
              <input type="radio" name="gender" checked={filters.gender === g} onChange={() => setF("gender", g)} /> {g || "All"}
            </label>
          ))}
        </FilterGroup>
        <FilterGroup title="Category">
          <label style={{ display: "flex", gap: "0.5rem", padding: "0.25rem 0" }}><input type="radio" name="cat" checked={filters.category === ""} onChange={() => setF("category", "")} /> All</label>
          {categories.map((c: any) => (
            <label key={c.slug} style={{ display: "flex", gap: "0.5rem", padding: "0.25rem 0" }}>
              <input type="radio" name="cat" checked={filters.category === c.slug} onChange={() => setF("category", c.slug)} /> {c.name}
            </label>
          ))}
        </FilterGroup>
        <FilterGroup title="Color">
          <div className="tag-row">
            {colors.map((c: string) => (
              <button key={c} className={`chip ${filters.color === c ? "active" : ""}`} onClick={() => setF("color", filters.color === c ? "" : c)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.toLowerCase(), border: "1px solid #ddd" }} /> {c}
              </button>
            ))}
          </div>
        </FilterGroup>
        <FilterGroup title="Size">
          {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
            <button key={s} className={`chip ${filters.size === s ? "active" : ""}`} onClick={() => setF("size", filters.size === s ? "" : s)} style={{ marginRight: "0.4rem", marginBottom: "0.4rem" }}>{s}</button>
          ))}
        </FilterGroup>
        <FilterGroup title="Price">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input placeholder="Min" value={filters.minPrice} onChange={(e) => setF("minPrice", e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd5c8" }} />
            <input placeholder="Max" value={filters.maxPrice} onChange={(e) => setF("maxPrice", e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd5c8" }} />
          </div>
        </FilterGroup>
        <button className="btn btn-outline" style={{ marginTop: "1rem", width: "100%", fontSize: "0.65rem" }} onClick={() => { setFilters({ gender: "", category: "", color: "", size: "", minPrice: "", maxPrice: "", q: "", new: false }); setPage(1); }}>
          Clear Filters
        </button>
      </aside>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ color: "#8a8278", fontSize: "0.85rem" }}>{total} {total === 1 ? "product" : "products"}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "0.6rem 1rem", border: "1px solid #ddd5c8", background: "#fff" }}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="best_selling">Best Selling</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {loading ? (
          <div className="grid-cols-products">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: "3/4" }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="notice notice-err" style={{ textAlign: "center", padding: "3rem" }}>No products match your filters. Try clearing them.</div>
        ) : (
          <div className="grid-cols-products">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`chip ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </section>
      <style jsx>{`
        @media (max-width: 860px) {
          .catalog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.8rem" }}>
      <h4 className="eyebrow" style={{ marginBottom: "0.8rem", color: "#9c7c4f" }}>{title}</h4>
      {children}
    </div>
  );
}
