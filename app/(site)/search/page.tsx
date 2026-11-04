import FieldwornShell from "@/components/FieldwornShell";
import "../shop-brand.css";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductCard";
import { allCards } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().toLowerCase();
  const results = q
    ? allCards().filter((p) => `${p.name} ${p.category} ${p.colour}`.toLowerCase().includes(q))
    : [];

  return (
    <FieldwornShell className="shop-fw">
    <div className="wrap" style={{ paddingTop: 30, paddingBottom: 70 }}>
      <h1 style={{ marginBottom: 20 }}>Search</h1>
      <form action="/search" style={{ display: "flex", gap: 10, marginBottom: 28, maxWidth: 520 }}>
        <input
          name="q"
          type="search"
          defaultValue={q}
          aria-label="Search products"
          style={{ flex: 1, padding: 11, border: "1px solid var(--line)", background: "#fff" }}
        />
        <button className="btn">Search</button>
      </form>
      {!q ? (
        <p className="empty">Type a product or category name.</p>
      ) : results.length ? (
        <ProductGrid products={results} />
      ) : (
        <p className="empty">No products found.</p>
      )}
    </div>
    </FieldwornShell>
  );
}
