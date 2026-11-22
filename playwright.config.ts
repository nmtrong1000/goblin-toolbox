import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tools/markdown-to-pdf/ui-test',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5183',
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
  webServer: [
    {
      command: 'PORT=3003 pnpm --filter @goblin/api dev',
      url: 'http://127.0.0.1:3003/api/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command:
        'API_BASE_URL=http://localhost:3003 pnpm --filter @goblin/web dev --port 5183 --strictPort',
      url: 'http://127.0.0.1:5183/api/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
