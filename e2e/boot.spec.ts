import { test as base, expect, type Locator } from '@playwright/test';

// Extend base test with a custom dblclick helper that matches our app's 400ms logic
export const test = base.extend<{
  macDblClick: (locator: Locator) => Promise<void>;
}>({
  macDblClick: async ({}, use) => {
    const helper = async (locator: Locator) => {
      await locator.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      await locator.click();
    };
    await use(helper);
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Enable test mode to disable CRT overlays/pseudo-elements
  await page.evaluate(() => document.documentElement.setAttribute('data-test-mode', 'true'));
});

test('boot sequence finishes and lands on desktop', async ({ page }) => {
  // Expect to see the boot screen initially (power phase)
  const bootScreen = page.locator('.boot-screen');
  await expect(bootScreen).toBeVisible();

  // Click to start the boot sequence
  await bootScreen.click();

  // The boot screen should eventually disappear
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 15000 });

  // Check for desktop icons via test IDs
  await expect(page.getByTestId('icon-about')).toBeVisible();
  await expect(page.getByTestId('icon-projects')).toBeVisible();
});

test('opening a window from the desktop', async ({ page, macDblClick }) => {
  // Initiate boot
  await page.locator('.boot-screen').click();
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 15000 });

  // Use custom helper to double click icon
  await macDblClick(page.getByTestId('icon-about'));

  // Expect window to appear
  await expect(page.getByTestId('window-about')).toBeVisible();
  await expect(page.getByTestId('window-about').locator('.mac-titlebar-title')).toContainText('About.txt');
});
