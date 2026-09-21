/** Short shareable slugs: health_insurance_application → health */

export const COMPARE_SESSION_KEY = "smart-insurance.compare"

export function formIdToCompareSlug(formId: string) {
  return formId.replace(/_insurance_application$/i, "").toLowerCase()
}

export function compareSlugToFormId(slug: string, knownFormIds: string[]) {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return ""
  if (knownFormIds.includes(slug)) return slug
  if (knownFormIds.includes(normalized)) return normalized
  const match = knownFormIds.find(
    (id) => formIdToCompareSlug(id) === normalized,
  )
  return match ?? ""
}

export function parseCompareParam(
  raw: string | null | undefined,
  knownFormIds: string[],
): [string, string] {
  if (raw == null) return ["", ""]
  const parts = raw.split(",").map((part) => part.trim())
  const left = compareSlugToFormId(parts[0] ?? "", knownFormIds)
  const right = compareSlugToFormId(parts[1] ?? "", knownFormIds)
  return [left, right]
}

/** Returns shareable query value. Both empty → "," (explicit clear, not defaults). */
export function serializeCompareParam(leftId: string, rightId: string) {
  if (!leftId && !rightId) return ","
  return [leftId, rightId]
    .map((id) => (id ? formIdToCompareSlug(id) : ""))
    .join(",")
}

/** URL wins; else session (including explicit clear ","); else defaults. */
export function resolveComparePair(
  hasUrlParam: boolean,
  urlRaw: string | null | undefined,
  sessionRaw: string | null | undefined,
  defaults: [string, string],
  knownFormIds: string[],
): [string, string] {
  if (hasUrlParam) return parseCompareParam(urlRaw, knownFormIds)
  if (sessionRaw != null) return parseCompareParam(sessionRaw, knownFormIds)
  return defaults
}

export function readCompareSession(): string | null {
  if (typeof window === "undefined") return null
  try {
    return sessionStorage.getItem(COMPARE_SESSION_KEY)
  } catch {
    return null
  }
}

export function writeCompareSession(value: string) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(COMPARE_SESSION_KEY, value)
  } catch {
    // private mode / quota
  }
}
