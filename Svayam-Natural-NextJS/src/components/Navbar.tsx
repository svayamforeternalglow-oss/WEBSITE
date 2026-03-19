"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
    label: "Our Products",
    href: "/products",
    children: [
      { label: "Hair Care", href: "/products?category=hair-care" },
      { label: "Skin Care", href: "/products?category=skin-care" },
      { label: "Beauty", href: "/products?category=beauty-products" },
      { label: "Natural Food", href: "/products?category=natural-food" },
      { label: "Wellness", href: "/products?category=wellness" },
      { label: "All Products", href: "/products" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const hasDarkHero =
    pathname === "/" || pathname === "/products/chandraprabha-night-nectar";
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const { isAuthenticated, username, logout } = useAuthStore();

  const solid = !hasDarkHero || scrolled;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
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
        {/* Logo — left-aligned on mobile, proper tap target */}
        <Link href="/" className="flex min-h-[44px] flex-shrink-0 items-center" aria-label="Svayam Natural - Home">
          <Image
            src="/Svayam_Logo4.png"
            alt=""
            width={420}
            height={147}
            className="h-10 w-auto max-w-[180px] transition-all duration-300 sm:h-12 sm:max-w-[220px] lg:h-[6rem] lg:max-w-none"
            priority
          />
        </Link>

        {/* Desktop Nav — centered */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li
              key={link.href}
              className="relative"
              onMouseEnter={link.children ? handleDropdownEnter : undefined}
              onMouseLeave={link.children ? handleDropdownLeave : undefined}
            >
              <Link
                href={link.href}
                className={`group relative flex items-center gap-1 rounded-lg px-4 py-2 text-[13px] font-medium tracking-[0.06em] transition-all duration-300 ${
                  solid
                    ? "text-forest/60 hover:text-forest"
                    : "text-sand/70 hover:text-sand"
                }`}
              >
                {link.label}
                {link.children && (
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
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
                  className={`absolute left-0 top-full pt-2 transition-all duration-200 ${
                    dropdownOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  }`}
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
            {mounted && wishlistCount > 0 && (
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
            {mounted && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-forest">
                {itemCount}
              </span>
            )}
          </button>
          
          {isAuthenticated ? (
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

        {/* Mobile Toggle */}
        <button
          className="relative flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <div className="flex w-5 flex-col items-end gap-[5px]">
            <span
              className={`h-[1.5px] transition-all duration-300 ${
                solid ? "bg-forest" : "bg-gold"
              } ${mobileOpen ? "w-5 translate-y-[6.5px] rotate-45" : "w-5"}`}
            />
            <span
              className={`h-[1.5px] w-3.5 transition-all duration-300 ${
                solid ? "bg-forest" : "bg-gold"
              } ${mobileOpen ? "w-0 opacity-0" : ""}`}
            />
            <span
              className={`h-[1.5px] transition-all duration-300 ${
                solid ? "bg-forest" : "bg-gold"
              } ${mobileOpen ? "w-5 -translate-y-[6.5px] -rotate-45" : "w-4"}`}
            />
          </div>
        </button>
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
            <div key={link.href} className="flex flex-col items-center">
              {link.children ? (
                <>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
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
                      className={`h-4 w-4 transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`}
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
                      mobileProductsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
            <div className="flex items-center gap-4">
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold transition-all hover:bg-gold hover:text-forest"
                aria-label="Wishlist"
              >
                <HeartIcon className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-forest">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => { setMobileOpen(false); openCart(); }}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold transition-all hover:bg-gold hover:text-forest"
                aria-label="Cart"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-forest">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
            
            {isAuthenticated ? (
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
