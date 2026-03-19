"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  ArrowRightIcon,
} from "./icons";

const footerLinks = {
  shop: [
    { label: "Hair Care", href: "/products?category=hair-care" },
    { label: "Skin Care", href: "/products?category=skin-care" },
    { label: "Beauty Products", href: "/products?category=beauty-products" },
    { label: "Natural Food", href: "/products?category=natural-food" },
    { label: "Wellness", href: "/products?category=wellness" },
  ],
  company: [
    { label: "Radiance Rituals", href: "/radiance-rituals" },
    { label: "About Us", href: "/#about" },
    { label: "Our Philosophy", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
  support: [
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Returns & Refunds", href: "/returns-refunds" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
};

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/svayam_natural",
    icon: InstagramIcon,
  },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "Twitter", href: "#", icon: TwitterIcon },
];

export default function Footer() {
  const pathname = usePathname();
  const isLight = pathname === "/products/chandraprabha-night-nectar";

  return (
    <footer
      className={`relative overflow-hidden ${isLight ? "bg-white" : "bg-forest"}`}
    >
      {/* Top decorative line */}
      <div
        className={`h-[1px] bg-gradient-to-r from-transparent to-transparent ${
          isLight ? "via-neutral-300" : "via-gold/25"
        }`}
      />

      {/* Subtle glow */}
      <div
        className={`pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full blur-[100px] ${
          isLight ? "bg-gold/[0.03]" : "bg-gold/[0.02]"
        }`}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid place-items-center gap-14 text-center md:place-items-start md:grid-cols-2 md:text-left lg:grid-cols-12">
          {/* Brand */}
          <div className="-mt-2 w-full md:-ml-2 lg:col-span-4">
            {isLight ? (
              <div
                className="mx-auto mb-4 h-[12rem] w-[36rem] max-w-full bg-forest md:mx-0"
                style={{
                  maskImage: "url(/Svayam_Logo2.png)",
                  WebkitMaskImage: "url(/Svayam_Logo2.png)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "left center",
                  WebkitMaskPosition: "left center",
                }}
                role="img"
                aria-label="Svayam Natural"
              />
            ) : (
              <Image
                src="/Svayam_Logo2.png"
                alt="Svayam Natural"
                width={550}
                height={192}
                className="mx-auto mb-4 h-[12rem] w-auto max-w-full brightness-0 invert md:mx-0"
              />
            )}
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex w-full flex-col items-center gap-4 md:items-start lg:col-span-2">
              <h3
                className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  isLight ? "text-forest" : "text-gold/70"
                }`}
              >
                {title}
              </h3>
              <ul className="flex flex-col items-center gap-3 md:items-start">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`group inline-flex items-center gap-0 text-sm transition-all duration-300 hover:gap-2 ${
                        isLight
                          ? "text-clay-light hover:text-forest"
                          : "text-sand/35 hover:text-sand/70"
                      }`}
                    >
                      {link.label}
                      <ArrowRightIcon className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter hint */}
          <div className="flex w-full max-w-xs flex-col items-center gap-4 md:max-w-none md:items-start lg:col-span-2">
            <h3
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                isLight ? "text-forest" : "text-gold/70"
              }`}
            >
              Stay Updated
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                isLight ? "text-clay-light" : "text-sand/35"
              }`}
            >
              Be the first to know about new products, rituals, and exclusive
              offers.
            </p>
            <div className="flex w-full">
              <input
                type="email"
                placeholder="Your email"
                className={`w-full rounded-l-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                  isLight
                    ? "border-neutral-300 bg-neutral-100 text-forest placeholder:text-clay-light/60 focus:border-gold/50"
                    : "border-sand/10 bg-sand/[0.04] text-sand/70 placeholder:text-sand/25 focus:border-gold/30"
                }`}
              />
              <button
                className={`flex items-center justify-center rounded-r-lg px-4 transition-colors ${
                  isLight
                    ? "bg-gold/15 text-gold-dark hover:bg-gold/25"
                    : "bg-gold/20 text-gold hover:bg-gold/30"
                }`}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tagline — below grid, wraps on small screens */}
        <p className="mt-14 text-center">
          <span className={`font-accent text-lg italic ${isLight ? "text-clay" : "text-gold/60"}`}>
            Where Nature Meets Tradition
          </span>
          <span className={`mx-2 ${isLight ? "text-clay-light" : "text-sand/35"}`}>—</span>
          <span className={`text-sm leading-relaxed ${isLight ? "text-clay-light" : "text-sand/35"}`}>
            Handcrafted Ayurvedic products made with ethically sourced ingredients, rooted in centuries of Indian wellness wisdom.
          </span>
        </p>

        {/* Social links — centered below tagline */}
        <div className="mt-6 flex justify-center gap-3">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 ${
                isLight
                  ? "border-neutral-300 text-clay-light hover:border-gold/50 hover:text-gold-dark"
                  : "border-sand/10 text-sand/40 hover:border-gold/50 hover:text-gold hover:shadow-[0_4px_20px_rgba(194,162,93,0.15)]"
              }`}
            >
              <social.icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={`border-t ${isLight ? "border-neutral-300" : "border-sand/[0.06]"}`}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-center sm:flex-row lg:px-10">
          <p
            className={`text-xs ${isLight ? "text-clay-light" : "text-sand/25"}`}
          >
            &copy; {new Date().getFullYear()} Svayam Natural. All rights
            reserved.
          </p>
          <p
            className={`text-xs ${isLight ? "text-clay-light/60" : "text-sand/20"}`}
          >
            Crafted with care in India
          </p>
        </div>
      </div>
    </footer>
  );
}
