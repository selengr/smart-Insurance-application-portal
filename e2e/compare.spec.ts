import { expect, type BrowserContext, type Page, test } from "@playwright/test"

const COMPARE_SESSION_KEY = "smart-insurance.compare"

type CopyFlowCopy = {
  lang: "en" | "fa"
  copyLink: string
  copiedLink: string
  copyHint: string
  chipName: RegExp
  chipDir: "ltr" | "rtl"
  chipTitle: string
}

const EN_COPY: CopyFlowCopy = {
  lang: "en",
  copyLink: "Copy compare link",
  copiedLink: "Link copied",
  copyHint: "Pick two different products to copy a shareable link.",
  chipName: /Last compared.*Health vs Home/i,
  chipDir: "ltr",
  chipTitle: "Health vs Home",
}

const FA_COPY: CopyFlowCopy = {
  lang: "fa",
  copyLink: "کپی لینک مقایسه",
  copiedLink: "لینک کپی شد",
  copyHint: "برای کپی لینک قابل اشتراک، دو محصول متفاوت انتخاب کنید.",
  chipName: /آخرین مقایسه.*درمان در برابر منزل/,
  chipDir: "rtl",
  chipTitle: "درمان در برابر منزل",
}

test.beforeEach(async ({ page }) => {
  await page.goto("/en")
  await page.evaluate((key) => sessionStorage.removeItem(key), COMPARE_SESSION_KEY)
})

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
  await page.goto("/en?compare=health,home")

  const section = page.locator("#compare")
  await section.getByRole("button", { name: "Clear" }).click()
  await expect(page).not.toHaveURL(/compare=/)
  await expect(section.getByLabel("First cover")).toHaveValue("")
  await expect(section.getByLabel("Second cover")).toHaveValue("")
  await expect(section.getByText(EN_COPY.copyHint)).toBeVisible()
  await expect(
    section.getByRole("button", { name: EN_COPY.copyLink }),
  ).toHaveAttribute("aria-disabled", "true")

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

async function runCopyCompareFlow(
  page: Page,
  context: BrowserContext,
  copy: CopyFlowCopy,
) {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto(`/${copy.lang}?compare=health,home`)

  const section = page.locator("#compare")
  const copyBtn = section.getByRole("button", { name: copy.copyLink })
  await expect(copyBtn).not.toHaveAttribute("aria-disabled", "true")
  await expect(section.getByText(copy.copyHint)).toHaveCount(0)
  await copyBtn.click()
  await expect(
    section.getByRole("button", { name: copy.copiedLink }),
  ).toBeVisible()
  await expect(section.getByRole("status")).toHaveText(copy.copiedLink)

  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toMatch(
    new RegExp(`/${copy.lang}\\?compare=health(,|%2C)home`),
  )

  const chip = page.getByRole("link", { name: copy.chipName })
  await expect(chip).toBeVisible()
  await expect(chip).toHaveAttribute("dir", copy.chipDir)
  await expect(chip).toHaveAttribute("title", copy.chipTitle)

  const chipBox = await chip.boundingBox()
  const iconBox = await chip.locator("[data-compare-chip-icon]").boundingBox()
  expect(chipBox).toBeTruthy()
  expect(iconBox).toBeTruthy()
  const chipMidX = chipBox!.x + chipBox!.width / 2
  const iconMidX = iconBox!.x + iconBox!.width / 2
  if (copy.chipDir === "rtl") {
    expect(iconMidX).toBeGreaterThan(chipMidX)
  } else {
    expect(iconMidX).toBeLessThan(chipMidX)
  }
}

test("last compared chip caps width on narrow viewports", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/en?compare=health,home")
  const chip = page.getByRole("link", { name: /Last compared/i })
  await expect(chip).toBeVisible()
  const box = await chip.boundingBox()
  expect(box).toBeTruthy()
  // max-w-[13rem] on narrow viewports
  expect(box!.width).toBeLessThanOrEqual(13 * 16 + 1)
})

test("EN copy compare link writes clipboard and confirms", async ({
  page,
  context,
}) => {
  await runCopyCompareFlow(page, context, EN_COPY)
})

test("FA copy compare link writes clipboard and confirms", async ({
  page,
  context,
}) => {
  await runCopyCompareFlow(page, context, FA_COPY)
})

test("last compared chip deep-links to stored pair", async ({ page }) => {
  await page.goto("/en?compare=health,car")
  await expect
    .poll(() =>
      page.evaluate((key) => sessionStorage.getItem(key), COMPARE_SESSION_KEY),
    )
    .toBe("health,car")

  await page.goto("/en")
  const chip = page.getByRole("link", { name: /Last compared.*Health vs Car/i })
  await expect(chip).toBeVisible()
  await chip.click()

  await expect(page).toHaveURL(/compare=health(,|%2C)car/)
  await expect(page).toHaveURL(/#compare/)
  const section = page.locator("#compare")
  await expect(section.getByLabel("First cover")).toHaveValue(
    "health_insurance_application",
  )
  await expect(section.getByLabel("Second cover")).toHaveValue(
    "car_insurance_application",
  )
})

test("last compared chip hides after clear until compare again", async ({
  page,
}) => {
  await page.goto("/en?compare=health,car")
  const chip = page.getByRole("link", { name: /Last compared/i })
  await expect(chip).toBeVisible()

  await page.locator("#compare").getByRole("button", { name: "Clear" }).click()
  await expect(chip).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((key) => sessionStorage.getItem(key), COMPARE_SESSION_KEY),
    )
    .toBe(",")

  const section = page.locator("#compare")
  await section.getByLabel("First cover").selectOption("health_insurance_application")
  await section.getByLabel("Second cover").selectOption("home_insurance_application")
  await expect(
    page.getByRole("link", { name: /Last compared.*Health vs Home/i }),
  ).toBeVisible()
})
