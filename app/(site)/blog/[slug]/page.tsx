import type { Metadata } from "next";
import FieldwornShell from "@/components/FieldwornShell";
import "../blog-brand.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import DIcon from "@/components/blog/Icons";
import PostCard, { Avatar } from "@/components/blog/PostCard";
import { AUTHOR, POSTS, formatDate, getPost, readTime, type Block } from "@/lib/blog";
import { imageSrc } from "@/lib/images";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

function Content({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;
    case "h2":
      return <h2>{block.text}</h2>;
    case "quote":
      return <blockquote>{block.text}</blockquote>;
    case "list":
      return (
        <ul>
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "figure":
      return (
        <figure>
          <div className="article-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc(block.image)} alt={block.caption} loading="lazy" />
          </div>
          <figcaption>{block.caption}</figcaption>
        </figure>
      );
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const others = POSTS.filter((p) => p.slug !== post.slug).sort(
    (a, b) => Number(b.category === post.category) - Number(a.category === post.category) || b.date.localeCompare(a.date),
  );
  const related = others.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: formatDate(p.date),
    readTime: readTime(p),
    image: imageSrc(p.image),
  }));

  return (
    <FieldwornShell>
    <div className="bl">
      <section className="page-hero page-hero-post">
        <span className="eyebrow eyebrow-dot">{post.category}</span>
        <h1>{post.title}</h1>
      </section>

      <section className="section">
        <div className="container">
          <div className="post-hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc(post.image)} alt="" />
          </div>
          <article className="article">
            {post.body.map((b, i) => (
              <Content key={i} block={b} />
            ))}

            <aside className="author-card" aria-label="About the author">
              <Avatar className="author-card-avatar" />
              <div className="author-card-info">
                <span className="eyebrow">Written by</span>
                <h2>{AUTHOR.name}</h2>
                <p>{AUTHOR.bio}</p>
              </div>
              <dl className="author-card-stats">
                <div>
                  <dd>{formatDate(post.date)}</dd>
                  <dt>Published</dt>
                </div>
                <div>
                  <dd>{readTime(post)} min read</dd>
                  <dt>Read</dt>
                </div>
              </dl>
            </aside>

            <Link className="btn article-back" href="/blog">
              All articles <DIcon name="upRight" small />
            </Link>
          </article>
        </div>
      </section>

      <section className="section related">
        <div className="container">
          <div className="related-head">
            <div>
              <span className="eyebrow">Keep reading</span>
              <h2>More From the Blog</h2>
            </div>
            <Link className="btn" href="/blog">
              View All Articles <DIcon name="upRight" small />
            </Link>
          </div>
          <div className="post-grid">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} author={AUTHOR.name} />
            ))}
          </div>
        </div>
      </section>
    </div>
    </FieldwornShell>
  );
}
