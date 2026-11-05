import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FieldwornShell from "@/components/FieldwornShell";
import { WEEK, hasHours, pretty } from "@/components/branches/hours";
import { BRANCHES, BRANCH_SERVICES, PHONE_DISPLAY, PHONE_TEL, directions, whatsapp } from "@/lib/brand";
import { imageSrc } from "@/lib/images";
import "../branches-brand.css";

const ALL = BRANCHES.flatMap((e) => e.branches.map((b) => ({ ...b, emirate: e.emirate })));
const FALLBACKS = ["images/pages/branches", "images/pages/about", "images/hero/hero-new", "images/pages/contact", "images/content/story"];

function photo(id: string) {
  const own = imageSrc(`images/branches/${id}`);
  return own.endsWith(".svg") ? imageSrc(FALLBACKS[ALL.findIndex((b) => b.id === id) % FALLBACKS.length]) : own;
}

export function generateStaticParams() {
  return ALL.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = ALL.find((x) => x.id === id);
  if (!b) return {};
  return {
    title: `${b.name} branch, ${b.emirate}`,
    description: `Dressly ${b.name} in ${b.area}, ${b.emirate}: address, opening hours, phone, directions and services.`,
  };
}

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = ALL.find((x) => x.id === id);
  if (!b) notFound();

  const services = b.services?.length ? b.services : BRANCH_SERVICES;
  const d = 0.008;
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${b.lng - d},${b.lat - d / 1.6},${b.lng + d},${b.lat + d / 1.6}&layer=mapnik&marker=${b.lat},${b.lng}`;
  const nearby = ALL.filter((x) => x.emirate === b.emirate && x.id !== b.id);
  const tel = b.phone ? b.phone.replace(/\s/g, "") : PHONE_TEL;

  return (
    <FieldwornShell>
      <div className="branch-page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/branches">Branches</Link> / {b.emirate} / {b.name}
        </nav>

        <div>
          <span className="eyebrow">*{b.emirate}</span>
          <h1>{b.name}</h1>
          <p className="lead">{b.address || `${b.area}, ${b.emirate}`}</p>
          <div className="actions">
            <a className="btn" href={whatsapp(`Hello Dressly, I have a question for the ${b.name} branch.`)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a className="btn ghost" href={`tel:${tel}`}>
              Call
            </a>
            <a className="btn ghost" href={directions(b)} target="_blank" rel="noopener noreferrer">
              Directions
            </a>
          </div>

          <section>
            <h2>Opening hours</h2>
            {hasHours(b.hours) ? (
              <table>
                <tbody>
                  {WEEK.map((w) => (
                    <tr key={w.key}>
                      <td>{w.label}</td>
                      <td>{pretty(b.hours![w.key])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">Hours coming soon. Message us on WhatsApp to check before you visit.</p>
            )}
          </section>

          <section>
            <h2>Phone</h2>
            {b.phone ? (
              <a href={`tel:${tel}`}>{b.phone}</a>
            ) : (
              <p>
                Call our main line: <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              </p>
            )}
          </section>

          <section>
            <h2>Services</h2>
            <div className="service-chips">
              {services.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </section>

          {b.parking && (
            <section>
              <h2>Parking</h2>
              <p>{b.parking}</p>
            </section>
          )}

          <section>
            <h2>Prefer us to come to you?</h2>
            <p className="muted">Our tailors visit homes and majlis across the Emirates with fabrics and a measuring tape.</p>
            <p>
              <Link className="link-btn" href="/home-tailoring">
                Book a home visit
              </Link>
            </p>
          </section>

          {nearby.length > 0 && (
            <section>
              <h2>Other branches in {b.emirate}</h2>
              <div className="branch-others">
                {nearby.map((n) => (
                  <Link key={n.id} href={`/branches/${n.id}`}>
                    {n.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="branch-photo" src={photo(b.id)} alt={`Dressly ${b.name}`} />
          <iframe className="branch-map" src={map} title={`Map of Dressly ${b.name}`} loading="lazy" />
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            <a href={directions(b)} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </p>
        </div>
      </div>
    </FieldwornShell>
  );
}
