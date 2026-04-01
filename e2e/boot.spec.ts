import { test, expect } from '@playwright/test';

test('boot sequence finishes and lands on desktop', async ({ page }) => {
  await page.goto('/');

  // Expect to see the boot screen initially
  await expect(page.locator('.boot-screen')).toBeVisible();

  // The boot screen should eventually disappear (it waits for 'startup.mp3' then finishes)
  // Since we're in dev mode it might be fast, but we'll wait for the desktop to appear
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 10000 });

  // Check for some desktop icons
  await expect(page.getByText('About.txt')).toBeVisible();
  await expect(page.getByText('Projects')).toBeVisible();
});

test('opening a window from the desktop', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 10000 });

  // Double click About.txt icon
  // Note: desktop icons use double click to open windows in useDesktopStore logic via DesktopIcon
  await page.getByText('About.txt').dblclick();

  // Expect window to appear
  await expect(page.locator('.mac-window')).toBeVisible();
  await expect(page.locator('.mac-titlebar-title')).toContainText('About.txt');
});
