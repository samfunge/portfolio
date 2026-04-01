import { test, expect } from '@playwright/test';

test('boot sequence finishes and lands on desktop', async ({ page }) => {
  await page.goto('/');

  // Expect to see the boot screen initially (power phase)
  const bootScreen = page.locator('.boot-screen');
  await expect(bootScreen).toBeVisible();

  // Click to start the boot sequence
  await bootScreen.click();

  // The boot screen should eventually disappear
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 15000 });

  // Check for some desktop icons
  await expect(page.getByText('About.txt')).toBeVisible();
  await expect(page.getByText('Projects')).toBeVisible();
});

test('opening a window from the desktop', async ({ page }) => {
  await page.goto('/');
  // Initiate boot
  await page.locator('.boot-screen').click();
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 15000 });

  // Double click About.txt icon
  // Note: desktop icons use double click to open windows in useDesktopStore logic via DesktopIcon
  await page.getByText('About.txt').dblclick();

  // Expect window to appear
  await expect(page.locator('.mac-window')).toBeVisible();
  await expect(page.locator('.mac-titlebar-title')).toContainText('About.txt');
});
