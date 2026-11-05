import type { Metadata } from "next";
import { brandFonts } from "@/lib/fieldworn-fonts";
import { StoreProvider } from "@/components/StoreProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import OfferPopup from "@/components/OfferPopup";
import "./logotype.css";


export const metadata: Metadata = {
  title: "About | Dressly",
};

/**
 * Own root layout: this mock is a complete standalone page, so it does not
 * load the store's stylesheet, header or footer.
 */
export default function LogotypeLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script adds "js" before first paint, as in the original, so reveal
    // animations start hidden; suppressHydrationWarning lets React keep that class.
    <html lang="en" className={brandFonts} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
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
