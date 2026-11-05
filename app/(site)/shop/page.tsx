/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import { ProductGrid } from "@/components/ProductCard";
import { cards, categories, home } from "@/lib/catalog";
import { imageSrc } from "@/lib/images";
import "../shop-brand.css";
import "../info-pages.css";

export const metadata: Metadata = {
  title: "Shop All Categories",
  description: "Browse every Dressly category: kandura and thobe, kids, outerwear, headwear, footwear and accessories.",
};

// Order of the groups on the page; "Traditional Wear" in the menu covers the groups after Kids.
const GROUPS: { group: string; id?: string }[] = [
  { group: "Kandura and Thobe" },
  { group: "Kids" },
  { group: "Outerwear", id: "traditional-wear" },
  { group: "Casual and underwear" },
  { group: "Headwear" },
  { group: "Footwear" },
  { group: "Accessories" },
  { group: "Gifts" },
];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Props = { searchParams: Promise<{ filter?: string | string[] }> };

export default async function ShopPage({ searchParams }: Props) {
  const filter = (await searchParams).filter;
  const showNew = (Array.isArray(filter) ? filter[0] : filter) === "new";
  const newSlugs = (home as { newArrivals?: string[] }).newArrivals ?? [];
  const newCards = cards(newSlugs);

  return (
    <FieldwornShell className="shop-fw">
      <div className="ip">
        <div className="ip-wrap">
          <div className="ip-head">
            <span className="ip-eyebrow">*Dressly</span>
            <h1>{showNew ? "New Arrivals" : "Shop All Categories"}</h1>
            <p>{showNew ? "The latest pieces in store, fresh from our tailors." : "Every category in one place. Pick one to see its full range, filters and sizes."}</p>
          </div>
          <nav className="ip-tabs" aria-label="Shop views">
            <a href="/shop" className={showNew ? "" : "on"}>All categories</a>
            <a href="/shop?filter=new" className={showNew ? "on" : ""}>New arrivals</a>
          </nav>

          {showNew ? (
            newCards.length ? <ProductGrid products={newCards} /> : <p className="empty">New arrivals are coming soon.</p>
          ) : (
            GROUPS.map(({ group, id }) => {
              const list = categories.filter((c) => c.group === group);
              if (!list.length) return null;
              return (
                <section className="ip-group" id={id ?? slugify(group)} key={group}>
                  <h2>{group}</h2>
                  <div className="ip-cats">
                    {list.map((c) => (
                      <a className="ip-cat" href={`/category/${c.slug}`} key={c.slug}>
                        <div className="im"><img src={imageSrc(`images/categories/${c.slug}`)} alt="" loading="lazy" /></div>
                        <b>{c.title}</b>
                        <small>{c.products.length} {c.products.length === 1 ? "piece" : "pieces"}</small>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </FieldwornShell>
  );
}
