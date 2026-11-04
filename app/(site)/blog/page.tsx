import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "./blog-brand.css";
import Link from "next/link";
import BlogList from "@/components/blog/BlogList";
import DIcon from "@/components/blog/Icons";
import { Avatar, type PostSummary } from "@/components/blog/PostCard";
import { AUTHOR, CATEGORIES, POSTS, formatDate, readTime } from "@/lib/blog";
import { imageSrc } from "@/lib/images";

export const metadata: Metadata = {
  title: "Blog",
  description: "Style guides, fabric care and tailoring notes from Dressly, kandura tailors since 1998.",
};

const summary = (p: (typeof POSTS)[number]): PostSummary => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  date: formatDate(p.date),
  readTime: readTime(p),
  image: imageSrc(p.image),
});

export default function BlogPage() {
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const featured = sorted.find((p) => p.featured) ?? sorted[0];
  const rest = sorted.filter((p) => p !== featured).map(summary);
  const used = CATEGORIES.filter((c) => rest.some((p) => p.category === c));
  const f = summary(featured);

  return (
    <FieldwornShell>
    <div className="bl">
      <section className="page-hero">
        <span className="eyebrow eyebrow-dot">From the blog</span>
        <h1>The Dressly Journal</h1>
        <p>Style guides, fabric care and tailoring notes from our team, for kanduras that look and feel right.</p>
      </section>

      <section className="section">
        <div className="container">
          <article className="featured">
            <div className="featured-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <span className="featured-badge">Featured article</span>
            </div>
            <div className="featured-body">
              <span className="eyebrow">{f.category}</span>
              <h2>{f.title}</h2>
              <p>{f.excerpt}</p>
              <div className="featured-foot">
                <div className="author">
                  <Avatar large />
                  <div>
                    <div className="author-name">{AUTHOR.name}</div>
                    <div className="author-date">{f.date}</div>
                  </div>
                </div>
                <Link className="btn" href={`/blog/${f.slug}`}>
                  Read Blog <DIcon name="upRight" small />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section section-tight-top">
        <div className="container">
          <BlogList posts={rest} categories={used} author={AUTHOR.name} />
        </div>
      </section>
    </div>
    </FieldwornShell>
  );
}
