# Smart Insurance Application Portal

A multilingual insurance application portal built with **Next.js 15**. Users can browse insurance products (Health, Home, Car, Life, etc.), fill out schema-driven dynamic forms, save drafts locally, and review purchased policies.

**Live demo:** [smart-insurance-application-portal.liara.run](https://smart-insurance-application-portal.liara.run)

---

## Features

- Dynamic forms generated from API field schemas (text, select, radio, checkbox, date)
- Runtime validation with Zod + React Hook Form
- Auto-save drafts to `localStorage`
- English / Persian (FA) localization with route-based locales
- Dark / light theme
- Purchased insurance list with filtering
- React Query for server state

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI, Motion |
| Forms | React Hook Form, Zod |
| Data | TanStack Query, Axios |
| i18n | Custom dictionaries + negotiator middleware |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional env:

```bash
NEXT_PUBLIC_HOST_API_KEY=https://assignment.devotel.io
NEXT_PUBLIC_USE_MOCK_API=true
```

Set `NEXT_PUBLIC_USE_MOCK_API=true` to run fully offline with local fixtures (handy for demos and recruiters).

## Screenshots

> Tip: drop screenshots into `docs/screenshots/` and link them here (home, dynamic form, applications table).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Schema builder smoke tests |

## Project structure

```
src/
  app/[lang]/          # Locale-aware routes
  components/          # UI + form field components
  sections/            # Page-level feature modules
  hooks/               # Data & form hooks
  services/            # HTTP + API clients
  dictionaries/        # en / fa translations
```

## Architecture

```
Browser (EN/FA routes)
   │
   ├─ Home → fetch insurance product list
   ├─ /insurance/[formId] → schema-driven dynamic form
   │     ├─ Zod schema built from API field definitions
   │     ├─ React Hook Form + draft autosave (localStorage)
   │     └─ Submit → purchased list
   └─ /purchased-insurances → filterable applications table

API: NEXT_PUBLIC_HOST_API_KEY (Devotel assignment API)
```

Recruiters can skim this as: **API schema → Zod → dynamic UI → validated submit**.

## Author

Built by [@selengr](https://github.com/selengr)
