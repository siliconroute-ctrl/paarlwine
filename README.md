# Terroir — the Paarl Wine app

**app.paarlwine.com** — the wine label translator from Paarl, South Africa. Photograph a foreign wine
label and Terroir names the grape, the style and the closest bottles back home, plus a Paarl estate
that drinks the same way. Part of the **paarlwine.com** brand (the WordPress site holds the articles).

## What is in it

| Area | What it does |
|------|--------------|
| `/guide` | Searchable guide of classic wines (France, Italy, Spain, South Africa and more) with "similar bottles elsewhere" |
| `/scan` | Label scanner. Needs sign-in. Uses Claude to read the label; limited per user per day |
| `/cellar` | Each user's saved scans and label photos |
| `/estates` | Directory of Paarl estates (edit `src/lib/estates.ts`) |
| `/sponsors`, `/contact` | Advertiser pitch and a contact form that saves to the database and emails `hello@paarlwine.com` |
| `/auth` | Email and password sign-in, Google sign-in, password reset |

## Tech

TanStack Start (React 19, TypeScript, Tailwind), Supabase (Postgres, auth, storage), Claude API for
the scanner, SMTP for email, deployed to Vercel.

## Run it locally

```sh
cp .env.example .env     # then fill in the values
npm install
npm run dev
```

## Deploy

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the step-by-step: Supabase, Vercel, DNS, Google sign-in, email.
See [`docs/HANDOVER.md`](docs/HANDOVER.md) for the checklist of everything that transfers with the brand.

## Database

All schema and seed data are in `supabase/migrations/` and run in file-name order. Add new changes as
new migration files; never edit one that has already run.

## Content

`content/articles/` has eight ready-to-publish WordPress articles. `content/WORDPRESS-SITE-GUIDE.md`
has the menu structure and cross-linking plan.
