"use server"

import { signOut } from "@/lib/auth"

// Signing in happens client-side (see login-form.tsx) via next-auth/react's
// signIn(), which redirects reliably for the Credentials provider. Signing
// out has no such issue, so a plain server action (bound to a <form>, no
// client JS required) still works fine here.
export async function signOutDemo(lang: string) {
  await signOut({ redirectTo: `/${lang}` })
}
