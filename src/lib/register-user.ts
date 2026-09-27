import bcrypt from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(80).optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

// Not a discriminated union: the project's tsconfig runs with `strict: false`
// (no `strictNullChecks`), which turns off the control-flow narrowing that
// pattern relies on. `reason` is always present (optional) instead, so
// `!result.ok && result.reason === "..."` type-checks without narrowing.
export type RegisterResult = { ok: boolean; reason?: "invalid" | "exists" }

/** Shared by the /api/auth/register route and the server-action sign-up form. */
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) return { ok: false, reason: "invalid" }

  const { email, password, name } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { ok: false, reason: "exists" }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { email, passwordHash, name } })
  return { ok: true }
}
