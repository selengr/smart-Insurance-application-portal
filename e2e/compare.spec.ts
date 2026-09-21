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

test("compare session keeps clear after navigate away and back", async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({ "Accept-Language": "en" })
  await page.goto("/en?compare=health,home")

  const section = page.locator("#compare")
  await section.getByRole("button", { name: "Clear" }).click()
  await expect(page).not.toHaveURL(/compare=/)
  await expect(section.getByLabel("First cover")).toHaveValue("")
  await expect(section.getByLabel("Second cover")).toHaveValue("")

  await page.goto("/en/login")
  await page.goto("/en")

  const again = page.locator("#compare")
  await expect(again.getByLabel("First cover")).toHaveValue("")
  await expect(again.getByLabel("Second cover")).toHaveValue("")
})

test("compare session restores pair when URL has no compare", async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({ "Accept-Language": "en" })
  await page.goto("/en?compare=health,car")
  await expect(page.locator("#compare").getByLabel("First cover")).toHaveValue(
    "health_insurance_application",
  )

  await page.goto("/en")
  const section = page.locator("#compare")
  await expect(section.getByLabel("First cover")).toHaveValue(
    "health_insurance_application",
  )
  await expect(section.getByLabel("Second cover")).toHaveValue(
    "car_insurance_application",
  )
})
