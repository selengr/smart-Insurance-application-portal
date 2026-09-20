export const LOCAL_APPS_KEY = "sip_local_applications"
export const LOCAL_APPS_VERSION = 2

export type ApplicationStatus = "Pending" | "In Review" | "Approved" | "Rejected"

export type StatusEvent = {
  status: ApplicationStatus
  at: string
  note?: string
}

export type LocalApplication = {
  id: string
  "Insurance Type": string
  Applicant: string
  "Submitted At": string
  Status: ApplicationStatus | string
  formId?: string
  answers?: Record<string, unknown>
  monthlyEstimate?: number
  reservedAt?: string
  updatedAt?: string
  statusHistory?: StatusEvent[]
}

const FORM_LABELS: Record<string, string> = {
  health_insurance_application: "Health",
  home_insurance_application: "Home",
  car_insurance_application: "Car",
  life_insurance_application: "Life",
}

const STATUS_FLOW: ApplicationStatus[] = ["Pending", "In Review", "Approved"]

function isApplicationStatus(value: string): value is ApplicationStatus {
  return ["Pending", "In Review", "Approved", "Rejected"].includes(value)
}

function normalizeApp(row: LocalApplication): LocalApplication {
  const status = isApplicationStatus(row.Status) ? row.Status : "Pending"
  const reservedAt = row.reservedAt ?? `${row["Submitted At"]}T12:00:00.000Z`
  const history =
    row.statusHistory && row.statusHistory.length > 0
      ? row.statusHistory
      : [{ status, at: reservedAt }]

  return {
    ...row,
    Status: status,
    reservedAt,
    updatedAt: row.updatedAt ?? history[history.length - 1]?.at ?? reservedAt,
    statusHistory: history,
  }
}

function readStorage(): LocalApplication[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_APPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalApplication[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeApp)
  } catch {
    return []
  }
}

function writeStorage(apps: LocalApplication[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(apps))
  window.dispatchEvent(new CustomEvent("sip:applications-changed"))
}

export function getLocalApplications(): LocalApplication[] {
  return readStorage()
}

export function getLocalApplicationById(id: string): LocalApplication | undefined {
  return readStorage().find((row) => row.id === id)
}

/** Resolve a policy from local submissions or seeded demo fixtures. */
export function resolveApplicationById(id: string): LocalApplication | undefined {
  const local = getLocalApplicationById(id)
  if (local) return local
  const demo = DEMO_APPLICATIONS.find((row) => row.id === id)
  return demo ? normalizeApp(demo) : undefined
}

export function isLocalOwnedApplication(id: string): boolean {
  return Boolean(getLocalApplicationById(id))
}

export const DEMO_APPLICATIONS: LocalApplication[] = [
  {
    id: "app-1",
    "Insurance Type": "Health",
    Applicant: "Demo User",
    "Submitted At": "2026-01-12",
    Status: "Approved",
    formId: "health_insurance_application",
    monthlyEstimate: 186,
    reservedAt: "2026-01-12T09:20:00.000Z",
    updatedAt: "2026-01-14T11:00:00.000Z",
    statusHistory: [
      { status: "Pending", at: "2026-01-12T09:20:00.000Z" },
      { status: "In Review", at: "2026-01-13T10:00:00.000Z" },
      { status: "Approved", at: "2026-01-14T11:00:00.000Z" },
    ],
    answers: {
      personal_info: {
        first_name: "Alex",
        last_name: "Rivera",
        age: 34,
        gender: "Prefer not to say",
      },
      coverage: "Standard",
      smoker: false,
      dependents: 1,
    },
  },
  {
    id: "app-2",
    "Insurance Type": "Home",
    Applicant: "Demo User",
    "Submitted At": "2026-02-03",
    Status: "In Review",
    formId: "home_insurance_application",
    monthlyEstimate: 94,
    reservedAt: "2026-02-03T14:05:00.000Z",
    updatedAt: "2026-02-04T09:30:00.000Z",
    statusHistory: [
      { status: "Pending", at: "2026-02-03T14:05:00.000Z" },
      { status: "In Review", at: "2026-02-04T09:30:00.000Z" },
    ],
    answers: {
      property_address: "128 Cedar Lane",
      property_type: "Apartment",
      year_built: 2012,
      security_system: true,
    },
  },
]

export function insuranceTypeFromFormId(
  formId: string,
  titles?: Record<string, string>,
) {
  if (titles?.[formId]) return titles[formId]
  return FORM_LABELS[formId] || formId.replace(/_application$/, "").replace(/_/g, " ")
}

export function applicantFromValues(data: Record<string, unknown>): string {
  const personal = data.personal_info as Record<string, unknown> | undefined
  if (personal?.first_name || personal?.last_name) {
    return [personal.first_name, personal.last_name].filter(Boolean).join(" ")
  }
  if (typeof data.full_name === "string" && data.full_name.trim()) {
    return data.full_name.trim()
  }
  return "Demo User"
}

export function saveLocalApplication(app: LocalApplication) {
  const normalized = normalizeApp(app)
  const existing = readStorage().filter((row) => row.id !== normalized.id)
  writeStorage([normalized, ...existing])
}

export function nextStatus(current: string): ApplicationStatus | null {
  const index = STATUS_FLOW.indexOf(current as ApplicationStatus)
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[index + 1]
}

/** Advance a locally owned application one step in the review pipeline. */
export function advanceApplicationStatus(id: string): LocalApplication | null {
  const apps = readStorage()
  const index = apps.findIndex((row) => row.id === id)
  if (index < 0) return null

  const current = normalizeApp(apps[index])
  const upcoming = nextStatus(current.Status)
  if (!upcoming) return current

  const at = new Date().toISOString()
  const updated: LocalApplication = {
    ...current,
    Status: upcoming,
    updatedAt: at,
    statusHistory: [...(current.statusHistory ?? []), { status: upcoming, at }],
  }
  apps[index] = updated
  writeStorage(apps)
  return updated
}

/**
 * Auto-progress local Pending apps based on age so the demo feels alive
 * without requiring a backend worker.
 */
export function applyDemoStatusProgress(now = Date.now()): boolean {
  const apps = readStorage()
  let changed = false

  const next = apps.map((row) => {
    const app = normalizeApp(row)
    if (app.Status === "Approved" || app.Status === "Rejected") return app

    const start = Date.parse(app.reservedAt ?? app["Submitted At"])
    if (Number.isNaN(start)) return app

    const ageMs = now - start
    let target: ApplicationStatus = "Pending"
    if (ageMs >= 1000 * 60 * 3) target = "Approved"
    else if (ageMs >= 1000 * 45) target = "In Review"

    if (target === app.Status) return app

    const history = [...(app.statusHistory ?? [])]
    const flowIndex = STATUS_FLOW.indexOf(app.Status as ApplicationStatus)
    const targetIndex = STATUS_FLOW.indexOf(target)
    for (let i = flowIndex + 1; i <= targetIndex; i += 1) {
      const status = STATUS_FLOW[i]
      if (!history.some((event) => event.status === status)) {
        history.push({
          status,
          at: new Date(start + (i === 1 ? 45_000 : 180_000)).toISOString(),
        })
      }
    }

    changed = true
    return {
      ...app,
      Status: target,
      updatedAt: history[history.length - 1]?.at,
      statusHistory: history,
    }
  })

  if (changed) writeStorage(next)
  return changed
}

export function recordMockSubmission(
  formId: string,
  data: Record<string, unknown>,
  applicationId: string,
  extras?: { monthlyEstimate?: number },
) {
  const answers = { ...data }
  delete answers.formId
  const reservedAt = new Date().toISOString()
  saveLocalApplication({
    id: applicationId,
    "Insurance Type": insuranceTypeFromFormId(formId),
    Applicant: applicantFromValues(data),
    "Submitted At": reservedAt.slice(0, 10),
    Status: "Pending",
    formId,
    answers,
    monthlyEstimate: extras?.monthlyEstimate,
    reservedAt,
    updatedAt: reservedAt,
    statusHistory: [{ status: "Pending", at: reservedAt }],
  })
  trackRecentApplication(applicationId)
}

export function summarizeStatuses(apps: { Status?: string }[]) {
  return apps.reduce(
    (acc, row) => {
      const key = String(row.Status ?? "Pending")
      if (key === "Pending") acc.pending += 1
      else if (key === "In Review") acc.inReview += 1
      else if (key === "Approved") acc.approved += 1
      else if (key === "Rejected") acc.rejected += 1
      else acc.other += 1
      return acc
    },
    { pending: 0, inReview: 0, approved: 0, rejected: 0, other: 0, total: apps.length },
  )
}

export const LOCAL_RECENTS_KEY = "sip_recent_applications"

export function clearLocalApplications() {
  writeStorage([])
}

export function clearFormDrafts() {
  if (typeof window === "undefined") return 0
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith("form_draft_")) keys.push(key)
  }
  keys.forEach((key) => localStorage.removeItem(key))
  return keys.length
}

export function clearDemoBrowserData() {
  clearLocalApplications()
  const drafts = clearFormDrafts()
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_RECENTS_KEY)
  }
  return { drafts }
}

export function importLocalApplications(
  incoming: unknown,
  mode: "merge" | "replace" = "merge",
): { imported: number; skipped: number } {
  if (!Array.isArray(incoming)) {
    throw new Error("Invalid import payload")
  }

  const normalized = incoming
    .filter((row): row is LocalApplication => {
      if (!row || typeof row !== "object") return false
      const candidate = row as Partial<LocalApplication>
      return typeof candidate.id === "string" && candidate.id.length > 0
    })
    .map((row) => normalizeApp(row))

  if (mode === "replace") {
    writeStorage(normalized)
    return { imported: normalized.length, skipped: incoming.length - normalized.length }
  }

  const existing = readStorage()
  const byId = new Map(existing.map((row) => [row.id, row]))
  let imported = 0
  normalized.forEach((row) => {
    byId.set(row.id, row)
    imported += 1
  })
  writeStorage(Array.from(byId.values()))
  return { imported, skipped: incoming.length - normalized.length }
}

export function trackRecentApplication(id: string) {
  if (typeof window === "undefined" || !id) return
  try {
    const raw = localStorage.getItem(LOCAL_RECENTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    const next = [id, ...parsed.filter((value) => value !== id)].slice(0, 8)
    localStorage.setItem(LOCAL_RECENTS_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / parse issues
  }
}

export function getRecentApplicationIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_RECENTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
  } catch {
    return []
  }
}

export function getRecentApplications(limit = 4): LocalApplication[] {
  const ids = getRecentApplicationIds().slice(0, limit)
  return ids
    .map((id) => resolveApplicationById(id))
    .filter((row): row is LocalApplication => Boolean(row))
}

// Keep version marker available for future migrations / docs
void LOCAL_APPS_VERSION
