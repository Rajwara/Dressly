import "server-only";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const EXTENSIONS = ["jpg", "jpeg", "webp", "png", "svg"];
const cache = new Map<string, string>();

/**
 * Resolve an image by its base path (no extension), e.g. "images/hero/hero-adult".
 * A real photo (.jpg, .jpeg, .webp or .png) dropped into /public wins over the
 * .svg placeholder that ships with the template.
 */
export function imageSrc(base: string): string {
  const hit = cache.get(base);
  if (hit) return hit;
  const ext = EXTENSIONS.find((e) => fs.existsSync(path.join(PUBLIC_DIR, `${base}.${e}`))) ?? "svg";
  const src = `/${base}.${ext}`;
  cache.set(base, src);
  return src;
}

export const productImage = (slug: string, view: "front" | "side" | "back" = "front") =>
  imageSrc(`images/products/${slug}-${view}`);
