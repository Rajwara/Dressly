import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FieldwornShell from "@/components/FieldwornShell";
import PolicyToc from "@/components/policies/PolicyToc";
import { HOME_VISIT_URL, PHONE_DISPLAY, WHATSAPP_URL } from "@/lib/brand";
import { POLICIES, getPolicy, type Policy } from "@/lib/policies";
import "./policies.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPolicy((await params).slug);
  return p ? { title: p.title, description: p.intro } : {};
}

const ICONS: Record<Policy["points"][number]["icon"], React.ReactNode> = {
  return: <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  tailor: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.1 8.1 20 20M8.1 15.9 20 4" /></>,
  swap: <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  truck: <><path d="M2 6h12v11H2zM14 10h4l4 4v3h-8z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  store: <path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-6h6v6" />,
  shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
};

const arrow = (
  <span className="ico">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  </span>
);
const Btn = ({ href, label, light, external }: { href: string; label: string; light?: boolean; external?: boolean }) => {
  const inner = (
    <>
      <span className="roll">
        <span data-t={label}>{label}</span>
      </span>
      {arrow}
    </>
  );
  const cls = light ? "pol-btn light" : "pol-btn";
  return external ? (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  );
};

const date = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function PolicyPage({ params }: Props) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();

  return (
    <FieldwornShell>
      <div className="pol">
        <section className="pol-hero">
          <nav className="pol-tabs" aria-label="Policies">
            {POLICIES.map((p) => (
              <Link key={p.slug} href={`/policies/${p.slug}`} className={p.slug === policy.slug ? "on" : undefined} aria-current={p.slug === policy.slug ? "page" : undefined}>
                {p.tab}
              </Link>
            ))}
          </nav>
          <span className="pol-label">*Policies</span>
          <h1>{policy.title}</h1>
          <p className="pol-intro">{policy.intro}</p>
          <span className="pol-updated">Last updated {date(policy.updated)}</span>
        </section>

        {policy.points.length > 0 && (
          <section className="pol-points pol-container" aria-label="Key points">
            {policy.points.map((pt, i) => (
              <article className="pol-point" key={pt.title}>
                <div className="pol-point-top">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONS[pt.icon]}
                  </svg>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                </div>
                <h3>{pt.title}</h3>
                <p>{pt.text}</p>
              </article>
            ))}
          </section>
        )}

        {policy.sections.length > 0 ? (
          <div className="pol-body pol-container">
            <aside className="pol-toc">
              <span className="pol-label">*On this page</span>
              <PolicyToc items={policy.sections.map((s) => ({ id: s.id, title: s.title }))} />
              <div className="pol-help">
                <b>Need help?</b>
                <p>Message our team on WhatsApp.</p>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  {PHONE_DISPLAY}
                </a>
              </div>
            </aside>
            <article className="pol-article">
              {policy.sections.map((s, i) => (
                <section className="pol-section" id={s.id} key={s.id}>
                  <span className="pol-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2>{s.title}</h2>
                    {s.body.map((b, j) =>
                      typeof b === "string" ? (
                        <p key={j}>{b}</p>
                      ) : (
                        <ul key={j}>
                          {b.list.map((li) => (
                            <li key={li}>{li}</li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </article>
          </div>
        ) : (
          <div className="pol-container pol-empty">
            <p>Our terms of service are being finalised and will be published here soon.</p>
          </div>
        )}

        <section className="pol-cta">
          <div className="pol-container pol-cta-row">
            <div>
              <span className="pol-label">*Still have a question?</span>
              <h2>We&apos;re Here To Help</h2>
              <p>Message us on WhatsApp, visit one of our 13 branches, or book a tailor to come to you.</p>
            </div>
            <div className="pol-cta-btns">
              <Btn href={WHATSAPP_URL} label="WhatsApp us" light external />
              <Btn href="/branches" label="Find a branch" light />
              <Btn href={HOME_VISIT_URL} label="Book a home visit" light external />
            </div>
          </div>
        </section>
      </div>
    </FieldwornShell>
  );
}
