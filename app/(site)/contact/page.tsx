import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "../blog/blog-brand.css";
import "./contact-brand.css";
import Link from "next/link";
import BranchGlobe from "@/components/branches/BranchGlobe";
import { globeBranches } from "@/lib/branch-cards";
import ContactForm from "@/components/blog/ContactForm";
import DIcon, { type IconName } from "@/components/blog/Icons";
import { BRANCHES, COMPANY, EMAIL, HEAD_OFFICE, HOME_VISIT_URL, HOURS, PHONE_DISPLAY, PHONE_TEL, REPLY_TIME, SOCIALS, WHATSAPP_URL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Dressly on WhatsApp or by phone, visit one of 13 branches across the UAE, or book a home tailoring visit.",
};

const SOCIAL_ICON: Record<string, IconName> = { instagram: "instagram", tiktok: "tiktok", whatsapp: "whatsapp" };

export default function ContactPage() {
  const hours = HOURS.map((h) => `${h.days} ${h.time}`).join(" · ");
  const rows: { icon: IconName; label: string; value: string; note: string; href?: string; external?: boolean }[] = [
    { icon: "whatsapp", label: "WhatsApp · fastest", value: PHONE_DISPLAY, note: REPLY_TIME || "The quickest way to reach us.", href: WHATSAPP_URL, external: true },
    { icon: "phone", label: "Call us", value: PHONE_DISPLAY, note: hours, href: `tel:${PHONE_TEL}` },
    { icon: "mail", label: "Email", value: EMAIL, note: "For orders, invoices and corporate enquiries.", href: `mailto:${EMAIL}` },
    { icon: "pin", label: "Visit us", value: "13 branches across 5 Emirates", note: "Measurements, fabrics and ready-made pickup.", href: "/branches" },
  ];

  return (
    <FieldwornShell>
    <div className="bl">
      <section className="page-hero">
        <span className="eyebrow eyebrow-dot">Contact us</span>
        <h1>Let&apos;s talk</h1>
        <p>Questions about an order, fabric or fit? WhatsApp is fastest{REPLY_TIME ? `: ${REPLY_TIME.charAt(0).toLowerCase()}${REPLY_TIME.slice(1)}` : "."}</p>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Get in touch</span>
            <h2>We&apos;re here to help.</h2>
            <p>From choosing a fabric to booking a home visit or tracking an order, WhatsApp is the quickest way to reach us.</p>
            <ul className="contact-list">
              {rows.map((r) => (
                <li className="contact-row" key={r.label}>
                  <span className="contact-icon">
                    <DIcon name={r.icon} />
                  </span>
                  <div>
                    <div className="contact-label">{r.label}</div>
                    {r.href?.startsWith("/") ? (
                      <Link className="contact-value" href={r.href}>
                        {r.value}
                      </Link>
                    ) : (
                      <a className="contact-value" href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {r.value}
                      </a>
                    )}
                    <div className="contact-note">{r.note}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="follow">
              <span className="eyebrow">Follow along</span>
              <div className="socials">
                {SOCIALS.map((s) => (
                  <a key={s.name} className="social" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Dressly on ${s.name}`}>
                    <DIcon name={SOCIAL_ICON[s.icon]} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2>Send us a message</h2>
            <p>Fill in the form and it will open WhatsApp with your message ready to send.</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="section section-tight-top">
        <div className="container contact-extras">
          <div className="visit-block">
            <span className="eyebrow eyebrow-dot">Home tailoring</span>
            <h2>Book a home visit</h2>
            <p>A tailor comes to your home or majlis with fabric swatches and a measuring tape, anywhere across the Emirates we serve.</p>
            <div className="visit-actions">
              <a className="btn" href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer">
                Book on WhatsApp <DIcon name="upRight" small />
              </a>
              <Link className="btn ghost" href="/home-tailoring">
                How it works
              </Link>
            </div>
          </div>
          <div className="faq-block">
            <span className="eyebrow">Quick answers</span>
            <ul>
              <li>
                <Link href="/faq#delivery">How long does delivery take?</Link>
              </li>
              <li>
                <Link href="/faq#returns">What is your returns policy?</Link>
              </li>
              <li>
                <Link href="/faq#measurements">How do I give my measurements?</Link>
              </li>
            </ul>
            <Link className="link-more" href="/faq">
              All questions <DIcon name="upRight" small />
            </Link>
          </div>
        </div>
      </section>

      <BranchGlobe branches={globeBranches()} emirates={BRANCHES.length} />
      <section className="section section-tight-top">
        <div className="container business">
          <div>
            <span className="eyebrow">Business details</span>
            <p>
              <b>{COMPANY}</b>
              {HEAD_OFFICE && (
                <>
                  <br />
                  {HEAD_OFFICE}
                </>
              )}
              <br />
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a> · <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
            </p>
          </div>
          <div className="socials">
            {SOCIALS.map((s) => (
              <a key={s.name} className="social" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Dressly on ${s.name}`}>
                <DIcon name={SOCIAL_ICON[s.icon]} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
    </FieldwornShell>
  );
}
