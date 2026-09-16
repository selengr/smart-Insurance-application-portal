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
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

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

## Author

Built by [@selengr](https://github.com/selengr)
