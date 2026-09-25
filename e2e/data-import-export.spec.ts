import { expect, type Page, test } from "@playwright/test"

type DataToolsCopy = {
  lang: "en" | "fa"
  loginCta: string
  exportLabel: string
  exportEmpty: string
  exportDone: string
  importLabel: string
  importDoneOne: string
  importFailed: string
  clearLabel: string
  clearConfirm: string
  clearCancel: string
  clearDone: string
}

const EN: DataToolsCopy = {
  lang: "en",
  loginCta: "Continue as demo user",
  exportLabel: "Export JSON",
  exportEmpty: "No local applications to export yet.",
  exportDone: "Applications exported",
  importLabel: "Import JSON",
  importDoneOne: "Imported 1 application(s)",
  importFailed: "Could not import that file. Use a SIP export JSON.",
  clearLabel: "Clear demo data",
  clearConfirm: "Clear local applications and drafts?",
  clearCancel: "Cancel",
  clearDone: "Demo data cleared",
}

const FA: DataToolsCopy = {
  lang: "fa",
  loginCta: "ادامه به‌عنوان کاربر دمو",
  exportLabel: "خروجی JSON",
  exportEmpty: "هنوز درخواست محلی برای خروجی نیست.",
  exportDone: "درخواست‌ها خروجی گرفته شد",
  importLabel: "ورود JSON",
  importDoneOne: "1 درخواست وارد شد",
  importFailed: "ورود فایل ممکن نشد. از خروجی JSON این پورتال استفاده کنید.",
  clearLabel: "پاک کردن داده دمو",
  clearConfirm: "درخواست‌ها و پیش‌نویس‌های محلی پاک شود؟",
  clearCancel: "انصراف",
  clearDone: "داده دمو پاک شد",
}

const IMPORT_ROW = {
  id: "app-import-1",
  "Insurance Type": "Car",
  Applicant: "Test Import",
  "Submitted At": "2026-03-01",
  Status: "Pending",
  formId: "car_insurance_application",
}

async function runDataImportExport(page: Page, copy: DataToolsCopy) {
  await page.goto(`/${copy.lang}/login`)
  await Promise.all([
    page.waitForURL(new RegExp(`/${copy.lang}/purchased-insurances`), {
      timeout: 45_000,
    }),
    page.getByRole("button", { name: copy.loginCta }).click(),
  ])

  const fileInput = page.locator('input[type="file"]')

  // Exporting with no local applications yet shows the empty hint, no download.
  await page.getByRole("button", { name: copy.exportLabel }).click()
  await expect(page.getByText(copy.exportEmpty)).toBeVisible()

  // Importing a file that isn't valid JSON fails cleanly.
  await fileInput.setInputFiles({
    name: "bad-import.json",
    mimeType: "application/json",
    buffer: Buffer.from("not json"),
  })
  await expect(page.getByText(copy.importFailed)).toBeVisible()

  // Importing a valid SIP export merges the row into the list.
  await fileInput.setInputFiles({
    name: "sip-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify([IMPORT_ROW])),
  })
  await expect(page.getByText(copy.importDoneOne)).toBeVisible()
  await expect(
    page.getByRole("cell", { name: IMPORT_ROW.id, exact: true }),
  ).toBeVisible()

  // Exporting now downloads the local applications as JSON.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: copy.exportLabel }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^sip-applications-\d{4}-\d{2}-\d{2}\.json$/)
  await expect(page.getByText(copy.exportDone)).toBeVisible()

  // Clearing demo data asks for confirmation before it wipes local applications.
  const clearButton = page.getByRole("button", { name: copy.clearLabel })
  await clearButton.click()
  await expect(page.getByText(copy.clearConfirm)).toBeVisible()
  await page.getByRole("button", { name: copy.clearCancel }).click()
  await expect(
    page.getByRole("cell", { name: IMPORT_ROW.id, exact: true }),
  ).toBeVisible()

  await page.getByRole("button", { name: copy.clearLabel }).click()
  await page.getByRole("button", { name: copy.clearLabel }).click()
  await expect(page.getByText(copy.clearDone)).toBeVisible()
  await expect(
    page.getByRole("cell", { name: IMPORT_ROW.id, exact: true }),
  ).toHaveCount(0)
}

test("EN import, export, and clear demo applications", async ({ page }) => {
  await runDataImportExport(page, EN)
})

test("FA import, export, and clear demo applications", async ({ page }) => {
  await runDataImportExport(page, FA)
})
