import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "../../shop-brand.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryShop from "@/components/CategoryShop";
import { cards, categories, getCategory } from "@/lib/catalog";
import { imageSrc } from "@/lib/images";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  return c ? { title: c.title, description: `Shop ${c.title} at Dressly.` } : {};
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
      </div>
    </FieldwornShell>
  );
}
