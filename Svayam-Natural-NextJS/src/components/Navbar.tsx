"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBagIcon, UserIcon, HeartIcon } from "./icons";
import { useCartStore } from "@/lib/cart";
import { useWishlistStore } from "@/lib/wishlist";
import { useAuthStore } from "@/lib/auth";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

const navLinks: NavItem[] = [
  { label: "Radiance Rituals", href: "/radiance-rituals" },
  {
    label: "Categories",
    href: "/products",
    children: [
      { label: "All Products", href: "/products" },
      { label: "Best Selling Kits", href: "/products?category=kits" },
      { label: "Face", href: "/products?category=face" },
      { label: "Lip Balm", href: "/products?category=lip-balm" },
      { label: "Hair Care", href: "/products?category=hair-care" },
      { label: "Body Care", href: "/products?category=body-care" },
      { label: "Eat to Glow", href: "/products?category=food" },
      { label: "Detox", href: "/products?category=detox" },
      { label: "Natural Food", href: "/products?category=natural-food" },
    ],
  },
  {
    label: "Svayam Collections",
    href: "/products",
    children: [
      { label: "Svayam Soundarya", href: "/products?collection=soundarya" },
      { label: "Svayam Swasthya", href: "/products?collection=swasthya" },
    ],
  },
  {
    label: "Explore Products",
    href: "/products",
    children: [
      { label: "Kesh Samraksha", href: "/products/kesh-samraksha" },
      { label: "Hibiscus Hair Gel", href: "/products/hibiscus-hair-gel" },
      { label: "Lavanyam Face Pack", href: "/products/lavanyam-facepack" },
      { label: "Suryakanti Day Cream", href: "/products/suryakanti-day-cream" },
      { label: "Chandraprabha Night Nectar", href: "/products/chandraprabha-night-nectar" },
      { label: "Gentle Body Lotion", href: "/products/glowup-night-gel" },
      { label: "Rose Lip Balm", href: "/products/rose-lip-balm" },
      { label: "Tejasamrit Ritual", href: "/products/tejasamrit" },
      { label: "Triphala Detox Tea", href: "/products/triphala-detox" },
      { label: "Gulkand Preserve", href: "/products/gulkand" },
      { label: "Abhyanga Udvartana", href: "/products/abhyanga-udvartana" },
    ],
  },
];

type PersistHydrationStore = {
  persist?: {
    hasHydrated?: () => boolean;
    onFinishHydration?: (listener: () => void) => () => void;
  };
};

const subscribeHydration = (store: PersistHydrationStore, listener: () => void) => {
  return store.persist?.onFinishHydration?.(listener) ?? (() => {});
};

const getHydrationSnapshot = (store: PersistHydrationStore) => {
  return store.persist?.hasHydrated?.() ?? true;
};

const getHydrationServerSnapshot = () => false;

const useStoreHydrated = (store: PersistHydrationStore) => {
  return useSyncExternalStore(
    (listener) => subscribeHydration(store, listener),
    () => getHydrationSnapshot(store),
    getHydrationServerSnapshot
  );
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const { isAuthenticated, username, logout } = useAuthStore();
  const cartHydrated = useStoreHydrated(useCartStore as unknown as PersistHydrationStore);
  const wishlistHydrated = useStoreHydrated(useWishlistStore as unknown as PersistHydrationStore);
  const authHydrated = useStoreHydrated(useAuthStore as unknown as PersistHydrationStore);
  const showCartCount = cartHydrated && itemCount > 0;
  const showWishlistCount = wishlistHydrated && wishlistCount > 0;
  const showAuthenticatedMenu = authHydrated && isAuthenticated;
  const mobileProfileHref = showAuthenticatedMenu ? "/my-orders" : "/login";

  // Since Navbar is 'sticky' and takes up flow space rather than overlapping absolute heroes,
  // it should always be solid to guarantee text contrast against the page background.
  const solid = true;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={`sticky inset-x-0 top-0 z-50 transition-all duration-500 ${
        mobileOpen
          ? "bg-forest"
          : solid
          ? "bg-white/[0.97] shadow-[0_1px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      {/* Top accent line */}
      <div
        className={`h-[1px] transition-opacity duration-500 ${
          solid
            ? "bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-100"
            : "bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-100"
        }`}
      />

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-5 lg:px-8 lg:py-0.5">
        {/* Mobile Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="relative flex h-10 w-10 items-center justify-center -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <div className="flex w-5 flex-col items-start gap-[5px]">
              <span className={`h-[1.5px] transition-all duration-300 ${solid ? "bg-forest" : "bg-gold"} ${mobileOpen ? "w-5 translate-y-[6.5px] rotate-45" : "w-5"}`} />
              <span className={`h-[1.5px] transition-all duration-300 ${solid ? "bg-forest" : "bg-gold"} ${mobileOpen ? "w-0 opacity-0" : "w-4"}`} />
              <span className={`h-[1.5px] transition-all duration-300 ${solid ? "bg-forest" : "bg-gold"} ${mobileOpen ? "w-5 -translate-y-[6.5px] -rotate-45" : "w-3"}`} />
            </div>
          </button>

          <Link href="/" className="flex min-h-[40px] items-center gap-1.5" aria-label="Svayam Natural - Home">
            <Image
              src="/Svayam_Logo4.png"
              alt=""
              width={140}
              height={49}
              className="h-7 w-auto transition-all duration-300"
              priority
            />
            <span className={`block font-heading text-[16px] font-bold tracking-wider ${solid ? 'text-forest' : 'text-sand'}`}>
              Svayam Natural
            </span>
          </Link>
        </div>

        {/* Desktop Logo */}
        <Link href="/" className="hidden lg:flex min-h-[44px] flex-shrink-0 items-center gap-2" aria-label="Svayam Natural - Home">
          <Image
            src="/Svayam_Logo4.png"
            alt=""
            width={420}
            height={147}
            className="h-12 w-auto max-w-none"
            priority
          />
          <span className={`block font-heading text-xl font-bold tracking-wider ${solid ? 'text-forest' : 'text-sand'}`}>
            Svayam Natural
          </span>
        </Link>

        {/* Desktop Nav — centered */}
        <ul className="hidden flex-1 items-center justify-center gap-1 px-4 lg:flex">
          {navLinks.map((link) => (
            <li
              key={link.label}
              className="group relative"
            >
              <Link
                href={link.href}
                className={`relative flex items-center gap-1 rounded-lg px-4 py-2 text-[13px] font-medium tracking-[0.06em] transition-all duration-300 ${
                  solid
                    ? "text-forest/60 hover:text-forest"
                    : "text-sand/70 hover:text-sand"
                }`}
              >
                {link.label}
                {link.children && (
                  <svg
                    className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
                <span
                  className={`absolute inset-x-2 -bottom-0.5 h-[1.5px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                    solid
                      ? "bg-gradient-to-r from-gold-dark to-gold"
                      : "bg-gradient-to-r from-gold to-gold-light"
                  }`}
                />
              </Link>

              {/* Dropdown */}
              {link.children && (
                <div
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-200 pointer-events-none translate-y-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <div className="min-w-[200px] rounded-xl border border-neutral-300 bg-white/[0.98] py-2 shadow-[0_12px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="group/item flex items-center gap-2 px-5 py-2.5 text-[13px] text-forest/60 transition-all duration-200 hover:bg-gold/[0.04] hover:text-forest"
                      >
                        <span className="h-1 w-1 rounded-full bg-gold/0 transition-all duration-200 group-hover/item:bg-gold" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/wishlist"
            className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              solid
                ? "text-forest/50 hover:bg-forest/[0.04] hover:text-gold-dark"
                : "text-sand/60 hover:bg-sand/[0.06] hover:text-gold"
            }`}
            aria-label="Wishlist"
          >
            <HeartIcon className="h-5 w-5" />
            {showWishlistCount && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-forest">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            onClick={openCart}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              solid
                ? "text-forest/50 hover:bg-forest/[0.04] hover:text-gold-dark"
                : "text-sand/60 hover:bg-sand/[0.06] hover:text-gold"
            }`}
            aria-label="Cart"
          >
            <ShoppingBagIcon className="h-[22px] w-[22px]" />
            {showCartCount && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-forest">
                {itemCount}
              </span>
            )}
          </button>
          
          {showAuthenticatedMenu ? (
            <div className="flex items-center gap-4">
              <span className={`text-[12px] font-medium tracking-wider ${solid ? "text-forest" : "text-sand"}`}>
                Hi, {username}
              </span>
              <div className="group relative">
                <Link
                  href="/my-orders"
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] transition-all duration-300 ${
                    solid
                      ? "border-forest/20 text-forest hover:bg-forest/5"
                      : "border-gold/40 text-gold hover:bg-gold/10"
                  }`}
                >
                  My Orders
                </Link>
              </div>
              <button
                onClick={logout}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] transition-all duration-300 ${
                  solid
                    ? "border-forest/20 text-forest hover:bg-forest hover:text-sand"
                    : "border-gold/40 text-gold hover:bg-gold hover:text-forest"
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`ml-2 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[12px] font-semibold tracking-[0.1em] transition-all duration-300 ${
                solid
                  ? "border-forest/20 text-forest hover:border-forest hover:bg-forest hover:text-sand"
                  : "border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-forest"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Right Actions */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/products" className={`relative flex h-8 w-8 items-center justify-center transition-all ${solid ? "text-forest/80" : "text-sand/90"}`} aria-label="Search">
            <svg className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </Link>

          <Link href="/wishlist" className={`relative flex h-8 w-8 items-center justify-center transition-all ${solid ? "text-forest/80" : "text-sand/90"}`} aria-label="Wishlist">
            <HeartIcon className="h-[20px] w-[20px]" />
            {showWishlistCount && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-forest">{wishlistCount}</span>
            )}
          </Link>

          <button onClick={openCart} className={`relative flex h-8 w-8 items-center justify-center transition-all ${solid ? "text-forest/80" : "text-sand/90"}`} aria-label="Cart">
            <ShoppingBagIcon className="h-[20px] w-[20px]" />
            {showCartCount && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-forest">{itemCount}</span>
            )}
          </button>
          
          <Link href={mobileProfileHref} className={`relative flex h-8 w-8 items-center justify-center transition-all ${solid ? "text-forest/80" : "text-sand/90"}`} aria-label="Profile">
            <UserIcon className="h-[20px] w-[20px]" />
          </Link>
        </div>
      </nav>

      {/* Mobile Menu — full-screen overlay, logo in same place (white washed) */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-forest/[0.98] backdrop-blur-2xl transition-all duration-500 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Header: logo (same position as navbar) + close */}
        <div className="flex flex-shrink-0 items-center justify-between px-4 py-2 sm:px-5">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex min-h-[44px] flex-shrink-0 items-center">
            <Image
              src="/Svayam_Logo4.png"
              alt=""
              width={420}
              height={147}
              className="h-10 w-auto max-w-[180px] brightness-0 invert sm:h-12 sm:max-w-[220px]"
            />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gold hover:bg-gold/10"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 pb-20">
          {navLinks.map((link, i) => (
            <div key={link.label} className="flex flex-col items-center">
              {link.children ? (
                <>
                  <button
                    onClick={() => setOpenSubmenu(openSubmenu === link.label ? null : link.label)}
                    className="flex items-center gap-2 py-3 text-center text-lg font-medium tracking-[0.1em] text-sand/70 transition-all duration-300 hover:text-gold"
                    style={{
                      transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms",
                      opacity: mobileOpen ? 1 : 0,
                      transform: mobileOpen
                        ? "translateY(0)"
                        : "translateY(12px)",
                    }}
                  >
                    {link.label}
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === link.label ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div
                    className={`flex flex-col items-center gap-0.5 overflow-hidden transition-all duration-300 ${
                      openSubmenu === link.label ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="py-2 text-center text-sm tracking-[0.08em] text-sand/50 transition-all duration-200 hover:text-gold"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-center text-lg font-medium tracking-[0.1em] text-sand/70 transition-all duration-300 hover:text-gold"
                  style={{
                    transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms",
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen
                      ? "translateY(0)"
                      : "translateY(12px)",
                  }}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
          <div className="mt-6 flex flex-col items-center gap-4">
            {showAuthenticatedMenu ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-medium tracking-wider text-sand">
                  Hi, {username}
                </span>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="rounded-full border border-gold/40 px-8 py-2 text-xs font-semibold tracking-widest text-gold transition-all hover:bg-gold hover:text-forest"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold tracking-wider text-forest"
              >
                <UserIcon className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
