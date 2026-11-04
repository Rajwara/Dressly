import CommunityVideos from "@/components/CommunityVideos";
import { COMMUNITY } from "@/lib/brand";
import { cards } from "@/lib/catalog";
import { imageSrc } from "@/lib/images";
import "./community.css";
import Fieldworn, { type FieldwornImages } from "./Fieldworn";

/**
 * The original file drew a placeholder for each image slot (data-ph="key").
 * Each slot now uses one of the store's current images.
 */
const SLOTS: Record<string, string> = {
  // full-bleed scenes
  hero: "images/hero/hero-winter",
  why: "images/categories/kandura-thobes",
  s1: "images/hero/hero-adult",
  s2: "images/hero/hero-new",
  s3: "images/hero/hero-kids",
  s4: "images/pages/about",
  cta: "images/pages/branches",
  foot: "images/content/story",
  // "Most Wanted" product thumbnails
  g1: "images/categories/saderi",
  g2: "images/categories/kandura-jackets",
  g3: "images/categories/bisht",
  g4: "images/categories/jalabiya",
  g5: "images/categories/arabian-casuals",
  g6: "images/categories/summer-thobes",
  // category cards, comfort slider and offer cards
  p1: "images/categories/adult-thobes",
  p2: "images/categories/traditional-kandura",
  p3: "images/categories/kids-clothing",
  p4: "images/categories/shimagh-ghutra",
  p5: "images/categories/perfumes",
  p6: "images/categories/wallets",
  // review row
  t1: "images/categories/egal",
  t2: "images/categories/ghutra",
  t3: "images/categories/yashmagh",
  t4: "images/categories/kufi-caps",
  t5: "images/categories/tarboosh",
  t6: "images/categories/arabic-sandals",
  t7: "images/categories/kids-footwear",
  t8: "images/categories/kids-headwear",
  // journal and Instagram
  b1: "images/pages/journal",
  b2: "images/pages/contact",
  f1: "images/community/shopping-day",
  f2: "images/community/desert-walk",
  f3: "images/community/perfume-blending",
  f4: "images/community/bisht-trim",
};

export default function HomePage() {
  const img: FieldwornImages = Object.fromEntries(Object.entries(SLOTS).map(([k, v]) => [k, imageSrc(v)]));
  // Same reels, wording and controls as the home page "Behind the craft" section.
  const clips = COMMUNITY.clips.map((c) => ({ ...c, poster: imageSrc(c.poster), products: cards(c.products) }));
  const community = (
    <div className="cv">
      <CommunityVideos eyebrow={COMMUNITY.eyebrow} text={COMMUNITY.text} instagram={COMMUNITY.instagram} clips={clips} hideHead />
    </div>
  );
  return <Fieldworn img={img} community={community} />;
}
