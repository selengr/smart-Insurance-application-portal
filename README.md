# Smart Insurance Application Portal

A multilingual insurance application portal built with **Next.js 15**. Users browse Health / Home / Car / Life products, complete schema-driven forms, reserve applications with a live estimate, and track status in My policies.

**Live demo:** [smart-insurance-application-portal.liara.run](https://smart-insurance-application-portal.liara.run)

---

## Features

- Schema-driven dynamic forms (text, select, radio, checkbox, date, groups)
- Sectioned apply → review → reserve journey with live monthly estimate
- Draft autosave + continue/start-fresh restore banner
- EN / FA localization (route-based) and dark / light theme
- Real sign-in (NextAuth credentials, backed by SQLite/Prisma) gating My policies — sign up, or continue as a seeded demo user
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
| Auth & DB | NextAuth v5 (Credentials), Prisma + SQLite |
| i18n | Custom dictionaries + negotiator middleware |

## Getting started

```bash
npm install
cp .env.example .env      # Prisma reads .env, not .env.local
npx prisma db push        # create prisma/dev.db from schema.prisma
npm run db:seed           # seed the demo@sip.dev account
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Auth & database

Signing in is real: `/api/auth/[...nextauth]` (NextAuth, Credentials provider) checks a `User` row in a local SQLite database via Prisma (`prisma/schema.prisma`).

- **Demo login** — the "Continue as demo user" button on `/login` signs in as `demo@sip.dev`, seeded by `npm run db:seed` (see `prisma/seed.mjs`).
- **Real accounts** — the "Need an account? Create one" link on `/login` registers a new user (`POST /api/auth/register`, password hashed with bcrypt) and signs them in immediately.
- **Env vars** — `DATABASE_URL` (SQLite file path) and `AUTH_SECRET` (session JWT signing key, e.g. `openssl rand -base64 32`) — see `.env.example`.
- `/purchased-insurances` is gated by a real session (checked in `src/middleware.ts` for routing, `src/lib/auth.ts` for pages), not a `sip_demo_session` cookie.

### Mock vs real API vs local backend

| Mode | How |
| --- | --- |
| Mock (default in development) | `NEXT_PUBLIC_USE_MOCK_API=true` or omit in `NODE_ENV=development` — fixtures + `localStorage` |
| Remote Devotel API | `NEXT_PUBLIC_USE_MOCK_API=false` + `NEXT_PUBLIC_HOST_API_KEY=https://…` |
| **Local backend (this repo's own API + database)** | `NEXT_PUBLIC_USE_MOCK_API=false` with `NEXT_PUBLIC_HOST_API_KEY` unset |

Fixtures and local reservations merge in mock mode so the policies list works offline.

**Local backend mode** points the existing `submitFormApi`/`purchasedInsurancesApi` calls (in `src/services/api/`) at this app's own `/api/insurance/forms/*` routes instead of an external API — no component changes needed, since it reuses the same mock/remote seam. When a form is reserved:
- **Signed in** → the application is written to the `Application` table (Prisma/SQLite), tied to that user, and the policies list reads it back from there.
- **Not signed in** → the reserve flow still succeeds (same response shape), but nothing is persisted server-side — matches today's guest experience.

The policy **detail** page (`src/app/[lang]/purchased-insurances/[id]/page.tsx`) and its "advance status" control work for both kinds of reservation: a locally-reserved or seeded-demo application resolves from `localStorage` as before (unchanged, synchronous), and anything not found there falls back to `GET`/`PATCH /api/insurance/forms/submissions/[id]` for a database-backed one. Drafts (`form_draft_*`) are unaffected either way and stay browser-local.

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
| `npm run test:e2e:prod` | Production build (mock API) + the same Playwright smoke against `next start`, like CI |
| `npm run ci` | unit tests + typecheck + lint + production build + e2e |
| `npm run db:push` | Push `prisma/schema.prisma` to the SQLite file at `DATABASE_URL` |
| `npm run db:seed` | Seed the `demo@sip.dev` account (see `prisma/seed.mjs`) |

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
   └─ /purchased-insurances (session-gated: NextAuth + Prisma/SQLite)
         ├─ Session continuity banner
         ├─ List + summary chips
         └─ /[id] detail + status timeline

Auth
   ├─ /api/auth/[...nextauth] → Credentials provider → Prisma User (bcrypt)
   └─ /api/auth/register → sign-up, then auto sign-in

Data
   ├─ Mock fixtures (src/mocks) when USE_MOCK_API
   ├─ Local apps: sip_local_applications (browser only)
   ├─ Local backend: /api/insurance/forms/* → Prisma Application (per user)
   └─ Optional remote: NEXT_PUBLIC_HOST_API_KEY
```

Recruiters can skim this as: **API schema → Zod → guided UI → reserve → track status**.

## Author

Built by [@selengr](https://github.com/selengr)
