import { test, expect } from '@playwright/test';

test.describe('gblaster', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show working shell', async ({ page }) => {
    await expect(page.locator('.header .title')).toContainText('gBlaster');

    await page.locator('#sidenav_menu_button').click();
    await page.locator(':nth-child(4) > .mdc-list-item__content').click();

    await expect(page.locator('mat-card-title').filter({ hasText: 'Theme-Colors' })).toBeVisible();
    await expect(page.locator('mat-card-title').filter({ hasText: 'Local Storage Settings' })).toBeVisible();

    await page.locator('#sidenav_menu_button').click();
    await page.locator(':nth-child(1) > .mdc-list-item__content').click();
  });
});
