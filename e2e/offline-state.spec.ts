import { expect, type Page, test } from "@playwright/test"

type OfflineCopy = {
  lang: "en" | "fa"
  offline: string
  backOnline: string
}

const EN: OfflineCopy = {
  lang: "en",
  offline: "You’re offline. Drafts stay on this device — reconnect to sync the list.",
  backOnline: "You’re back online. Refreshing local data…",
}

const FA: OfflineCopy = {
  lang: "fa",
  offline: "آفلاین هستید. پیش‌نویس‌ها روی این دستگاه می‌مانند — برای همگام‌سازی فهرست دوباره وصل شوید.",
  backOnline: "دوباره آنلاین شدید. در حال تازه‌سازی داده‌های محلی…",
}

async function runOfflineBanner(page: Page, copy: OfflineCopy) {
  await page.goto(`/${copy.lang}`)

  const banner = page.getByRole("status").filter({ hasText: copy.offline })
  await expect(banner).toBeHidden()

  await page.context().setOffline(true)
  await expect(banner).toBeVisible()

  await page.context().setOffline(false)
  const backOnlineBanner = page.getByRole("status").filter({ hasText: copy.backOnline })
  await expect(backOnlineBanner).toBeVisible()
  await expect(banner).toBeHidden()

  // The reconnect banner is transient and clears itself a few seconds later.
  await expect(backOnlineBanner).toBeHidden({ timeout: 6_000 })
}

test("EN offline banner appears offline and clears after reconnect", async ({
  page,
}) => {
  await runOfflineBanner(page, EN)
})

test("FA offline banner appears offline and clears after reconnect", async ({
  page,
}) => {
  await runOfflineBanner(page, FA)
})
