import FieldwornShell from "@/components/FieldwornShell";
import "../shop-brand.css";
import type { Metadata } from "next";
import WishlistView from "@/components/WishlistView";
import { allCards } from "@/lib/catalog";

export const metadata: Metadata = { title: "Saved products" };

export default function WishlistPage() {
  return (
    <FieldwornShell className="shop-fw">
    <div className="wrap" style={{ paddingTop: 30, paddingBottom: 70 }}>
      <h1 style={{ marginBottom: 20 }}>Saved products</h1>
      <WishlistView products={allCards()} />
    </div>
    </FieldwornShell>
  );
}
