import type { Metadata } from "next";
import { brandFonts } from "@/lib/fieldworn-fonts";
import Link from "next/link";
import "./(site)/globals.css";

// Unmatched URLs. The app has two root layouts (store, homepage and About),
// so this page brings its own <html>, styles and fonts.

export const metadata: Metadata = { title: "Page not found | Dressly" };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={brandFonts}>
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
