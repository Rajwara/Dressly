/**
 * Header menu, footer columns and top-bar messages. Category labels come from
 * lib/data/categories.json, so renaming a category there updates the menu.
 */
import categoriesData from "./data/categories.json";
import { PHONE_DISPLAY, WHATSAPP_URL } from "./brand";

type Cat = { slug: string; title: string; group: string };
const CATS = categoriesData as Cat[];
const title = (slug: string) => CATS.find((c) => c.slug === slug)?.title ?? slug;
const link = (slug: string) => ({ label: title(slug), href: `/category/${slug}` });
const inGroup = (group: string, first?: string) => {
  const list = CATS.filter((c) => c.group === group).map((c) => c.slug);
  return first ? [first, ...list.filter((s) => s !== first)] : list;
};

export type NavLink = { label: string; href: string };
export type NavColumn = { heading?: string; links: NavLink[] };
export type NavItem = { label: string; href: string; columns?: NavColumn[] };

export const MAIN_NAV: NavItem[] = [
  { label: "Branches", href: "/branches" },
  { label: "Home Tailoring", href: "/home-tailoring" },
  { label: "Kandura & Thobe", href: "/category/kandura-thobes", columns: [{ links: inGroup("Kandura and Thobe", "kandura-thobes").map(link) }] },
  { label: "Kids", href: "/category/kids-clothing", columns: [{ links: inGroup("Kids", "kids-clothing").map(link) }] },
  {
    label: "Traditional Wear",
    href: "/shop",
    columns: [
      { heading: "Outerwear", links: inGroup("Outerwear").map(link) },
      { heading: "Casual & Underwear", links: inGroup("Casual and underwear").map(link) },
      { heading: "Headwear", links: inGroup("Headwear").map(link) },
      { heading: "Footwear", links: inGroup("Footwear").map(link) },
      { heading: "Accessories", links: [...inGroup("Accessories"), ...inGroup("Gifts")].map(link) },
    ],
  },
  { label: "New Arrivals", href: "/shop?filter=new" },
];

export const SHOP_ALL: NavLink = { label: "Shop All Categories", href: "/shop" };

export const FOOTER_NAV: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "New Arrivals", href: "/shop?filter=new" },
      { label: "Kandura & Thobe", href: "/category/kandura-thobes" },
      { label: "Kids", href: "/category/kids-clothing" },
      { label: "Traditional Wear", href: "/shop#traditional-wear" },
      { label: "Shop All", href: "/shop" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns", href: "/policies/refund" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Branches", href: "/branches" },
      { label: "Home Tailoring", href: "/home-tailoring" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
    ],
  },
];

/** Rotating messages in the bar above the header. */
export const TOP_BAR: NavLink[] = [
  { label: "Kandura tailoring since 1998", href: "/about" },
  { label: "Home tailoring: we come to you", href: "/home-tailoring" },
  { label: "13 branches across 5 Emirates", href: "/branches" },
  { label: `Order on WhatsApp ${PHONE_DISPLAY}`, href: WHATSAPP_URL },
];

/** Pages where the offer popup must never open. */
export const NO_POPUP_PATHS = ["/cart", "/checkout", "/account"];
