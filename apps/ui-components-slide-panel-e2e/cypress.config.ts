import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';
import setupNodeEvents from './src/plugins/index';

const cypressJsonConfig = {
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  video: true,
  videosFolder: '../../dist/cypress/apps/ui-components-slide-panel-e2e/videos',
  screenshotsFolder: '../../dist/cypress/apps/ui-components-slide-panel-e2e/screenshots',
  chromeWebSecurity: false,
  baseUrl: 'http://localhost:4400',
  specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'src/support/e2e.ts'
};
export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    ...cypressJsonConfig,
    setupNodeEvents
  }
});