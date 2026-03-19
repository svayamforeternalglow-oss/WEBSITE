"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/admindev")) {
    return null;
  }
  return <Navbar />;
}
