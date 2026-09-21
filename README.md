# Smart Insurance Application Portal

A multilingual insurance application portal built with **Next.js 15**. Users browse Health / Home / Car / Life products, complete schema-driven forms, reserve applications with a live estimate, and track status in My policies.

**Live demo:** [smart-insurance-application-portal.liara.run](https://smart-insurance-application-portal.liara.run)

---

## Features

- Schema-driven dynamic forms (text, select, radio, checkbox, date, groups)
- Sectioned apply → review → reserve journey with live monthly estimate
- Draft autosave + continue/start-fresh restore banner
- EN / FA localization (route-based) and dark / light theme
- Demo session cookie (soft gate on My policies)
- Local reservations with status timeline (Pending → In Review → Approved)
- Policy detail, confirmation receipt (copy + print), mobile nav
- React Query data layer + optional remote API or offline mocks

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI, Motion |
| Forms | React Hook Form, Zod |
| Data | TanStack Query, Axios, `localStorage` demo store |
| i18n | Custom dictionaries + negotiator middleware |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Mock vs real API

| Mode | How |
| --- | --- |
| Mock (default in development) | `NEXT_PUBLIC_USE_MOCK_API=true` or omit in `NODE_ENV=development` |
| Remote Devotel API | `NEXT_PUBLIC_USE_MOCK_API=false` + `NEXT_PUBLIC_HOST_API_KEY=https://…` |

Fixtures and local reservations merge in mock mode so the policies list works offline.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Schema, status, quote, import, and answer-label unit tests |
| `npm run test:e2e` | Playwright smoke: demo login → apply → reserve → policy detail (EN + FA) |
| `npm run ci` | unit tests + typecheck + lint + build + e2e |

## Project structure

```
src/
  app/[lang]/          # Locale-aware routes
  components/          # UI primitives + shared widgets
  sections/            # Page-level feature modules
  hooks/               # Data & form hooks
  services/            # HTTP + API clients
  lib/                 # Quotes, drafts, status, i18n helpers
  dictionaries/        # en / fa translations
  mocks/               # Offline fixtures
```

## Architecture

```
Browser (EN/FA)
   │
   ├─ Home → product catalog
   ├─ /insurance/[formId]
   │     ├─ API/mock schema → Zod → sectioned RHF form
   │     ├─ Drafts: form_draft_* (localStorage)
   │     ├─ Live estimate (demo quote)
   │     └─ Reserve → recordMockSubmission → confirmation?ref=
   ├─ /confirmation → receipt (copy / print)
   └─ /purchased-insurances
         ├─ Demo session banner (sip_demo_session cookie)
         ├─ List + summary chips
         └─ /[id] detail + status timeline

Data
   ├─ Mock fixtures (src/mocks) when USE_MOCK_API
   ├─ Local apps: sip_local_applications (browser only)
   └─ Optional remote: NEXT_PUBLIC_HOST_API_KEY
```

Recruiters can skim this as: **API schema → Zod → guided UI → reserve → track status**.

## Author

Built by [@selengr](https://github.com/selengr)
