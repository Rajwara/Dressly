import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { StoreProvider } from "@/components/StoreProvider";
import Motion from "@/components/Motion";
import OfferPopup from "@/components/OfferPopup";
import { QuickViewProvider } from "@/components/QuickView";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";
import "./blog-layout.css";

const serif = Plus_Jakarta_Sans({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Dressly | Kandura Tailoring Since 1998", template: "%s | Dressly" },
  description:
    "Dressly: the UAE's trusted name in kandura textile and tailoring since 1998. Bespoke kanduras, home tailoring visits, headwear, sandals and accessories across 13 branches in 5 Emirates.",
};

/**
 * Root layout. Every page renders its own header and footer through
 * <FieldwornShell> (the homepage design), so only the cart, quick view,
 * floating WhatsApp button and offer popup live here.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body id="top">
        <StoreProvider>
          <QuickViewProvider>
            <main>{children}</main>
            <WhatsAppButton />
            <OfferPopup />
          </QuickViewProvider>
          <Motion />
        </StoreProvider>
      </body>
    </html>
  );
}
