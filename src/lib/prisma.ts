import { PrismaClient } from "@prisma/client"

// Reuse a single client across hot reloads in dev so we don't exhaust
// SQLite connections every time a route module is re-evaluated.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
