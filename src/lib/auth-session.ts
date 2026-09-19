export const DEMO_SESSION_COOKIE = "sip_demo_session"

export function isDemoAuthenticated(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return false
  return cookieHeader.split(";").some((part) => {
    const [key, value] = part.trim().split("=")
    return key === DEMO_SESSION_COOKIE && value === "1"
  })
}
