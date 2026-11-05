"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shows a photo that follows the cursor while a FAQ question is hovered.
 * Each <details> in `.ip-faq` sets the photo with data-img. Only on devices
 * with a mouse, and not when the visitor prefers reduced motion.
 */
export default function FaqCursorImage() {
  const box = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = box.current!;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      // Ease towards the cursor so the photo trails it softly.
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx + 24}px, ${cy - 90}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const item = (e.target as HTMLElement).closest<HTMLElement>(".ip-faq details[data-img]");
      if (item) {
        if (!raf) {
          cx = x;
          cy = y;
          raf = requestAnimationFrame(tick);
        }
        setSrc(item.dataset.img ?? null);
      } else {
        setSrc(null);
      }
    };
    const leave = () => setSrc(null);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={box} className={`faq-cursor${src ? " on" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" />}
    </div>
  );
}
