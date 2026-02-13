# Offline Travel Guide

Next.js PWA travel guide with offline support, tours by day, admin CMS, and feedback analytics.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Storybook (UI Kit)

```bash
npm run storybook -- -p 6007
```

## Design System

Design tokens and UI rules are defined in:

- `src/app/globals.css` (tokens, base classes)
- `docs/design-system.md` (spec)

UI components:

- `src/ui/Button.tsx`
- `src/ui/ButtonLink.tsx`
- `src/ui/Card.tsx`
- `src/ui/Badge.tsx`

### Tokens (summary)

All tokens live in `:root` and must be used instead of raw hex values.

- Colors: `--color-primary-*`, `--color-neutral-*`, `--color-white`
- Typography: `--font-serif`, `--font-sans`, `--text-*`
- Spacing: `--space-*` (multiples of 4)
- Radius: `--radius-*`
- Elevation: `--shadow-*`

### Rules (Do/Don’t)

Do:
- Use tokens and base classes (`.card`, `.button-*`, `.badge-*`).
- Keep one primary CTA per screen.
- Use cards for clickable content.
- Show chevron `→` on clickable cards.

Don’t:
- Add raw hex colors in components.
- Introduce new spacing values not in tokens.
- Use multiple primary CTAs on one screen.

### Accessibility

- Minimum contrast: WCAG AA
- Clickable area ≥ 44px
- Hover states add information, never replace it

## Data Sources

- **Tours, days, events, articles** are stored in **Supabase**.
- **Places** are still loaded from Markdown files in `content/ru/places`.
- Feedback is stored in Supabase.

## Content structure (Places)

```
content/
  ru/
    places/
      goreme-open-air.md
      dark-church.md
      underground-city-derinkuyu.md
      selime-monastery.md
      ihlara-valley.md
      soganli-valley.md
      uchisar-castle.md
    tours/
      cappadocia-christian-4days/
        tour.json
```

## Add places

Create a new place file:

```
content/ru/places/colosseum.md
```

Frontmatter example:

```md
---
title: "Колизей"
city: "Рим"
country: "Италия"
lat: 41.8902
lng: 12.4922
images: ["/images/your-photo.jpg"]
---

Короткое описание места.

## История

Исторический контекст и факты.
```

## Add tours (Admin)

Tours are created/edited via the admin UI:

- `http://localhost:3000/admin` (dashboard)
- `http://localhost:3000/admin/tours`
- `http://localhost:3000/admin/tours/new`

Events are chronological and can be of two types:

- `excursion` (экскурсия)
- `travel` (перемещение)

Each event can reference a **rich article** (title, lead, markdown body, images array).

## Offline

Offline works in production builds (PWA). In development it is disabled.

## Supabase (Tours + Feedback)

### 1) Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (required for admin writes)
```

In Vercel, add the same variables under **Project Settings → Environment Variables**.

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** and should never be exposed to the client.
- Admin API routes use the service role key.

### 2) Database schema

Run SQL in Supabase (SQL Editor):

- `docs/supabase.sql`

### 3) What’s supported

- Feedback per **place**, **travel segment**, **day**, and **tour**
- Like/dislike + 1–5 rating + comment
- Auth-ready: `user_id` is optional now, can be enforced later with RLS policies
- Tours data (tours, days, events, articles) for public pages + admin CMS

### 4) Tables

The SQL creates these tables:

- `tours`
- `tour_days`
- `tour_events`
- `event_articles`
- `feedback_place`
- `feedback_stop`
- `feedback_travel`
- `feedback_day`
- `feedback_tour`

All tables have RLS enabled with public insert/select policies by default.

### 5) Migrations

We use a single SQL file for now:

- `docs/supabase.sql`

If schema changes are needed, append new statements to this file and re-run it in Supabase SQL Editor.

### 6) RLS Policies

Current policies allow public insert/select for feedback tables and public read for tours data.  
When auth is enabled, replace them with policies that use `auth.uid()` and restrict reads/writes.

## Architecture

- **Next.js App Router**: `src/app`
- **Places content (Markdown)**: `content/ru/places`, loader `src/lib/places.ts`
- **Tours content (Supabase)**: loader `src/lib/toursDb.ts`
- **UI kit**: `src/ui/*`
- **Design tokens & base styles**: `src/app/globals.css`
- **Map**: MapLibre (`src/components/MapView.tsx`)
- **Feedback API**: `src/app/api/feedback/route.ts`
- **Admin API**: `src/app/api/admin/tours/*`
- **Admin UI**: `src/app/admin/*`, `src/components/admin/*`

## Contributing

1. Keep UI changes aligned with `docs/design-system.md`.
2. Use tokens from `:root` in `src/app/globals.css`.
3. Add stories for new UI components in `src/ui/__stories__`.
4. Run Storybook before merging changes.

## Release Checklist

1. `npm run lint`
2. `npm run build`
3. `npm run storybook -- -p 6007`
4. Verify PWA offline on production build

## Deployment Troubleshooting

Common issues:

- **Vercel build fails with TypeScript errors**  
  Fix the reported file/line and re-run `npm run build` locally.

- **Storybook build fails**  
  Ensure Storybook uses Vite and `@vitejs/plugin-react` is installed.

- **PWA not working in dev**  
  PWA is disabled in development by design; test in production build.

## CI/CD Pipeline (Suggested)

Minimal GitHub Actions flow:

1. Install deps: `npm ci`
2. Lint: `npm run lint`
3. Build: `npm run build`
4. Storybook (optional): `npm run build-storybook`

Vercel can handle production deploys automatically on push to `main`.

## Content Authoring Guidelines (Places)

1. **One place = one file** under `content/ru/places/`.
2. Always include `title`, `city`, `country`, `lat`, `lng`.
3. Use `images` array with local paths in `/public/images/`.
4. Add a short intro paragraph + `## История` section.
5. Keep descriptions concise (3–6 sentences).

## Deploy (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add env vars from `.env.local`.
4. Deploy with defaults.
