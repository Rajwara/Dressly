import fs from "node:fs";
import path from "node:path";
import { imageSrc } from "@/lib/images";
import { FieldwornChromeBehavior, FieldwornFooter, FieldwornHeader } from "./FieldwornChrome";
import Logotype, { type LogotypeImages } from "./Logotype";

/**
 * Image slots, filled with the store's About page photography.
 * To use a different photo for a slot, upload a file named after the slot to
 * public/images/about/ (for example hero-1b.webp): it takes priority.
 */
const ABOUT_IMAGES: Record<string, string> = {
  // hero slider: small / large / small portrait images on each of 3 slides
  "hero-1a": "images/categories/traditional-kandura", "hero-1b": "images/categories/kandura-thobes", "hero-1c": "images/categories/adult-thobes",
  "hero-2a": "images/categories/saderi", "hero-2b": "images/categories/bisht", "hero-2c": "images/categories/kandura-jackets",
  "hero-3a": "images/categories/kids-clothing", "hero-3b": "images/categories/summer-thobes", "hero-3c": "images/categories/jalabiya",
  // about: either side of "Learn more"
  "about-1": "images/pages/about", "about-2": "images/content/story",
  // services: Bespoke Kanduras, Uniforms, Home Tailoring Visits, Sandals & Accessories
  "service-1": "images/categories/kandura-thobes", "service-2": "images/categories/kandura-jackets",
  "service-3": "images/content/story", "service-4": "images/categories/arabic-sandals",
  // process: the four home-tailoring steps
  "process-1": "images/pages/contact", "process-2": "images/pages/about", "process-3": "images/content/story", "process-4": "images/hero/hero-new",
  // our story cards
  "project-1": "images/pages/about", "project-2": "images/hero/hero-adult", "project-3": "images/hero/hero-winter", "project-4": "images/pages/branches",
  // round tabs in "What we stand for"
  "avatar-1": "images/categories/egal", "avatar-2": "images/categories/ghutra", "avatar-3": "images/categories/shimagh-ghutra",
  "avatar-4": "images/categories/kufi-caps", "avatar-5": "images/categories/kandura-thobes", "avatar-6": "images/categories/kandura-jackets",
};

/**
 * Image slots. Upload a file named after the slot to public/images/about/
 * (for example hero-1b.webp) and it replaces that placeholder on the next build.
 * Until then each slot shows the original grey placeholder with its size.
 */
const SLOTS = [
  "hero-1a", "hero-1b", "hero-1c", "hero-2a", "hero-2b", "hero-2c", "hero-3a", "hero-3b", "hero-3c",
  "about-1", "about-2",
  "service-1", "service-2", "service-3", "service-4",
  "process-1", "process-2", "process-3", "process-4",
  "project-1", "project-2", "project-3", "project-4",
  "avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5", "avatar-6",
];
const DIR = path.join(process.cwd(), "public", "images", "about");
const EXTENSIONS = ["webp", "jpg", "jpeg", "png", "avif"];

function findImage(slot: string) {
  const ext = EXTENSIONS.find((e) => fs.existsSync(path.join(DIR, `${slot}.${e}`)));
  return ext ? `/images/about/${slot}.${ext}` : undefined;
}

export default function AboutPage() {
  const img: LogotypeImages = Object.fromEntries(SLOTS.map((s) => [s, findImage(s) ?? (ABOUT_IMAGES[s] ? imageSrc(ABOUT_IMAGES[s]) : undefined)]));
  return (
    <>
      <FieldwornHeader />
      <Logotype img={img} />
      <FieldwornFooter image={imageSrc("images/content/story")} />
      <FieldwornChromeBehavior />
    </>
  );
}
