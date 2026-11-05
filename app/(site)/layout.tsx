import type { Metadata } from "next";
import { brandFonts } from "@/lib/fieldworn-fonts";
import { StoreProvider } from "@/components/StoreProvider";
import Motion from "@/components/Motion";
import OfferPopup from "@/components/OfferPopup";
import { QuickViewProvider } from "@/components/QuickView";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";
import "./blog-layout.css";


export const metadata: Metadata = {
  title: { default: "Dressly | Abaya Tailoring Since 1998", template: "%s | Dressly" },
  description:
    "Dressly: the UAE's trusted name in abaya textile and tailoring since 1998. Bespoke abayas, home tailoring visits, headwear, sandals and accessories across 13 branches in 5 Emirates.",
};

/**
 * Root layout. Every page renders its own header and footer through
 * <FieldwornShell> (the homepage design), so only the cart, quick view,
 * floating WhatsApp button and offer popup live here.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={brandFonts}>
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
