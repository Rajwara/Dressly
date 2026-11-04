"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import pan from "@/lib/data/uae-globe-pan.json";
import { PLACES, normalise } from "@/lib/places";
import "./branch-globe.css";

export type GlobeBranch = { id: string; name: string; area: string; emirate: string; image: string; directions: string; lat: number; lng: number };

const FOCUS = { x: 500, y: 360 }; // where the active branch sits on the globe (1000-unit box)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
type Hit = { i: number; note?: string };

/** Branches matching a name, area or emirate; otherwise the nearest to a known UAE place. */
function searchBranches(branches: GlobeBranch[], q: string): { hits: Hit[]; title: string } {
  const n = normalise(q);
  if (!n) return { hits: [], title: "" };
  const direct = branches.map((b, i) => ({ b, i })).filter(({ b }) => normalise(`${b.name} ${b.area} ${b.emirate}`).includes(n));
  if (direct.length) return { hits: direct.map(({ i }) => ({ i })), title: `${direct.length} ${direct.length === 1 ? "branch" : "branches"}` };
  const place = PLACES.find((p) => normalise(p.name) === n) ?? PLACES.find((p) => normalise(p.name).includes(n) || n.includes(normalise(p.name)));
  if (!place) return { hits: [], title: "" };
  const near = branches
    .map((b, i) => ({ i, d: km(place, b) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map(({ i, d }) => ({ i, note: `${d < 10 ? d.toFixed(1) : Math.round(d)} km` }));
  return { hits: near, title: `Nearest to ${place.name}` };
}

/**
 * "Where we tailor" scroll story. The section pins while a row of cards (one
 * per branch) slides sideways; the map behind the globe pans to bring the
 * current branch into focus, every branch has a pin, and hovering a pin shows
 * a photo card that follows the cursor. Reduced motion: no pinning, the cards
 * scroll sideways and the globe stays put.
 */
export default function BranchGlobe({ branches, emirates }: { branches: GlobeBranch[]; emirates: number }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const layer = useRef<SVGGElement>(null);
  const pins = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<{ i: number; x: number; y: number; flip: boolean } | null>(null);
  const [reduced, setReduced] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const result = searchBranches(branches, query);

  const points = branches.map((b) => pan.branches.find((p) => p.id === b.id)!);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const sec = section.current!, row = track.current!;
    let distance = 0, raf = 0, running = false;
    const cur = { p: 0, mx: 0, my: 0 }, tgt = { p: 0 };

    const measure = () => {
      const vw = document.documentElement.clientWidth;
      distance = Math.max(0, row.scrollWidth - vw);
      sec.style.height = `${window.innerHeight + distance + window.innerHeight * 0.35}px`;
      onScroll();
    };
    const focusFor = (p: number) => {
      const f = p * (points.length - 1), i = Math.floor(f), t = f - i;
      const a = points[i], b = points[Math.min(i + 1, points.length - 1)];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };
    const draw = () => {
      const f = focusFor(cur.p);
      const tx = FOCUS.x - f.x, ty = FOCUS.y - f.y;
      layer.current?.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)})`);
      if (pins.current) pins.current.style.transform = `translate(${(tx / 10).toFixed(3)}%, ${(ty / 10).toFixed(3)}%)`;
      row.style.transform = `translate3d(${(-cur.p * distance).toFixed(1)}px,0,0)`;
      setActive(Math.round(cur.p * (points.length - 1)));
    };
    const tick = () => {
      const d = tgt.p - cur.p;
      cur.p = Math.abs(d) < 0.0005 ? tgt.p : cur.p + d * 0.12;
      draw();
      if (cur.p !== tgt.p) raf = requestAnimationFrame(tick);
      else running = false;
    };
    function onScroll() {
      const r = sec.getBoundingClientRect();
      const total = sec.offsetHeight - window.innerHeight;
      tgt.p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }
    measure();
    cur.p = tgt.p;
    draw();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
      sec.style.height = "";
    };
    // points derive from props and never change after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    const sec = section.current!;
    const total = sec.offsetHeight - window.innerHeight;
    const top = sec.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (total * i) / (branches.length - 1), behavior: "smooth" });
  };

  const pick = (i: number) => {
    setOpen(false);
    setQuery(branches[i].name);
    setActive(i);
    if (reduced) {
      track.current?.children[i]?.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
      return;
    }
    goTo(i);
  };

  const onPinMove = (i: number) => (e: React.PointerEvent) => {
    const r = section.current!.querySelector(".bg-sticky")!.getBoundingClientRect();
    const x = e.clientX - r.left;
    setHover({ i, x, y: e.clientY - r.top, flip: r.width - x < 280 });
  };
  const hovered = hover ? branches[hover.i] : null;

  return (
    <section ref={section} className={reduced ? "mk bg-story is-static" : "mk bg-story"} aria-labelledby="bg-title">
      <div className="bg-sticky">
        <div className="mk__head">
          <h2 className="mk__title" id="bg-title">
            Where we tailor: {branches.length} branches across {emirates} Emirates.
          </h2>
          <form
            className="bg-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const h = result.hits[sel] ?? result.hits[0];
              if (h) pick(h.i);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setSel(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, result.hits.length - 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Search a branch, area or emirate"
              aria-label="Search branches"
              role="combobox"
              aria-expanded={open && query.trim().length > 0}
              aria-controls="bg-search-list"
              aria-autocomplete="list"
            />
            <button type="submit">Search</button>
            {open && query.trim() && (
              <div className="bg-search-list" id="bg-search-list" role="listbox">
                {result.hits.length ? (
                  <>
                    <span className="bg-search-title">{result.title}</span>
                    {result.hits.map((h, n) => {
                      const b = branches[h.i];
                      return (
                        <button
                          type="button"
                          role="option"
                          aria-selected={n === sel}
                          key={b.id}
                          className={n === sel ? "on" : undefined}
                          onMouseEnter={() => setSel(n)}
                          onClick={() => pick(h.i)}
                        >
                          <span className="bg-search-n">{String(h.i + 1).padStart(2, "0")}</span>
                          <span>
                            <b>{b.name}</b>
                            <small>
                              {b.area} · {b.emirate}
                            </small>
                          </span>
                          {h.note && <em>{h.note}</em>}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <span className="bg-search-empty">
                    No branch found for “{query}”. Try an area such as Mirdif, or <a href="#branches">use the full finder</a>.
                  </span>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="bg-globe">
          <svg viewBox="0 0 1000 1000" aria-hidden="true">
            <defs>
              <radialGradient id="bg-ocean" cx="50%" cy="38%" r="62%">
                <stop offset="0" stopColor="#dcdcdc" />
                <stop offset=".72" stopColor="#d1d1d1" />
                <stop offset="1" stopColor="#bdbdbd" />
              </radialGradient>
              <radialGradient id="bg-shade" cx="50%" cy="45%" r="55%">
                <stop offset=".7" stopColor="#3c3c3c" stopOpacity="0" />
                <stop offset="1" stopColor="#3c3c3c" stopOpacity=".24" />
              </radialGradient>
              <filter id="bg-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="20" />
              </filter>
              <clipPath id="bg-clip">
                <circle cx="500" cy="500" r="490" />
              </clipPath>
            </defs>
            <circle cx="500" cy="500" r="493" fill="#5e5e5e" opacity=".42" filter="url(#bg-glow)" />
            <circle cx="500" cy="500" r="490" fill="url(#bg-ocean)" />
            <g clipPath="url(#bg-clip)">
              <g ref={layer}>
                <path d={pan.graticule} fill="none" stroke="#8f8f8f" strokeOpacity=".3" strokeWidth=".8" />
                <path d={pan.land} fill="#e9e9e9" stroke="#f7f7f7" strokeWidth=".8" />
                <path d={pan.borders} fill="none" stroke="#ffffff" strokeWidth="1" />
                <path d={pan.uae} fill="#fcfcfc" stroke="#ffffff" strokeWidth="1" />
              </g>
            </g>
            <circle cx="500" cy="500" r="490" fill="url(#bg-shade)" />
            <circle cx="500" cy="500" r="490" fill="none" stroke="#6f6f6f" strokeWidth="1.6" />
          </svg>
          <div className="bg-pins-clip">
            <div className="bg-pins" ref={pins}>
              {branches.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  className={i === active ? "bg-pin is-active" : "bg-pin"}
                  style={{ left: `${points[i].x / 10}%`, top: `${points[i].y / 10}%`, "--delay": `${-i * 0.7}s` } as React.CSSProperties}
                  aria-label={`${b.name}, ${b.area}, ${b.emirate}`}
                  onPointerEnter={onPinMove(i)}
                  onPointerMove={onPinMove(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setActive(i)}
                  onClick={() => goTo(i)}
                >
                  <i className="bg-pin__ring" />
                  <i className="bg-pin__sweep" />
                  <i className="bg-pin__core" />
                  <b className="bg-pin__label">{b.name}</b>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-track-wrap">
          <div className="bg-track" ref={track}>
            {branches.map((b, i) => (
              <a
                key={b.id}
                className={i === active ? "mk-card bg-card is-current" : "mk-card bg-card"}
                href={b.directions}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Directions to ${b.name}, ${b.area}, ${b.emirate}`}
                onPointerEnter={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const ph = e.currentTarget.querySelector<HTMLElement>(".mk-card__photo")!;
                  ph.style.setProperty("--x", `${e.clientX - r.left}px`);
                  ph.style.setProperty("--y", `${e.clientY - r.top}px`);
                  e.currentTarget.classList.add("is-active");
                  setActive(i);
                }}
                onPointerLeave={(e) => e.currentTarget.classList.remove("is-active")}
              >
                <span className="mk-card__photo" style={{ "--photo": `url("${b.image}")` } as React.CSSProperties} />
                <span className="mk-card__top">
                  <span className="mk-card__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mk-card__label">{b.emirate}</span>
                </span>
                <span className="mk-card__bottom">
                  <span>
                    <span className="mk-card__city">{b.name}</span>
                    <span className="mk-card__areas">{b.area}</span>
                  </span>
                  <span className="mk-card__icon">
                    <span className="mk-card__pin">
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                        <circle cx="8" cy="5.5" r="3" />
                        <path d="M8 8.5V15" />
                      </svg>
                    </span>
                    <span className="mk-card__arrow">
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                      </svg>
                    </span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-progress" aria-hidden="true">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <i>
            <b style={{ width: `${((active + 1) / branches.length) * 100}%` }} />
          </i>
          <span>{String(branches.length).padStart(2, "0")}</span>
        </div>

        {hovered && hover && (
          <div className={hover.flip ? "pin-card flip" : "pin-card"} style={{ left: hover.x, top: hover.y }} aria-hidden="true">
            <img src={hovered.image} alt="" />
            <span>
              <b>{hovered.name}</b>
              <small>
                {hovered.area} · {hovered.emirate}
              </small>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
