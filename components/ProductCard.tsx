import Link from "next/link";
import { SWATCH } from "@/lib/colours";
import { money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import HeartButton from "./HeartButton";
import { QuickViewButton } from "./QuickView";

/** "Classic Round-Collar Kandura, Ivory" -> "Classic Round-Collar Kandura" (the colour is shown separately). */
const baseName = (p: CardProduct) => p.name.replace(new RegExp(`,\\s*${p.colour}$`, "i"), "");

export default function ProductCard({ product: p }: { product: CardProduct }) {
  const href = `/product/${p.slug}`;
  return (
    <article className="pcard" data-color={p.colour} data-price={p.price}>
      <div className="pcard-media">
        <Link className="pcard-img" href={href} aria-label={p.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.images[0]} alt={p.name} loading="lazy" />
          {p.images[1] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="alt" src={p.images[1]} alt="" loading="lazy" aria-hidden="true" />
          )}
        </Link>
        {p.badge && <span className="pcard-badge">{p.badge}</span>}
        <HeartButton slug={p.slug} name={p.name} />
        <QuickViewButton product={p} />
      </div>
      <div className="pcard-body">
        <span className="pcard-cat">{p.category}</span>
        <h3>
          <Link href={href}>{baseName(p)}</Link>
        </h3>
        <div className="pcard-row">
          <span className="pcard-colour">
            <span className="dot" style={{ background: SWATCH[p.colour] ?? "#ccc" }} />
            {p.colour}
          </span>
          <span className="price">{money(p.price)}</span>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, cols }: { products: CardProduct[]; cols?: number }) {
  return (
    <div className="grid" data-stagger style={cols ? ({ "--cols": cols } as React.CSSProperties) : undefined}>
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
