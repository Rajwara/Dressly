// Builds the globe artwork for the Branches page "Where we tailor" section:
// an orthographic view centred on the UAE, with land, borders, a graticule,
// the UAE highlighted, one marker per emirate and a dot per branch.
//
// Usage: node scripts/generate-uae-globe.mjs
// Reads branch coordinates from lib/brand.ts and writes lib/data/uae-globe.json.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { geoGraticule, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const world = require("world-atlas/countries-50m.json");

// Branch coordinates come straight from lib/brand.ts so the dots match the finder.
const brand = fs.readFileSync(path.join(root, "lib/brand.ts"), "utf8");
const block = brand.slice(brand.indexOf("export const BRANCHES"), brand.indexOf("export const directions"));
const emirates = [];
for (const m of block.matchAll(/emirate: "([^"]+)",\s*branches: \[([\s\S]*?)\]\s*,?\s*\}/g)) {
  const branches = [...m[2].matchAll(/lat: ([\d.]+), lng: ([\d.]+)/g)].map((x) => ({ lat: +x[1], lng: +x[2] }));
  emirates.push({ emirate: m[1], branches });
}
if (emirates.length !== 5) throw new Error(`expected 5 emirates, found ${emirates.length}`);

const SIZE = 1000;
const R = 490;
// Centre a little south of the UAE so it sits in the top part of the globe, above the cards.
const projection = geoOrthographic()
  .rotate([-55.0, -21.7])
  .scale(6000)
  .translate([SIZE / 2, SIZE / 2])
  .clipExtent([[-10, -10], [SIZE + 10, SIZE + 10]])
  .precision(0.3);
const pathOf = geoPath(projection);
const round = (d) => (d || "").replace(/(\d+\.\d)\d+/g, "$1");

const countries = feature(world, world.objects.countries);
const land = { type: "FeatureCollection", features: countries.features.filter((f) => f.id !== "784") };
const uae = countries.features.find((f) => f.id === "784"); // ISO 3166 numeric code for the UAE
const borders = mesh(world, world.objects.countries, (a, b) => a !== b);
const graticule = geoGraticule().step([3, 3])();

const pct = ([x, y]) => ({ left: +((x / SIZE) * 100).toFixed(2), top: +((y / SIZE) * 100).toFixed(2) });

// One marker per emirate at the mean of its branches, then nudged apart so the rings don't overlap.
const markers = emirates.map((e) => {
  const lng = e.branches.reduce((a, b) => a + b.lng, 0) / e.branches.length;
  const lat = e.branches.reduce((a, b) => a + b.lat, 0) / e.branches.length;
  const [x, y] = projection([lng, lat]);
  return { emirate: e.emirate, count: e.branches.length, x, y };
});
// Dubai, Sharjah and Ajman are a few km apart, too close for separate rings.
// Keep Dubai, Abu Dhabi and Ras Al Khaimah at their real positions, put Ajman
// one ring further along the coast and Sharjah just inland between the two.
const GAP = 46; // in the 1000-unit box; a marker ring is ~43 units at full size
const by = Object.fromEntries(markers.map((m) => [m.emirate, m]));
const dub = by["Dubai"], rak = by["Ras Al Khaimah"];
const len = Math.hypot(rak.x - dub.x, rak.y - dub.y);
const along = [(rak.x - dub.x) / len, (rak.y - dub.y) / len]; // the coast, Dubai to Ras Al Khaimah
const inland = [-along[1], along[0]]; // perpendicular, pointing away from the sea (south-east on screen)
if (inland[1] < 0) { inland[0] *= -1; inland[1] *= -1; }
by["Ajman"].x = dub.x + along[0] * GAP;
by["Ajman"].y = dub.y + along[1] * GAP;
by["Sharjah"].x = dub.x + along[0] * GAP * 0.5 + inland[0] * GAP * 0.87;
by["Sharjah"].y = dub.y + along[1] * GAP * 0.5 + inland[1] * GAP * 0.87;
// Ras Al Khaimah stays put unless it would touch Ajman; then it moves one ring further up the coast.
const aj = by["Ajman"];
if (Math.hypot(rak.x - aj.x, rak.y - aj.y) < GAP) {
  rak.x = aj.x + along[0] * GAP;
  rak.y = aj.y + along[1] * GAP;
}
for (const a of markers) for (const b of markers) {
  if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < GAP - 1) console.warn("markers overlap:", a.emirate, b.emirate);
}
const dots = emirates.flatMap((e) => e.branches.map((b) => pct(projection([b.lng, b.lat]))));

const out = {
  size: SIZE,
  radius: R,
  graticule: round(pathOf(graticule)),
  land: round(pathOf(land)),
  borders: round(pathOf(borders)),
  uae: round(pathOf(uae)),
  markers: markers.map((m) => ({ emirate: m.emirate, count: m.count, ...pct([m.x, m.y]) })),
  dots,
};
fs.writeFileSync(path.join(root, "lib/data/uae-globe.json"), JSON.stringify(out) + "\n");
console.log(
  "wrote lib/data/uae-globe.json",
  Math.round(JSON.stringify(out).length / 1024) + " KB",
  out.markers.map((m) => `${m.emirate} ${m.left},${m.top}`).join(" | "),
);

// ---------------------------------------------------------------------------
// Pannable close-up for the scroll story: one large map layer that slides
// behind the globe circle, with a real-position point for every branch.
// Writes lib/data/uae-globe-pan.json.
{
  const pan = geoOrthographic()
    .rotate([-55.15, -25.0])
    .scale(13000)
    .translate([SIZE / 2, SIZE / 2])
    .clipExtent([[-1400, -1400], [2400, 2400]])
    .precision(0.3);
  const p2 = geoPath(pan);
  const branches = [];
  for (const m of block.matchAll(/\{ id: "([^"]+)",[^}]*?lat: ([\d.]+), lng: ([\d.]+)/g)) {
    const [x, y] = pan([+m[3], +m[2]]);
    branches.push({ id: m[1], x: +x.toFixed(1), y: +y.toFixed(1) });
  }
  if (branches.length !== 13) throw new Error(`expected 13 branches, found ${branches.length}`);
  // Branch coordinates are approximate (placed by area) and some sit a few
  // hundred metres apart; nudge display positions so the pins never overlap.
  const MINP = 30;
  for (let it = 0; it < 600; it++) {
    for (const a of branches) for (const c of branches) {
      if (a === c) continue;
      const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01;
      if (d < MINP) {
        const push = (MINP - d) / 2, ux = dx / d, uy = dy / d;
        a.x -= ux * push; a.y -= uy * push; c.x += ux * push; c.y += uy * push;
      }
    }
  }
  for (const b of branches) { b.x = +b.x.toFixed(1); b.y = +b.y.toFixed(1); }
  const panOut = {
    graticule: round(p2(geoGraticule().step([1, 1]).extent([[40, 14], [70, 36]])())),
    land: round(p2(land)),
    borders: round(p2(borders)),
    uae: round(p2(uae)),
    branches,
  };
  fs.writeFileSync(path.join(root, "lib/data/uae-globe-pan.json"), JSON.stringify(panOut) + "\n");
  console.log("wrote lib/data/uae-globe-pan.json", Math.round(JSON.stringify(panOut).length / 1024) + " KB",
    "x range", Math.min(...branches.map((b) => b.x)), Math.max(...branches.map((b) => b.x)));
}
