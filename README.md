# Dressly

Next.js 16 (App Router) storefront.

| Route    | Source                    |
|----------|---------------------------|
| `/`      | `app/(home)/` – homepage (header, hero, categories, reels, reviews, journal, footer) |
| `/about` | `app/(about)/` – About page (uses the homepage header and footer) |

Both pages share the Big Shoulders + Space Grotesk fonts in `app/fonts/`. Each route group has its own root layout, so the two pages' stylesheets don't clash.

## Run

```bash
npm install
npm run dev
```

## Editing
- Brand copy, socials, WhatsApp number and reels: `lib/brand.ts`
- Products tagged in the reels: `lib/data/*.json`
- About page photos: drop a file named after a slot (e.g. `hero-1b.webp`) into `public/images/about/` to override it. Slot names are listed in `app/(about)/about/page.tsx`.
