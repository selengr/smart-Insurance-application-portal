"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_SESSION_COOKIE } from "@/lib/auth-session"

export async function signInDemo(lang: string) {
  const jar = await cookies()
  jar.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  redirect(`/${lang}/purchased-insurances`)
}

export async function signOutDemo(lang: string) {
  const jar = await cookies()
  jar.delete(DEMO_SESSION_COOKIE)
  redirect(`/${lang}`)
}
