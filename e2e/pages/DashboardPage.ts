import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly dashboardPageURL: string;

    readonly settingsButton: Locator;
    readonly addNewMenuItem: Locator;
    readonly editMenuItem: Locator;
    readonly deleteMenuItem: Locator;
    readonly nameInput: Locator;
    readonly assignedToDropdown: Locator;
    readonly selectAllCheckbox: Locator;
    readonly assignedToAllText: Locator;
    readonly saveButton: Locator;
    readonly superAdminOption: Locator;
    readonly UserOption: Locator;
    readonly deleteConfirmButton: Locator;
    readonly dashboardButton: Locator;
    readonly addDashboardButton: Locator;
    readonly viewAllButton: Locator;
    readonly applyButton: Locator;
    readonly editDashboardButton: Locator;
    readonly selectUserCheckbox: Locator;
    readonly deleteDashboardButton: Locator;
    readonly addNewViewAll: Locator;

    constructor(page: Page) {
        this.page = page;
        const baseUrl = process.env.BASE_URL || process.env.E2E_BASE_URL;
        const slug = process.env.E2E_SLUG;
        this.dashboardPageURL = `${baseUrl}/${slug}/app/custom-dashboard/default`;

        this.settingsButton = page.getByRole('button', { name: 'Settings', exact: true });
        this.addNewMenuItem = page.getByRole('menuitem', { name: 'Add New' });
        this.editMenuItem = page.getByRole('menuitem', { name: 'Edit' });
        this.deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
        this.nameInput = page.locator('input[name="name"]');
        this.assignedToDropdown = page.locator('.ant-select-selection-overflow');
        this.selectAllCheckbox = page.getByRole('checkbox', { name: 'Select All' });
        this.assignedToAllText = page.getByText('Assigned ToAll');
        this.saveButton = page.locator('#save');
        this.superAdminOption = page.getByText('Super Admin', { exact: true });
        this.UserOption = page.getByRole('tree').getByText('User');
        this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });
        this.dashboardButton = page.getByRole('button', { name: 'Dashboard' });
        this.addDashboardButton = page.getByRole('button', { name: 'Add Dashboard' });
        this.viewAllButton = page.getByRole('button', { name: '• View All' });
        this.applyButton = page.getByRole('button', { name: 'Apply' });
        this.editDashboardButton = page.getByRole('button', { name: 'Edit Dashboard' });
        this.selectUserCheckbox = page.getByRole('checkbox', { name: 'Select User' });
        this.deleteDashboardButton = page.getByLabel('Delete Dashboard');
        this.addNewViewAll = page.locator('#add_dashboard')
    }

    getDashboardName(uniqueDashboardName: string): Locator {
        return this.page.locator(`//span[normalize-space()='${uniqueDashboardName}']`);
    }

    getDashboardHeader(uniqueDashboardName: string): Locator {
        return this.page.locator(`//span[contains(text(),'${uniqueDashboardName}')]`);
    }

    getStarIcon(uniqueDashboardName: string): Locator {
        return this.page.getByRole('row', { name: `${uniqueDashboardName}` }).getByLabel('default', { exact: true })
    }

    getEditButton(uniqueDashboardName: string): Locator {
        return this.page.getByRole('row', { name: `${uniqueDashboardName}` }).getByLabel('edit', { exact: true })
    }

    getDeleteButton(uniqueDashboardName: string): Locator {
        return this.page.getByRole('row', { name: `${uniqueDashboardName}` }).getByLabel('delete', { exact: true })
    }

    async navigate() {
        await this.page.goto(this.dashboardPageURL);

    }

    async addDashboard(uniqueDashboardName: string) {
        await this.settingsButton.click();
        await this.addNewMenuItem.click();
        await this.nameInput.clear();
        await this.nameInput.fill(uniqueDashboardName);
        await this.assignedToDropdown.click();
        await this.selectAllCheckbox.click();
        await this.assignedToAllText.click();

        // Wait for React UI state to update properly before saving
        await this.page.waitForTimeout(500);
        await this.saveButton.click();

        return uniqueDashboardName;
    }

    async editDashboard(uniqueDashboardName: string) {
        await this.settingsButton.click();
        await this.editMenuItem.click();
        await this.nameInput.clear();
        await this.nameInput.fill(uniqueDashboardName);
        await this.assignedToDropdown.click();
        await this.superAdminOption.click();
        await this.UserOption.click();

        // Wait for React UI state to update properly before saving
        await this.page.waitForTimeout(500);
        await this.saveButton.click();

        return uniqueDashboardName;
    }

    async deleteDashboard() {
        await this.settingsButton.click();
        await this.deleteMenuItem.click();
        await this.deleteConfirmButton.click();
    }

    async addDashboardfromSidebar(uniqueDashboardName: string) {
        await this.dashboardButton.click();
        await this.addDashboardButton.click();
        await this.nameInput.clear();
        await this.nameInput.fill(uniqueDashboardName);
        await this.assignedToDropdown.click();
        await this.page.waitForTimeout(400);
        await this.selectAllCheckbox.click();
        await this.assignedToAllText.click();
        await this.page.waitForTimeout(500);
        await this.saveButton.click();

        return uniqueDashboardName;
    }

    async addDashboardfromViewAll(uniqueDashboardName: string) {
        await this.dashboardButton.click();
        await this.viewAllButton.click();
        await this.addNewViewAll.click();
        await this.nameInput.clear();
        await this.nameInput.fill(uniqueDashboardName);
        await this.assignedToDropdown.click();
        await this.selectAllCheckbox.click();
        await this.assignedToAllText.click();
        await this.page.waitForTimeout(500);
        await this.saveButton.click();

        return uniqueDashboardName;

    }

    async clickDashboardName(uniqueDashboardName: string) {
        await this.viewAllButton.click();
        await this.getDashboardName(uniqueDashboardName).dblclick();
        await expect(this.getDashboardHeader(uniqueDashboardName)).toBeVisible();
    }

    async setDefaultDashboard(uniqueDashboardName: string) {
        await this.viewAllButton.click();
        await this.getStarIcon(uniqueDashboardName).click();
        await this.applyButton.click();
    }

    async editDashboardfromViewAll(uniqueDashboardName: string) {
        await this.page.waitForTimeout(100);
        await this.getEditButton(uniqueDashboardName).click();
        await this.assignedToDropdown.click();
        await this.selectUserCheckbox.click();
        await this.saveButton.click()
    }

    async clickDeleteDefaultDashboard(uniqueDashboardName: string) {
        await this.viewAllButton.click();
        await expect(this.getDeleteButton(uniqueDashboardName)).toBeDisabled();
        await this.getDeleteButton(uniqueDashboardName).click({ force: true });
        await expect(this.deleteConfirmButton).toBeHidden();
    }

    async deleteDashboardfromViewAll(uniqueDashboardName1: string) {
        await this.viewAllButton.click();
        await this.getDeleteButton(uniqueDashboardName1).click();
        await this.deleteConfirmButton.click();
    }

    async assertToastMessage(messageRegExpOrString: string | RegExp) {
        const toast = this.page.getByText(messageRegExpOrString);
        await expect(toast).toBeVisible({ timeout: 15000 });
    }
}