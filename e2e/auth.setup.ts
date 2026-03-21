import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL || '';
  const isSSO = email.includes('shorelineiot.com');

  // 1. Go to your login page.
  await page.goto((process.env.BASE_URL || process.env.E2E_BASE_URL) + '/login/auth/login');

  // 2. Type your email
  const emailInput = page.locator('#login-email-form-email-input');
  await emailInput.fill(email);

  // 3. Click Next
  const nextButton = page.getByRole('button', { name: 'Next' });
  await nextButton.click();

  if (isSSO) {
    // SSO Flow: Requires manual intervention for Google/Amplify login
    console.log('Detected SSO domain (shorelineiot.com). Pausing for manual login...');

    // This will pause the test and let you manually complete the Google Login
    await page.pause();

    // Wait for the app to redirect you back after SSO
    await page.waitForURL('**/app/**', { timeout: 120000 });
  } else {
    // Non-SSO Flow: Fully automated login
    console.log('Detected Non-SSO domain. Proceeding with automated login...');

    const passwordInput = page.locator('#password');
    await passwordInput.fill(process.env.E2E_NON_SSO_USER_PASSWORD || '');

    const loginButton = page.getByRole('button', { name: 'Log In' });
    await loginButton.click();

    // Wait for the app to redirect you back after successful login
    await page.waitForURL('**/app/**', { timeout: 60000 });
  }

  // 5. Save the authenticated state
  await page.context().storageState({ path: authFile });
});
