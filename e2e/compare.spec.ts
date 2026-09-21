import { expect, test } from "@playwright/test"

const COMPARE_SESSION_KEY = "smart-insurance.compare"

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ "Accept-Language": "en" })
  await page.goto("/en")
  await page.evaluate((key) => sessionStorage.removeItem(key), COMPARE_SESSION_KEY)
})

test("compare URL restores pair and updates after swap", async ({ page }) => {
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
  await page.goto("/en?compare=health,car")
  await expect
    .poll(() =>
      page.evaluate((key) => sessionStorage.getItem(key), COMPARE_SESSION_KEY),
    )
    .toBe("health,car")

  await page.goto("/en")
  const section = page.locator("#compare")
  await expect(section.getByLabel("First cover")).toHaveValue(
    "health_insurance_application",
  )
  await expect(section.getByLabel("Second cover")).toHaveValue(
    "car_insurance_application",
  )
})

test("copy compare link writes clipboard and confirms", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/en?compare=health,home")

  const section = page.locator("#compare")
  await section.getByRole("button", { name: "Copy compare link" }).click()
  await expect(
    section.getByRole("button", { name: "Link copied" }),
  ).toBeVisible()

  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toMatch(/\/en\?compare=health(,|%2C)home/)
})
