"use client";

import { useEffect, useState } from "react";

/** "On this page" list that highlights the section currently in view. */
export default function PolicyToc({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <ol className="pol-toc-list">
      {items.map((i, n) => (
        <li key={i.id}>
          <a href={`#${i.id}`} className={active === i.id ? "on" : undefined} aria-current={active === i.id ? "true" : undefined}>
            <span>{String(n + 1).padStart(2, "0")}</span>
            {i.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
