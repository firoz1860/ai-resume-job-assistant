import { defineConfig, devices } from '@playwright/test';

/**
 * CareerOS visual + interaction QA.
 *
 * Tests run against the LOCAL PRODUCTION BUILD (`vite preview` on :4173).
 * Build first: `npm run build`, then `npm run test:e2e`.
 *
 * Evidence (screenshots, video, HTML report, results.json) is written to the
 * repo-level `qa-evidence/` folder so it can be opened or downloaded from the PR.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  outputDir: '../qa-evidence/test-output',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../qa-evidence/playwright-report', open: 'never' }],
    ['json', { outputFile: '../qa-evidence/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
