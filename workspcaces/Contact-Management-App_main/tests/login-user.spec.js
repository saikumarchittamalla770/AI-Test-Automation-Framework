import { test, expect } from '@playwright/test';
import testData from '../testdata/login-user.json';

const BASE_URL = `http://localhost:3000/`;

test.describe('User Login', () => {

test('login-user - happy', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-user_happy_step1.png` });
  // Fill in username or email field.
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-user_happy_step2.png` });
  // Fill in password field.
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-user_happy_step3.png` });
  // Submit login form
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-user_happy_step4.png` });
  // Redirects to dashboard after successful login
  // TODO: unsupported action waitForNavigation
  await page.screenshot({ path: `proofs/login-user_happy_step5.png` });
});

test('login-user - error', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-user_error_step1.png` });
  // Fill with invalid username or email.
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['usernameOrEmail'] || '');
  await page.screenshot({ path: `proofs/login-user_error_step2.png` });
  // Fill with invalid password.
  await page.locator(`input[formControlName='password']`).fill(testData['password'] || '');
  await page.screenshot({ path: `proofs/login-user_error_step3.png` });
  // Submit Login form with invalid data
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-user_error_step4.png` });
  // Should show error for invalid credentials
  // TODO: expect {"action":"expect","selector":"mat-error, .mat-mdc-snack-bar-container","value":"Invalid username or password","assert":"contains","waitFor":{"type":"selector","match":"mat-error, .mat-mdc-snack-bar-container"},"notes":"Should show error for invalid credentials","validationRules":{}}
  await page.screenshot({ path: `proofs/login-user_error_step5.png` });
});

test('login-user - alt', async ({ page }) => {
  // start
  await page.goto(BASE_URL);
  await page.goto(`${BASE_URL}login`);
  await page.screenshot({ path: `proofs/login-user_alt_step1.png` });
  // Leave email/username empty.
  await page.locator(`input[formControlName='usernameOrEmail']`).fill(testData['__unknown'] || '');
  await page.screenshot({ path: `proofs/login-user_alt_step2.png` });
  // Leave password empty.
  await page.locator(`input[formControlName='password']`).fill(testData['__unknown'] || '');
  await page.screenshot({ path: `proofs/login-user_alt_step3.png` });
  // Form validation errors shown.
  await page.locator(`button[type='submit']`).click();
  await page.screenshot({ path: `proofs/login-user_alt_step4.png` });
  // Expect 'required' error message.
  // TODO: expect {"action":"expect","selector":"mat-error","value":"required","assert":"contains","waitFor":{"type":"selector","match":"mat-error"},"notes":"Expect 'required' error message.","validationRules":{}}
  await page.screenshot({ path: `proofs/login-user_alt_step5.png` });
});

});
