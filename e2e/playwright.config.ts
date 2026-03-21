import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export const STORAGE_STATE = path.join(__dirname, '.auth/user.json');

export default defineConfig({
    testDir: './',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html'],
        ['list'],
        ['./reporters/excel-reporter.ts']
    ] as any,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.BASE_URL || process.env.E2E_BASE_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'on',
        video: 'on-first-retry',
        headless: false,
    },

    /* Configure projects for major browsers */
    projects: [
        // Setup project for Authentication
        {
            name: 'setup',
            testMatch: '**/auth.setup.ts',
        },
        {
            name: 'chromium',
            testMatch: 'specs/**/*.spec.ts',
            dependencies: fs.existsSync(STORAGE_STATE) ? [] : ['setup'],
            use: {
                ...devices['Desktop Chrome'],
                // Use the storage state (tokens) from the setup project
                storageState: STORAGE_STATE,
            },
        },
    ],
});
