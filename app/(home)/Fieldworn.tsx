"use client";

/* eslint-disable @next/next/no-img-element */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { FooterColumns, SiteNav, TopBar } from "@/components/fieldworn/SiteNav";

gsap.registerPlugin(ScrollTrigger);

export type FieldwornImages = Record<string, string>;

/**
 * "Fieldworn" homepage, ported from index_13.html. Markup and CSS
 * (./fieldworn.css) are unchanged; the placeholder drawings are replaced with
 * the store's own images (see page.tsx), and the original script runs in the
 * effect below, using GSAP from npm instead of the inlined copy.
 */
export default function Fieldworn({ img, community }: { img: FieldwornImages; community?: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = root.current!;
    const $ = (s: string, r: ParentNode = scope) => r.querySelector<HTMLElement>(s)!;
    const $$ = (s: string, r: ParentNode = scope) => Array.from(r.querySelectorAll<HTMLElement>(s));
    const off: (() => void)[] = [];
    const on = (t: EventTarget, type: string, fn: EventListener) => {
      t.addEventListener(type, fn);
      off.push(() => t.removeEventListener(type, fn));
    };

    /* Scale the giant wordmarks to fill the container width */
    function fit() {
      $$(".giant").forEach((el) => {
        const box = el.parentElement!;
        const span = $(".fit", el) || el;
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
    const nav = $(".nav");
    const burger = $(".burger");
    on(burger, "click", () => {
      const o = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(o));
    });
    const cart = (o: boolean) => document.body.classList.toggle("cart-open", o);
    const cartBtn = scope.querySelector(".cart");
    if (cartBtn) on(cartBtn, "click", () => cart(true));
    on($(".drawer-close"), "click", () => cart(false));
    on($(".drawer-bg"), "click", () => cart(false));
    on(document, "keydown", ((e: KeyboardEvent) => {
      if (e.key === "Escape") cart(false);
    }) as EventListener);

    /* Category filter */
    const tabs = $$(".tab");
    const cats = $$(".cat-card");
    tabs.forEach((t) =>
      on(t, "click", () => {
        tabs.forEach((x) => {
          const sel = x === t;
          x.classList.toggle("on", sel);
          x.setAttribute("aria-selected", String(sel));
        });
        const f = t.getAttribute("data-f");
        const show: HTMLElement[] = [];
        cats.forEach((c) => {
          const m = f === "all" || c.getAttribute("data-c") === f;
          c.hidden = !m;
          if (m) show.push(c);
        });
        gsap.killTweensOf(cats);
        gsap.fromTo(show, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.07 });
        ScrollTrigger.refresh();
      }),
    );

    /* Slider: arrows move one card */
    const track = $(".slider-track");
    const looks = $$(".look", track);
    let idx = 0;
    function slide(d: number) {
      const step = looks[0].offsetWidth + 16;
      const max = Math.max(0, track.scrollWidth - track.parentElement!.clientWidth);
      idx = Math.max(0, Math.min(looks.length - 1, idx + d));
      const x = Math.min(idx * step, max);
      if (x === max && d > 0) idx = Math.round(max / step);
      gsap.to(track, { x: -x, duration: 0.8, ease: "power3.inOut" });
    }
    on($(".c-prev"), "click", () => slide(-1));
    on($(".c-next"), "click", () => slide(1));
    on(window, "resize", () => {
      idx = 0;
      gsap.set(track, { x: 0 });
    });

    /* Offer cards: crossfade */
    const offers = $$(".disc-card");
    let oi = 0;
    const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
    function offer(d: number) {
      const cur = offers[oi];
      oi = (oi + d + offers.length) % offers.length;
      const nx = offers[oi];
      if (!reduced) {
        gsap.to(cur, { autoAlpha: 0, x: -40 * d, scale: 0.96, duration: 0.5, ease: "power2.in", onComplete: () => cur.classList.remove("on") });
        nx.classList.add("on");
        gsap.fromTo(nx, { autoAlpha: 0, x: 40 * d, scale: 0.96 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.7, delay: 0.2, ease: "power3.out" });
      } else {
        cur.classList.remove("on");
        nx.classList.add("on");
      }
    }
    on($(".d-prev"), "click", () => offer(-1));
    on($(".d-next"), "click", () => offer(1));

    /* Scroll and load animations */
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion:no-preference)", () => {
        function reveal(sel: string, o: { y?: number; scale?: number; start?: string; d?: number; st?: number } = {}) {
          const els = $$(sel);
          if (!els.length) return;
          gsap.set(els, { opacity: 0, y: o.y == null ? 40 : o.y, scale: o.scale || 1 });
          ScrollTrigger.batch(els, {
            start: o.start || "top 90%",
            once: true,
            onEnter: (b) => {
              gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: o.d || 0.9, ease: "power3.out", stagger: o.st == null ? 0.12 : o.st, overwrite: "auto" });
            },
          });
        }

        /* Banner entrance */
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".banner-bg", { scale: 1.14, duration: 1.8, ease: "power2.out" }, 0)
          .from(".banner-title .ch", { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.2)
          .from(".nav-row>*", { y: -20, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.3)
          .from(".banner-text>*", { y: 30, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.6)
          .from(".banner-year", { y: 30, opacity: 0, duration: 0.9 }, 0.75);

        /* Banner image eases as the page scrolls away */
        gsap.to(".banner-bg", { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".banner", start: "top top", end: "bottom top", scrub: true } });

        /* Section headings and copy */
        reveal(".rv", { y: 30, st: 0.08 });

        /* Why us: image scales down inside its frame, cards rise in sequence */
        gsap.fromTo(".why-img .scale", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".why-img", start: "top bottom", end: "bottom 70%", scrub: 0.5 } });
        reveal(".why-card", { y: 70, scale: 0.95, st: 0.14, d: 1 });
        reveal(".products .product", { y: 50, st: 0.1 });
        reveal(".cat-card", { y: 50, st: 0.1 });

        /* Pinned stack: each photo slides over the last and the product card follows */
        const panels = $$(".panel");
        const n = panels.length;
        gsap.set(panels.slice(1), { yPercent: 100 });
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".stack", start: "top top", end: "bottom bottom", scrub: 0.4 } });
        panels.slice(1).forEach((p, i) => {
          tl.to(p, { yPercent: 0, duration: 1 }, i).to(".stack-track", { yPercent: -(100 / n) * (i + 1), duration: 1 }, i);
        });

        reveal(".look", { y: 50, st: 0.12 });

        /* Offer card and heading */
        gsap.from(".disc-cards", { y: 80, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".disc-stage", start: "top 85%", once: true } });

        /* Testimonials: pinned while the row travels sideways */
        mm.add("(min-width:768px)", () => {
          const t = $(".tst-track");
          gsap.to(t, {
            x: () => -(t.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: { trigger: ".tst", start: "top top", end: "bottom bottom", scrub: 0.4, invalidateOnRefresh: true },
          });
        });

        reveal(".blog-card", { y: 50, st: 0.14 });
        reveal(".follow-grid a", { y: 80, scale: 0.92, st: 0.14, d: 1 });

        /* CTA and footer */
        gsap.fromTo(".cta-bg", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.from(".foot-giant .ch", { yPercent: 100, duration: 1, ease: "power3.out", stagger: 0.04, scrollTrigger: { trigger: ".foot-giant", start: "top 98%", once: true } });
        gsap.from(".foot-img img", { scale: 1.2, ease: "none", scrollTrigger: { trigger: ".foot-img", start: "top bottom", end: "bottom 80%", scrub: 0.5 } });
      });
    }, scope);

    // The original refits and refreshes on window load; in a client-side page load may already have fired.
    const settle = () => {
      fit();
      ScrollTrigger.refresh();
    };
    if (document.readyState === "complete") requestAnimationFrame(settle);
    else on(window, "load", settle);

    return () => {
      off.forEach((f) => f());
      ctx.revert();
      document.body.classList.remove("cart-open");
    };
  }, []);

  return (
    <div ref={root} style={{ display: "contents" }}>
      <TopBar />
      <header className="banner">
       <div className="banner-in">
        <img className="banner-bg" src={img.hero} alt="" />
        <SiteNav wordmark="DRESSLY" />
        <div className="banner-copy"><div className="container">
         <div className="banner-text"><p>Kanduras cut with precision and finished to a standard we have spent a generation refining, since 1998.</p><a className="banner-link" href="/category/kandura-thobes"><span className="roll"><span data-t="Shop Now">Shop Now</span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v13h17M17 13l4 4-4 4"/></svg></a></div>
         <div className="banner-year">TAILORING<br />SINCE<br />@1998</div>
         <h1 className="banner-title"><span className="giant"><span className="fit" style={{ display: "inline-block" }} aria-label="DRESSLY"><span className="ch" aria-hidden="true">D</span><span className="ch" aria-hidden="true">R</span><span className="ch" aria-hidden="true">E</span><span className="ch" aria-hidden="true">S</span><span className="ch" aria-hidden="true">S</span><span className="ch" aria-hidden="true">L</span><span className="ch" aria-hidden="true">Y</span></span></span></h1>
        </div></div>
       </div>
      </header>
      <main>
      <section className="section" id="why"><div className="container why-grid">
       <div className="why-img"><div className="scale"><img src={img.why} alt="" /></div><span className="label">*Why Us</span><p>Abayas That Fit Right, Feel Good And Keep Going.</p></div>
       <article className="why-card"><div className="why-top"><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="7" width="26" height="24" rx="4"/><path d="M5 14h26M14 7v7h8V7M20 25l3 3 6-7"/></svg><b>01</b></div><h3>Built to Last</h3><p>The finest fabrics, cut and stitched to keep their shape, colour and feel, wash after wash.</p></article><article className="why-card"><div className="why-top"><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="7" width="26" height="24" rx="4"/><path d="M5 14h26"/><rect x="21" y="22" width="9" height="7" rx="1"/><path d="M23 22v-2a2.500 2.500 0 0 1 5 0v2"/></svg><b>02</b></div><h3>Home Tailoring</h3><p>Our tailors bring fabrics and the measuring tape to your home or majlis, then deliver to your door.</p></article><article className="why-card"><div className="why-top"><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="7" width="26" height="24" rx="4"/><path d="M5 14h26M22 25h-9M16 21l-4 4 4 4"/></svg><b>03</b></div><h3>13 Branches</h3><p>Choose fabric and be measured at any of our branches across Abu Dhabi, Dubai, Sharjah, Ajman and RAK.</p></article><article className="why-card"><div className="why-top"><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="7" width="26" height="24" rx="4"/><circle cx="17" cy="19" r="4"/><path d="M10 29c1-4 4-6 7-6s6 2 7 6M27 9v6M24 12h6"/></svg><b>04</b></div><h3>Since 1998</h3><p>A family craft grown into one of the UAE&apos;s most recognised names in abaya tailoring.</p></article>
      </div></section>

      <section className="section grey" id="collections"><div className="container coll-grid">
       <div className="coll-side"><span className="label rv">*Collections</span><h2 className="rv">Most Wanted Right Now</h2><div className="coll-end"><p className="rv">Our most-loved pieces this season, from long gilets and coat abayas to bisht abayas and summer styles.</p><div className="rv"><a className="btn " href="/category/kandura-thobes"><span className="roll"><span data-t="Explore All">Explore All</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a></div></div></div>
       <div className="products"><a className="product mw" href="/product/stitched-saderi-olive"><div className="thumb"><img src={img.g1} alt="" /><span className="pill">Long Gilets</span></div><div className="info"><div className="name">Quilted Long Gilet, Olive</div><div className="meta"><span className="price">AED 280</span><span className="mw-go">Shop now <span aria-hidden="true">→</span></span></div></div></a><a className="product mw" href="/product/tailored-layering-jacket-charcoal"><div className="thumb"><img src={img.g2} alt="" /><span className="pill">Coat Abayas</span></div><div className="info"><div className="name">Tailored Coat Abaya, Charcoal</div><div className="meta"><span className="price">AED 390</span><span className="mw-go">Shop now <span aria-hidden="true">→</span></span></div></div></a><a className="product mw" href="/product/occasion-bisht-black"><div className="thumb"><img src={img.g3} alt="" /><span className="pill">Bisht Abayas</span></div><div className="info"><div className="name">Occasion Bisht Abaya, Black</div><div className="meta"><span className="price">AED 950</span><span className="mw-go">Shop now <span aria-hidden="true">→</span></span></div></div></a><a className="product mw" href="/product/everyday-cotton-jalabiya-pale-blue"><div className="thumb"><img src={img.g4} alt="" /><span className="pill">Jalabiyas</span></div><div className="info"><div className="name">Everyday Cotton Jalabiya, Pale Blue</div><div className="meta"><span className="price">AED 210</span><span className="mw-go">Shop now <span aria-hidden="true">→</span></span></div></div></a><a className="product mw" href="/product/relaxed-short-sleeve-tunic-stone"><div className="thumb"><img src={img.g5} alt="" /><span className="pill">Kaftans</span></div><div className="info"><div className="name">Relaxed Linen Kaftan, Stone</div><div className="meta"><span className="price">AED 190</span><span className="mw-go">Shop now <span aria-hidden="true">→</span></span></div></div></a><a className="product mw" href="/product/breathable-cotton-thobe-white"><div className="thumb"><img src={img.g6} alt="" /><span className="pill">Summer</span></div><div className="info"><div className="name">Breathable Linen Abaya, White</div><div className="meta"><span className="price">AED 360</span><span className="mw-go">Shop now <span aria-hidden="true">→</span></span></div></div></a></div>
      </div></section>

      <section className="section dark" id="categories"><div className="container">
       <div className="cat-head"><div><span className="label rv">*Category</span><h2 className="rv">Find Your Fit</h2></div><p className="rv">Shop by what you need, from everyday abayas to shaylas, girls&apos; wear and accessories.</p></div>
       <div className="tabs rv" role="tablist" aria-label="Filter categories"><button className="tab on" role="tab" aria-selected="true" data-f="all">All</button><button className="tab" role="tab" aria-selected="false" data-f="abaya">Abayas</button><button className="tab" role="tab" aria-selected="false" data-f="kids">Girls</button><button className="tab" role="tab" aria-selected="false" data-f="headwear">Hijabs</button><button className="tab" role="tab" aria-selected="false" data-f="accessories">Accessories</button></div>
       <div className="cat-grid"><a className="cat-card" href="/category/adult-thobes" data-c="abaya"><div className="im zoom"><span className="pill">3 Styles</span><img src={img.p1} alt="" /></div><h3>Everyday Abayas</h3><div>Starts from <span className="price">AED 420</span></div></a><a className="cat-card" href="/category/traditional-kandura" data-c="abaya"><div className="im zoom"><span className="pill">3 Styles</span><img src={img.p2} alt="" /></div><h3>Occasion & Embellished Abayas</h3><div>Starts from <span className="price">AED 450</span></div></a><a className="cat-card" href="/category/kids-clothing" data-c="kids"><div className="im zoom"><span className="pill">3 Styles</span><img src={img.p3} alt="" /></div><h3>Girls' Abayas & Jalabiyas</h3><div>Starts from <span className="price">AED 190</span></div></a><a className="cat-card" href="/category/shimagh-ghutra" data-c="headwear"><div className="im zoom"><span className="pill">3 Styles</span><img src={img.p4} alt="" /></div><h3>All Hijabs & Shaylas</h3><div>Starts from <span className="price">AED 130</span></div></a><a className="cat-card" href="/category/perfumes" data-c="accessories"><div className="im zoom"><span className="pill">3 Styles</span><img src={img.p5} alt="" /></div><h3>Perfumes & Oud</h3><div>Starts from <span className="price">AED 260</span></div></a><a className="cat-card" href="/category/wallets" data-c="accessories"><div className="im zoom"><span className="pill">3 Styles</span><img src={img.p6} alt="" /></div><h3>Clutches & Bags</h3><div>Starts from <span className="price">AED 180</span></div></a></div>
      </div></section>

      <section className="stack" aria-label="Featured looks"><div className="stack-sticky">
       <div className="panel"><img src={img.s1} alt="" /></div><div className="panel"><img src={img.s2} alt="" /></div><div className="panel"><img src={img.s3} alt="" /></div><div className="panel"><img src={img.s4} alt="" /></div>
       <div className="stack-card-wrap"><div className="container"><div className="stack-card"><div className="stack-track"><a className="product" href="/product/stitched-saderi-olive"><span className="pill">Long Gilets</span><div className="thumb"><img src={img.g1} alt="" /></div><div className="name">Quilted Long Gilet, Olive</div><div className="price">AED 280</div></a><a className="product" href="/product/tailored-layering-jacket-charcoal"><span className="pill">Coat Abayas</span><div className="thumb"><img src={img.g2} alt="" /></div><div className="name">Tailored Coat Abaya, Charcoal</div><div className="price">AED 390</div></a><a className="product" href="/product/occasion-bisht-black"><span className="pill">Bisht Abayas</span><div className="thumb"><img src={img.g3} alt="" /></div><div className="name">Occasion Bisht Abaya, Black</div><div className="price">AED 950</div></a><a className="product" href="/product/breathable-cotton-thobe-white"><span className="pill">Summer</span><div className="thumb"><img src={img.g6} alt="" /></div><div className="name">Breathable Linen Abaya, White</div><div className="price">AED 360</div></a></div></div></div></div>
      </div></section>

      <section className="section"><div className="container">
       <div className="comfort-head"><span className="label rv">*Comfort</span><h2 className="rv">Made For Moving<br />Through Your Day</h2><div className="arrows rv"><button className="round c-prev" type="button" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"/></svg></button><button className="round c-next" type="button" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></button></div></div>
       <div className="slider"><div className="slider-track"><a className="look" href="/product/button-placket-thobe-stone"><div className="bg zoom"><img src={img.p1} alt="" /></div><div className="look-txt"><b>Button-Front Abaya, Stone</b><span className="price">AED 450</span></div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="look" href="/product/hand-finished-neck-kandura-cream"><div className="bg zoom"><img src={img.p2} alt="" /></div><div className="look-txt"><b>Hand-Embroidered Neckline Abaya, Cream</b><span className="price">AED 480</span></div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="look" href="/product/boys-stand-collar-thobe-cream"><div className="bg zoom"><img src={img.p3} alt="" /></div><div className="look-txt"><b>Girls' Embroidered Jalabiya, Cream</b><span className="price">AED 220</span></div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="look" href="/product/fine-weave-shimagh-red-and-white"><div className="bg zoom"><img src={img.p4} alt="" /></div><div className="look-txt"><b>Border-Print Shayla, Red and White</b><span className="price">AED 160</span></div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="look" href="/product/citrus-musk-eau-de-parfum-gold"><div className="bg zoom"><img src={img.p5} alt="" /></div><div className="look-txt"><b>White Musk Eau de Parfum, Gold</b><span className="price">AED 290</span></div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="look" href="/product/slim-card-wallet-black"><div className="bg zoom"><img src={img.p6} alt="" /></div><div className="look-txt"><b>Evening Clutch, Black</b><span className="price">AED 210</span></div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a></div></div>
      </div></section>

      <section className="section dark disc"><div className="container"><span className="label rv">*Occasion Wear</span><h2 className="rv">Dressed For Every Occasion</h2></div>
       <div className="disc-stage" style={{ position: "relative" }}>
        <div className="marquee" aria-hidden="true"><span>Since 1998</span><span>Since 1998</span><span>Since 1998</span><span>Since 1998</span></div>
        <div className="disc-cards"><a className="disc-card on" href="/product/formal-cuffed-thobe-olive"><div className="bg zoom"><img src={img.p1} alt="" /></div><span className="pill">Everyday Abayas</span><div className="disc-txt"><b>Pleated Cuff Abaya, Olive</b>AED 480 &nbsp;|&nbsp; Olive</div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="disc-card" href="/product/heritage-cuff-kandura-taupe"><div className="bg zoom"><img src={img.p2} alt="" /></div><span className="pill">Occasion & Embellished Abayas</span><div className="disc-txt"><b>Beaded Cuff Abaya, Taupe</b>AED 510 &nbsp;|&nbsp; Taupe</div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="disc-card" href="/product/boys-occasion-kandura-sand"><div className="bg zoom"><img src={img.p3} alt="" /></div><span className="pill">Girls' Abayas & Jalabiyas</span><div className="disc-txt"><b>Girls' Eid Abaya, Sand</b>AED 250 &nbsp;|&nbsp; Sand</div><span className="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a></div>
        <div className="arrows"><button className="round d-prev" type="button" aria-label="Previous offer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"/></svg></button><button className="round d-next" type="button" aria-label="Next offer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></button></div>
       </div>
      </section>

      <section className="tst" aria-label="Customer reviews"><div className="tst-sticky">
       <div className="container tst-head"><div><span className="label">*Our Promise</span><h2>What We Stand For</h2></div><p>The standard every Dressly piece is held to, in store or at your door.</p></div>
       <div className="tst-track"><div className="tst-im zoom"><img src={img.t1} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Precision in fit, honesty in fabric. Every abaya is finished to the standard our name was built on.</blockquote><hr /><b>Our promise</b><small>Since 1998</small></article><div className="tst-im zoom"><img src={img.t2} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Personal attention to every client&apos;s needs has earned us a trusted name across the UAE.</blockquote><hr /><b>Customer first</b><small>Our approach</small></article><div className="tst-im zoom"><img src={img.t3} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Our tailors bring the fabrics and the measuring tape straight to your home or majlis.</blockquote><hr /><b>Home tailoring</b><small>We come to you</small></article><div className="tst-im zoom"><img src={img.t4} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Abayas cut from the finest fabrics, blending traditional design with modern craft.</blockquote><hr /><b>Bespoke abayas</b><small>Made to measure</small></article><div className="tst-im zoom"><img src={img.t5} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Visit any of our 13 branches across 5 Emirates to choose fabric and be measured.</blockquote><hr /><b>13 branches</b><small>Across the UAE</small></article><div className="tst-im zoom"><img src={img.t6} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Uniforms held to the same exacting standard of precision as our abayas.</blockquote><hr /><b>Uniforms</b><small>Army &amp; police</small></article><div className="tst-im zoom"><img src={img.t7} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Women&apos;s sandals, shaylas and abaya accessories to complete the look.</blockquote><hr /><b>Accessories</b><small>The finishing touch</small></article><div className="tst-im zoom"><img src={img.t8} alt="" /></div><article className="tst-card"><div className="stars" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div><blockquote>Order, ask about fabric or book a fitting on WhatsApp, any time.</blockquote><hr /><b>WhatsApp</b><small>+971 56 858 6987</small></article></div>
      </div></section>

      <section className="section grey" id="journal"><div className="container blog-grid">
       <div className="blog-side"><div><span className="label rv">*Blog</span><h2 className="rv">Notes On<br />Getting Dressed</h2></div><div className="rv"><a className="btn " href="/blog"><span className="roll"><span data-t="View All Posts">View All Posts</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a></div></div>
       <a className="blog-card" href="/blog/how-to-choose-the-right-kandura-fit"><div className="im zoom"><img src={img.b1} alt="" /></div><h3>How to Choose the Right Abaya Fit</h3><span className="read"><span className="roll"><span data-t="Read More">Read More</span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a><a className="blog-card" href="/blog/keep-white-kanduras-bright"><div className="im zoom"><img src={img.b2} alt="" /></div><h3>Caring for White Abayas: Keep Them Bright</h3><span className="read"><span className="roll"><span data-t="Read More">Read More</span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a>
      </div></section>

      {/* Follow Us: the home page "Behind the craft" reels section (see page.tsx) */}

      <section className="section reels-section" style={{ paddingBottom: "64px" }}>
        <div className="container tst-head reels-head">
          <div><span className="label rv">*Behind The Craft</span><h2 className="rv">See It On Instagram</h2></div>
          <p className="rv">Follow <a href="https://www.instagram.com/dressly" target="_blank" rel="noopener noreferrer">@dressly</a> on Instagram for more, and tag us wearing Dressly to be featured in our community showcase.</p>
        </div>
        {community}
      </section>

      <section className="cta"><img className="cta-bg" src={img.cta} alt="" /><div className="container">
       <h2 className="rv">Abayas Made To Your Measure, Since 1998</h2>
       <div className="cta-row"><div className="rv"><a className="btn light" href="/category/kandura-thobes"><span className="roll"><span data-t="Shop Now">Shop Now</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a></div><div className="rv">DRESSLY<br />TAILORING SINCE 1998</div></div>
      </div></section>
      </main>

      <footer className="footer"><div className="container">
       <div className="foot-grid">
        <div className="foot-img zoom"><img src={img.foot} alt="" /></div>
        <div>
         <FooterColumns />
         <div className="foot-end"><span>© 2026 Dressly. All rights reserved.</span><div className="socials"><a href="https://www.tiktok.com/@dressly" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4v10a3 3 0 1 1-3-3M14 4c.5 2.5 2 4 5 4"/></svg></a><a href="https://www.instagram.com/dressly" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".5"/></svg></a><a href="https://api.whatsapp.com/send/?phone=971568586987" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 1.8.8-.3 1.4c-3.5.5-7.7-3.7-7.2-7.2l1.4-.3.8 1.8z"/></svg></a></div></div>
        </div>
       </div>
       <div className="foot-giant"><span className="giant"><span className="fit" style={{ display: "inline-block" }} aria-label="DRESSLY"><span className="ch" aria-hidden="true">D</span><span className="ch" aria-hidden="true">R</span><span className="ch" aria-hidden="true">E</span><span className="ch" aria-hidden="true">S</span><span className="ch" aria-hidden="true">S</span><span className="ch" aria-hidden="true">L</span><span className="ch" aria-hidden="true">Y</span></span></span></div>
      </div></footer>

      <div className="drawer-bg"></div>
      <aside className="drawer" aria-label="Shopping cart"><div className="drawer-head"><h4>Your Cart</h4><button className="drawer-close" type="button" aria-label="Close cart">✕</button></div><p>Your cart is empty.</p></aside>
    </div>
  );
}
