"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { useStore } from "@/components/StoreProvider";
import { FOOTER_NAV, MAIN_NAV, SHOP_ALL, TOP_BAR } from "@/lib/site-nav";
import "./site-nav.css";

/**
 * Header menu, top bar and footer columns shared by every page. The markup
 * keeps the original classes (.nav, .nav-row, .links, .drop, .nav-end,
 * .burger) so the existing header scripts (mobile menu, entrance animation)
 * keep working on the homepage and on store pages; .sn-* classes add the rest.
 */

/** Rotating messages above the header. */
export function TopBar() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % TOP_BAR.length), 4500);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <div className="sn-top" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} role="region" aria-label="Announcements">
      <div className="sn-top-track">
        {TOP_BAR.map((m, n) => {
          const external = m.href.startsWith("http");
          return (
            <a key={m.label} href={m.href} className={n === i ? "on" : ""} aria-hidden={n !== i} tabIndex={n === i ? 0 : -1}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {m.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Counter({ n }: { n: number }) {
  return n > 0 ? <b className="sn-count">{n}</b> : null;
}

/** Icons on the right: search, account, saved, cart (with live counts). */
function NavIcons() {
  const { cartCount, wishlist } = useStore();
  return (
    <div className="sn-icons">
      <a href="/search" aria-label="Search"><Icon name="search" size={21} /></a>
      <a href="/account" aria-label="Account" className="sn-hide-sm"><Icon name="user" size={21} /></a>
      <a href="/wishlist" aria-label={`Saved (${wishlist.length})`}><Icon name="heart" size={21} /><Counter n={wishlist.length} /></a>
      <a href="/cart" aria-label={`Cart (${cartCount})`}><Icon name="bag" size={21} /><Counter n={cartCount} /></a>
    </div>
  );
}

export function SiteNav({ wordmark }: { wordmark: string }) {
  return (
    <nav className="nav sn" aria-label="Main">
      <div className="container nav-row">
        <a className="logo" href="/">{wordmark}</a>
        <ul className="links">
          {MAIN_NAV.map((item) => (
            <li key={item.label} className={item.columns ? "sn-has-drop" : undefined}>
              <a href={item.href}>
                {item.label}
                {item.columns && <span className="sn-caret" aria-hidden="true">⌄</span>}
              </a>
              {item.columns && (
                <div className={`drop ${item.columns.length > 1 ? "sn-mega" : ""}`}>
                  {item.columns.map((col, c) => (
                    <div key={c} className="sn-col">
                      {col.heading && <p className="sn-col-head">{col.heading}</p>}
                      <ul>
                        {col.links.map((l) => (
                          <li key={l.href}><a href={l.href}>{l.label}</a></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
          <li className="sn-mobile-only"><a href="/account">Account</a></li>
          <li className="sn-shop-li"><a className="sn-shop" href={SHOP_ALL.href}>{SHOP_ALL.label}</a></li>
        </ul>
        <div className="nav-end">
          <NavIcons />
          <button className="burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
        </div>
      </div>
    </nav>
  );
}

/** Footer link columns plus the newsletter sign-up. */
export function FooterColumns() {
  return (
    <div className="sn-foot">
      <div className="sn-foot-cols">
        {FOOTER_NAV.map((col) => (
          <div key={col.heading}>
            <h4>{col.heading}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <FooterNewsletter />
    </div>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "footer" }) });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }
  return (
    <form className="sn-news" onSubmit={submit}>
      <h4>Newsletter</h4>
      <p>New arrivals, Eid edits and offers. No spam.</p>
      {state === "done" ? (
        <p className="sn-news-ok">Thank you, you are on the list.</p>
      ) : (
        <div className="sn-news-row">
          <input type="email" required placeholder="Your email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={state === "sending"}>{state === "sending" ? "…" : "Sign up"}</button>
        </div>
      )}
      {state === "error" && <p className="sn-news-err">Something went wrong. Please try again.</p>}
    </form>
  );
}
