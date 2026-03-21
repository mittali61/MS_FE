import { test, expect } from '@playwright/test';
import { executeStep } from '../../helpers/step-helper';
import { UsersPage } from '../../pages/UsersPage';

/**
 * Invited user email = dummyEmail and password = dummyName 
 */

const dummyEmail = `testuser_${Date.now()}@mailinator.com`;
const dummyName = `testuser_${Date.now()}`;


const mailinatorUser = dummyEmail.split('@')[0];
const mailinatorInboxURL = `https://www.mailinator.com/v4/public/inboxes.jsp?to=${mailinatorUser}`;

const baseUrl = process.env.BASE_URL || process.env.E2E_BASE_URL;

// Helper to verify login attempt
const verifyLoginAttempt = async (browser: any, testEmail: string, testName: string, expectedMessage: string) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const freshPage = await context.newPage();
    try {
        await freshPage.goto(`${baseUrl}/login/auth/login`);
        await freshPage.locator('#login-email-form-email-input').fill(testEmail);
        await freshPage.getByRole('button', { name: 'Next' }).click();
        await freshPage.locator('#password').fill(testName);
        await freshPage.getByRole('button', { name: 'Log In' }).click();

        await expect(freshPage.getByText(expectedMessage)).toBeVisible({ timeout: 15000 });
    } finally {
        await context.close();
    }
};

test.describe.serial('User Page', () => {

    test('invite user', {
        tag: ['@user-management', '@smoke', '@TC-2258'],
    }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2258' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, `Invite a new user ${dummyEmail} with generated credentials`, async () => {
            await userManagementPage.navigate();
            await userManagementPage.inviteUser(dummyName, dummyEmail);
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.assertUserInTableVisible(dummyName);
        });
    });

    test('Search Invited user', {
        tag: ['@user-management', '@smoke', '@TC-2260'],
    }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2260' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Search and verify the invited user in table', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.assertUserInTableVisible(dummyName);
        });
    });

    test('Resend Invite', { tag: ['@user-management', '@smoke', '@TC-2261'] }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2261' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Step 1: Resend Invite', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.resendInvite(dummyName);
            await userManagementPage.assertToastMessage('User Invite sent Successfully!');
        });
    });

    test('Mailinator Confirm Invitation', { tag: ['@user-management', '@TC-2262', '@smoke'] }, async ({ browser }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2262' });

        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();
        let newPage: any;

        try {
            await executeStep(testInfo, 'Step 1: Accept Invite using Non-SSO with different passwords', async () => {
                await page.goto(mailinatorInboxURL);
                const firstEmail = page.locator('table.table-striped tbody tr').first();
                await expect(firstEmail).toBeVisible({ timeout: 30000 });
                await firstEmail.click();

                const emailIframe = page.frameLocator('#html_msg_body');
                const confirmButton = emailIframe.getByRole('link', { name: /Accept|Confirm|Join|Invite/i }).first();
                await expect(confirmButton).toBeVisible();

                const [newPageOpen] = await Promise.all([
                    context.waitForEvent('page'),
                    confirmButton.click(),
                ]);
                newPage = newPageOpen;
                await newPage.waitForLoadState();

                await expect(newPage).toHaveURL(/.*\/auth\/invite-accepted/, { timeout: 10000 });
                console.log(`Invitation confirmed for ${dummyEmail}`);

                await newPage.locator('#password').fill(dummyName);
                await newPage.locator('#retypePassword').fill(dummyName + 'wrongpassword');
                await newPage.getByRole('checkbox').check();
                await newPage.getByRole('button', { name: 'Create New Password' }).click();
                await expect(newPage.getByText('Passwords must match')).toBeVisible({ timeout: 5000 });
            });

            await executeStep(testInfo, 'Step 2: Accept Invite using Non-SSO with valid details', async () => {
                await newPage.locator('#password').fill(dummyName);
                await newPage.locator('#retypePassword').fill(dummyName);
                await newPage.getByRole('button', { name: 'Create New Password' }).click();
                await expect(newPage).toHaveURL(/.*\/app\/custom-dashboard/, { timeout: 10000 });
            });

        } finally {
            await context.close();
        }

        await executeStep(testInfo, 'Step 3: Confirm status after accepting invite', async () => {
            const mainUserContext = await browser.newContext();
            const mainUserPage = await mainUserContext.newPage();
            const mainUserMgmtPage = new UsersPage(mainUserPage);
            try {
                await mainUserMgmtPage.navigate();
                await mainUserMgmtPage.searchUser(dummyEmail);
                await mainUserMgmtPage.assertUserInTableVisible(dummyName);
                await mainUserMgmtPage.checkStatusOnline(dummyName);
            } finally {
                await mainUserContext.close();
            }
        });
    });

    test('Block user', { tag: ['@user-management', '@smoke', '@TC-2268'] }, async ({ page, browser }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2268' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Step 1: Block user from table', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.assertUserInTableVisible(dummyName);
            await userManagementPage.blockUser(dummyName);
            await userManagementPage.assertToastMessage(/User Blocked Successfully!/i);
        });

        await executeStep(testInfo, 'Step 2: Verify blocked user cannot access org', async () => {
            await verifyLoginAttempt(browser, dummyEmail, dummyName, 'You are currently not a part of any organization.');
            console.log(`Verified blocked user ${dummyEmail} sees no-org banner`);
        });

        await executeStep(testInfo, 'Step 3: Unblock user', async () => {
            // Re-fetch correct row directly in unblock since page was manipulated
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.unblockUser(dummyName);
            await userManagementPage.assertToastMessage(/User Unblocked Successfully!/i);
        });

        await executeStep(testInfo, 'Step 4: Verify unblocked user can access dashboard', async () => {
            await verifyLoginAttempt(browser, dummyEmail, dummyName, dummyName);
        });
    });

    test('Group association', { tag: ['@user-management', '@smoke', '@TC-2271'] }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2271' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Step 1: All Group Association user', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.assignAllGroups(dummyName);
            await userManagementPage.assertToastMessage('User group changed successfully!');
        });

        await executeStep(testInfo, 'Step 2: Remove All Group Association user', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.removeAllGroups(dummyName);
            await userManagementPage.assertToastMessage('You have unassigned all selected groups');
        });
    });

    test('Notifications', { tag: ['@user-management', '@smoke', '@TC-2273'] }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2273' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Step 1: User Notifications', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.updateNotifications(dummyName);
            await userManagementPage.assertToastMessage('User alerts notifications updated successfully!');
            await userManagementPage.assertToastMessage('User billing notifications updated successfully!');
        });
    });

    test('Change User Role', { tag: ['@user-management', '@smoke', '@TC-2270'] }, async ({ page }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2270' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Step 1: Change User Role to User', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.changeRoleToUser();
            await userManagementPage.assertToastMessage('User role changed successfully!');
        });

        await executeStep(testInfo, 'Step 2: Change User Role to Site Manager', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.changeRoleToSiteManager();
            await userManagementPage.assertToastMessage('User role changed successfully!');
        });
    });

    test('Delete User', { tag: ['@user-management', '@smoke', '@TC-2279'] }, async ({ page, browser }, testInfo) => {
        testInfo.annotations.push({ type: 'TC', description: 'TC-2279' });
        const userManagementPage = new UsersPage(page);

        await executeStep(testInfo, 'Step 1: Delete user from table', async () => {
            await userManagementPage.navigate();
            await userManagementPage.searchUser(dummyEmail);
            await userManagementPage.deleteUser(dummyName);
            await userManagementPage.assertToastMessage('User Removed Successfully!');
        });

        await executeStep(testInfo, 'Step 2: Verify deleted user cannot access org', async () => {
            await verifyLoginAttempt(browser, dummyEmail, dummyName, 'You are currently not a part of any organization.');
            console.log(`Verified deleted user ${dummyEmail} sees no-org banner`);
        });
    });
});
