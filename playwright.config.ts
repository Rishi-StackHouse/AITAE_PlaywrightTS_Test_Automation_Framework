import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { Timeouts } from './Src/Core/Constant/Timeouts';

dotenv.config({ path: path.resolve(__dirname, 'Config', '.env'), quiet: true });


export default defineConfig({
  testDir: './Testsuites',
  fullyParallel: true,  // Run tests in files in parallel
  forbidOnly: !!process.env.CI,  // Fail the build on CI if you accidentally left test.only in the source code
  retries: process.env.CI ? 2 : 0,   // Retry on CI only 
  workers: process.env.CI ? 1 : undefined,  // Opt out of parallel tests on CI.
  reporter: 'html',   // Reporter to use. See https://playwright.dev/docs/test-reporters
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Orge',
      testDir: './Testsuites/Orge',
      timeout: Number(process.env.ORGE_TIMEOUT_TEST ?? Timeouts.orge.test),
      expect: { timeout: Number(process.env.ORGE_TIMEOUT_EXPECT ?? Timeouts.orge.expect) },
      use: {
        ...devices[process.env.ORGE_DEVICE ?? 'Desktop Chrome'],
        channel: process.env.ORGE_CHANNEL ?? 'chrome',
        viewport: { width: 1280, height: 720 },
        screen: { width: 1280, height: 720 },
        actionTimeout: Number(process.env.ORGE_TIMEOUT_ACTION ?? Timeouts.orge.action),
        navigationTimeout: Number(process.env.ORGE_TIMEOUT_NAVIGATION ?? Timeouts.orge.navigation)
      },
    },


  ],

});


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */



/* Test against mobile viewports. */
// {
//   name: 'Mobile Chrome',
//   use: { ...devices['Pixel 5'] },
// },
// {
//   name: 'Mobile Safari',
//   use: { ...devices['iPhone 12'] },
// },

/* Test against branded browsers. */
// {
//   name: 'Microsoft Edge',
//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
// },
// {
//   name: 'Google Chrome',
//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
// },
