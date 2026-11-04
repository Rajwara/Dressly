import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "../blog/blog-brand.css";
import "./contact-brand.css";
import Link from "next/link";
import BranchesMap from "@/components/blog/BranchesMap";
import ContactForm from "@/components/blog/ContactForm";
import DIcon, { type IconName } from "@/components/blog/Icons";
import { BRANCHES, HOME_VISIT_URL, PHONE_DISPLAY, PHONE_TEL, SOCIALS, WHATSAPP_URL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Dressly on WhatsApp or by phone, visit one of 13 branches across the UAE, or book a home tailoring visit.",
};

const SOCIAL_ICON: Record<string, IconName> = { instagram: "instagram", tiktok: "tiktok", whatsapp: "whatsapp" };

export default function ContactPage() {
  const pins = BRANCHES.flatMap((e) => e.branches.map((b) => ({ name: b.name, area: b.area, lat: b.lat, lng: b.lng })));
  const rows: { icon: IconName; label: string; value: string; href?: string; external?: boolean }[] = [
    { icon: "whatsapp", label: "WhatsApp us", value: PHONE_DISPLAY, href: WHATSAPP_URL, external: true },
    { icon: "phone", label: "Call us", value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
    { icon: "pin", label: "Visit us", value: "13 branches across 5 Emirates", href: "/branches" },
    { icon: "home", label: "Home tailoring", value: "Book a visit to your home or majlis", href: HOME_VISIT_URL, external: true },
  ];

  return (
    <FieldwornShell>
    <div className="bl">
      <section className="page-hero">
        <span className="eyebrow eyebrow-dot">Contact us</span>
        <h1>Let&apos;s talk</h1>
        <p>Questions about an order, fabric or fit? Message us and our team will get back to you as soon as we can.</p>
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
        <div className="container">
          <div className="map-wrap">
            <div className="map-slot">
              <BranchesMap pins={pins} />
            </div>
            <div className="map-card">
              <span className="eyebrow eyebrow-dot">Visit us</span>
              <h3>13 branches across the UAE</h3>
              <p>Abu Dhabi, Dubai, Sharjah, Ajman and Ras Al Khaimah. Find the one nearest you.</p>
              <div className="map-hours">
                <DIcon name="clock" />
                Home tailoring visits by appointment
              </div>
              <Link className="btn" href="/branches">
                Find a branch <DIcon name="upRight" small />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </FieldwornShell>
  );
}
