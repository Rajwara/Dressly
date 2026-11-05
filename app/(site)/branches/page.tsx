import type { Metadata } from "next";
import BranchLocator, { type LocatorBranch } from "@/components/BranchLocator";
import BranchGlobe, { type GlobeBranch } from "@/components/branches/BranchGlobe";
import PageBanner from "@/components/PageBanner";
import FieldwornShell from "@/components/FieldwornShell";
import { BRANCHES, directions } from "@/lib/brand";
import { imageSrc } from "@/lib/images";
import "./branches-brand.css";


export const metadata: Metadata = {
  title: "Branches",
  description: "Find your nearest Dressly branch: 13 abaya tailoring stores across Abu Dhabi, Dubai, Sharjah, Ajman and Ras Al Khaimah.",
};

// Shown on hover until a photo of the branch itself is added at public/images/branches/<id>.webp.
const FALLBACKS = ["images/pages/branches", "images/pages/about", "images/hero/hero-new", "images/pages/contact", "images/content/story"];
export default function BranchesPage() {
  let i = 0;
  const branches: LocatorBranch[] = BRANCHES.flatMap((e) =>
    e.branches.map((b) => {
      const own = imageSrc(`images/branches/${b.id}`);
      const image = own.endsWith(".svg") ? imageSrc(FALLBACKS[i++ % FALLBACKS.length]) : own;
      return { ...b, emirate: e.emirate, image };
    }),
  );
  const globe: GlobeBranch[] = branches.map((b) => ({
    id: b.id,
    name: b.name,
    area: b.area,
    emirate: b.emirate,
    image: b.image,
    directions: directions(b),
    lat: b.lat,
    lng: b.lng,
  }));

  return (
    <FieldwornShell className="fw-overlay">
      <PageBanner
        image="images/pages/branches"
        eyebrow="*13 branches · 5 Emirates"
        title="Our branches"
        text="Visit any of our branches across the Emirates to choose fabrics and be measured, or book a tailor to come to you."
      />
      <BranchGlobe branches={globe} emirates={BRANCHES.length} />
      <BranchLocator branches={branches} />
    </FieldwornShell>
  );
}
