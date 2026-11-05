import type { Metadata } from "next";
import { brandFonts } from "@/lib/fieldworn-fonts";
import { StoreProvider } from "@/components/StoreProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import OfferPopup from "@/components/OfferPopup";
import "./fieldworn.css";



export const metadata: Metadata = {
  title: "Dressly | Abaya Tailoring Since 1998",
  description: "Dressly: abaya tailoring since 1998, with 13 branches across the UAE and home tailoring visits.",
};

/**
 * Own root layout: this mock is a complete standalone homepage, so it does not
 * load the store's stylesheet, header or footer (their class names overlap).
 */
export default function FieldwornLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={brandFonts}>
      <body>
        <StoreProvider>
          {children}
          <WhatsAppButton />
          <OfferPopup />
        </StoreProvider>
      </body>
    </html>
  );
}
