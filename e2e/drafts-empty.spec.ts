import { expect, type Page, test } from "@playwright/test"

const DRAFT_KEY_PREFIX = "form_draft_"

type DraftsEmptyCopy = {
  lang: "en" | "fa"
  draftsEmpty: string
  draftsEmptyCta: string
}

const EN: DraftsEmptyCopy = {
  lang: "en",
  draftsEmpty: "No drafts yet",
  draftsEmptyCta: "Choose a product",
}

const FA: DraftsEmptyCopy = {
  lang: "fa",
  draftsEmpty: "هنوز پیش‌نویسی نیست",
  draftsEmptyCta: "انتخاب محصول",
}

async function clearDrafts(page: Page) {
  await page.evaluate((prefix) => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
  }, DRAFT_KEY_PREFIX)
}

async function runHomeDraftsEmpty(page: Page, copy: DraftsEmptyCopy) {
  await page.goto(`/${copy.lang}`)
  await clearDrafts(page)
  await page.reload()

  const hint = page.getByRole("status").filter({ hasText: copy.draftsEmpty })
  await expect(hint).toBeVisible()
  await hint.getByRole("link", { name: copy.draftsEmptyCta }).click()
  await expect(page).toHaveURL(new RegExp(`/${copy.lang}/?#products`))
  await expect(page.locator("#products")).toBeInViewport()
}

test("EN home drafts empty hint deep-links to products", async ({ page }) => {
  await runHomeDraftsEmpty(page, EN)
})

test("FA home drafts empty hint deep-links to products", async ({ page }) => {
  await runHomeDraftsEmpty(page, FA)
})
