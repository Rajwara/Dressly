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
/** Clothing sizes come from "Size" options; values like "8Y" are ages (girls' range); "EU size" is shoes. */
const AGE = /^(\d+)Y$/;
const clothingSizes = (p: CardProduct) => p.options.filter((o) => o.label === "Size").flatMap((o) => o.values).filter((v) => !AGE.test(v));
const agesOf = (p: CardProduct) => p.options.filter((o) => o.label === "Size").flatMap((o) => o.values).filter((v) => AGE.test(v));
const shoeSizes = (p: CardProduct) => p.options.filter((o) => o.label === "EU size").flatMap((o) => o.values);
const ageLabel = (v: string) => `${v.replace("Y", "")} years`;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const bySize = (a: string, b: string) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b, undefined, { numeric: true });
const byNum = (a: string, b: string) => parseFloat(a) - parseFloat(b);
const PAGE = 24;
/** Optional product facets: a filter appears once products in the category carry the field. */
const FACETS = [
  { key: "fabric", label: "Fabric" },
  { key: "occasion", label: "Occasion" },
  { key: "collar", label: "Collar style" },
] as const;
type FacetKey = (typeof FACETS)[number]["key"];

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

/**
 * Filters (category, colour, size, age, shoe size, price), sort (featured,
 * recently added, price, name), grid density and the product grid. Used on
 * category pages and on the Shop page. A filter only appears when it has a choice to make.
 */
export default function CategoryShop({ products, sidebar, initialSort = "featured" }: { products: CardProduct[]; sidebar?: React.ReactNode; initialSort?: Sort }) {
  const [sort, setSort] = useState<Sort>(initialSort);
  const [cats, setCats] = useState<string[]>([]);
  const [ages, setAges] = useState<string[]>([]);
  const [shoes, setShoes] = useState<string[]>([]);
  const [colours, setColours] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [ranges, setRanges] = useState<string[]>([]);
  const [cols, setCols] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [facets, setFacets] = useState<Record<FacetKey, string[]>>({ fabric: [], occasion: [], collar: [] });
  const [limit, setLimit] = useState(PAGE);

  const allCats = useMemo(() => {
    const m = new Map<string, { slug: string; title: string; n: number }>();
    products.forEach((p) => {
      const c = m.get(p.categorySlug) ?? { slug: p.categorySlug, title: p.category, n: 0 };
      c.n++;
      m.set(p.categorySlug, c);
    });
    return [...m.values()];
  }, [products]);
  const allColours = useMemo(() => [...new Set(products.map((p) => p.colour))].sort(), [products]);
  const allSizes = useMemo(() => [...new Set(products.flatMap(clothingSizes))].sort(bySize), [products]);
  const allAges = useMemo(() => [...new Set(products.flatMap(agesOf))].sort(byNum), [products]);
  const allShoes = useMemo(() => [...new Set(products.flatMap(shoeSizes))].sort(byNum), [products]);
  const facetValues = useMemo(
    () =>
      FACETS.map((f) => ({ ...f, values: [...new Set(products.map((p) => p[f.key]).filter((v): v is string => Boolean(v)))].sort() })).filter(
        (f) => f.values.length > 1,
      ),
    [products],
  );
  const usedRanges = useMemo(() => RANGES.filter((r) => products.some((p) => p.price >= r.min && p.price <= r.max)), [products]);

  const shown = useMemo(() => {
    const list = products.filter(
      (p) =>
        (!cats.length || cats.includes(p.categorySlug)) &&
        (!colours.length || colours.includes(p.colour)) &&
        (!sizes.length || clothingSizes(p).some((s) => sizes.includes(s))) &&
        (!ages.length || agesOf(p).some((s) => ages.includes(s))) &&
        (!shoes.length || shoeSizes(p).some((s) => shoes.includes(s))) &&
        (!ranges.length || RANGES.some((r) => ranges.includes(r.label) && p.price >= r.min && p.price <= r.max)) &&
        FACETS.every((f) => !facets[f.key].length || facets[f.key].includes(p[f.key] ?? "")),
    );
    if (sort === "new") return [...list].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
    if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, cats, colours, sizes, ages, shoes, ranges, facets, sort]);

  // Start from the first page whenever the filters or sort change.
  useEffect(() => setLimit(PAGE), [cats, colours, sizes, ages, shoes, ranges, facets, sort]);

  // Cards move when the list changes; let scroll animations re-measure, and show any that were waiting.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".shop .pcard").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.style.visibility = el.style.opacity = "";
    });
    ScrollTrigger.refresh();
  }, [shown, cols, limit]);

  const active = cats.length + colours.length + sizes.length + ages.length + shoes.length + ranges.length + FACETS.reduce((n, f) => n + facets[f.key].length, 0);
  const clear = () => {
    setCats([]);
    setAges([]);
    setShoes([]);
    setColours([]);
    setSizes([]);
    setRanges([]);
    setFacets({ fabric: [], occasion: [], collar: [] });
  };
  const visible = shown.slice(0, limit);

  return (
    <div className="shop">
      <aside className={filtersOpen ? "side open" : "side"}>
        {sidebar}
        {allCats.length > 1 && (
          <div>
            <h4>Category</h4>
            <div className="check-list">
              {allCats.map((c) => (
                <label key={c.slug}>
                  <input type="checkbox" checked={cats.includes(c.slug)} onChange={() => setCats((l) => toggle(l, c.slug))} />
                  {c.title} <small className="count-note">({c.n})</small>
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <h4>Colour</h4>
          <div className="swatch-list">
            {allColours.map((c) => (
              <button key={c} type="button" className={colours.includes(c) ? "on" : undefined} aria-pressed={colours.includes(c)} onClick={() => setColours((l) => toggle(l, c))}>
                <span className="dot" style={{ background: SWATCH[c] ?? "#d6bfb7" }} />
                {c}
              </button>
            ))}
          </div>
        </div>
        {allSizes.length > 1 && (
          <div>
            <h4>Size</h4>
            <div className="chip-list">
              {allSizes.map((s) => (
                <button key={s} type="button" className={sizes.includes(s) ? "on" : undefined} aria-pressed={sizes.includes(s)} onClick={() => setSizes((l) => toggle(l, s))}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {allAges.length > 0 && (
          <div>
            <h4>Age</h4>
            <div className="chip-list">
              {allAges.map((s) => (
                <button key={s} type="button" className={ages.includes(s) ? "on" : undefined} aria-pressed={ages.includes(s)} onClick={() => setAges((l) => toggle(l, s))}>
                  {ageLabel(s)}
                </button>
              ))}
            </div>
          </div>
        )}
        {allShoes.length > 1 && (
          <div>
            <h4>Shoe size (EU)</h4>
            <div className="chip-list">
              {allShoes.map((s) => (
                <button key={s} type="button" className={shoes.includes(s) ? "on" : undefined} aria-pressed={shoes.includes(s)} onClick={() => setShoes((l) => toggle(l, s))}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {usedRanges.length > 1 && (
          <div>
            <h4>Price</h4>
            <div className="check-list">
              {usedRanges.map((r) => (
                <label key={r.label}>
                  <input type="checkbox" checked={ranges.includes(r.label)} onChange={() => setRanges((l) => toggle(l, r.label))} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {facetValues.map((f) => (
          <div key={f.key}>
            <h4>{f.label}</h4>
            <div className="chip-list">
              {f.values.map((v) => {
                const on = facets[f.key].includes(v);
                return (
                  <button key={v} type="button" className={on ? "on" : undefined} aria-pressed={on} onClick={() => setFacets((x) => ({ ...x, [f.key]: toggle(x[f.key], v) }))}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {active > 0 && (
          <button className="link" type="button" onClick={clear}>
            Clear all filters ({active})
          </button>
        )}
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
