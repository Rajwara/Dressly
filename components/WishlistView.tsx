"use client";

import type { CardProduct } from "@/lib/types";
import { ProductGrid } from "./ProductCard";
import { useStore } from "./StoreProvider";

export default function WishlistView({ products }: { products: CardProduct[] }) {
  const { wishlist } = useStore();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = wishlist.map((s) => bySlug.get(s)).filter((p): p is CardProduct => Boolean(p));
  return items.length ? <ProductGrid products={items} /> : <p className="empty">No saved products yet.</p>;
}
