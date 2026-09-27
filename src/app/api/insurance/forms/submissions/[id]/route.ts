import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { advanceApplicationStatusForUser, getApplicationForUser } from "@/lib/server-applications"

// Not yet wired into the UI: src/app/[lang]/purchased-insurances/[id]/page.tsx
// still reads/advances status via the browser-local store
// (src/lib/local-applications.ts) for every application, including ones a
// signed-in user reserved through the database. These two routes exist so
// that migration is a follow-up wiring change, not a from-scratch backend
// build. GET returns one reserved application; PATCH advances it one step
// in the Pending → In Review → Approved pipeline.

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view this application." }, { status: 401 })
  }

  const app = await getApplicationForUser(session.user.id, id)
  if (!app) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 })
  }
  return NextResponse.json(app)
}

export async function PATCH(_request: Request, { params }: Params) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to update this application." }, { status: 401 })
  }

  const updated = await advanceApplicationStatusForUser(session.user.id, id)
  if (!updated) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 })
  }
  return NextResponse.json(updated)
}
