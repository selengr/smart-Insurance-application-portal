import { expect, test } from "@playwright/test"

/**
 * Smoke: demo sign-in → health apply → fill demo → reserve → policy detail.
 * Uses EN copy for stable accessible names.
 */
test("health apply reserves and opens policy detail", async ({ page }) => {
  await page.goto("/en/login")
  await page.getByRole("button", { name: "Continue as demo user" }).click()
  await expect(page).toHaveURL(/\/en\/purchased-insurances/)

  await page.goto("/en/insurance/health_insurance_application")

  const startFresh = page.getByRole("button", { name: "Start fresh" })
  if (await startFresh.isVisible().catch(() => false)) {
    await startFresh.click()
  }

  await expect(
    page.getByRole("button", { name: "Fill demo answers" }),
  ).toBeVisible({ timeout: 30_000 })

  await page.getByRole("button", { name: "Fill demo answers" }).click()

  // Health form has four top-level sections
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("button", { name: "Next section" }).click()
  }
  await page.getByRole("button", { name: "Continue to reserve" }).click()

  await expect(
    page.getByRole("heading", { name: "Reserve your cover" }),
  ).toBeVisible()

  await page
    .locator("label")
    .filter({ hasText: /I confirm these details are correct/i })
    .locator('input[type="checkbox"]')
    .check()

  await page.getByRole("button", { name: "Reserve application" }).click()

  await expect(page).toHaveURL(
    /\/en\/insurance\/health_insurance_application\/confirmation/,
  )
  await expect(
    page.getByRole("heading", { name: "Reservation confirmed" }),
  ).toBeVisible()
  await expect(page.getByText(/APP-/i).first()).toBeVisible()

  await page.getByRole("link", { name: "View my policies" }).click()
  await expect(page).toHaveURL(/\/en\/purchased-insurances\/APP-/)

  await expect(page.getByText("Sara", { exact: true })).toBeVisible()
  await expect(page.getByText("Karimi", { exact: true })).toBeVisible()
  await expect(page.getByText("Standard", { exact: true }).first()).toBeVisible()
})
