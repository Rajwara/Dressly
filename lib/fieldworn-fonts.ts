import localFont from "next/font/local";

/** The homepage fonts, for store pages in its branding (Branches, Blog). */
export const bigShoulders = localFont({ src: "../components/fieldworn/fonts/big-shoulders.woff2", weight: "100 900", display: "swap", variable: "--font-big-shoulders" });
export const spaceGrotesk = localFont({ src: "../components/fieldworn/fonts/space-grotesk.woff2", weight: "300 700", display: "swap", variable: "--font-space-grotesk" });
export const fieldwornFonts = `${bigShoulders.variable} ${spaceGrotesk.variable}`;
