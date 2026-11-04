"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import Icon from "./Icon";

export type Clip = { handle: string; video: string; poster: string; verified: boolean; products: CardProduct[] };

function VideoCard({ clip, index, reduceMotion }: { clip: Clip; index: number; reduceMotion: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [shopping, setShopping] = useState(false);

  // Play while the card is mostly on screen, unless the viewer paused it.
  useEffect(() => {
    const v = ref.current;
    if (!v || reduceMotion) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [userPaused, reduceMotion]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  const n = clip.products.length;

  return (
    <article className="clip" aria-label={`Look ${index + 1} by ${clip.handle}`}>
      <video
        ref={ref}
        src={clip.video}
        poster={clip.poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
      />
      <div className="clip-top">
        <span className="clip-handle">
          {clip.handle}
          {clip.verified && (
            <span className="clip-verified" aria-label="Verified">
              <Icon name="verified" size={15} />
            </span>
          )}
        </span>
        <span className="clip-controls">
          <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"}>
            <Icon name={playing ? "pause" : "play"} size={15} />
          </button>
          <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute video" : "Mute video"} aria-pressed={!muted}>
            <Icon name={muted ? "muted" : "sound"} size={16} />
          </button>
        </span>
      </div>

      {n > 0 && (
        <button className="clip-shop" type="button" onClick={() => setShopping(true)} aria-expanded={shopping}>
          Shop the Look [{n}]
        </button>
      )}

      {shopping && (
        <div className="clip-panel" role="dialog" aria-label="Shop the look">
          <div className="clip-panel-head">
            <b>Shop the Look</b>
            <button type="button" aria-label="Close" onClick={() => setShopping(false)}>
              <Icon name="close" size={18} />
            </button>
          </div>
          <ul>
            {clip.products.map((p) => (
              <li key={p.slug}>
                <Link href={`/product/${p.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" loading="lazy" />
                  <span>
                    {p.name}
                    <small>{money(p.price)}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default function CommunityVideos({
  eyebrow,
  text,
  instagram,
  clips,
  hideHead,
}: {
  eyebrow: string;
  text: string;
  instagram: string;
  clips: Clip[];
  /** Leave out the built-in eyebrow and text, when the page renders its own heading. */
  hideHead?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ start: 0, size: 1, atStart: true, atEnd: false });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => setReduceMotion(matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    const size = t.scrollWidth ? t.clientWidth / t.scrollWidth : 1;
    const start = max > 0 ? (t.scrollLeft / max) * (1 - size) : 0;
    setProgress({ start, size, atStart: t.scrollLeft <= 2, atEnd: t.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const t = track.current;
    const card = t?.querySelector<HTMLElement>(".clip");
    if (!t || !card) return;
    t.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section className="community">
      {!hideHead && <div className="wrap">
        <span className="eyebrow">{eyebrow}</span>
        <p className="community-text">
          {text.split("@dressly").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <span key={i}>
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  @dressly
                </a>
                {part}
              </span>
            ),
          )}
        </p>
      </div>}
      <div className="clips" ref={track} onScroll={measure}>
        {clips.map((c, i) => (
          <VideoCard key={c.video} clip={c} index={i} reduceMotion={reduceMotion} />
        ))}
      </div>
      <div className="wrap clips-nav">
        <div className="clips-progress" aria-hidden="true">
          <span style={{ left: `${progress.start * 100}%`, width: `${progress.size * 100}%` }} />
        </div>
        <button type="button" aria-label="Previous videos" onClick={() => step(-1)} disabled={progress.atStart}>
          <Icon name="arrowLeft" size={20} />
        </button>
        <button type="button" aria-label="Next videos" onClick={() => step(1)} disabled={progress.atEnd}>
          <Icon name="arrowRight" size={20} />
        </button>
      </div>
    </section>
  );
}
