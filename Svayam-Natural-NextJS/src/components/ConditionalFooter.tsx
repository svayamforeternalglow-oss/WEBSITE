"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/admindev")) {
    return null;
  }

  const isChandraprabhaPage = pathname?.startsWith("/products/chandraprabha-night-nectar");

  return <Footer variant={isChandraprabhaPage ? "light" : "forest"} />;
}
