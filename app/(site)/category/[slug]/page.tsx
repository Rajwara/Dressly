import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "../../shop-brand.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryShop from "@/components/CategoryShop";
import { cards, categories, getCategory } from "@/lib/catalog";
import { imageSrc } from "@/lib/images";
import type { Category } from "@/lib/types";
import "@/components/product/product-extras.css";

/** Short copy under the grid. Uses `intro` from categories.json when set, otherwise a plain description. */
function introFor(c: Category): string[] {
  if (c.intro?.length) return c.intro;
  const name = c.title.toLowerCase();
  const group = c.group.toLowerCase();
  return [
    `Browse our ${name}, part of the Dressly ${group} collection. Every piece is listed with its colours, sizes and price, and you can order online or on WhatsApp.`,
    `Not sure which size or style suits you? Use the size guide, visit one of our branches to try pieces on, or book a home tailoring visit and a tailor will come to you.`,
    `Delivery is available across the UAE. Questions about fabric, fit or delivery times? Message us on WhatsApp and our team will help.`,
  ];
}

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  return c ? { title: c.title, description: introFor(c)[0].slice(0, 160) } : {};
}

export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();

  const sidebar = (
    <div>
      <h4>{category.group}</h4>
      {category.siblings.map((s) => {
        const sib = getCategory(s);
        return sib ? (
          <Link key={s} className={s === category.slug ? "on" : undefined} href={`/category/${s}`}>
            {sib.title}
          </Link>
        ) : null;
      })}
    </div>
  );

  return (
    <FieldwornShell className="shop-fw">
      <div className="cat-hero">
        <div className="cat-hero-copy">
          <div className="crumb">
            <Link href="/">Home</Link> / {category.group} / {category.title}
          </div>
          <span className="eyebrow">*{category.group}</span>
          <h1>{category.title}</h1>
          <p>
            {category.products.length} {category.products.length === 1 ? "style" : "styles"}, tailored by Dressly since 1998.
          </p>
        </div>
        <div className="cat-hero-pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc(`images/categories/${category.slug}`)} alt={category.title} />
        </div>
      </div>
      <div className="wrap">
        <CategoryShop products={cards(category.products)} sidebar={sidebar} />
        <section className="cat-about" aria-labelledby="cat-about-title">
          <h2 id="cat-about-title">About {category.title}</h2>
          {introFor(category).map((t) => (
            <p key={t.slice(0, 32)}>{t}</p>
          ))}
        </section>
      </div>
    </FieldwornShell>
  );
}
