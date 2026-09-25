import { expect, type Page, test } from "@playwright/test"

type FiltersCopy = {
  lang: "en" | "fa"
  loginCta: string
  healthType: string
  homeType: string
  searchLabel: string
  filterLabel: string
  columnLabel: string
  valueLabel: string
  applyFilter: string
  removeFilter: string
  insuranceTypeColumn: string
  clearAll: string
  approvedTile: string
  allTile: string
  noFilterMatches: string
}

const EN: FiltersCopy = {
  lang: "en",
  loginCta: "Continue as demo user",
  healthType: "Health",
  homeType: "Home",
  searchLabel: "Search applications",
  filterLabel: "Filter",
  columnLabel: "Column",
  valueLabel: "Value",
  applyFilter: "Apply filter",
  removeFilter: "Remove filter",
  insuranceTypeColumn: "Insurance type",
  clearAll: "Clear all",
  approvedTile: "Approved",
  allTile: "All",
  noFilterMatches: "No applications match this search or status filter.",
}

const FA: FiltersCopy = {
  lang: "fa",
  loginCta: "ادامه به‌عنوان کاربر دمو",
  healthType: "درمان",
  homeType: "منزل",
  searchLabel: "جستجوی درخواست‌ها",
  filterLabel: "فیلتر",
  columnLabel: "ستون",
  valueLabel: "مقدار",
  applyFilter: "اعمال فیلتر",
  removeFilter: "حذف فیلتر",
  insuranceTypeColumn: "نوع بیمه",
  clearAll: "پاک کردن همه",
  approvedTile: "تأیید شده",
  allTile: "همه",
  noFilterMatches: "هیچ درخواستی با این جستجو یا فیلتر وضعیت هم‌خوانی ندارد.",
}

async function loginAsDemo(page: Page, copy: FiltersCopy) {
  await page.goto(`/${copy.lang}/login`)
  await Promise.all([
    page.waitForURL(new RegExp(`/${copy.lang}/purchased-insurances`), {
      timeout: 45_000,
    }),
    page.getByRole("button", { name: copy.loginCta }).click(),
  ])
}

async function runPoliciesFilters(page: Page, copy: FiltersCopy) {
  await loginAsDemo(page, copy)

  // Two fixture applications (Health/Approved, Home/In review) seed the demo list.
  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: copy.homeType, exact: true }),
  ).toBeVisible()

  // Search narrows to the matching row.
  const search = page.getByRole("searchbox", { name: copy.searchLabel })
  await search.fill(copy.homeType)
  await expect(
    page.getByRole("cell", { name: copy.homeType, exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toHaveCount(0)
  await search.fill("")
  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toBeVisible()

  // Status summary tile narrows to that status.
  await page.getByRole("button", { name: copy.approvedTile }).click()
  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: copy.homeType, exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: copy.allTile }).click()
  await expect(
    page.getByRole("cell", { name: copy.homeType, exact: true }),
  ).toBeVisible()

  // Column filter modal narrows and the chip removes it.
  await page.getByRole("button", { name: copy.filterLabel }).click()
  await page
    .getByLabel(copy.columnLabel)
    .selectOption({ label: copy.insuranceTypeColumn })
  await page.getByLabel(copy.valueLabel).fill(copy.homeType)
  await page.getByRole("button", { name: copy.applyFilter }).click()

  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByText(`${copy.insuranceTypeColumn}: ${copy.homeType}`),
  ).toBeVisible()

  await page.getByRole("button", { name: copy.removeFilter }).click()
  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toBeVisible()

  // A search with no matches shows the empty-filter hint and clears via one click.
  await search.fill("zz-no-such-application")
  await expect(page.getByText(copy.noFilterMatches)).toBeVisible()
  await page.getByRole("button", { name: copy.clearAll }).click()
  await expect(
    page.getByRole("cell", { name: copy.healthType, exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: copy.homeType, exact: true }),
  ).toBeVisible()
}

test("EN policy filters narrow and reset the applications list", async ({
  page,
}) => {
  await runPoliciesFilters(page, EN)
})

test("FA policy filters narrow and reset the applications list", async ({
  page,
}) => {
  await runPoliciesFilters(page, FA)
})
