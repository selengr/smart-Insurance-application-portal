import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { i18n } from "../i18n.config"
import { isDemoAuthenticated } from "@/lib/auth-session"

import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

function getLocale(request: NextRequest): string {
  try {
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

    const locales = [...i18n.locales]
    const languages = new Negotiator({ headers: negotiatorHeaders })
      .languages()
      .filter((language) => {
        try {
          Intl.getCanonicalLocales(language)
          return true
        } catch {
          return false
        }
      })

    if (!languages.length) return i18n.defaultLocale
    return matchLocale(languages, locales, i18n.defaultLocale)
  } catch {
    return i18n.defaultLocale
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`
    return NextResponse.redirect(redirectUrl)
  }

  const locale = i18n.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
  )
  const isPoliciesRoute = locale && pathname.includes(`/${locale}/purchased-insurances`)
  if (isPoliciesRoute && !isDemoAuthenticated(request.headers.get("cookie"))) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts|icons|images|.*\\..*).*)"],
}
