import type { Metadata } from "next";
import localFont from "next/font/local";
import { StoreProvider } from "@/components/StoreProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import OfferPopup from "@/components/OfferPopup";
import "./logotype.css";

// Home page fonts, used for the whole page (headings, text, header and footer).
const bigShoulders = localFont({ src: "../../components/fieldworn/fonts/big-shoulders.woff2", weight: "100 900", display: "swap", variable: "--font-big-shoulders" });
const spaceGrotesk = localFont({ src: "../../components/fieldworn/fonts/space-grotesk.woff2", weight: "300 700", display: "swap", variable: "--font-space-grotesk" });

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
    <html lang="en" className={`${bigShoulders.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
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
