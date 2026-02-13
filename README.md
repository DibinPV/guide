# Offline Travel Guide

Next.js PWA travel guide with offline support, tours by day, and location pages built from Markdown.

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

## Content structure

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

## Add tours

Create a folder and a `tour.json` file:

```
content/ru/tours/rome-3days/tour.json
```

Minimal example:

```json
{
  "title": "Рим за 3 дня",
  "city": "Рим",
  "country": "Италия",
  "days": [
    {
      "day": 1,
      "title": "Античный центр",
      "stops": [
        {
          "place": "colosseum",
          "description": "Осмотр главной арены.",
          "passBy": "По пути увидим Арку Константина.",
          "travelToNext": {
            "mode": "walk",
            "durationMinutes": 20,
            "distanceKm": 1.5
          }
        }
      ]
    }
  ]
}
```

## Offline

Offline works in production builds (PWA). In development it is disabled.

## Feedback (Supabase)

### 1) Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (optional, server-only)
```

In Vercel, add the same variables under **Project Settings → Environment Variables**.

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** and should never be exposed to the client.
- If not provided, the API route will fall back to the anon key.

### 2) Database schema

Run SQL in Supabase (SQL Editor):

- `docs/supabase.sql`

### 3) What’s supported

- Feedback per **place**, **travel segment**, **day**, and **tour**
- Like/dislike + 1–5 rating + comment
- Auth-ready: `user_id` is optional now, can be enforced later with RLS policies

### 4) Tables

The SQL creates these tables:

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

Current policies allow public insert/select for feedback tables.  
When auth is enabled, replace them with policies that use `auth.uid()` and restrict reads.

## Architecture

- **Next.js App Router** (`src/app`)
- **Content layer**: Markdown + JSON (`content/ru`)
- **Content loaders**: `src/lib/places.ts`, `src/lib/tours.ts`
- **UI kit**: `src/ui/*`
- **Design tokens & base styles**: `src/app/globals.css`
- **Map**: MapLibre (`src/components/MapView.tsx`)
- **Feedback API**: `src/app/api/feedback/route.ts`

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

## Content Authoring Guidelines

1. **One place = one file** under `content/ru/places/`.
2. Always include `title`, `city`, `country`, `lat`, `lng`.
3. Use `images` array with local paths in `/public/images/`.
4. Add a short intro paragraph + `## История` section.
5. Keep descriptions concise (3–6 sentences).

## Deploy (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Deploy with defaults.
