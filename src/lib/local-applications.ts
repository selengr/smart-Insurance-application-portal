export const LOCAL_APPS_KEY = "sip_local_applications"

export type LocalApplication = {
  id: string
  "Insurance Type": string
  Applicant: string
  "Submitted At": string
  Status: string
  formId?: string
}

const FORM_LABELS: Record<string, string> = {
  health_insurance_application: "Health",
  home_insurance_application: "Home",
  car_insurance_application: "Car",
  life_insurance_application: "Life",
}

function readStorage(): LocalApplication[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_APPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalApplication[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getLocalApplications(): LocalApplication[] {
  return readStorage()
}

export function insuranceTypeFromFormId(formId: string) {
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
  return "Applicant"
}

export function saveLocalApplication(app: LocalApplication) {
  if (typeof window === "undefined") return
  const existing = readStorage().filter((row) => row.id !== app.id)
  localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify([app, ...existing]))
}

export function recordMockSubmission(formId: string, data: Record<string, unknown>, applicationId: string) {
  saveLocalApplication({
    id: applicationId,
    "Insurance Type": insuranceTypeFromFormId(formId),
    Applicant: applicantFromValues(data),
    "Submitted At": new Date().toISOString().slice(0, 10),
    Status: "Pending",
    formId,
  })
}
