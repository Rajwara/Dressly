"use client";

import { useEffect, useState } from "react";
import type { CardProduct } from "@/lib/types";
import { ProductGrid } from "../ProductCard";

const KEY = "recently-viewed";
const MAX = 8;

/** Records this product as viewed and lists the other products seen recently. */
export default function RecentlyViewed({ current, products }: { current: string; products: CardProduct[] }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    let list: string[] = [];
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(v)) list = v.filter((s) => typeof s === "string");
    } catch {
      /* storage unavailable */
    }
    setSlugs(list.filter((s) => s !== current).slice(0, MAX));
    try {
      localStorage.setItem(KEY, JSON.stringify([current, ...list.filter((s) => s !== current)].slice(0, MAX + 1)));
    } catch {
      /* storage unavailable */
    }
  }, [current]);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const seen = slugs.map((s) => bySlug.get(s)).filter((p): p is CardProduct => Boolean(p));
  if (!seen.length) return null;

  return (
    <section className="pdp-more">
      <div className="head">
        <div>
          <span className="shop-label">*Your history</span>
          <h2>Recently viewed</h2>
        </div>
      </div>
      <ProductGrid products={seen} />
    </section>
  );
}
