import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import CategoryShop from "@/components/CategoryShop";
import { allCards, cards, newArrivals } from "@/lib/catalog";
import "@/components/product/product-extras.css";
import "../shop-brand.css";
import "../info-pages.css";

export const metadata: Metadata = {
  title: "Shop All Categories",
  description: "Browse every Dressly category: abayas, hijabs and shaylas, jalabiyas and kaftans, essentials, sandals, perfumes, accessories and girls.",
};

type Props = { searchParams: Promise<{ filter?: string | string[] }> };

export default async function ShopPage({ searchParams }: Props) {
  const filter = (await searchParams).filter;
  const showNew = (Array.isArray(filter) ? filter[0] : filter) === "new";
  const newCards = cards(newArrivals);

  return (
    <FieldwornShell className="shop-fw">
      <div className="ip">
        <div className="ip-wrap">
          <div className="ip-head">
            <span className="ip-eyebrow">*Dressly</span>
            <h1>{showNew ? "New Arrivals" : "Shop All Categories"}</h1>
            <p>{showNew ? "The latest pieces in store, fresh from our tailors." : "Every piece in one place. Filter by category, colour, size, age and price, or sort by what\u2019s new."}</p>
          </div>
          <nav className="ip-tabs" aria-label="Shop views">
            <a href="/shop" className={showNew ? "" : "on"}>All categories</a>
            <a href="/shop?filter=new" className={showNew ? "on" : ""}>New arrivals</a>
          </nav>

          {showNew && !newCards.length ? (
            <p className="empty">New arrivals are coming soon.</p>
          ) : (
            <CategoryShop key={showNew ? "new" : "all"} products={showNew ? newCards : allCards()} initialSort={showNew ? "new" : "featured"} />
          )}
        </div>
      </div>
    </FieldwornShell>
  );
}
