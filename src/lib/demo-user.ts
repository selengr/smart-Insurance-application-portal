// Seeded via `npm run db:seed` (see prisma/seed.mjs) so the "Continue as
// demo user" button on /login always has a real account to sign in as.
// Kept in a client-safe file (no Prisma/bcrypt imports) so both the
// server-side auth config and the client login form can use it.
export const DEMO_USER_EMAIL = "demo@sip.dev"
export const DEMO_USER_PASSWORD = "demo-portal"
