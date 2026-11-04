import { imageSrc } from "@/lib/images";

/** Full-width photo banner at the top of a content page; the header sits on it. */
export default function PageBanner({ image, eyebrow, title, text }: { image: string; eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="page-banner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc(image)} alt="" />
      <div className="page-banner-copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </div>
  );
}
