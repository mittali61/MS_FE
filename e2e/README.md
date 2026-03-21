# Playwright End-to-End Testing Guide

Welcome to the SLCloud E2E testing framework. This setup is designed to help the QA team write, run, and report on automated tests efficiently.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **Yarn** installed on your machine.

### 2. Setup
Clone the repository and install dependencies from the root directory:
```bash
git clone git@bitbucket.org:shorelineiot/slcloud-frontend-v2.git
cd slcloud-frontend-v2
yarn install
```

### 3. Initialize Playwright
Install the required browser binaries:
```bash
npx playwright install chromium
```

### 4. Update .env
You can reference the .env.example file to create a .env file and update the values.

---

## 📂 Folder Structure

All testing assets are located inside the `workspaces/webapp/e2e` directory:

- `specs/`: Contains all `.spec.ts` test files (e.g., `user-management.spec.ts`).
- `reporters/`: Custom reporting logic (HTML/Excel generation).
- `reports/`: **(Ignored by Git)** Professional PDF test execution reports.
- `.auth/`: **(Ignored by Git)** Stores local session/login state (`user.json`).
- `config.json`: Environment-specific configurations like `baseUrl` and `slug`.

---

## 🛠 Essential Commands

We use Playwright for End-to-End testing. These commands should be executed from the **root directory** of the project.

| Command | Description |
|---------|-------------|
| `yarn test:e2e` | Run all E2E tests in headless mode. |
| `yarn test:e2e:login` | Run the authentication setup (SSO or Non-SSO). |
| `yarn test:e2e:headed` | Run tests in headed mode (visible browser). |
| `yarn test:e2e:ui` | Open Playwright Test UI for interactive debugging. |
| `yarn test:e2e:smoke` | Run only tests tagged with `@smoke`. |
| `yarn test:e2e:tc @TC-ID` | Execute a specific test case by its tag ID (e.g. `@TC-2258`). |
| `yarn test:codegen` | Generate new test code by recording browser actions. |

**Note:** Before running tests for the first time or when your session expires, run `yarn test:e2e:login` to authenticate.


## ✍️ Script Writing Style

To keep our tests robust and maintainable, please follow these guidelines:

1.  **Use Test IDs**: Always prefer `page.getByTestId('...')` over CSS selectors or XPaths.
2.  **Unique Data**: Always use unique suffixes (like `Date.now()`) for emails/names to avoid "duplicate record" errors.
3.  **Serial Execution**: Use `test.describe.serial` if your tests depend on each other (e.g., Create -> Edit -> Delete).

4.  **Tagging & Mapping**: Use the following pattern for every test case:
    *   **Tags**: Add `@feature-name`, `@smoke` (if applicable), and `@TC-ID`.
    *   **Mapping**: Add the TC ID to the report for automatic Jira linking.
    ```typescript
    test('invite user', { 
        tag: ['@user-management', '@smoke', '@TC-2258'] 
    }, async ({ page }, testInfo) => {
        // This makes the ID clickable in the report
        testInfo.annotations.push({ type: 'TC', description: 'TC-2258' });
        
        // ... rest of the test
    });
    ```
5.  **Resilient Logic**: Use fallback logic (like checking `isVisible()`) to handle potential flakes or missing data gracefully.
6.  **Annotations**: Use `testInfo.annotations.push()` for tips or manual check warnings in the final report.

---

## 🎓 Learning Path for QA Team

We have provided two versions of our tests to help you learn:

1.  **Standard Version (`user-management.spec.ts`)**: 
    - **Recommended for Beginners.**
    - All locators (buttons, inputs) are written directly inside each test case.
    - Easy to read and understand if you are new to Playwright.

2.  **Optimized Version (`user-management.optimized.spec.ts`)**:
    - **Recommended for Advanced Users.**
    - Uses the **Page Object Model (POM)**.
    - All locators and common actions are stored in `e2e/helpers/UserManagementPage.ts`.
    - This version is cleaner and much easier to maintain when the UI changes.

---


## ⚠️ Important PR Guidelines

- **Scope**: Keep your changes **str    ictly** inside the `e2e/` folder. 
- **Core Files**: Do **NOT** modify files in `src/` or other app directories unless explicitly requested. Changing application code in a QA PR may lead to rejection.
- **Reporting**: Always verify your changes by running the test locally and checking the generated HTML report in `e2e/reports/`.

---

Happy Testing! 🎭
