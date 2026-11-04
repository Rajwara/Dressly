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
};

export type Category = {
  slug: string;
  title: string;
  group: string;
  siblings: string[];
  products: string[];
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
  options: ProductOption[];
};

export type CartLine = { slug: string; options: string; qty: number };
