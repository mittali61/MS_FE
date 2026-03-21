import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly dashboardPageURL: string;

    constructor(page: Page) {
        this.page = page;
        const baseUrl = process.env.BASE_URL || process.env.E2E_BASE_URL;
        const slug = process.env.E2E_SLUG;
        this.dashboardPageURL = `${baseUrl}/${slug}/app/custom-dashboard/default`;
    }

    async navigate() {
        await this.page.goto(this.dashboardPageURL);
    }

    async addDashboard() {
        await this.page.getByRole('button', { name: 'Settings', exact: true }).click();
        await this.page.getByRole('menuitem', { name: 'Add New' }).click();
        await this.page.locator('input[name="name"]').clear();
        const uniqueDashboardName = `Automation Dashboard - ${Date.now()}`;
        await this.page.locator('input[name="name"]').fill(uniqueDashboardName);
        await this.page.locator('.ant-select-selection-overflow').click();
        await this.page.getByRole('checkbox', { name: 'Select All' }).click();
        await this.page.getByText('Assigned ToAll').click();

        // Wait for React UI state to update properly before saving
        await this.page.waitForTimeout(500);
        await this.page.locator('#save').click();

        return uniqueDashboardName;
    }

    async editDashboard() {
        await this.page.getByRole('button', { name: 'Settings', exact: true }).click();
        await this.page.getByRole('menuitem', { name: 'Edit' }).click();
        await this.page.locator('input[name="name"]').clear();
        const uniqueDashboardName = `Automation Dashboard - ${Date.now()}`;
        await this.page.locator('input[name="name"]').fill(uniqueDashboardName);
        await this.page.locator('.ant-select-selection-overflow').click();
        await this.page.getByText('Super Admin', { exact: true }).click();
        await this.page.getByRole('tree').getByText('User').click();

        // Wait for React UI state to update properly before saving
        await this.page.waitForTimeout(500);
        await this.page.locator('#save').click();

        return uniqueDashboardName;
    }

    async deleteDashboard() {
        await this.page.getByRole('button', { name: 'Settings', exact: true }).click();
        await this.page.getByRole('menuitem', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: 'Delete' }).click();
    }

    async addDashboardfromSidebar() {
        await this.page.getByRole('button', { name: 'Dashboard' }).click();
        await this.page.getByRole('button', { name: 'Add Dashboard' }).click();
        await this.page.locator('input[name="name"]').clear();
        const uniqueDashboardName = `Automation Dashboard - ${Date.now()}`;
        await this.page.locator('input[name="name"]').fill(uniqueDashboardName);
        await this.page.locator('.ant-select-selection-overflow').click();
        await this.page.getByRole('checkbox', { name: 'Select All' }).click();
        await this.page.getByText('Assigned ToAll').click();

        await this.page.waitForTimeout(500);
        await this.page.locator('#save').click();

        return uniqueDashboardName;
    }

    async clickDashboardName() {
        await this.page.getByRole('button', { name: 'Dashboard' }).click();
        await this.page.getByRole('button', { name: '• View All' }).click();
        const cell = this.page.getByRole('cell', { name: /Automation Dashboard -/ });
        // Dispatches click directly without mouse movement — no hover, no tooltip
        await cell.dispatchEvent('click');
        await expect(this.page.getByText('DashboardAutomation Dashboard -')).toBeVisible();
    }

    async setDefaultDashboard() {
        await this.page.getByRole('button', { name: '• View All' }).click();
        const starIcon = this.page.getByRole('row', { name: 'Automation Dashboard -' }).getByLabel('default', { exact: true });
        await starIcon.dispatchEvent('click');
        await this.page.getByRole('button', { name: 'Apply' }).click();
    }

    async editDashboardfromViewAll() {
        const editIcon = this.page.getByRole('button', { name: 'Edit Dashboard' });
        await editIcon.dispatchEvent('click');
        await this.page.locator('.ant-select-selection-overflow').click();
        await this.page.getByRole('checkbox', { name: 'Select User' }).click();
        await this.page.locator('#save').click()
    }

    async clickDeleteDefaultDashboard() {
        const deleteBtn = this.page.getByLabel('Delete Dashboard');
        await expect(deleteBtn).toBeDisabled();
        await deleteBtn.click({ force: true });
        await expect(this.page.getByRole('button', { name: 'Delete' })).toBeHidden();
    }

    async assertToastMessage(messageRegExpOrString: string | RegExp) {
        const toast = this.page.getByText(messageRegExpOrString);
        await expect(toast).toBeVisible({ timeout: 15000 });
    }
}