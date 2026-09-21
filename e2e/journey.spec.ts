import { expect, type Page, test } from "@playwright/test"

type JourneyCopy = {
  lang: "en" | "fa"
  loginCta: string
  startFresh: string
  fillDemo: string
  nextSection: string
  continueReview: string
  reviewTitle: string
  agreeLabel: RegExp
  reserve: string
  confirmationTitle: string
  viewPolicies: string
  firstName: string
  lastName: string
  coverage: string
}

const EN: JourneyCopy = {
  lang: "en",
  loginCta: "Continue as demo user",
  startFresh: "Start fresh",
  fillDemo: "Fill demo answers",
  nextSection: "Next section",
  continueReview: "Continue to reserve",
  reviewTitle: "Reserve your cover",
  agreeLabel: /I confirm these details are correct/i,
  reserve: "Reserve application",
  confirmationTitle: "Reservation confirmed",
  viewPolicies: "View my policies",
  firstName: "Sara",
  lastName: "Karimi",
  coverage: "Standard",
}

const FA: JourneyCopy = {
  lang: "fa",
  loginCta: "ادامه به‌عنوان کاربر دمو",
  startFresh: "شروع از نو",
  fillDemo: "پر کردن نمونه",
  nextSection: "بخش بعد",
  continueReview: "ادامه برای رزرو",
  reviewTitle: "رزرو پوشش",
  agreeLabel: /جزئیات را درست می‌دانم/,
  reserve: "رزرو درخواست",
  confirmationTitle: "رزرو تأیید شد",
  viewPolicies: "مشاهده بیمه‌های من",
  firstName: "سارا",
  lastName: "کریمی",
  coverage: "استاندارد",
}

async function runHealthJourney(page: Page, copy: JourneyCopy) {
  const { lang } = copy

  await page.goto(`/${lang}/login`)
  await page.getByRole("button", { name: copy.loginCta }).click()
  await expect(page).toHaveURL(new RegExp(`/${lang}/purchased-insurances`))

  await page.goto(`/${lang}/insurance/health_insurance_application`)

  const startFresh = page.getByRole("button", { name: copy.startFresh })
  if (await startFresh.isVisible().catch(() => false)) {
    await startFresh.click()
  }

  await expect(page.getByRole("button", { name: copy.fillDemo })).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole("button", { name: copy.fillDemo }).click()

  // Health form has four top-level sections
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("button", { name: copy.nextSection }).click()
  }
  await page.getByRole("button", { name: copy.continueReview }).click()

  await expect(
    page.getByRole("heading", { name: copy.reviewTitle }),
  ).toBeVisible()

  await page
    .locator("label")
    .filter({ hasText: copy.agreeLabel })
    .locator('input[type="checkbox"]')
    .check()

  await page.getByRole("button", { name: copy.reserve }).click()

  await expect(page).toHaveURL(
    new RegExp(`/${lang}/insurance/health_insurance_application/confirmation`),
  )
  await expect(
    page.getByRole("heading", { name: copy.confirmationTitle }),
  ).toBeVisible()
  await expect(page.getByText(/APP-/i).first()).toBeVisible()

  await page.getByRole("link", { name: copy.viewPolicies }).click()
  await expect(page).toHaveURL(
    new RegExp(`/${lang}/purchased-insurances/APP-`),
  )

  await expect(page.getByText(copy.firstName, { exact: true })).toBeVisible()
  await expect(page.getByText(copy.lastName, { exact: true })).toBeVisible()
  await expect(
    page.getByText(copy.coverage, { exact: true }).first(),
  ).toBeVisible()
}

test("EN health apply reserves and opens policy detail", async ({ page }) => {
  await runHealthJourney(page, EN)
})

test("FA health apply reserves and opens policy detail", async ({ page }) => {
  await runHealthJourney(page, FA)
})
