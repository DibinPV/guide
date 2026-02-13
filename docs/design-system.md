# Design System — Offline Travel Guide

**Version:** 1.0

## Principles
1. Calm & readable
2. One primary action per screen
3. Cards over pages
4. Soft elevation, no hard borders
5. Offline-first

## Tokens
All tokens are defined in `src/app/globals.css` under `:root`.

## Components
- `Button` (`src/ui/Button.tsx`)
- `Card` (`src/ui/Card.tsx`)
- `Badge` (`src/ui/Badge.tsx`)

## Usage Rules
- No hex colors in components.
- Use `.card`, `.button-*`, `.badge-*` classes only.
- All clickable cards must include chevron `→`.
- Only one primary CTA per screen.

## Storybook
Run:

```bash
npm run storybook
```
