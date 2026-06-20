"use client";

import { usePathname } from "next/navigation";
import WhatsAppFloat from "./WhatsAppFloat";

export default function ConditionalWhatsAppFloat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/admindev")) {
    return null;
  }
  return <WhatsAppFloat />;
}
