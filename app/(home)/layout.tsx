import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./fieldworn.css";

// The two fonts embedded in the original file, now served as files.
const bigShoulders = localFont({ src: "../../components/fieldworn/fonts/big-shoulders.woff2", weight: "100 900", display: "swap", variable: "--font-big-shoulders" });
const spaceGrotesk = localFont({ src: "../../components/fieldworn/fonts/space-grotesk.woff2", weight: "300 700", display: "swap", variable: "--font-space-grotesk" });

// Fonts of the home page reels section shown in "Follow Us".
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Dressly | Kandura Tailoring Since 1998",
  description: "Dressly: kandura tailoring since 1998, with 13 branches across the UAE and home tailoring visits.",
};

/**
 * Own root layout: this mock is a complete standalone homepage, so it does not
 * load the store's stylesheet, header or footer (their class names overlap).
 */
export default function FieldwornLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${spaceGrotesk.variable} ${jakarta.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
