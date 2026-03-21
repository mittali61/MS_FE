import { Page, Locator, expect } from '@playwright/test';

export class UsersPage {
    readonly page: Page;
    readonly userPageURL: string;

    constructor(page: Page) {
        this.page = page;
        const baseUrl = process.env.BASE_URL || process.env.E2E_BASE_URL;
        const slug = process.env.E2E_SLUG;
        this.userPageURL = `${baseUrl}/${slug}/app/org-settings/user-management`;
    }

    async navigate() {
        await this.page.goto(this.userPageURL);
    }

    async inviteUser(dummyName: string, dummyEmail: string) {
        await this.page.getByText('Invite User').click();

        // Fill Name & Email
        await this.page.locator('input[name="name"]').fill(dummyName);
        await this.page.locator('input[name="email"]').fill(dummyEmail);

        // Select Role
        await this.page.locator('#user_role').click();
        await this.page.locator('.ant-select-tree-title').first().click();

        // Select Organization (parent node in tree)
        await this.page.locator('#select_org').click();
        await this.page.locator('.ant-select-tree-checkbox').first().click();

        // Submit
        await this.page.getByRole('button', { name: 'Invite' }).click();
    }

    async searchUser(dummyEmail: string) {
        await this.page.getByRole('textbox', { name: 'Search User' }).fill(dummyEmail);
    }

    async assertUserInTableVisible(dummyName: string) {
        await expect(this.page.getByRole('row', { name: dummyName })).toBeVisible({ timeout: 15000 });
    }

    async resendInvite(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByLabel('email', { exact: true }).click();
    }

    async checkStatusOnline(dummyName: string) {
        await expect(this.page.getByRole('cell', { name: 'Online' })).toBeVisible({ timeout: 15000 });
    }

    async blockUser(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByLabel('block', { exact: true }).click();
        await this.page.getByRole('button', { name: 'Apply' }).click();
    }

    async unblockUser(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByLabel('block', { exact: true }).click();
        await this.page.getByRole('button', { name: 'Apply' }).click();
    }

    async assignAllGroups(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByRole('cell', { name: 'Select Group' }).click();
        await this.page.getByRole('checkbox', { name: 'Select All' }).click();
        await this.page.getByRole('cell', { name: 'All' }).click();
        await this.page.getByRole('button', { name: 'Apply' }).click();
    }

    async removeAllGroups(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByRole('cell', { name: 'All' }).click();
        await this.page.getByRole('checkbox', { name: 'Select All' }).click();
        await this.page.getByRole('cell', { name: 'Select Group' }).click();
        await this.page.getByRole('button', { name: 'Apply' }).click();
    }

    async updateNotifications(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByRole('cell', { name: 'Email +' }).click();
        await this.page.getByRole('checkbox', { name: 'Select All' }).click();
        await this.page.locator('.MuiTableContainer-root').click();
    }

    async changeRoleToUser() {
        await this.page.locator('.MuiTableCell-root.MuiTableCell-body > div').first().click();
        await this.page.getByRole('menuitem', { name: 'User' }).click();
    }

    async changeRoleToSiteManager() {
        await this.page.locator('.MuiTableCell-root.MuiTableCell-body > div').first().click();
        await this.page.getByRole('menuitem', { name: 'Site Manager' }).click();
    }

    async deleteUser(dummyName: string) {
        const row = this.page.getByRole('row', { name: dummyName });
        await row.getByLabel('delete', { exact: true }).click();
        await this.page.getByRole('button', { name: 'Delete' }).click();
    }

    async assertToastMessage(messageRegExpOrString: string | RegExp) {
        await expect(this.page.getByText(messageRegExpOrString)).toBeVisible({ timeout: 15000 });
    }
}
