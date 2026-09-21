import { expect, test } from "@playwright/test"

test("compare URL restores pair and updates after swap", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "Accept-Language": "en" })
  await page.goto("/?compare=health,home")

  await expect(page).toHaveURL(/\/en\/?\?.*compare=health(,|%2C)home/)

  const section = page.locator("#compare")
  await expect(
    section.getByRole("heading", { name: "Compare covers" }),
  ).toBeVisible()

  const first = section.getByLabel("First cover")
  const second = section.getByLabel("Second cover")
  await expect(first).toHaveValue("health_insurance_application")
  await expect(second).toHaveValue("home_insurance_application")

  await section.getByRole("button", { name: "Swap" }).click()

  await expect(page).toHaveURL(/compare=home(,|%2C)health/)
  await expect(first).toHaveValue("home_insurance_application")
  await expect(second).toHaveValue("health_insurance_application")
})
