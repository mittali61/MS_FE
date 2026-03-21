import { test, type Page } from '@playwright/test';
import { executeStep } from '../../helpers/step-helper';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe.serial('Dashboard Page', () => {
    let sharedDashboardName = '';

    test('Verify if Dashboard Settings is working or not', {
        tag: ['@dashboard', '@smoke', '@TC-2257'],
    }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2257' });
        const dashboardPage = new DashboardPage(page);

        await executeStep(testInfo, `Step 1: Add new dashboard`, async () => {
            await dashboardPage.navigate();
            await dashboardPage.addDashboard();
            await dashboardPage.assertToastMessage("Dashboard created successfully");
        });

        await executeStep(testInfo, `Step 2: Edit dashboard`, async () => {
            await dashboardPage.editDashboard();
            await dashboardPage.assertToastMessage("Dashboard updated successfully");
        });

        await executeStep(testInfo, `Step 3: Delete dashboard`, async () => {
            await dashboardPage.deleteDashboard();
            await dashboardPage.assertToastMessage("Dashboard deleted successfully");
        });
    });

    test('Add Dashboard > Verify new dashboard can be added or not', {
        tag: ['@dashboard', '@smoke', '@TC-2307'],
    }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2307' });
        const dashboardPage = new DashboardPage(page);

        await executeStep(testInfo, `Step 1: Add dashboard from sidebar`, async () => {
            await dashboardPage.navigate();
            sharedDashboardName = await dashboardPage.addDashboardfromSidebar();
            await dashboardPage.assertToastMessage("Dashboard created successfully");
        });
    }
    )

    test('Verify if View All is working or not', {
        tag: ['@dashboard', '@smoke', '@TC-2302'],
    }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2302' });
        const dashboardPage = new DashboardPage(page);

        await executeStep(testInfo, `Step 1: Verify dashboards on View All are clickable`, async () => {
            await dashboardPage.navigate();
            await dashboardPage.clickDashboardName();
        });

        await executeStep(testInfo, `Step 2: Verify if favourite dashboard can be selected`, async () => {
            await dashboardPage.setDefaultDashboard();
            await dashboardPage.assertToastMessage("User dashboard set default");
        });

        await executeStep(testInfo, `Step 3: Verify if edit icon on dashboard is working`, async () => {
            await dashboardPage.editDashboardfromViewAll();
            await dashboardPage.assertToastMessage("Dashboard updated successfully");
        });

        await executeStep(testInfo, `Step 4: Verify if delete icon on favourite dashboard is disabled`, async () => {
            await dashboardPage.clickDeleteDefaultDashboard();
        });

        await executeStep(testInfo, `Step 5: Verify if delete dashboard is working`, async () => {

        });

        await executeStep(testInfo, `Step 6: Verify if Add dashboard is working`, async () => {

        });

    })

});
