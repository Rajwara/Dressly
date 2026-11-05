/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import Icon from "@/components/Icon";
import PageBanner from "@/components/PageBanner";
import { HOME_VISIT, HOME_VISIT_URL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/brand";
import { imageSrc } from "@/lib/images";
import "../shop-brand.css";
import "../info-pages.css";
import "../branches/branches-brand.css";

export const metadata: Metadata = {
  title: "Home Tailoring",
  description: "Book a Dressly tailor to visit your home or majlis: browse fabrics, get measured on the spot and have your pieces delivered to your door.",
};

const INCLUDED = [
  "A tailor visits at a time that suits you, at home or in your majlis",
  "Fabric swatches to see and feel in person",
  "Precise measurements, kept on file for your next order",
  "Collar, cuff and style choices talked through with you",
  "Finished pieces delivered to your door",
  "Free fit adjustments after delivery",
];

const FAQ = [
  { q: "Which areas do you visit?", a: "Anywhere across the Emirates we serve. Send your area on WhatsApp and we will confirm the visit." },
  { q: "Is there a charge for the visit?", a: "Ask our team on WhatsApp when you book; they will confirm any visit charge before the tailor comes." },
  { q: "How long does a visit take?", a: "Usually 20 to 40 minutes, depending on how many pieces and people are being measured." },
  { q: "Can you measure several people in one visit?", a: "Yes. Tell us how many people when you book so the tailor can plan the time." },
];

export default function HomeTailoringPage() {
  return (
    <FieldwornShell className="shop-fw fw-overlay">
      <PageBanner
        image="images/content/story"
        eyebrow="*We come to you"
        title="Home Tailoring"
        text="Be measured at home or in your majlis. Our tailors bring the fabrics, the measuring tape and decades of craft to your door."
      />
      <div className="ip">
        <div className="ip-wrap">
          <div className="ip-actions" style={{ marginTop: 0 }}>
            <a className="btn" href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> Book a visit on WhatsApp</a>
            <a className="btn ghost" href={`tel:${PHONE_TEL}`}><Icon name="phone" size={18} /> Call {PHONE_DISPLAY}</a>
          </div>

          <section className="ip-section">
            <h2>How it works</h2>
            <div className="ip-steps">
              {HOME_VISIT.steps.map((s) => (
                <div className="ip-step" key={s.title}>
                  <span><Icon name={s.icon} size={20} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="ip-section ip-split">
            <div>
              <h2>What&apos;s included</h2>
              <ul className="ip-list">{INCLUDED.map((t) => <li key={t}>{t}</li>)}</ul>
              <div className="ip-actions">
                <a className="btn" href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer">Book your visit</a>
                <a className="btn ghost" href="/size-guide">See the size guide</a>
              </div>
            </div>
            <img src={imageSrc("images/pages/about")} alt="" />
          </section>

          <section className="ip-section ip-faq">
            <h2>Questions</h2>
            {FAQ.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
            <p style={{ marginTop: 18 }}>More answers in our <a href="/faq#measurements" style={{ borderBottom: "1px solid" }}>FAQ</a>.</p>
          </section>

          <section className="ip-section ip-panel">
            <h2>Prefer to visit us?</h2>
            <p style={{ color: "#6e5a66", maxWidth: 560 }}>Choose fabrics and be measured at any of our 13 branches across 5 Emirates.</p>
            <div className="ip-actions"><a className="btn" href="/branches">Find a branch</a></div>
          </section>
        </div>
      </div>
    </FieldwornShell>
  );
}
