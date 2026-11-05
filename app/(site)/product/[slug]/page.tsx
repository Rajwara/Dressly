import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "../../shop-brand.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import { allCards, cards, getCategory, getProduct, products } from "@/lib/catalog";
import { COMPLETE_THE_LOOK, isTailorable } from "@/lib/commerce";
import { imageSrc, productImage } from "@/lib/images";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

/** Optional extra photos: drop e.g. <slug>-detail.webp or <slug>-styled.webp into public/images/products/. */
const EXTRA_VIEWS = ["detail", "styled", "4", "5", "6"];

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.metaDescription || `${p.name} at Dressly.` } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();

  const images = [
    ...(["front", "side", "back"] as const).map((view) => ({ view, src: productImage(p.slug, view) })),
    ...EXTRA_VIEWS.map((view) => ({ view, src: imageSrc(`images/products/${p.slug}-${view}`) })).filter((i) => !i.src.endsWith(".svg")),
  ].slice(0, 6);
  const related = cards(p.related);
  const group = getCategory(p.categorySlug)?.group;
  const look = cards(
    COMPLETE_THE_LOOK.filter((c) => c !== p.categorySlug)
      .map((c) => getCategory(c)?.products.find((s) => s !== p.slug))
      .filter((s): s is string => Boolean(s)),
  );

  return (
    <FieldwornShell className="shop-fw">
      <div className="wrap">
        <div className="crumb">
          <Link href="/">Home</Link> / <Link href={`/category/${p.categorySlug}`}>{p.category}</Link> / {p.name}
        </div>
        <ProductDetail
          slug={p.slug}
          name={p.name}
          price={p.price}
          description={p.description}
          options={p.options}
          sizeGuide={p.sizeGuide}
          images={images}
          tailorable={isTailorable(group)}
          fabric={p.fabric}
        >
          {look.length > 0 && (
            <section className="pdp-more">
              <div className="head">
                <div>
                  <span className="shop-label">*Finish the outfit</span>
                  <h2>Complete the look</h2>
                </div>
              </div>
              <ProductGrid products={look} />
            </section>
          )}
          {related.length > 0 && (
            <section className="pdp-more">
              <div className="head">
                <div>
                  <span className="shop-label">*More like this</span>
                  <h2>You may also like</h2>
                </div>
                <Link href={`/category/${p.categorySlug}`}>View all</Link>
              </div>
              <ProductGrid products={related} />
            </section>
          )}
          <RecentlyViewed current={p.slug} products={allCards()} />
        </ProductDetail>
      </div>
    </FieldwornShell>
  );
}
