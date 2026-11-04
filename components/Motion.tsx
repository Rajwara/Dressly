"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = "power3.out";

/**
 * Site-wide GSAP animations, attached by class name so pages stay plain markup.
 * Runs again on every route change and reverts cleanly. Nothing moves when the
 * visitor prefers reduced motion.
 */
export default function Motion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);
        const onScroll = (trigger: Element, start = "top 86%") => ({ trigger, start, once: true });

        // Hero: copy rises in, photo settles from a slow zoom, then drifts on scroll.
        const hero = document.querySelector(".hero");
        if (hero) {
          const copy = hero.querySelectorAll(".hero-copy > div:not([hidden]) > *, .hero-copy .dots");
          gsap.timeline({ defaults: { ease: EASE } })
            .from(".hero-media", { scale: 1.12, duration: 2.2, ease: "power2.out" }, 0)
            .from(copy, { y: 36, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.25);
          gsap.to(".hero-media", { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        }

        // Page and category banners.
        q(".page-banner img, .cat-hero-pic img").forEach((img) => {
          gsap.from(img, { scale: 1.15, duration: 1.8, ease: "power2.out" });
        });
        q(".page-banner-copy > *, .cat-hero-copy > *").forEach((el, i) => {
          gsap.from(el, { y: 26, autoAlpha: 0, duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 });
        });

        // Section headings: fade up, and the little rule under them draws in.
        q(".center-head, .head, .community .wrap:first-child").forEach((el) => {
          gsap.from(el.children, { y: 28, autoAlpha: 0, duration: 0.9, ease: EASE, stagger: 0.08, scrollTrigger: onScroll(el) });
        });
        q(".center-head .rule").forEach((el) => {
          gsap.from(el, { scaleX: 0, duration: 1.1, ease: "power2.inOut", scrollTrigger: onScroll(el) });
        });

        // Product cards and other grids: staggered rise as each row enters.
        ScrollTrigger.batch(".grid .pcard, .timeline li, .steps li, .emirate, .clip", {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.fromTo(els, { y: 46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE, stagger: 0.09, overwrite: true }),
        });
        gsap.set(".grid .pcard, .timeline li, .steps li, .emirate, .clip", { autoAlpha: 0 });
        ScrollTrigger.refresh();

        // Category tiles: wipe up from the bottom, image settles.
        q(".mosaic .tile").forEach((tile, i) => {
          const tl = gsap.timeline({ scrollTrigger: onScroll(tile, "top 92%"), delay: (i % 4) * 0.08 });
          tl.from(tile, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" }).from(
            tile.querySelector("img"),
            { scale: 1.25, duration: 1.4, ease: "power2.out" },
            0,
          );
        });

        // Editorial images: wipe in from the side, then a gentle parallax.
        q(".story > img, .service-pic").forEach((el, i) => {
          gsap.from(el, { clipPath: i % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", duration: 1.3, ease: "power4.inOut", scrollTrigger: onScroll(el) });
          // Only images inside a clipping frame get the zoomed parallax; a bare image would spill sideways.
          const img = el.tagName === "IMG" ? null : el.querySelector("img");
          if (img) gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        q(".story > div, .service > div:last-child").forEach((el) => {
          gsap.from(el.children, { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: EASE, scrollTrigger: onScroll(el) });
        });

        // Stats count up.
        q(".stats b").forEach((el) => {
          const text = el.textContent ?? "";
          const m = text.match(/^(\d+)(.*)$/);
          if (!m) return;
          const end = Number(m[1]);
          const from = end > 1000 ? end - 40 : 0;
          const obj = { v: from };
          gsap.to(obj, {
            v: end,
            duration: 1.8,
            ease: "power2.out",
            scrollTrigger: onScroll(el, "top 95%"),
            onUpdate: () => {
              el.textContent = Math.round(obj.v) + m[2];
            },
          });
        });

        // Ribbon, stats and footer columns.
        q(".ribbon .wrap > *, .stats .wrap > div, footer .cols > div").forEach((el, i) => {
          gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.8, ease: EASE, delay: (i % 4) * 0.08, scrollTrigger: onScroll(el, "top 96%") });
        });
      });
      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
