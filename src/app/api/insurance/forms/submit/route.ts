import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { applicantFromValues, insuranceTypeFromFormId } from "@/lib/local-applications"
import { createApplicationForUser } from "@/lib/server-applications"

// Matches the shape src/services/api/insurance-forms.tsx's submitFormApi
// posts here in "remote API" mode: { data: { ...answers, formId,
// monthlyEstimate } }. The response shape matches what the mock branch of
// that same function already returns, so callers (the apply form) need no
// changes either way.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const payload = (body && typeof body === "object" ? body.data : null) as
    | (Record<string, unknown> & { formId?: string; monthlyEstimate?: number })
    | null

  const applicationId = `APP-${Date.now().toString(36).toUpperCase()}`

  if (payload?.formId) {
    const { formId, monthlyEstimate, ...answers } = payload

    // Only signed-in users get a durable, database-backed reservation — an
    // anonymous submission still succeeds (same response shape) but isn't
    // persisted anywhere server-side, same as today's mock-mode behavior.
    const session = await auth()
    if (session?.user?.id) {
      await createApplicationForUser(session.user.id, {
        id: applicationId,
        formId,
        insuranceType: insuranceTypeFromFormId(formId),
        applicant: applicantFromValues(answers),
        monthlyEstimate: typeof monthlyEstimate === "number" ? monthlyEstimate : undefined,
        answers,
      })
    }
  }

  return NextResponse.json({ ok: true, applicationId, received: payload })
}
