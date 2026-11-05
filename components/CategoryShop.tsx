"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useEffect, useMemo, useState } from "react";
import { SWATCH } from "@/lib/colours";
import { money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import Icon from "./Icon";
import Link from "next/link";
import ProductCard from "./ProductCard";
import "./product/product-extras.css";

export type Sort = "featured" | "new" | "low" | "high" | "az";
type Range = { label: string; min: number; max: number };

const RANGES: Range[] = [
  { label: `Under ${money(250)}`, min: 0, max: 249 },
  { label: `${money(250)} to ${money(499)}`, min: 250, max: 499 },
  { label: `${money(500)} to ${money(999)}`, min: 500, max: 999 },
  { label: `${money(1000)} and above`, min: 1000, max: Infinity },
];
const PAGE = 24;

/** Clothing sizes come from "Size" options; values like "8Y" are ages (girls' range); "EU size" is shoes. */
const AGE = /^(\d+)Y$/;
const sizeValues = (p: CardProduct) => p.options.filter((o) => o.label === "Size").flatMap((o) => o.values);
const clothingSizes = (p: CardProduct) => sizeValues(p).filter((v) => !AGE.test(v));
const agesOf = (p: CardProduct) => sizeValues(p).filter((v) => AGE.test(v));
const shoeSizes = (p: CardProduct) => p.options.filter((o) => o.label === "EU size").flatMap((o) => o.values);
const ageLabel = (v: string) => `${v.replace("Y", "")} yrs`;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const bySize = (a: string, b: string) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b, undefined, { numeric: true });
const byNum = (a: string, b: string) => parseFloat(a) - parseFloat(b);
const GROUP_ORDER = ["Abayas", "Hijabs", "Outerwear", "Home & Lounge", "Essentials", "Girls", "Footwear", "Fragrance", "Accessories", "Gifts"];
const byGroup = (a: string, b: string) => (GROUP_ORDER.indexOf(a) + 1 || 99) - (GROUP_ORDER.indexOf(b) + 1 || 99);

/** Every filter, in the order the sidebar shows them. Optional facets appear once products carry the field. */
type Key = "cat" | "colour" | "size" | "age" | "shoe" | "price" | "fabric" | "occasion" | "collar";
const KEYS: Key[] = ["cat", "colour", "size", "age", "shoe", "price", "fabric", "occasion", "collar"];
const TITLES: Record<Key, string> = { cat: "Category", colour: "Colour", size: "Size", age: "Age", shoe: "Shoe size (EU)", price: "Price", fabric: "Fabric", occasion: "Occasion", collar: "Collar style" };
type Selected = Record<Key, string[]>;
const EMPTY: Selected = { cat: [], colour: [], size: [], age: [], shoe: [], price: [], fabric: [], occasion: [], collar: [] };

/** The values a product has for one filter. */
function valuesOf(p: CardProduct, k: Key): string[] {
  switch (k) {
    case "cat": return [p.categorySlug];
    case "colour": return [p.colour];
    case "size": return clothingSizes(p);
    case "age": return agesOf(p);
    case "shoe": return shoeSizes(p);
    case "price": return RANGES.filter((r) => p.price >= r.min && p.price <= r.max).map((r) => r.label);
    default: return p[k] ? [p[k] as string] : [];
  }
}

/** Shown inside the grid after the sixth product. */
function SizeHelpCard() {
  return (
    <div className="size-help">
      <span className="shop-label">*Not sure of your size?</span>
      <p>Get measured at home by one of our tailors, or check the size guide before you order.</p>
      <Link className="btn" href="/home-tailoring">
        Book a home visit
      </Link>
      <Link className="btn ghost" href="/size-guide">
        Size guide
      </Link>
    </div>
  );
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** One collapsible filter section with a count of what's selected in it. */
function Section({ title, picked, open = true, children }: { title: string; picked: number; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="fx-sec" open={open}>
      <summary>
        <span>{title}</span>
        {picked > 0 && <b className="fx-badge">{picked}</b>}
        <Icon name="chevron" size={16} />
      </summary>
      <div className="fx-body">{children}</div>
    </details>
  );
}

/**
 * Filters, sort, grid density and the product grid. Used on category pages and
 * on the Shop page. Each option shows how many products it would give with the
 * other filters applied; options that would give none are greyed out.
 */
export default function CategoryShop({ products, sidebar, initialSort = "featured" }: { products: CardProduct[]; sidebar?: React.ReactNode; initialSort?: Sort }) {
  const [sort, setSort] = useState<Sort>(initialSort);
  const [sel, setSel] = useState<Selected>(EMPTY);
  const [cols, setCols] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [more, setMore] = useState<Partial<Record<Key, boolean>>>({});
  /** Long lists show this many options (plus anything already ticked) until "Show all". */
  const SHORT = 8;
  const MoreToggle = ({ k, total, what }: { k: Key; total: number; what: string }) =>
    total > SHORT ? (
      <button type="button" className="fx-more" onClick={() => setMore((m) => ({ ...m, [k]: !m[k] }))} aria-expanded={!!more[k]}>
        {more[k] ? "Show fewer" : `Show all ${total} ${what}`}
      </button>
    ) : null;
  const trim = <T extends { value: string; count: number }>(k: Key, list: T[]) =>
    more[k] || list.length <= SHORT ? list : list.filter((o, i) => i < SHORT || sel[k].includes(o.value));

  const pick = (k: Key, v: string) => setSel((s) => ({ ...s, [k]: toggle(s[k], v) }));
  const matches = (p: CardProduct, except?: Key) =>
    KEYS.every((k) => k === except || !sel[k].length || valuesOf(p, k).some((v) => sel[k].includes(v)));

  /** Options per filter, with live counts. */
  const options = useMemo(() => {
    const out = {} as Record<Key, { value: string; label: string; count: number; group?: string }[]>;
    for (const k of KEYS) {
      const all = new Map<string, { label: string; group?: string }>();
      products.forEach((p) =>
        valuesOf(p, k).forEach((v) => all.set(v, { label: k === "cat" ? p.category : k === "age" ? ageLabel(v) : v, group: k === "cat" ? p.group : undefined })),
      );
      const base = products.filter((p) => matches(p, k));
      let list = [...all].map(([value, o]) => ({ value, ...o, count: base.filter((p) => valuesOf(p, k).includes(value)).length }));
      if (k === "size") list = list.sort((a, b) => bySize(a.value, b.value));
      else if (k === "age" || k === "shoe") list = list.sort((a, b) => byNum(a.value, b.value));
      else if (k === "price") list = list.sort((a, b) => RANGES.findIndex((r) => r.label === a.value) - RANGES.findIndex((r) => r.label === b.value));
      else if (k === "cat") list = list.sort((a, b) => byGroup(a.group ?? "", b.group ?? "") || Number(b.label.startsWith("All ")) - Number(a.label.startsWith("All ")));
      else list = list.sort((a, b) => a.label.localeCompare(b.label));
      out[k] = list;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, sel]);

  const shown = useMemo(() => {
    const list = products.filter((p) => matches(p));
    if (sort === "new") return [...list].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
    if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, sel, sort]);

  // Start from the first page whenever the filters or sort change.
  useEffect(() => setLimit(PAGE), [sel, sort]);

  // Cards move when the list changes; let scroll animations re-measure, and show any that were waiting.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".shop .pcard").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.style.visibility = el.style.opacity = "";
    });
    ScrollTrigger.refresh();
  }, [shown, cols, limit]);

  const active = KEYS.reduce((n, k) => n + sel[k].length, 0);
  const clear = () => setSel(EMPTY);
  const visible = shown.slice(0, limit);
  const labelOf = (k: Key, v: string) => options[k].find((o) => o.value === v)?.label ?? v;
  const has = (k: Key) => options[k].length > 1;

  const chips = (k: Key) => (
    <div className="fx-chips">
      {options[k].map((o) => {
        const on = sel[k].includes(o.value);
        return (
          <button key={o.value} type="button" className={on ? "on" : undefined} aria-pressed={on} disabled={!on && !o.count} onClick={() => pick(k, o.value)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
  const checks = (k: Key, list = options[k]) => (
    <div className="fx-checks">
      {list.map((o) => {
        const on = sel[k].includes(o.value);
        return (
          <label key={o.value} className={!on && !o.count ? "off" : undefined}>
            <input type="checkbox" checked={on} disabled={!on && !o.count} onChange={() => pick(k, o.value)} />
            <span>{o.label}</span>
            <small>{o.count}</small>
          </label>
        );
      })}
    </div>
  );

  // Category options grouped under their group name (Abayas, Hijabs…).
  const catGroups = [...new Set(options.cat.map((o) => o.group ?? ""))];

  return (
    <div className="shop">
      <aside className={filtersOpen ? "side fx open" : "side fx"} aria-label="Filters">
        <div className="fx-head">
          <h3>Filters</h3>
          {active > 0 && (
            <button type="button" className="fx-clear" onClick={clear}>
              Clear all ({active})
            </button>
          )}
          <button type="button" className="fx-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
            <Icon name="close" size={18} />
          </button>
        </div>
        {sidebar}
        {has("cat") && (
          <Section title={TITLES.cat} picked={sel.cat.length}>
            {(more.cat || catGroups.length <= 2 ? catGroups : catGroups.filter((g, i) => i < 2 || options.cat.some((o) => (o.group ?? "") === g && sel.cat.includes(o.value)))).map((g) => (
              <div key={g} className="fx-group">
                {catGroups.length > 1 && <p className="fx-group-name">{g}</p>}
                {checks("cat", options.cat.filter((o) => (o.group ?? "") === g))}
              </div>
            ))}
            {catGroups.length > 2 && (
              <button type="button" className="fx-more" onClick={() => setMore((m) => ({ ...m, cat: !m.cat }))} aria-expanded={!!more.cat}>
                {more.cat ? "Show fewer" : `Show all ${options.cat.length} categories`}
              </button>
            )}
          </Section>
        )}
        {options.colour.length > 0 && (
          <Section title={TITLES.colour} picked={sel.colour.length}>
            <div className="fx-swatches">
              {trim("colour", [...options.colour].sort((a, b) => Number(b.count > 0) - Number(a.count > 0))).map((o) => {
                const on = sel.colour.includes(o.value);
                return (
                  <button key={o.value} type="button" className={on ? "on" : undefined} aria-pressed={on} disabled={!on && !o.count} onClick={() => pick("colour", o.value)}>
                    <span className="dot" style={{ background: SWATCH[o.value] ?? "#d6bfb7" }} />
                    <span className="fx-sw-name">{o.label}</span>
                    <small>{o.count}</small>
                  </button>
                );
              })}
            </div>
            <MoreToggle k="colour" total={options.colour.length} what="colours" />
          </Section>
        )}
        {has("size") && <Section title={TITLES.size} picked={sel.size.length}>{chips("size")}</Section>}
        {options.age.length > 0 && <Section title={TITLES.age} picked={sel.age.length}>{chips("age")}</Section>}
        {has("shoe") && <Section title={TITLES.shoe} picked={sel.shoe.length} open={false}>{chips("shoe")}</Section>}
        {has("price") && <Section title={TITLES.price} picked={sel.price.length}>{checks("price")}</Section>}
        {(["fabric", "occasion", "collar"] as const).map((k) =>
          has(k) ? (
            <Section key={k} title={TITLES[k]} picked={sel[k].length} open={false}>
              {chips(k)}
            </Section>
          ) : null,
        )}
        <button type="button" className="btn fx-apply" onClick={() => setFiltersOpen(false)}>
          Show {shown.length} {shown.length === 1 ? "product" : "products"}
        </button>
      </aside>
      <div>
        <div className="bar">
          <button className="filter-toggle" type="button" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
            <Icon name="menu" size={16} /> Filters{active ? ` (${active})` : ""}
          </button>
          <span>
            {shown.length > PAGE ? `Showing ${visible.length} of ${shown.length} products` : `${shown.length} ${shown.length === 1 ? "product" : "products"}`}
          </span>
          <div className="bar-right">
            <div className="density" role="group" aria-label="Products per row">
              {[2, 3, 4].map((n) => (
                <button key={n} type="button" className={cols === n ? "on" : undefined} aria-pressed={cols === n} aria-label={`${n} per row`} onClick={() => setCols(n)}>
                  {Array.from({ length: n }, (_, i) => (
                    <i key={i} />
                  ))}
                </button>
              ))}
            </div>
            <label>
              Sort{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="featured">Featured</option>
                <option value="new">Recently added</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="az">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>
        {active > 0 && (
          <div className="fx-active" aria-label="Active filters">
            {KEYS.flatMap((k) =>
              sel[k].map((v) => (
                <button key={`${k}:${v}`} type="button" onClick={() => pick(k, v)} aria-label={`Remove ${TITLES[k]}: ${labelOf(k, v)}`}>
                  <span>{TITLES[k]}:</span> {labelOf(k, v)} <Icon name="close" size={13} />
                </button>
              )),
            )}
            <button type="button" className="fx-active-clear" onClick={clear}>
              Clear all
            </button>
          </div>
        )}
        {shown.length ? (
          <>
            <div className="grid" data-stagger style={{ "--cols": cols } as React.CSSProperties}>
              {visible.map((p, i) => (
                <Fragment key={p.slug}>
                  <ProductCard product={p} />
                  {i === 5 && <SizeHelpCard />}
                </Fragment>
              ))}
              {visible.length < 6 && <SizeHelpCard />}
            </div>
            {shown.length > visible.length && (
              <div className="load-more">
                <p>
                  Showing {visible.length} of {shown.length}
                </p>
                <button className="btn ghost" type="button" onClick={() => setLimit((l) => l + PAGE)}>
                  Load more
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="empty">
            No products match these filters.{" "}
            <button className="link" type="button" onClick={clear}>
              Clear filters
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
