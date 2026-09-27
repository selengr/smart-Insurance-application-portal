import { NextResponse } from "next/server"

import { registerUser } from "@/lib/register-user"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const result = await registerUser(body ?? {})

  if (!result.ok && result.reason === "invalid") {
    return NextResponse.json(
      { error: "Enter a valid email and a password with at least 8 characters." },
      { status: 400 },
    )
  }
  if (!result.ok && result.reason === "exists") {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
