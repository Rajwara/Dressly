"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRANCH_SERVICES, PHONE_DISPLAY, PHONE_TEL, directions, whatsapp, type BranchHours } from "@/lib/brand";
import { hasHours, isOpenNow, pretty, todayKey } from "./branches/hours";
import { PLACES, normalise } from "@/lib/places";
import Icon from "./Icon";

export type LocatorBranch = {
  id: string;
  name: string;
  area: string;
  emirate: string;
  lat: number;
  lng: number;
  phone?: string;
  image: string;
  address?: string;
  hours?: BranchHours;
  services?: string[];
  parking?: string;
};

type Origin = { lat: number; lng: number; label: string };

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

const pinHtml = (n: number) =>
  `<span class="pin"><svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"><path d="M16 41s13-14.2 13-24.5A13 13 0 0 0 3 16.5C3 26.8 16 41 16 41Z"/></svg><b>${n}</b></span>`;

async function geocode(q: string): Promise<Origin | null> {
  const n = normalise(q);
  if (!n) return null;
  const local = PLACES.find((p) => normalise(p.name) === n) ?? PLACES.find((p) => normalise(p.name).includes(n) || n.includes(normalise(p.name)));
  if (local) return { lat: local.lat, lng: local.lng, label: local.name };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ae&q=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" } },
    );
    const [hit] = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name.split(",").slice(0, 2).join(",") } : null;
  } catch {
    return null;
  }
}

/** Store finder: search a place or use your location, nearest branches first, with a pin map. */
export default function BranchLocator({ branches }: { branches: LocatorBranch[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const wrapEl = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const originMarker = useRef<Marker | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);

  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [filter, setFilter] = useState<string[] | null>(null);
  const [status, setStatus] = useState<string>("");
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number; flip: boolean } | null>(null);
  const [emirate, setEmirate] = useState<string>("All");
  const [openNow, setOpenNow] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayKey()), []);

  const emirates = useMemo(() => ["All", ...Array.from(new Set(branches.map((b) => b.emirate)))], [branches]);
  const anyHours = useMemo(() => branches.some((b) => hasHours(b.hours)), [branches]);

  const numbered = useMemo(() => branches.map((b, i) => ({ ...b, n: i + 1 })), [branches]);
  const list = useMemo(() => {
    let l = numbered.map((b) => ({ ...b, dist: origin ? km(origin, b) : undefined }));
    if (filter) l = l.filter((b) => filter.includes(b.id));
    if (emirate !== "All") l = l.filter((b) => b.emirate === emirate);
    if (openNow) l = l.filter((b) => isOpenNow(b.hours) === true);
    if (origin) l.sort((a, b) => a.dist! - b.dist!);
    return l;
  }, [numbered, origin, filter, emirate, openNow]);

  // Map set-up (Leaflet touches window, so it loads on the client only).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !mapEl.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(mapEl.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        })
        .addTo(m);
      numbered.forEach((b) => {
        const mk = leaflet
          .marker([b.lat, b.lng], {
            icon: leaflet.divIcon({ className: "pin-icon", html: pinHtml(b.n), iconSize: [32, 42], iconAnchor: [16, 41] }),
            title: `${b.name}, ${b.area}`,
            keyboard: true,
          })
          .addTo(m);
        const track = (e: { originalEvent: MouseEvent }) => {
          const r = wrapEl.current?.getBoundingClientRect();
          if (r) {
            const x = e.originalEvent.clientX - r.left;
            setHover({ id: b.id, x, y: e.originalEvent.clientY - r.top, flip: r.width - x < 260 });
          }
        };
        mk.on("mouseover", track).on("mousemove", track).on("mouseout", () => setHover(null));
        mk.on("click", () => {
          setActive(b.id);
          document.getElementById(`branch-${b.id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        });
        markers.current.set(b.id, mk);
      });
      m.fitBounds(leaflet.latLngBounds(numbered.map((b) => [b.lat, b.lng])), { padding: [40, 40] });
      map.current = m;
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
    };
  }, [numbered]);

  // Highlight the active pin.
  useEffect(() => {
    markers.current.forEach((mk, id) => mk.getElement()?.classList.toggle("on", id === active));
  }, [active]);

  // Show the searched point and frame it with the nearest branches.
  useEffect(() => {
    const m = map.current;
    const leaflet = L.current;
    if (!m || !leaflet) return;
    originMarker.current?.remove();
    originMarker.current = null;
    if (origin) {
      originMarker.current = leaflet
        .marker([origin.lat, origin.lng], { icon: leaflet.divIcon({ className: "origin-icon", html: "<span></span>", iconSize: [18, 18] }) })
        .addTo(m);
      const near = list.slice(0, 3).map((b) => [b.lat, b.lng] as [number, number]);
      m.flyToBounds(leaflet.latLngBounds([[origin.lat, origin.lng], ...near]), { padding: [60, 60], duration: 0.9 });
    } else if (filter && list.length) {
      m.flyToBounds(leaflet.latLngBounds(list.map((b) => [b.lat, b.lng] as [number, number])), { padding: [60, 60], maxZoom: 14, duration: 0.9 });
    }
  }, [origin, filter, list]);

  // "#find-<emirate>" (from the emirate cards above) shows that emirate's branches.
  useEffect(() => {
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const apply = () => {
      const m = window.location.hash.match(/^#find-([a-z0-9-]+)$/);
      if (!m) return;
      const ids = numbered.filter((b) => slug(b.emirate) === m[1]).map((b) => b.id);
      if (!ids.length) return;
      const name = numbered.find((b) => b.id === ids[0])!.emirate;
      setOrigin(null);
      setQuery("");
      setFilter(ids);
      setActive(ids[0]);
      setStatus(`${ids.length} ${ids.length === 1 ? "branch" : "branches"} in ${name}`);
      document.getElementById("branches")?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Clear the hash so clicking the same card again still works.
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [numbered]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = normalise(query);
    if (!n) return reset();
    // A branch's own name wins: "Sharjah Co-op" means that store, not the city.
    const byName = numbered.filter((b) => normalise(b.name).includes(n) || n.includes(normalise(b.name)));
    if (byName.length) {
      setOrigin(null);
      setFilter(byName.map((b) => b.id));
      setActive(byName[0].id);
      setStatus(byName.length === 1 ? `${byName[0].name}, ${byName[0].area}` : `${byName.length} branches matching “${query}”`);
      return;
    }
    // Otherwise an area or emirate the branches are in, or any place we can locate.
    const direct = numbered.filter((b) => normalise(`${b.area} ${b.emirate}`).includes(n)).map((b) => b.id);
    setStatus("Searching…");
    const place = await geocode(query);
    if (place) {
      setOrigin(place);
      setFilter(null);
      setStatus(`Nearest branches to ${place.label}`);
    } else if (direct.length) {
      setOrigin(null);
      setFilter(direct);
      setStatus(`${direct.length} ${direct.length === 1 ? "branch" : "branches"} matching “${query}”`);
    } else {
      setStatus(`We couldn't find “${query}”. Try an area or city name, or use your location.`);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return setStatus("Your browser can't share its location.");
    setStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude, label: "your location" });
        setFilter(null);
        setQuery("");
        setStatus("Nearest branches to your location");
      },
      () => setStatus("Location permission was declined. Type an area instead."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const reset = () => {
    setOrigin(null);
    setFilter(null);
    setQuery("");
    setStatus("");
    setEmirate("All");
    setOpenNow(false);
    const m = map.current;
    if (m && L.current) m.flyToBounds(L.current.latLngBounds(numbered.map((b) => [b.lat, b.lng])), { padding: [40, 40], duration: 0.9 });
  };

  const focus = (b: (typeof list)[number]) => {
    setActive(b.id);
    map.current?.flyTo([b.lat, b.lng], 14, { duration: 0.8 });
  };

  const hovered = hover ? numbered.find((b) => b.id === hover.id) : null;

  return (
    <section className="locator" id="branches">
      <div className="locator-panel">
        <span className="eyebrow">Store locator</span>
        <h2>Find your nearest branch</h2>
        <form className="locator-search" onSubmit={search} role="search">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Area or city, e.g. Mirdif, Al Nahda, Khalifa City"
            aria-label="Search for an area or city"
          />
          <button className="btn" type="submit">
            Search
          </button>
        </form>
        <div className="locator-tools">
          <button type="button" className="link-btn" onClick={locate}>
            <Icon name="pin" size={16} /> Near me
          </button>
          <label className={anyHours ? "open-toggle" : "open-toggle disabled"} title={anyHours ? undefined : "Opening hours coming soon"}>
            <input type="checkbox" checked={openNow} disabled={!anyHours} onChange={(e) => setOpenNow(e.target.checked)} />
            Open now
          </label>
          {(origin || filter || emirate !== "All" || openNow) && (
            <button type="button" className="link-btn" onClick={reset}>
              Show all {branches.length} branches
            </button>
          )}
        </div>
        <div className="emirate-chips" role="group" aria-label="Filter by emirate">
          {emirates.map((e) => (
            <button key={e} type="button" aria-pressed={emirate === e} onClick={() => setEmirate(e)}>
              {e}
            </button>
          ))}
        </div>
        <p className="locator-status" aria-live="polite">
          {status || `${branches.length} branches across ${new Set(branches.map((b) => b.emirate)).size} Emirates`}
        </p>
        {!list.length && <p className="locator-empty">No branches match these filters.</p>}
        <ol className="locator-list">
          {list.map((b, i) => (
            <li
              key={b.id}
              id={`branch-${b.id}`}
              className={active === b.id ? "on" : undefined}
              onMouseEnter={() => setActive(b.id)}
            >
              <button type="button" className="locator-item" onClick={() => focus(b)}>
                <span className="locator-n">{b.n}</span>
                <span>
                  <b>{b.name}</b>
                  <small>
                    {b.area} · {b.emirate}
                  </small>
                </span>
                {b.dist !== undefined && (
                  <span className={i === 0 && origin ? "locator-dist nearest" : "locator-dist"}>
                    {i === 0 && origin && <em>Nearest</em>}
                    {b.dist < 10 ? b.dist.toFixed(1) : Math.round(b.dist)} km
                  </span>
                )}
              </button>
              <BranchDetails b={b} today={today} />
              <div className="locator-actions">
                <a className="btn" href={whatsapp(`Hello Dressly, I have a question for the ${b.name} branch.`)} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
                <a className="btn ghost" href={directions(b, origin ?? undefined)} target="_blank" rel="noopener noreferrer">
                  Directions
                </a>
                <a className="btn ghost" href={`tel:${b.phone ? b.phone.replace(/\s/g, "") : PHONE_TEL}`}>
                  Call
                </a>
                <Link className="link-btn" href={`/branches/${b.id}`}>
                  Branch details
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="locator-map" ref={wrapEl}>
        <div ref={mapEl} className="locator-canvas" aria-label="Map of Dressly branches" />
        {hovered && hover && (
          <div className={hover.flip ? "pin-card flip" : "pin-card"} style={{ left: hover.x, top: hover.y }} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

/** Address, hours, phone, services and parking for one branch in the list. */
function BranchDetails({ b, today }: { b: LocatorBranch; today: string | null }) {
  const open = today ? isOpenNow(b.hours) : undefined; // client only: avoids a server/client time mismatch
  const services = b.services?.length ? b.services : BRANCH_SERVICES;
  return (
    <div className="branch-details">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="branch-thumb" src={b.image} alt="" loading="lazy" />
      <dl>
        <div>
          <dt>Address</dt>
          <dd>{b.address || `${b.area}, ${b.emirate}`}</dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>
            {hasHours(b.hours) ? (
              <>
                {open !== undefined && <span className={open ? "open-badge" : "open-badge closed"}>{open ? "Open now" : "Closed now"}</span>}
                {today && b.hours![today as keyof BranchHours] !== undefined && <>Today {pretty(b.hours![today as keyof BranchHours])} · </>}
                Friday {pretty(b.hours!.fri)}
              </>
            ) : (
              "Hours coming soon"
            )}
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            {b.phone ? (
              <a href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>
            ) : (
              <>
                Call our main line <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Services</dt>
          <dd className="service-chips">
            {services.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </dd>
        </div>
        {b.parking && (
          <div>
            <dt>Parking</dt>
            <dd>{b.parking}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
