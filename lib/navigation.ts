type Link = { label: string; href: string };
type Column = { heading: string; links: Link[] };
export type NavItem = { label: string; href: string; columns?: Column[] };

const cat = (slug: string) => `/category/${slug}`;

export const mainNav: NavItem[] = [
  {
    label: "Kandura and Thobe",
    href: cat("kandura-thobes"),
    columns: [
      {
        heading: "Kandura and Thobe",
        links: [
          { label: "All Kandura and Thobes", href: cat("kandura-thobes") },
          { label: "Adult Thobes", href: cat("adult-thobes") },
          { label: "Traditional Kandura", href: cat("traditional-kandura") },
          { label: "Summer Thobes", href: cat("summer-thobes") },
        ],
      },
    ],
  },
  {
    label: "Kids",
    href: cat("kids-clothing"),
    columns: [
      {
        heading: "Kids",
        links: [
          { label: "Kids Clothing", href: cat("kids-clothing") },
          { label: "Kids Shimagh and Ghutra", href: cat("kids-headwear") },
          { label: "Kids Footwear", href: cat("kids-footwear") },
        ],
      },
    ],
  },
  {
    label: "Traditional Wear",
    href: cat("kandura-jackets"),
    columns: [
      {
        heading: "Outerwear",
        links: [
          { label: "Kandura Jackets", href: cat("kandura-jackets") },
          { label: "Saderi (Sleeveless Jackets)", href: cat("saderi") },
          { label: "Bisht", href: cat("bisht") },
          { label: "Shawls", href: cat("shawls") },
        ],
      },
      {
        heading: "Casual and underwear",
        links: [
          { label: "Jalabiya", href: cat("jalabiya") },
          { label: "Arabian Casuals", href: cat("arabian-casuals") },
          { label: "Faneela (Undershirts)", href: cat("faneela") },
          { label: "Wuzar", href: cat("wuzar") },
          { label: "Trunks and Salwar", href: cat("trunks-salwar") },
        ],
      },
      {
        heading: "Headwear",
        links: [
          { label: "Shimagh and Ghutra", href: cat("shimagh-ghutra") },
          { label: "Ghutra", href: cat("ghutra") },
          { label: "Yashmagh", href: cat("yashmagh") },
          { label: "Egal", href: cat("egal") },
          { label: "Tarboosh", href: cat("tarboosh") },
          { label: "Kufi and Prayer Caps", href: cat("kufi-caps") },
        ],
      },
      { heading: "Footwear", links: [{ label: "Arabic Sandals", href: cat("arabic-sandals") }] },
      {
        heading: "Accessories",
        links: [
          { label: "Perfumes", href: cat("perfumes") },
          { label: "Wallets", href: cat("wallets") },
        ],
      },
    ],
  },
  { label: "Home Tailoring", href: "/#home-tailoring" },
  { label: "Branches", href: "/branches" },
  { label: "About", href: "/about" },
];

export const footerNav: Column[] = [
  {
    heading: "Shop",
    links: [
      { label: "Kandura and Thobe", href: cat("kandura-thobes") },
      { label: "Kids", href: cat("kids-clothing") },
      { label: "Outerwear", href: cat("kandura-jackets") },
      { label: "Casual and underwear", href: cat("jalabiya") },
      { label: "Headwear", href: cat("shimagh-ghutra") },
      { label: "Footwear", href: cat("arabic-sandals") },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Branches", href: "/branches" },
      { label: "Home Tailoring", href: "/#home-tailoring" },
      { label: "Gift Card", href: "/product/digital-gift-card-ivory" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Terms", href: "/policies/terms" },
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Refunds", href: "/policies/refund" },
      { label: "Shipping", href: "/policies/shipping" },
    ],
  },
];
