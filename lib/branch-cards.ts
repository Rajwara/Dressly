import "server-only";
import type { LocatorBranch } from "@/components/BranchLocator";
import type { GlobeBranch } from "@/components/branches/BranchGlobe";
import { BRANCHES, directions } from "./brand";
import { imageSrc } from "./images";

// Shown until a photo of the branch itself is added at public/images/branches/<id>.webp.
const FALLBACKS = ["images/pages/branches", "images/pages/about", "images/hero/hero-new", "images/pages/contact", "images/content/story"];

/** Every branch with its emirate and a photo, for the store locator. */
export function branchCards(): LocatorBranch[] {
  let i = 0;
  return BRANCHES.flatMap((e) =>
    e.branches.map((b) => {
      const own = imageSrc(`images/branches/${b.id}`);
      const image = own.endsWith(".svg") ? imageSrc(FALLBACKS[i++ % FALLBACKS.length]) : own;
      return { ...b, emirate: e.emirate, image };
    }),
  );
}

/** The same branches in the shape the globe section needs. */
export function globeBranches(): GlobeBranch[] {
  return branchCards().map((b) => ({ id: b.id, name: b.name, area: b.area, emirate: b.emirate, image: b.image, directions: directions(b), lat: b.lat, lng: b.lng }));
}
