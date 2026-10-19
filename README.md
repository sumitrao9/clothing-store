# Maison Atelier

Premium full-stack fashion e-commerce platform built with Next.js 14, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, and Stripe.

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Validation:** Zod
- **Password hashing:** bcryptjs
- **Image processing:** sharp
- **Type checking / lint:** TypeScript, ESLint

## Prerequisites

- Node.js 18+
- PostgreSQL (local via Docker or hosted)
- Docker (optional, for local Postgres)
- Stripe account (test keys for development)

## Installation & Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Copy environment example and configure
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, Stripe keys, etc.

# Start local Postgres (Docker)
npm run db:up

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

Open http://localhost:3000.

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://maison:maison@localhost:5432/maison?schema=public` |
| `NEXTAUTH_SECRET` | NextAuth secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe test secret key | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key | `pk_test_...` |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run db:up` | Start Postgres via Docker |
| `npm run db:down` | Stop Postgres |

## Project Structure

```
src/app/          # Next.js App Router routes & API routes
prisma/           # Prisma schema & migrations
```

## Status

Type check (`tsc --noEmit`) passes. Build and tests not yet run in this environment.
