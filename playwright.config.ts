import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const adminAuthFile = "e2e/.auth/admin.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: [/admin\//],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin-setup",
      testMatch: /admin\/auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      dependencies: ["admin-setup"],
      testMatch: /admin\/.*\.spec\.ts/,
      testIgnore: [/admin\/auth\.spec\.ts/],
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices["Desktop Chrome"],
        storageState: adminAuthFile,
      },
    },
    // Auth edge cases (incl. logout) run after admin specs so signOut
    // does not revoke the shared storageState session mid-suite.
    {
      name: "admin-auth",
      dependencies: ["admin"],
      testMatch: /admin\/auth\.spec\.ts/,
      fullyParallel: false,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
