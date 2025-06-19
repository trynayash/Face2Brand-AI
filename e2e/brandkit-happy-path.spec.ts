// @ts-ignore
// eslint-disable-next-line
/// <reference types="@playwright/test" />
import { test, expect } from '@playwright/test';
import path from 'path';

test('BrandKit happy path: login, upload, generate, see result', async ({ page }) => {
  // Go to landing page
  await page.goto('/');

  // Wait for 'Get Started' button to be visible and click with force due to animation
  await page.waitForSelector('text=Get Started', { state: 'visible' });
  await page.click('text=Get Started', { force: true });
  await page.waitForURL('**/login');

  // Click "Sign In" on the Auth page
  await page.click('text=Sign In');

  // Fill Clerk login (replace with test credentials or mock as needed)
  await page.fill('input[type="email"]', process.env.E2E_EMAIL || 'testuser@example.com');
  await page.fill('input[type="password"]', process.env.E2E_PASSWORD || 'testpassword');
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL('**/dashboard');

  // Upload selfie
  const filePath = path.resolve(__dirname, '../public/selfie-icon.png');
  await page.setInputFiles('input[type="file"]', filePath);

  // Fill required fields
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="vision"]', 'Build a personal brand');
  await page.fill('input[name="expression"]', 'Creative, Bold');

  // Submit form
  await page.click('button:has-text("Generate Brand Kit")');

  // Wait for result (brand name/tagline visible)
  await expect(page.locator('text=Brand Name')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('text=Tagline')).toBeVisible();
}); 