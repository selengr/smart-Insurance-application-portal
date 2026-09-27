import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { listApplicationsForUser } from "@/lib/server-applications"

const EMPTY_COLUMNS = ["id", "Insurance Type", "Applicant", "Submitted At", "Status"]

// Matches src/services/api/purchased-insurances.tsx's remote-mode call to
// GET /api/insurance/forms/submissions, returning { columns, data } (see
// ITabelData). A guest gets an empty list rather than a 401 — same as the
// "no policies yet" guest state the UI already renders in mock mode.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ columns: EMPTY_COLUMNS, data: [] })
  }

  const result = await listApplicationsForUser(session.user.id)
  return NextResponse.json(result)
}
