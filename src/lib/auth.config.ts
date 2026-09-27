import type { NextAuthConfig } from "next-auth"

// Edge-safe half of the NextAuth setup: no Prisma, no bcrypt. Middleware runs
// on the Edge runtime and can only verify the JWT session cookie, so it
// imports this file instead of `auth.ts`, which pulls in the real
// (Node-only) Credentials provider.
export const authConfig = {
  pages: { signIn: "/login" },
  // Required off Vercel — without it NextAuth refuses requests from hosts it
  // doesn't recognize (e.g. Playwright's 127.0.0.1:PORT, or a container's
  // internal hostname) and silently redirects to /api/auth/error instead of
  // completing sign-in.
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user)
    },
  },
} satisfies NextAuthConfig
