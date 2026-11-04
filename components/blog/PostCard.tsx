import Link from "next/link";
import DIcon from "./Icons";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: number;
  image: string;
};

export function Avatar({ large, className = "" }: { large?: boolean; className?: string }) {
  return (
    <span className={`avatar${large ? " avatar-lg" : ""} ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
    </span>
  );
}

export default function PostCard({ post, author }: { post: PostSummary; author: string }) {
  const href = `/blog/${post.slug}`;
  return (
    <article className="post-card" data-category={post.category}>
      <Link className="post-media" href={href}>
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" loading="lazy" />
        ) : (
          <div className="img-slot" role="img" aria-label="Post image placeholder">
            <DIcon name="image" />
          </div>
        )}
        <span className="post-tag">{post.category}</span>
      </Link>
      <div className="post-body">
        <h3>
          <Link href={href}>{post.title}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <div className="post-foot-rule" />
        <div className="post-foot">
          <div className="author">
            <Avatar />
            <span className="author-name">{author}</span>
          </div>
          <span className="post-meta">
            {post.date} &bull; {post.readTime} min read
          </span>
        </div>
      </div>
    </article>
  );
}
