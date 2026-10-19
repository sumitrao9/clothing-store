"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./StoreProvider";

export default function MobileTabBar() {
  const pathname = usePathname();
  const { cartCount, wishlistCount, openPalette } = useStore();
  const cls = (href: string) => (pathname === href ? "mtab active" : "mtab");
  return (
    <nav className="mobile-tabbar">
      <Link href="/" className={cls("/")}><span>⌂</span><small>Home</small></Link>
      <button className="mtab" onClick={openPalette}><span>⌕</span><small>Search</small></button>
      <Link href="/wishlist" className={cls("/wishlist")}><span>♡{wishlistCount > 0 ? `(${wishlistCount})` : ""}</span><small>Wish</small></Link>
      <Link href="/cart" className={cls("/cart")}><span>⧉{cartCount > 0 ? `(${cartCount})` : ""}</span><small>Bag</small></Link>
      <Link href="/account" className={cls("/account")}><span>◍</span><small>Me</small></Link>
    </nav>
  );
}
