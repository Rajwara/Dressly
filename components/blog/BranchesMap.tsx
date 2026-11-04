"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

type Pin = { name: string; area: string; lat: number; lng: number };

const pinHtml = (n: number) =>
  `<span class="pin"><svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"><path d="M16 41s13-14.2 13-24.5A13 13 0 0 0 3 16.5C3 26.8 16 41 16 41Z"/></svg><b>${n}</b></span>`;

/** Static map of every branch, for the contact page (the Branches page has the full finder). */
export default function BranchesMap({ pins }: { pins: Pin[] }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);
      pins.forEach((p, i) =>
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({ className: "pin-icon", html: pinHtml(i + 1), iconSize: [32, 42], iconAnchor: [16, 41] }),
          title: `${p.name}, ${p.area}`,
        }).addTo(map!),
      );
      map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [60, 60] });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [pins]);

  return <div ref={el} style={{ width: "100%", height: "100%" }} aria-label="Map of Dressly branches" />;
}
