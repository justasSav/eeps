import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  baseURL: "http://localhost:3000",
  use: {
    viewport: { width: 390, height: 844 },
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npx serve out -l 3000",
    port: 3000,
    reuseExistingServer: true,
  },
});
