import { Cormorant_Garamond, Jost } from "next/font/google";

/**
 * Brand fonts for every page.
 * - Display (headings, logo, wordmark): Cormorant Garamond, an elegant high-contrast serif.
 * - Text (body, menus, buttons): Jost, a clean geometric sans.
 * The CSS variable names are kept from the original design (--font-big-shoulders,
 * --font-space-grotesk, --font-serif, --font-sans) so every stylesheet picks them up.
 */
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap", variable: "--font-big-shoulders" });
const text = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap", variable: "--font-space-grotesk" });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap", variable: "--font-serif", preload: false });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap", variable: "--font-sans", preload: false });

export const fieldwornFonts = `${display.variable} ${text.variable}`;
/** All four variables: put on <html> in every root layout. */
export const brandFonts = `${display.variable} ${text.variable} ${serif.variable} ${sans.variable}`;
