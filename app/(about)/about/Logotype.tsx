"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";

export type LogotypeImages = Record<string, string | undefined>;

/**
 * "Logotype" homepage, ported from index_14.html. Markup and CSS (./logotype.css)
 * are unchanged and the original script runs in the effect below.
 *
 * Images: every <img> keeps its data-ph placeholder. When a file for that slot
 * exists (see page.tsx) it is passed in as `src`, and the placeholder is skipped,
 * exactly as the original script does for an <img> that already has a src.
 */
export default function Logotype({ img }: { img: LogotypeImages }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = root.current!;
    const html = document.documentElement;
    const $ = (s: string, r: ParentNode = scope) => r.querySelector<HTMLElement>(s)!;
    const $$ = (s: string, r: ParentNode = scope) => Array.from(r.querySelectorAll<HTMLElement>(s));
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const desktop = window.matchMedia("(min-width: 992px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) html.classList.add("hover-device");

    const off: (() => void)[] = [];
    const on = (t: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
      t.addEventListener(type, fn, opts);
      off.push(() => t.removeEventListener(type, fn, opts));
    };

    /* ---------- Placeholder images. Set a real src on any <img> and this skips it. ---------- */
    const tones: Record<string, [string, string]> = { 1: ["#e2cec7", "#7d6873"], 2: ["#cbb3bf", "#5a3c50"], 3: ["#ebdcd6", "#7d6873"], 4: ["#6e5a66", "#f3e7e2"] };
    $$("img[data-ph]").forEach((el) => {
      const image = el as HTMLImageElement;
      if (image.getAttribute("src")) return;
      const p = image.dataset.ph!.split("|");
      const d = p[1].split("x");
      const t = tones[p[2]] || tones[1];
      const w = +d[0];
      const h = +d[1];
      const fs = Math.max(12, Math.min(w, h) / 14);
      const label = p[0]
        ? '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="' + fs + '" fill="' + t[1] + '">' + p[0] + " · " + w + "×" + h + "</text>"
        : "";
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '"><rect width="100%" height="100%" fill="' + t[0] + '"/>' +
        '<path d="M0 0L' + w + " " + h + "M" + w + " 0L0 " + h + '" stroke="' + t[1] + '" stroke-opacity=".18"/>' + label + "</svg>";
      image.src = "data:image/svg+xml," + encodeURIComponent(svg);
    });

    /* ---------- Fit the fixed 1200px desktop composition on narrower laptops ---------- */
    const page = $(".page");
    function fit() {
      const w = document.documentElement.clientWidth;
      page.style.zoom = w >= 992 && w < 1334 ? String(w / 1334) : "";
    }
    fit();
    on(window, "resize", fit);

    /* ---------- Reveal groups: animate once when the group scrolls into view ---------- */
    const groups = $$("[data-group]");
    let io: IntersectionObserver | null = null;
    if (reduced || !("IntersectionObserver" in window)) {
      groups.forEach((g) => g.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io!.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      groups.forEach((g) => io!.observe(g));
    }

    /* ---------- Hero slider: 1.5s hold, 0.5s slide, infinite ---------- */
    let timer: ReturnType<typeof setInterval> | undefined;
    {
      const track = $("#track");
      const slider = $("#slider");
      const slides = $$(".slide", track);
      const n = slides.length;
      track.insertBefore(slides[n - 1].cloneNode(true), slides[0]);
      track.appendChild(slides[0].cloneNode(true));
      track.appendChild(slides[1].cloneNode(true));
      let i = 1;
      const set = (v: number) => {
        i = v;
        track.style.setProperty("--i", String(i));
      };
      const go = (v: number) => {
        track.classList.remove("snap");
        set(v);
      };
      const snap = (v: number) => {
        track.classList.add("snap");
        set(v);
        void track.offsetWidth;
        track.classList.remove("snap");
      };
      on(track, "transitionend", (e) => {
        if (e.target !== track) return;
        if (i > n) snap(i - n);
        else if (i < 1) snap(i + n);
      });
      const stop = () => clearInterval(timer);
      const play = () => {
        stop();
        if (!reduced) timer = setInterval(() => go(i + 1), 2000);
      };
      set(1);
      on($("#next"), "click", () => {
        if (i > n) snap(i - n);
        go(i + 1);
        play();
      });
      on($("#prev"), "click", () => {
        if (i < 1) snap(i + n);
        go(i - 1);
        play();
      });
      let x0: number | null = null;
      on(slider, "touchstart", ((e: TouchEvent) => {
        x0 = e.touches[0].clientX;
        stop();
      }) as EventListener, { passive: true });
      on(slider, "touchend", ((e: TouchEvent) => {
        if (x0 !== null) {
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        }
        x0 = null;
        play();
      }) as EventListener);
      on(document, "visibilitychange", () => (document.hidden ? stop() : play()));
      play();
    }

    /* ---------- Scroll-linked keyframes, with the same heavy smoothing feel ----------
       progress: 0 when the section's top enters the bottom of the viewport,
                 100 when its bottom leaves the top. */
    type Frame = [number, Partial<Record<"w" | "x" | "y" | "s" | "o", number>>];
    type Track = { el: HTMLElement; frames: Frame[] };
    type Scene = { sec: HTMLElement; smooth: number; always: boolean; tracks: Track[]; cur?: number; drawn?: number };
    const track = (el: HTMLElement, frames: Frame[]): Track => ({ el, frames });
    const lines = $$(".about-ink");
    const scenes: Scene[] = [
      {
        // About: lines fill in, note the last line finishes after line 4, as in the source
        sec: $("#about"),
        smooth: 0.96,
        always: true,
        tracks: [
          track(lines[0], [[16, { w: 0 }], [24, { w: 105 }]]),
          track(lines[1], [[25, { w: 0 }], [37, { w: 105 }]]),
          track(lines[2], [[38, { w: 0 }], [43, { w: 105 }]]),
          track(lines[3], [[44, { w: 0 }], [49, { w: 105 }]]),
          track(lines[4], [[54, { w: 0 }], [65, { w: 105 }]]),
        ],
      },
      {
        // Services: heading slides in, cards scale up from offset positions
        sec: $("#services"),
        smooth: 0.97,
        always: false,
        tracks: [
          track($("#svcHead"), [[0, { o: 0, x: -469 }], [25, { o: 1, x: 0 }]]),
          track($("#svc1"), [[7, { s: 0 }], [30, { s: 1 }]]),
          track($("#svc2"), [[30, { s: 0, x: 354, y: -119 }], [42, { s: 1, x: 0, y: 0 }]]),
          track($("#svc3"), [[42, { s: 0, x: -406, y: -273 }], [50, { s: 1, x: 0, y: 0 }]]),
          track($("#svc4"), [[54, { s: 0, x: 391, y: -108 }], [73, { s: 1, x: 0, y: 0 }]]),
          track($("#svcText"), [[56, { o: 0, x: 378 }], [73, { o: 1, x: 100 }]]),
        ],
      },
    ];

    function valueAt(frames: Frame[], prop: keyof Frame[1], p: number) {
      const pts = frames.filter((f) => prop in f[1]);
      if (!pts.length) return undefined;
      if (p <= pts[0][0]) return pts[0][1][prop]!;
      for (let k = 1; k < pts.length; k++) {
        if (p <= pts[k][0]) {
          const t = (p - pts[k - 1][0]) / (pts[k][0] - pts[k - 1][0]);
          return pts[k - 1][1][prop]! + (pts[k][1][prop]! - pts[k - 1][1][prop]!) * t;
        }
      }
      return pts[pts.length - 1][1][prop]!;
    }
    function apply(t: Track, p: number) {
      const f = t.frames;
      const w = valueAt(f, "w", p);
      if (w !== undefined) {
        t.el.style.width = w + "%";
        return;
      }
      const x = valueAt(f, "x", p) || 0;
      const y = valueAt(f, "y", p) || 0;
      const s = valueAt(f, "s", p);
      const o = valueAt(f, "o", p);
      t.el.style.transform = "translate(" + x + "px," + y + "px) scale(" + (s === undefined ? 1 : s) + ")";
      if (o !== undefined) t.el.style.opacity = String(o);
    }
    function clearScene(sc: Scene) {
      sc.tracks.forEach((t) => {
        t.el.style.transform = "";
        t.el.style.opacity = "";
      });
      sc.cur = undefined;
      sc.drawn = undefined;
    }
    function target(sc: Scene) {
      const r = sc.sec.getBoundingClientRect();
      const vh = window.innerHeight;
      return clamp((vh - r.top) / (r.height + vh), 0, 1) * 100;
    }
    let last = 0;
    let raf = 0;
    function tick(now: number) {
      const dt = Math.min(now - last, 100) || 16.67;
      last = now;
      scenes.forEach((sc) => {
        if (!sc.always && !desktop.matches) {
          if (sc.cur !== undefined) clearScene(sc);
          return;
        }
        const goal = target(sc);
        if (sc.cur === undefined || reduced) sc.cur = goal;
        else sc.cur += (goal - sc.cur) * (1 - Math.pow(sc.smooth, dt / 16.67));
        if (sc.drawn === undefined || Math.abs(sc.drawn - sc.cur) > 0.005) {
          sc.tracks.forEach((t) => apply(t, sc.cur!));
          sc.drawn = sc.cur;
        }
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    /* ---------- Process hover: unblur the row, show its tilted image ---------- */
    /* Click (or Enter/Space) opens a step to show its details; one step open at a time. */
    const processImgs = $$(".process-images > div");
    const processCards = $$(".process-card");
    const openStep = (card: HTMLElement | null) => {
      processCards.forEach((c, i) => {
        const isOpen = c === card;
        c.classList.toggle("open", isOpen);
        c.setAttribute("aria-expanded", String(isOpen));
        processImgs[i].classList.toggle("on", isOpen);
      });
    };
    processCards.forEach((c) => {
      const pimg = processImgs[+c.dataset.i!];
      on(c, "mouseenter", () => pimg.classList.add("on"));
      on(c, "mouseleave", () => {
        if (!c.classList.contains("open")) pimg.classList.remove("on");
      });
      on(c, "click", (e) => {
        if ((e.target as HTMLElement).closest("a")) return;
        openStep(c.classList.contains("open") ? null : c);
      });
      on(c, "keydown", ((e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openStep(c.classList.contains("open") ? null : c);
        }
      }) as EventListener);
    });

    /* ---------- Testimonial tabs ---------- */
    const tabs = $$(".t-tab");
    const panes = $$(".t-pane");
    function selectTab(idx: number) {
      tabs.forEach((t, i) => {
        t.setAttribute("aria-selected", i === idx ? "true" : "false");
        t.tabIndex = i === idx ? 0 : -1;
      });
      panes.forEach((p, i) => {
        p.classList.toggle("show", i === idx);
        p.classList.remove("fade");
        if (i === idx) {
          void p.offsetWidth;
          p.classList.add("fade");
        }
      });
    }
    tabs.forEach((t, i) => {
      on(t, "click", () => selectTab(i));
      on(t, "keydown", ((e: KeyboardEvent) => {
        const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (d) {
          e.preventDefault();
          const n = (i + d + tabs.length) % tabs.length;
          selectTab(n);
          tabs[n].focus();
        }
      }) as EventListener);
    });
    selectTab(0);

    /* The header and its menu come from the home page (see FieldwornChrome). */

    return () => {
      off.forEach((f) => f());
      clearInterval(timer);
      cancelAnimationFrame(raf);
      io?.disconnect();
      html.classList.remove("hover-device");
    };
  }, []);

  return (
    <div ref={root} style={{ display: "contents" }}>
      <div className="page">

        <main>
          {/* HERO */}
          <section className="hero gutter"><div className="wrap" data-group="">
            <div className="hero-top">
              <h1 className="h1 hero-title" data-r="" style={{ "--x": "-80px", "--d": "1.4s" } as React.CSSProperties}>The Art of the Abaya, Perfected.</h1>
              <div className="hero-intro" data-r="" style={{ "--x": "80px", "--d": "1.4s", "--w": ".3s" } as React.CSSProperties}>
                <p>Since 1998, Dressly has dressed the women of the UAE in abayas cut with precision and finished to a standard we have spent a generation refining.</p>
                <a className="btn" href="/category/kandura-thobes"><span className="roll"><span data-t="View collection">View collection</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a>
              </div>
            </div>
            <div className="hero-bottom">
              <div className="hero-social" data-r="" style={{ "--d": "1.4s" } as React.CSSProperties}>
                <a className="social" href="https://www.tiktok.com/@dressly" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 4v10a3 3 0 1 1-3-3M14 4c.5 2.5 2 4 5 4"/></svg></a>
                <a className="social" href="https://www.instagram.com/dressly" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="16.8" cy="7.2" r=".6" fill="currentColor"/></svg></a>
                <a className="social" href="https://api.whatsapp.com/send/?phone=971568586987" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 1.8.8-.3 1.4c-3.5.5-7.7-3.7-7.2-7.2l1.4-.3.8 1.8z"/></svg></a>
              </div>
              <div className="hero-stage">
                <div className="slider-wrap">
                  <div className="slider" id="slider" aria-roledescription="carousel" aria-label="Featured images">
                    <div className="track" id="track">
                      {/* Slide template: replace data-ph with src="your-image.jpg" on each <img /> */}
                      <div className="slide" data-slide="1"><figure><img src={img["hero-1a"]} data-ph="Hero 1A|200x271|1" alt="" /></figure><figure className="big"><img src={img["hero-1b"]} data-ph="Hero 1B|400x542|2" alt="" /></figure><figure><img src={img["hero-1c"]} data-ph="Hero 1C|200x271|3" alt="" /></figure></div>
                      <div className="slide" data-slide="2"><figure><img src={img["hero-2a"]} data-ph="Hero 2A|200x271|2" alt="" /></figure><figure className="big"><img src={img["hero-2b"]} data-ph="Hero 2B|400x542|4" alt="" /></figure><figure><img src={img["hero-2c"]} data-ph="Hero 2C|200x271|1" alt="" /></figure></div>
                      <div className="slide" data-slide="3"><figure><img src={img["hero-3a"]} data-ph="Hero 3A|200x271|3" alt="" /></figure><figure className="big"><img src={img["hero-3b"]} data-ph="Hero 3B|400x542|1" alt="" /></figure><figure><img src={img["hero-3c"]} data-ph="Hero 3C|200x271|4" alt="" /></figure></div>
                    </div>
                    <button className="slider-hit prev" id="prev" aria-label="Previous slide"></button>
                    <button className="slider-hit next" id="next" aria-label="Next slide"></button>
                  </div>
                  {/* Two stacked layers in difference mode give the dark-on-white, light-on-dark wordmark */}
                  <div className="wordmark" aria-hidden="true"><span>D</span><span>R</span><span>E</span><span>S</span><span>S</span><span>L</span><span>Y</span></div>
                  <div className="wordmark" aria-hidden="true"><span>D</span><span>R</span><span>E</span><span>S</span><span>S</span><span>L</span><span>Y</span></div>
                </div>
                <div className="scroll-cue" data-r="" style={{ "--d": "1.4s" } as React.CSSProperties}>
                  <svg viewBox="0 0 16 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M8 0v41M1 34l7 7 7-7"/></svg>
                  <span>Scroll Down</span>
                </div>
              </div>
            </div>
          </div></section>

          {/* ABOUT */}
          <section className="gutter" id="about"><div className="wrap pad" data-group="">
            <h2 className="h6 center about-label" data-r="">About us</h2>
            <p className="about-lines" data-r="" id="aboutLines">
              <span className="about-line">Since 1998, Dressly has dressed<span className="about-ink" aria-hidden="true">Since 1998, Dressly has dressed</span></span>
              <span className="about-line">the women of the UAE in abayas<span className="about-ink" aria-hidden="true">the women of the UAE in abayas</span></span>
              <span className="about-line">cut with precision and finished to<span className="about-ink" aria-hidden="true">cut with precision and finished to</span></span>
              <span className="about-line">a standard refined over a generation,<span className="about-ink" aria-hidden="true">a standard refined over a generation,</span></span>
              <span className="about-line">piece by piece<span className="about-ink" aria-hidden="true">piece by piece</span></span>
            </p>
            <div className="about-bottom" data-r="">
              <div className="about-img"><img src={img["about-1"]} data-ph="About 1|260x150|1" alt="" /></div>
              <a className="btn" href="/about"><span className="roll"><span data-t="Learn more">Learn more</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a>
              <div className="about-img"><img src={img["about-2"]} data-ph="About 2|260x150|3" alt="" /></div>
            </div>
          </div></section>

          {/* SERVICES */}
          <section className="gutter" id="services"><div className="wrap pad">
            <div className="services">
              <div className="svc-left">
                <h2 className="h2" id="svcHead">What we can do for you</h2>
                <a className="svc-card" id="svc2" href="/category/kandura-thobes"><div className="svc-img"><img src={img["service-1"]} data-ph="Service 1|449x482|2" alt="" /></div><div className="h6">Bespoke Abayas</div></a>
                <a className="svc-card" id="svc4" href="/category/shimagh-ghutra"><div className="svc-img"><img src={img["service-2"]} data-ph="Service 2|449x482|4" alt="" /></div><div className="h6">Hijabs &amp; Shaylas</div></a>
              </div>
              <div className="svc-right">
                <a className="svc-card" id="svc1" href="https://api.whatsapp.com/send/?phone=971568586987&text=Hello%20Dressly%2C%20I%20would%20like%20to%20book%20a%20home%20tailoring%20visit." target="_blank" rel="noopener noreferrer"><div className="svc-img"><img src={img["service-3"]} data-ph="Service 3|439x482|3" alt="" /></div><div className="h6">Home Tailoring Visits</div></a>
                <a className="svc-card" id="svc3" href="/category/arabic-sandals"><div className="svc-img"><img src={img["service-4"]} data-ph="Service 4|439x482|1" alt="" /></div><div className="h6">Sandals, Shaylas &amp; Accessories</div></a>
                <div className="svc-text" id="svcText">
                  <p>From made-to-measure abayas to shaylas and the finishing accessories, every piece is held to the same exacting standard, in store or at your door.</p>
                  <a className="btn" href="https://api.whatsapp.com/send/?phone=971568586987&text=Hello%20Dressly%2C%20I%20would%20like%20to%20book%20a%20home%20tailoring%20visit." target="_blank" rel="noopener noreferrer"><span className="roll"><span data-t="Book a home visit">Book a home visit</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a>
                </div>
              </div>
            </div>
          </div></section>

          {/* PROCESS */}
          <section className="gutter" id="process"><div className="wrap pad" data-group="">
            <h2 className="h2 center process-head" data-r="">Our process</h2>
            <div className="process-list" data-r="" id="processList">
              <div className="process-card" data-i="0" role="button" tabIndex={0} aria-expanded="false" aria-controls="process-desc-0"><span className="h6 num">01</span><span className="process-dot"></span><h3 className="h3">Request on WhatsApp</h3><p className="process-desc" id="process-desc-0">Send us your preferred date, time and area on <a href="https://api.whatsapp.com/send/?phone=971568586987&amp;text=Hello%20Dressly%2C%20I%20would%20like%20to%20book%20a%20home%20tailoring%20visit." target="_blank" rel="noopener noreferrer">WhatsApp</a> and we will confirm a slot and the tailor who will visit.</p></div>
              <div className="process-card" data-i="1" role="button" tabIndex={0} aria-expanded="false" aria-controls="process-desc-1"><span className="h6 num">02</span><span className="process-dot"></span><h3 className="h3">Home or majlis visit</h3><p className="process-desc" id="process-desc-1">A tailor arrives at your chosen time, at home or in your majlis, anywhere across the Emirates we serve.</p></div>
              <div className="process-card" data-i="2" role="button" tabIndex={0} aria-expanded="false" aria-controls="process-desc-2"><span className="h6 num">03</span><span className="process-dot"></span><h3 className="h3">Fabrics &amp; measurements</h3><p className="process-desc" id="process-desc-2">Browse our fabric swatches in person, choose your collar and cuff style, and get measured precisely on the spot.</p></div>
              <div className="process-card" data-i="3" role="button" tabIndex={0} aria-expanded="false" aria-controls="process-desc-3"><span className="h6 num">04</span><span className="process-dot"></span><h3 className="h3">Delivered to your door</h3><p className="process-desc" id="process-desc-3">Once tailored to perfection, your abayas are delivered straight to your door, and your measurements are kept for next time.</p></div>
              <div className="process-images" aria-hidden="true">
                <div><img src={img["process-1"]} data-ph="Process 1|400x450|4" alt="" /></div>
                <div><img src={img["process-2"]} data-ph="Process 2|400x450|2" alt="" /></div>
                <div><img src={img["process-3"]} data-ph="Process 3|400x450|3" alt="" /></div>
                <div><img src={img["process-4"]} data-ph="Process 4|400x450|1" alt="" /></div>
              </div>
            </div>
          </div></section>

          {/* PROJECTS */}
          <section className="gutter" id="projects"><div className="wrap pad" data-group="">
            <div className="project-head" data-r="">
              <h2 className="h2">Our story since 1998</h2>
              <a className="btn" href="/about"><span className="roll"><span data-t="Our story">Our story</span></span><span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg></span></a>
            </div>
            <div className="project-grid">
              <a className="project-card" data-r="" href="/about"><img src={img["project-1"]} data-ph="Project 1|585x650|2" alt="" /><div className="project-info"><div><span className="pill">Our beginning</span><div className="h6">A Tailor&apos;s Beginning</div></div><span>1998</span></div></a>
              <a className="project-card" data-r="" href="/about"><img src={img["project-2"]} data-ph="Project 2|585x650|4" alt="" /><div className="project-info"><div><span className="pill">Our growth</span><div className="h6">Setting the Standard</div></div><span>Growth</span></div></a>
              <a className="project-card" data-r="" href="/branches"><img src={img["project-3"]} data-ph="Project 3|585x650|1" alt="" /><div className="project-info"><div><span className="pill">Today</span><div className="h6">A Name Across the Emirates</div></div><span>Today</span></div></a>
              <a className="project-card" data-r="" href="/branches"><img src={img["project-4"]} data-ph="Project 4|585x650|3" alt="" /><div className="project-info"><div><span className="pill">Our branches</span><div className="h6">13 Branches, 5 Emirates</div></div><span>2026</span></div></a>
            </div>
          </div></section>

          {/* TESTIMONIALS */}
          <section className="gutter" id="testimonials"><div className="wrap pad" data-group="">
            <h2 className="h2 center t-head" data-r="">What we stand for</h2>
            <div className="t-tabs" id="tabs" role="tablist" aria-label="Client testimonials">
              <button className="t-tab" role="tab" aria-selected="true" aria-label="Our promise"><img src={img["avatar-1"]} data-ph="|50x50|2" alt="" /></button>
              <button className="t-tab" role="tab" aria-selected="false" aria-label="Our approach"><img src={img["avatar-2"]} data-ph="|50x50|4" alt="" /></button>
              <button className="t-tab" role="tab" aria-selected="false" aria-label="Our growth"><img src={img["avatar-3"]} data-ph="|50x50|1" alt="" /></button>
              <button className="t-tab" role="tab" aria-selected="false" aria-label="Home tailoring"><img src={img["avatar-4"]} data-ph="|50x50|3" alt="" /></button>
              <button className="t-tab" role="tab" aria-selected="false" aria-label="Bespoke abayas"><img src={img["avatar-5"]} data-ph="|50x50|2" alt="" /></button>
              <button className="t-tab" role="tab" aria-selected="false" aria-label="Hijabs and shaylas"><img src={img["avatar-6"]} data-ph="|50x50|4" alt="" /></button>
              <div className="t-panes" data-r="">
                <div className="t-pane show fade" role="tabpanel">
                  <svg className="t-quote" viewBox="0 0 50 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 41V19C1 9 6 3 18 1v5c-5 2-7 5-7 9h10v26H1zM29 41V19c0-10 5-16 17-18v5c-5 2-7 5-7 9h10v26H29z"/></svg>
                  <p className="h4">Precision in fit, honesty in fabric: every abaya is finished to the standard our name was built on.</p>
                  <p className="h6 t-name">Our promise</p>
                </div>
                <div className="t-pane" role="tabpanel"><svg className="t-quote" viewBox="0 0 50 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 41V19C1 9 6 3 18 1v5c-5 2-7 5-7 9h10v26H1zM29 41V19c0-10 5-16 17-18v5c-5 2-7 5-7 9h10v26H29z"/></svg><p className="h4">Personal attention to every client&apos;s needs has earned us a trusted name across the UAE.</p><p className="h6 t-name">Our approach</p></div>
                <div className="t-pane" role="tabpanel"><svg className="t-quote" viewBox="0 0 50 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 41V19C1 9 6 3 18 1v5c-5 2-7 5-7 9h10v26H1zM29 41V19c0-10 5-16 17-18v5c-5 2-7 5-7 9h10v26H29z"/></svg><p className="h4">What began as a single store is now a name found in almost every emirate.</p><p className="h6 t-name">Our growth</p></div>
                <div className="t-pane" role="tabpanel"><svg className="t-quote" viewBox="0 0 50 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 41V19C1 9 6 3 18 1v5c-5 2-7 5-7 9h10v26H1zM29 41V19c0-10 5-16 17-18v5c-5 2-7 5-7 9h10v26H29z"/></svg><p className="h4">Prefer to be fitted at home? Our tailors bring the fabrics and the tape to your door.</p><p className="h6 t-name">Home tailoring</p></div>
                <div className="t-pane" role="tabpanel"><svg className="t-quote" viewBox="0 0 50 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 41V19C1 9 6 3 18 1v5c-5 2-7 5-7 9h10v26H1zM29 41V19c0-10 5-16 17-18v5c-5 2-7 5-7 9h10v26H29z"/></svg><p className="h4">Abayas cut from the finest fabrics, blending traditional design with modern craft.</p><p className="h6 t-name">Bespoke abayas</p></div>
                <div className="t-pane" role="tabpanel"><svg className="t-quote" viewBox="0 0 50 42" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 41V19C1 9 6 3 18 1v5c-5 2-7 5-7 9h10v26H1zM29 41V19c0-10 5-16 17-18v5c-5 2-7 5-7 9h10v26H29z"/></svg><p className="h4">Shaylas and hijabs chosen to match every abaya, in chiffon, silk and soft cotton.</p><p className="h6 t-name">Shaylas</p></div>
              </div>
            </div>
          </div></section>
        </main>
      </div>
    </div>
  );
}
