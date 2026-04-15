import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import CartDrawer from "@/components/CartDrawer";
import ToastContainer from "@/components/Toast";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import TopBanner from "@/components/TopBanner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Svayam Natural — Premium Ayurvedic Beauty & Wellness",
    template: "%s | Svayam Natural",
  },
  description:
    "Discover handcrafted Ayurvedic beauty, skincare, and wellness products made with nature's finest ingredients. Premium quality, pure tradition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        <TopBanner />
        <ConditionalNavbar />
        <main>{children}</main>
        <ConditionalFooter />
        <CartDrawer />
        <ToastContainer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
