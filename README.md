# Dressly

Next.js 16 (App Router) storefront. Every page shares the same header, footer, colours and fonts (Big Shoulders + Space Grotesk).

| Page | URL | Code |
|---|---|---|
| Home | `/` | `app/(home)/` |
| About | `/about` | `app/(about)/` |
| Contact | `/contact` | `app/(site)/contact/` |
| Category | `/category/<slug>` | `app/(site)/category/[slug]/`, `components/CategoryShop.tsx` |
| Product | `/product/<slug>` | `app/(site)/product/[slug]/`, `components/ProductDetail.tsx` |
| Blog / post | `/blog`, `/blog/<slug>` | `app/(site)/blog/`, posts in `lib/blog.ts` |
| Policies | `/policies/privacy`, `terms`, `shipping`, `refund` | `app/(site)/policies/[slug]/`, text in `lib/policies.ts` |
| Branches | `/branches` | `app/(site)/branches/`, `components/branches/` |
| Cart, saved, search | `/cart`, `/wishlist`, `/search` | `app/(site)/` |

`(home)`, `(about)` and `(site)` are route groups with their own root layouts, so their stylesheets don't clash; `app/global-not-found.tsx` is the shared 404.

## Shared pieces
- Header and footer: `components/fieldworn/FieldwornChrome.tsx` (+ `fieldworn-chrome.css`). The homepage has its own copy inside `app/(home)/Fieldworn.tsx`.
- Fonts: `components/fieldworn/fonts/`.
- Brand data (phone, WhatsApp, socials, branches, offer popup, reels): `lib/brand.ts`.
- Products and categories: `lib/catalog.ts` + `lib/data/*.json`.
- Logos and icons: `public/logo.png`, `public/logo-white.png`, `public/icon.png`, `app/icon.png`, `app/apple-icon.png`.
- About page photos: drop a file named after a slot (e.g. `hero-1b.webp`) into `public/images/about/`; slot names are in `app/(about)/about/page.tsx`.

## Run
```bash
npm install
npm run dev
```

## Notes
- The newsletter form posts to `app/api/subscribe/route.ts`, which forwards to `SUBSCRIBE_WEBHOOK_URL` if that environment variable is set.
- `scripts/generate-uae-globe.mjs` rebuilds the branches map data (only needed if branch locations change).
