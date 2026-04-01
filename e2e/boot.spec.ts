import { test as base, expect, type Locator } from '@playwright/test';

// Extend base test with a custom dblclick helper that matches our app's 400ms logic
export const test = base.extend<{
  macDblClick: (locator: Locator) => Promise<void>;
}>({
  macDblClick: async ({}, use) => {
    const helper = async (locator: Locator) => {
      // For DesktopIcon custom logic: two separate clicks
      await locator.click({ force: true });
      await new Promise(resolve => setTimeout(resolve, 150));
      await locator.click({ force: true });
      
      // Also fire a native dblclick just in case the element uses onDoubleClick (like in GamesWindow)
      await locator.dispatchEvent('dblclick');
    };
    await use(helper);
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Enable test mode to disable CRT overlays/pseudo-elements
  await page.evaluate(() => document.documentElement.setAttribute('data-test-mode', 'true'));
});

async function waitForBoot(page: any) {
  // Wait for the store to signal boot complete via data attribute
  await page.waitForSelector('html[data-boot-complete="true"]', { timeout: 20000 });
}

test('boot sequence finishes and lands on desktop', async ({ page }) => {
  // Expect to see the boot screen initially (power phase)
  const bootScreen = page.locator('.boot-screen');
  await expect(bootScreen).toBeVisible();

  // Click to start the boot sequence
  await bootScreen.click();

  // Wait for the boot signal
  await waitForBoot(page);

  // Check for desktop icons via test IDs
  await expect(page.getByTestId('icon-about')).toBeVisible();
  await expect(page.getByTestId('icon-projects')).toBeVisible();
});

test('opening a window from the desktop', async ({ page, macDblClick }) => {
  // Initiate boot
  await page.locator('.boot-screen').click();
  await waitForBoot(page);

  // Use custom helper to double click icon
  await macDblClick(page.getByTestId('icon-about'));

  // Expect window to appear
  await expect(page.getByTestId('window-about')).toBeVisible();
});
