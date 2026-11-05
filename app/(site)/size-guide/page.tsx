import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import { SizeChart } from "@/components/size-guide/SizeGuide";
import { HOME_VISIT_URL } from "@/lib/brand";
import "../shop-brand.css";
import "../info-pages.css";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Dressly size chart and how to measure yourself, or book a home visit to be measured by a tailor.",
};

const HOW = [
  { t: "Chest", d: "Around the fullest part of the chest, under the arms, with the tape level." },
  { t: "Shoulder", d: "Across the back, from the edge of one shoulder to the other." },
  { t: "Sleeve", d: "From the shoulder edge down to the wrist bone, arm relaxed." },
  { t: "Length", d: "From the top of the shoulder by the neck down to where the hem should fall." },
  { t: "Neck", d: "Around the base of the neck, with one finger under the tape for comfort." },
];

export default function SizeGuidePage() {
  return (
    <FieldwornShell className="shop-fw">
      <div className="ip">
        <div className="ip-wrap">
          <div className="ip-head">
            <span className="ip-eyebrow">*Find your fit</span>
            <h1>Size Guide</h1>
            <p>Use the chart below, measure yourself with a soft tape, or let one of our tailors measure you at home or in a branch.</p>
          </div>
          <SizeChart />
          <section className="ip-section">
            <h2>How to measure</h2>
            <div className="ip-steps">
              {HOW.map((h, i) => (
                <div className="ip-step" key={h.t}>
                  <span>{i + 1}</span>
                  <h3>{h.t}</h3>
                  <p>{h.d}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="ip-section ip-panel">
            <h2>Not sure of your size?</h2>
            <p style={{ color: "#555", maxWidth: 600 }}>A tailor can measure you at home, or visit any branch. Your measurements are kept for next time.</p>
            <div className="ip-actions">
              <a className="btn" href="/home-tailoring">Book a home visit</a>
              <a className="btn ghost" href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
            </div>
          </section>
        </div>
      </div>
    </FieldwornShell>
  );
}
