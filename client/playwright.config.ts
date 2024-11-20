import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'uvicorn main:app --host 0.0.0.0 --port 8000',
    port: 8000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    cwd: '..',
  },
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
  },
  testDir: './tests',
});