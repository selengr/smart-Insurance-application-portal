import { expect, type Page, test } from "@playwright/test"

const LOCAL_RECENTS_KEY = "sip_recent_applications"

type RecentEmptyCopy = {
  lang: "en" | "fa"
  recentTitle: string
  recentEmpty: string
  recentEmptyCta: string
  loginCta: string
}

const EN: RecentEmptyCopy = {
  lang: "en",
  recentTitle: "Recently viewed",
  recentEmpty: "No recent applications yet.",
  recentEmptyCta: "Browse products",
  loginCta: "Continue as demo user",
}

const FA: RecentEmptyCopy = {
  lang: "fa",
  recentTitle: "بازدیدهای اخیر",
  recentEmpty: "هنوز درخواست اخیری نیست.",
  recentEmptyCta: "مشاهده محصولات",
  loginCta: "ادامه به‌عنوان کاربر دمو",
}

async function clearRecents(page: Page) {
  await page.evaluate((key) => localStorage.removeItem(key), LOCAL_RECENTS_KEY)
}

async function runHomeRecentEmpty(page: Page, copy: RecentEmptyCopy) {
  await page.goto(`/${copy.lang}`)
  await clearRecents(page)
  await page.reload()

  const section = page.getByRole("region", { name: copy.recentTitle })
  await expect(section).toBeVisible()
  await expect(section.getByText(copy.recentEmpty)).toBeVisible()

  await section.getByRole("link", { name: copy.recentEmptyCta }).click()
  await expect(page).toHaveURL(new RegExp(`/${copy.lang}/?#products`))
  await expect(page.locator("#products")).toBeInViewport()
}

async function runPoliciesRecentEmpty(page: Page, copy: RecentEmptyCopy) {
  await page.goto(`/${copy.lang}/login`)
  await Promise.all([
    page.waitForURL(new RegExp(`/${copy.lang}/purchased-insurances`), {
      timeout: 45_000,
    }),
    page.getByRole("button", { name: copy.loginCta }).click(),
  ])

  await clearRecents(page)
  await page.reload()
  await expect(page).toHaveURL(new RegExp(`/${copy.lang}/purchased-insurances`))

  const section = page.getByRole("region", { name: copy.recentTitle })
  await expect(section).toBeVisible()
  await section.getByRole("link", { name: copy.recentEmptyCta }).click()

  await expect(page).toHaveURL(new RegExp(`/${copy.lang}/?#products`))
  await expect(page.locator("#products")).toBeInViewport()
}

test("EN home recent empty state deep-links to products", async ({ page }) => {
  await runHomeRecentEmpty(page, EN)
})

test("FA home recent empty state deep-links to products", async ({ page }) => {
  await runHomeRecentEmpty(page, FA)
})

test("EN policies recent empty state deep-links to home products", async ({
  page,
}) => {
  await runPoliciesRecentEmpty(page, EN)
})

test("FA policies recent empty state deep-links to home products", async ({
  page,
}) => {
  await runPoliciesRecentEmpty(page, FA)
})
