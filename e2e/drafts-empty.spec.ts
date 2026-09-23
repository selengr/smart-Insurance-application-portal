import { expect, test } from "@playwright/test"

test("home drafts empty hint deep-links to products", async ({ page }) => {
  await page.goto("/en")
  await page.evaluate(() => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith("form_draft_")) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
  })
  await page.reload()

  const hint = page.getByRole("status").filter({
    hasText: "No drafts yet",
  })
  await expect(hint).toBeVisible()
  await hint.getByRole("link", { name: "Choose a product" }).click()
  await expect(page).toHaveURL(/#products/)
  await expect(page.locator("#products")).toBeInViewport()
})
