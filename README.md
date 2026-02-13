# Offline Travel Guide

A Next.js PWA travel guide with Markdown content, offline caching, and a geolocation map.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
cd "/Users/paveldibin/Library/CloudStorage/OneDrive-Personal/Codex/First Test/guide-app"
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

## Content structure

```
content/
  ru/
    places/
      eiffel-tower.md
      louvre.md
    tours/
      paris-weekend/
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
---
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

## Deploy (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Deploy with defaults.
