import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env.BASE_URL || 'http://localhost:4200';

// Nx's preset derives report paths when the ESM config is loaded.
// eslint-disable-next-line unicorn/no-top-level-side-effects
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm exec nx serve gblaster',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
