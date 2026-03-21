import { test, TestInfo } from '@playwright/test';

/**
 * Executes a test step and pushes annotations to the testInfo object.
 * This is useful for capturing detailed step-by-step results in reporters.
 * 
 * @param testInfo The TestInfo object from the Playwright test handler.
 * @param stepName The name of the step to execute.
 * @param action The asynchronous function containing the step logic.
 */
export const executeStep = async (testInfo: TestInfo, stepName: string, action: () => Promise<void>) => {
    try {
        await test.step(stepName, action);
        testInfo.annotations.push({ type: 'Step Passed', description: stepName });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message.split('\n')[0] : String(error);
        testInfo.annotations.push({ type: 'Step Failed', description: `${stepName} - ${errMsg}` });
        throw error;
    }
};
