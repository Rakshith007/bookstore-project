import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // 👇 ADD THIS BASE URL 👇
    baseUrl: 'http://localhost:3000',
    
    // 👇 ADD THESE CONFIGURATIONS 👇
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    screenshotOnRunFailure: true,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});