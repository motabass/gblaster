import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, {
      cypressDir: 'cypress'
    }),
    // Please ensure you use `cy.origin()` when navigating between domains and remove this option.
    // See https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin
    injectDocumentDomain: true
  },
  fileServerFolder: '.',
  video: false,
  videosFolder: '../../dist/cypress/apps/gblaster-e2e/videos',
  screenshotsFolder: '../../dist/cypress/apps/gblaster-e2e/screenshots',
  chromeWebSecurity: true,
  experimentalStudio: true
});

//
// const cypressJsonConfig = {
//   fileServerFolder: '.',
//   fixturesFolder: './src/fixtures',
//   video: false,
//   videosFolder: '../../dist/cypress/apps/gblaster-e2e/videos',
//   screenshotsFolder: '../../dist/cypress/apps/gblaster-e2e/screenshots',
//   chromeWebSecurity: true,
//   experimentalStudio: true,
//   specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
//   supportFile: 'src/support/e2e.ts'
// };
// export default defineConfig({
//   e2e: {
//     ...nxE2EPreset(__dirname),
//     ...cypressJsonConfig,
//     setupNodeEvents,
//     testIsolation: true
//   }
// });
