"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  ArrowRightIcon,
} from "./icons";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const footerLinks = {
  shop: [
    { label: "Face", href: "/products?category=face" },
    { label: "Hair Care", href: "/products?category=hair-care" },
    { label: "Body Care", href: "/products?category=body-care" },
    { label: "Eat to Glow", href: "/products?category=food" },
    { label: "Natural Food", href: "/products?category=natural-food" },
    { label: "Svayam Collections", href: "/products?collection=soundarya" },
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

// WhatsApp SVG icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const DEFAULT_SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/svayam_natural", icon: InstagramIcon, configKey: "instagram_url" },
  { label: "Facebook", href: "#", icon: FacebookIcon, configKey: "facebook_url" },
  { label: "Twitter", href: "#", icon: TwitterIcon, configKey: "twitter_url" },
  { label: "WhatsApp", href: "#", icon: WhatsAppIcon, configKey: "whatsapp_group_link" },
];

export default function Footer() {
  const pathname = usePathname();
  const isLight = pathname === "/products/chandraprabha-night-nectar";
  const [socials, setSocials] = useState(DEFAULT_SOCIALS);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/site-config`);
        if (!res.ok) throw new Error('API not available');
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Not JSON');
        const data = await res.json();
        if (data.success) {
          const map = data.data.map;
          setSocials(DEFAULT_SOCIALS.map(s => ({
            ...s,
            href: map[s.configKey] || s.href,
          })));
        }
      } catch { /* keep defaults */ }
    })();
  }, []);

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
        <div className="grid grid-cols-1 gap-y-12 gap-x-8 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex w-full flex-col items-center sm:items-start gap-4">
              <h3
                className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  isLight ? "text-forest" : "text-gold/70"
                }`}
              >
                {title}
              </h3>
              <ul className="flex flex-col items-center sm:items-start gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`group inline-flex items-center gap-0 text-sm py-1.5 transition-all duration-300 hover:gap-2 ${
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
          <div className="flex w-full flex-col items-center sm:items-start gap-4 sm:max-w-none">
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
          {socials.filter(s => s.href && s.href !== '#').map((social) => (
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
