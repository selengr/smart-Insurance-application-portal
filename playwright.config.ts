import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.PLAYWRIGHT_PORT || 3100)
const baseURL = `http://127.0.0.1:${port}`
// CI and `npm run test:e2e:prod` test the real production build, not the dev server.
const useProdServer = Boolean(process.env.CI || process.env.E2E_PROD)

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: useProdServer
      ? `npx next start -p ${port}`
      : `npx next dev --turbopack -p ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      PORT: String(port),
      NEXT_PUBLIC_USE_MOCK_API: "true",
      NEXT_PUBLIC_HOST_API_KEY: "https://assignment.devotel.io",
    },
  },
})
