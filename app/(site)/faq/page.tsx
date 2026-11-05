import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import { PHONE_DISPLAY, WHATSAPP_URL } from "@/lib/brand";
import { DELIVERY, PAYMENT_METHODS, RETURNS_DAYS } from "@/lib/commerce";
import FaqCursorImage from "@/components/FaqCursorImage";
import { imageSrc } from "@/lib/images";
import "../shop-brand.css";
import "../info-pages.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about delivery, returns, measurements, home tailoring visits, payment and orders at Dressly.",
};

// Delivery and returns answers read from lib/commerce.ts, so they stay in line with checkout.
const GROUPS: { id: string; title: string; items: { q: string; a: string }[] }[] = [
  {
    id: "delivery",
    title: "Delivery",
    items: [
      { q: "How long does delivery take?", a: `Ready-made pieces usually arrive in ${DELIVERY.days.Dubai} working day in Dubai, Sharjah and Ajman, and ${DELIVERY.days["Abu Dhabi"]}–${DELIVERY.days.Fujairah} working days elsewhere in the UAE. Each product page shows an estimate for your emirate.` },
      { q: "How long do tailored pieces take?", a: `Allow about ${DELIVERY.tailoredExtraDays} extra working days for pieces tailored to your measurements.` },
      { q: "How much is delivery?", a: `AED ${DELIVERY.fee} per order, and free on orders of AED ${DELIVERY.freeOver} or more. Branch pickup is always free.` },
      { q: "Can I collect from a branch?", a: "Yes. Choose “Pick up at a branch” at checkout and select one of our 13 branches." },
    ],
  },
  {
    id: "returns",
    title: "Returns & exchanges",
    items: [
      { q: "What is your returns policy?", a: `You can return or exchange unworn ready-made items with their tags within ${RETURNS_DAYS} days of delivery. See the full returns policy for details.` },
      { q: "Can I return a tailored piece?", a: "Pieces made to your measurements cannot be returned, but fit adjustments after delivery are free." },
      { q: "How do I start a return?", a: "Message us on WhatsApp with your order number, or bring the item to any branch." },
    ],
  },
  {
    id: "measurements",
    title: "Measurements & fit",
    items: [
      { q: "How do I find my size?", a: "Use our size guide, or book a home visit or visit a branch to be measured by a tailor." },
      { q: "Can a tailor come to my home?", a: "Yes. Book a home tailoring visit on WhatsApp: the tailor brings fabric swatches and measures you at home or in your majlis." },
      { q: "Do you keep my measurements?", a: "Yes, once you have been measured we keep your measurements on file so your next order is quicker." },
    ],
  },
  {
    id: "payment",
    title: "Payment & orders",
    items: [
      { q: "How can I pay?", a: `${PAYMENT_METHODS.map((m) => m.label).join(", ")}.` },
      { q: "Do prices include VAT?", a: "Yes, all prices include 5% VAT." },
      { q: "Do I need an account to order?", a: "No. You can check out as a guest and create an account afterwards if you like." },
      { q: "Can I order on WhatsApp?", a: `Yes. Use “Order on WhatsApp” on any product or in your cart, or message ${PHONE_DISPLAY}.` },
    ],
  },
];

// Photo shown next to the cursor while each question is hovered, rotating through these.
const PHOTOS = [
  "images/categories/kandura-thobes", "images/pages/branches", "images/content/story", "images/categories/traditional-kandura",
  "images/categories/shimagh-ghutra", "images/categories/arabic-sandals", "images/pages/about", "images/categories/perfumes",
  "images/categories/summer-thobes", "images/hero/hero-new", "images/categories/bisht", "images/categories/jalabiya",
  "images/categories/ghutra", "images/pages/contact",
].map(imageSrc);

export default function FaqPage() {
  let n = 0;
  return (
    <FieldwornShell className="shop-fw">
      <div className="ip">
        <div className="ip-wrap ip-narrow">
          <div className="ip-head">
            <span className="ip-eyebrow">*Help</span>
            <h1>FAQ</h1>
            <p>Quick answers to the questions we hear most. Can&apos;t find yours? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ borderBottom: "1px solid" }}>WhatsApp us</a>.</p>
          </div>
          <nav className="ip-faq-nav" aria-label="FAQ topics">
            {GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}
          </nav>
          <div className="ip-faq">
            {GROUPS.map((g) => (
              <section className="ip-faq-group" id={g.id} key={g.id}>
                <h2>{g.title}</h2>
                {g.items.map((f) => (
                  <details key={f.q} data-img={PHOTOS[n++ % PHOTOS.length]}><summary>{f.q}</summary><p>{f.a}</p></details>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
      <FaqCursorImage />
    </FieldwornShell>
  );
}
