"use client";

/* eslint-disable @next/next/no-img-element */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import "./fieldworn-chrome.css";
import { FooterColumns, SiteNav, TopBar } from "./SiteNav";

gsap.registerPlugin(ScrollTrigger);

/*
 * Header bar, footer and cart drawer from the homepage (Fieldworn), with the
 * same markup, classes and behaviour, filled with Dressly links and
 * details. Styles are the Fieldworn stylesheet scoped to `.fw`.
 */

const WA = "https://api.whatsapp.com/send/?phone=971568586987";
const WORDMARK = "DRESSLY";

const svgProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** Top bar and header bar used on every store page. */
export function FieldwornHeader() {
  return (
    <div className="fw fw-head">
    <TopBar />
    <header className="banner">
      <div className="banner-in bar">
        <SiteNav wordmark={WORDMARK} />
      </div>
    </header>
    </div>
  );
}

export function FieldwornFooter({ image }: { image: string }) {
  return (
    <>
      <div className="fw fw-foot"><footer className="footer"><div className="container">
        <div className="foot-grid">
          <div className="foot-img zoom"><img src={image} alt="" /></div>
          <div>
            <FooterColumns />
            <div className="foot-end"><span>© {new Date().getFullYear()} Dressly. All rights reserved.</span><div className="socials">
              <a href="https://www.instagram.com/dressly" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg {...svgProps}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r=".5" /></svg></a>
              <a href="https://www.tiktok.com/@dressly" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg {...svgProps}><path d="M14 4v10a3 3 0 1 1-3-3M14 4c.5 2.5 2 4 5 4" /></svg></a>
              <a href={WA} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg {...svgProps}><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 1.8.8-.3 1.4c-3.5.5-7.7-3.7-7.2-7.2l1.4-.3.8 1.8z" /></svg></a>
            </div></div>
          </div>
        </div>
        <div className="foot-giant"><span className="giant"><span className="fit" style={{ display: "inline-block" }} aria-label={WORDMARK}>{WORDMARK.split("").map((c, i) => <span className="ch" aria-hidden="true" key={i}>{c === " " ? "\u00a0" : c}</span>)}</span></span></div>
      </div></footer></div>
      <div className="fw">
        <div className="drawer-bg"></div>
        <aside className="drawer" aria-label="Shopping cart"><div className="drawer-head"><h4>Your Cart</h4><button className="drawer-close" type="button" aria-label="Close cart">✕</button></div><p>Your cart is empty.</p></aside>
      </div>
    </>
  );
}

/** The parts of the homepage script that belong to the header and footer. */
export function FieldwornChromeBehavior() {
  useEffect(() => {
    const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
    const $$ = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
    const off: (() => void)[] = [];
    const on = (t: EventTarget, type: string, fn: EventListener) => {
      t.addEventListener(type, fn);
      off.push(() => t.removeEventListener(type, fn));
    };

    /* Scale the giant wordmark to fill the container width */
    function fit() {
      $$(".fw .giant").forEach((el) => {
        const box = el.parentElement!;
        const span = el.querySelector<HTMLElement>(".fit") || el;
        el.style.fontSize = "100px";
        const w = span.getBoundingClientRect().width;
        if (w) el.style.fontSize = 100 * (box.clientWidth / w) * 0.995 + "px";
      });
    }
    fit();
    on(window, "resize", fit);
    document.fonts?.ready.then(() => {
      fit();
      ScrollTrigger.refresh();
    });

    /* Mobile menu and cart drawer */
    const nav = $(".fw .nav");
    const burger = $(".fw .burger");
    on(burger, "click", () => {
      const o = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(o));
    });
    const cart = (o: boolean) => document.body.classList.toggle("cart-open", o);
    const drawerBtn = document.querySelector(".fw button.cart");
    if (drawerBtn) on(drawerBtn, "click", () => cart(true));
    on($(".fw .drawer-close"), "click", () => cart(false));
    on($(".fw .drawer-bg"), "click", () => cart(false));
    on(document, "keydown", ((e: KeyboardEvent) => {
      if (e.key === "Escape") cart(false);
    }) as EventListener);

    /* Header entrance and footer animations, as on the homepage */
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion:no-preference)", () => {
      gsap.from(".fw .nav-row>*", { y: -20, opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.3, ease: "power3.out" });
      gsap.from(".fw .foot-giant .ch", { yPercent: 100, duration: 1, ease: "power3.out", stagger: 0.04, scrollTrigger: { trigger: ".fw .foot-giant", start: "top 98%", once: true } });
      gsap.from(".fw .foot-img img", { scale: 1.2, ease: "none", scrollTrigger: { trigger: ".fw .foot-img", start: "top bottom", end: "bottom 80%", scrub: 0.5 } });
    });

    const settle = () => {
      fit();
      ScrollTrigger.refresh();
    };
    if (document.readyState === "complete") requestAnimationFrame(settle);
    else on(window, "load", settle);

    return () => {
      off.forEach((f) => f());
      mm.revert();
      document.body.classList.remove("cart-open");
    };
  }, []);
  return null;
}
