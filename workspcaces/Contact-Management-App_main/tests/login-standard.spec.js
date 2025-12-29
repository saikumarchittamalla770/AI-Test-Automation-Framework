import { test, expect } from '@playwright/test';
import testData from '../testdata/login-standard.json';

const BASE_URL = `http://localhost:3000/`;

test.describe('User logs in with valid credentials', () => {

test('login-standard - happy', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  // Navigate to login page
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-standard_happy_step1.png` });
  // Fill in username or email
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-standard_happy_step2.png` });
  // Fill in password
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-standard_happy_step3.png` });
  // Submit login form
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-standard_happy_step4.png` });
  // Expect redirect to dashboard on success
  // TODO: unsupported action waitForNavigation
  await page.screenshot({ path: `proofs/login-standard_happy_step5.png` });
});

test('login-standard - error', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  // Navigate to login page
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-standard_error_step1.png` });
  // Fill invalid username or email
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-standard_error_step2.png` });
  // Fill invalid password
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-standard_error_step3.png` });
  // Submit login form
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-standard_error_step4.png` });
  // Error Snackbar appears
  await expect(page.locator(`.mat-mdc-snack-bar-container`)).toBeVisible();
  await page.screenshot({ path: `proofs/login-standard_error_step5.png` });
});

test('login-standard - alt', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  // Navigate to login page
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-standard_alt_step1.png` });
  // Only fill username or email
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-standard_alt_step2.png` });
  // Leave password empty
  await page.locator(`input[formControlName='password']`).fill(testData['__unknown'] || '');
  await page.screenshot({ path: `proofs/login-standard_alt_step3.png` });
  // Attempt submit
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-standard_alt_step4.png` });
  // Show required error message for password
  await expect(page.locator(`mat-error`)).toBeVisible();
  await page.screenshot({ path: `proofs/login-standard_alt_step5.png` });
});

});
