import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./(site)/globals.css";

// Unmatched URLs. The app has two root layouts (store, homepage and About),
// so this page brings its own <html>, styles and fonts.
const serif = Plus_Jakarta_Sans({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif", preload: false });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", preload: false });

export const metadata: Metadata = { title: "Page not found | Dressly" };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <div className="wrap narrow" style={{ paddingTop: 80, paddingBottom: 120, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Dressly" width={640} height={180} style={{ margin: "0 auto 28px", height: 64, width: "auto" }} />
          <span className="eyebrow">Error 404</span>
          <h1 style={{ margin: "12px 0 16px" }}>Page not found</h1>
          <p style={{ color: "var(--muted)", marginBottom: 28 }}>That page does not exist or has moved.</p>
          <Link className="btn" href="/">
            Back to the shop
          </Link>
        </div>
      </body>
    </html>
  );
}
