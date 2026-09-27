import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { nextStatus } from "@/lib/local-applications"
import type { ITabelData, ITabelRow } from "@/types/purchased-insurances"

// Server-side (Prisma-backed) counterpart to src/lib/local-applications.ts.
// Used by the /api/insurance/forms/* routes so a signed-in user's reserved
// applications persist in the database instead of only in their browser.
// Deliberately mirrors the same row shape (ITabelData/ITabelRow) so the
// existing policies-list UI (src/services/api/purchased-insurances.tsx)
// needs no changes to consume it.

const COLUMNS = ["id", "Insurance Type", "Applicant", "Submitted At", "Status"]

type ApplicationRow = {
  id: string
  insuranceType: string
  applicant: string
  formId: string | null
  status: string
  monthlyEstimate: number | null
  submittedAt: Date
}

function toRow(app: ApplicationRow): ITabelRow {
  return {
    id: app.id,
    "Insurance Type": app.insuranceType,
    Applicant: app.applicant,
    "Submitted At": app.submittedAt.toISOString().slice(0, 10),
    Status: app.status,
    ...(app.formId ? { formId: app.formId } : {}),
    ...(typeof app.monthlyEstimate === "number"
      ? { monthlyEstimate: app.monthlyEstimate }
      : {}),
  }
}

export async function listApplicationsForUser(userId: string): Promise<ITabelData> {
  const rows = await prisma.application.findMany({
    where: { userId },
    orderBy: { reservedAt: "desc" },
  })
  return { columns: COLUMNS, data: rows.map(toRow) }
}

export async function createApplicationForUser(
  userId: string,
  input: {
    id: string
    formId?: string
    insuranceType: string
    applicant: string
    monthlyEstimate?: number
    answers: Record<string, unknown>
  },
) {
  const now = new Date()
  return prisma.application.create({
    data: {
      id: input.id,
      userId,
      formId: input.formId,
      insuranceType: input.insuranceType,
      applicant: input.applicant,
      monthlyEstimate: input.monthlyEstimate,
      answers: input.answers as Prisma.InputJsonValue,
      status: "Pending",
      statusHistory: [{ status: "Pending", at: now.toISOString() }],
      submittedAt: now,
      reservedAt: now,
    },
  })
}

export async function getApplicationForUser(userId: string, id: string) {
  return prisma.application.findFirst({ where: { id, userId } })
}

/** Advance one step in the Pending → In Review → Approved pipeline. */
export async function advanceApplicationStatusForUser(userId: string, id: string) {
  const app = await getApplicationForUser(userId, id)
  if (!app) return null

  const upcoming = nextStatus(app.status)
  if (!upcoming) return app

  const at = new Date().toISOString()
  const history = Array.isArray(app.statusHistory) ? app.statusHistory : []

  return prisma.application.update({
    where: { id },
    data: {
      status: upcoming,
      statusHistory: [...history, { status: upcoming, at }],
    },
  })
}
