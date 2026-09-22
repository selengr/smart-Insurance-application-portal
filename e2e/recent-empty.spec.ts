import { expect, test } from "@playwright/test"

const LOCAL_RECENTS_KEY = "sip_recent_applications"

test("home recent empty state deep-links to products", async ({ page }) => {
  await page.goto("/en")
  await page.evaluate((key) => localStorage.removeItem(key), LOCAL_RECENTS_KEY)
  await page.reload()

  const section = page.getByRole("region", { name: "Recently viewed" })
  await expect(section).toBeVisible()
  await expect(section.getByText("No recent applications yet.")).toBeVisible()

  await section.getByRole("link", { name: "Browse products" }).click()
  await expect(page).toHaveURL(/#products/)
  await expect(page.locator("#products")).toBeInViewport()
})
