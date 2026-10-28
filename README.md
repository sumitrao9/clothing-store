# Maison Atelier

**A full-stack fashion storefront: catalog, search, cart, wishlist, Stripe checkout, order
history and an admin surface — Next.js 14 App Router, Prisma/PostgreSQL, NextAuth, Tailwind.**

[![CI](https://github.com/sumitrao9/clothing-store/actions/workflows/ci.yml/badge.svg)](https://github.com/sumitrao9/clothing-store/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## What it covers

| Area | Routes |
|---|---|
| Shopping | `/`, `/products`, `/product/[slug]`, `/categories`, `/collections`, `/search`, `/lookbook` |
| Transaction | `/cart`, `/checkout`, `/wishlist`, `/account` |
| Content & legal | `/about`, `/contact`, `/privacy`, `/terms` |
| Admin & API | `/admin`, route handlers under `/api` |

- **Catalog** — products with variants, images, categories and curated collections.
- **Cart & wishlist** — server-backed carts (persisted per user/session) rather than
  client-only state, so they survive a device switch.
- **Checkout** — Stripe payment intents, order + payment records, coupon support.
- **Auth** — NextAuth (credentials with bcrypt hashing), protected account and admin routes.
- **Validation** — Zod schemas at the API boundary.

## Data model

```
User ─┬─ Address
      ├─ Cart ── CartItem ──┐
      ├─ Wishlist ─ WishlistItem
      └─ Order ── OrderItem ─┼─ Product ── ProductVariant ── ProductImage
                             └─ Payment     │
Coupon ───────────────────────────────────  Category / Collection
```

22 Prisma models in `prisma/schema.prisma`; migrations committed under `prisma/migrations`.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Prisma + PostgreSQL ·
NextAuth · Stripe · Zod · bcryptjs · sharp.

## Setup

```bash
npm install
npm run prisma:generate
cp .env.example .env      # then fill in the values below
npm run db:up             # PostgreSQL via Docker
npm run prisma:migrate
npm run seed              # optional demo catalog
npm run dev               # http://localhost:3000
```

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Session signing key (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App origin (`http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Stripe **test** secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe **test** publishable key |

`.env` is git-ignored; `.env.example` documents the shape with placeholders only.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` / `build` / `start` | Next dev, production build, production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm run prisma:generate` / `prisma:migrate` | Prisma client and migrations |
| `npm run db:up` / `db:down` | Local PostgreSQL via Docker |

## Status & verification

- `npm run typecheck` — passes
- `npm run lint` — 0 warnings, 0 errors
- `npm run build` — succeeds (all routes prerender or render on demand)
- CI runs the same three gates on every push (`.github/workflows/ci.yml`)

**Not built yet:** an automated test suite (Playwright for checkout, Vitest for cart/price
logic). Until then, the guarantees above are compile-time and build-time only — which is the
main thing I would add next.

**Known weakness:** prices and payment amounts are stored as `Float` in `schema.prisma` rather
than integer paise. It is the first thing I would migrate — floating-point money accumulates
rounding error across carts and refunds, and the fix touches every totals path, so it is
deliberately called out here instead of quietly shipped.

## License

MIT — see [LICENSE](LICENSE).
