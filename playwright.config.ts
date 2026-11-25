import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/tests/**/*.e2e.ts',
  testIgnore: '**/node_modules/**',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    launchOptions:
      process.env.CI === 'true'
        ? {}
        : {
            executablePath:
              process.env.PLAYWRIGHT_CHROME_PATH ??
              '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          },
  },
  webServer: {
    command: 'pnpm start',
    url: 'http://127.0.0.1:5173/api/tools/markdown-to-pdf/health',
    reuseExistingServer: process.env.CI !== 'true',
    timeout: 120_000,
  },
});
