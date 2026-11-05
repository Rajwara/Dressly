export type ProductOption = { label: string; values: string[] };

export type Product = {
  slug: string;
  name: string;
  colour: string;
  category: string;
  categorySlug: string;
  price: number;
  options: ProductOption[];
  sizeGuide: boolean;
  description: string;
  metaDescription: string;
  related: string[];
  /** ISO date the product was added; used by the "Recently added" sort. */
  addedAt?: string;
  /** Optional filter facets; category filters for these appear once products carry them. */
  fabric?: string;
  occasion?: string;
  collar?: string;
};

export type Category = {
  slug: string;
  title: string;
  group: string;
  siblings: string[];
  products: string[];
  /** Optional short paragraphs shown under the category grid (for shoppers and search engines). */
  intro?: string[];
};

/** The slice of a product that cards, the cart and the wishlist need on the client. */
export type CardProduct = {
  slug: string;
  name: string;
  colour: string;
  category: string;
  categorySlug: string;
  price: number;
  image: string;
  /** front, side and back views; the second is shown on hover */
  images: string[];
  badge?: string;
  addedAt?: string;
  /** Category group, e.g. "Abayas"; used to group the Category filter. */
  group?: string;
  options: ProductOption[];
  fabric?: string;
  occasion?: string;
  collar?: string;
};

export type CartLine = { slug: string; options: string; qty: number };
