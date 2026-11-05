import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";
import FieldwornShell from "@/components/FieldwornShell";
import { allCards, categories } from "@/lib/catalog";
import { isTailorable } from "@/lib/commerce";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  // Category slugs whose pieces can be tailored to measurements.
  const tailorable = categories.filter((c) => isTailorable(c.group)).map((c) => c.slug);
  return (
    <FieldwornShell>
      <Checkout products={allCards()} tailorable={tailorable} />
    </FieldwornShell>
  );
}
