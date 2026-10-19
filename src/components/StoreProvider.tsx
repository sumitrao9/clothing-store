"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SessionProvider } from "next-auth/react";
import CartDrawer from "./CartDrawer";
import QuickViewModal from "./QuickView";
import CommandPalette from "./CommandPalette";
import MobileTabBar from "./MobileTabBar";

type Toast = { id: number; msg: string; type: "ok" | "err" };
type StoreCtx = {
  cartCount: number;
  wishlistCount: number;
  refresh: () => void;
  addToCart: (p: { productId: string; variantId?: string; size?: string; color?: string; quantity?: number }) => Promise<any>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  // UI state
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  quickView: any;
  openQuickView: (p: any) => void;
  closeQuickView: () => void;
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  toasts: Toast[];
  toast: (msg: string, type?: "ok" | "err") => void;
};

const Ctx = createContext<StoreCtx | null>(null);

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<any>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [c, w] = await Promise.all([
        fetch("/api/cart").then((r) => r.json()),
        fetch("/api/wishlist").then((r) => r.json()).catch(() => ({ data: { count: 0 } }))
      ]);
      setCartCount(c?.data?.count ?? 0);
      setWishlistCount(w?.data?.count ?? 0);
    } catch {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback(async (p: any) => {
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    await refresh();
    setCartOpen(true);
    const j = await res.json();
    toast(j?.ok ? "Added to bag" : (j?.error || "Could not add"), j?.ok ? "ok" : "err");
    return j;
  }, [toast, refresh]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const j = await res.json();
    await refresh();
    return Boolean(j?.data?.added);
  }, [refresh]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openQuickView = useCallback((p: any) => setQuickView(p), []);
  const closeQuickView = useCallback(() => setQuickView(null), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Global shortcut: Cmd/Ctrl+K opens palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (e.key === "Escape") { setPaletteOpen(false); setCartOpen(false); setQuickView(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value: StoreCtx = {
    cartCount, wishlistCount, refresh, addToCart, toggleWishlist,
    cartOpen, openCart, closeCart, quickView, openQuickView, closeQuickView,
    paletteOpen, openPalette, closePalette, toasts, toast
  };

  return (
    <SessionProvider>
      <Ctx.Provider value={value}>
        {children}
        <Toasts toasts={toasts} />
        <CartDrawer />
        <QuickViewModal />
        <CommandPalette />
        <MobileTabBar />
      </Ctx.Provider>
    </SessionProvider>
  );
}

function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
