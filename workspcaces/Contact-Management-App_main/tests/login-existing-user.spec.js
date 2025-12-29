import { test, expect } from '@playwright/test';
import testData from '../testdata/login-existing-user.json';

const BASE_URL = `http://localhost:3000/`;

test.describe('Login as existing user', () => {

test('login-existing-user - happy', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-existing-user_happy_step1.png` });
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-existing-user_happy_step2.png` });
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-existing-user_happy_step3.png` });
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-existing-user_happy_step4.png` });
  // TODO: unsupported action waitFor
  await page.screenshot({ path: `proofs/login-existing-user_happy_step5.png` });
  // TODO: expect {"action":"expect","selector":"url","assert":"contains","value":"/dashboard"}
  await page.screenshot({ path: `proofs/login-existing-user_happy_step6.png` });
});

test('login-existing-user - error', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-existing-user_error_step1.png` });
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-existing-user_error_step2.png` });
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-existing-user_error_step3.png` });
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-existing-user_error_step4.png` });
  // TODO: unsupported action waitFor
  await page.screenshot({ path: `proofs/login-existing-user_error_step5.png` });
  await expect(page.locator(`.mat-snack-bar-container`)).toBeVisible();
  await page.screenshot({ path: `proofs/login-existing-user_error_step6.png` });
});

test('login-existing-user - alt', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-existing-user_alt_step1.png` });
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-existing-user_alt_step2.png` });
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-existing-user_alt_step3.png` });
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-existing-user_alt_step4.png` });
  await expect(page.locator(`mat-error`)).toBeVisible();
  await page.screenshot({ path: `proofs/login-existing-user_alt_step5.png` });
});

});
