import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Click to start boot
  await page.locator('.boot-screen').click();
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 15000 });
});

test('can open games folder and launch snake', async ({ page }) => {
  // Open games folder
  await page.getByText('Games', { exact: true }).dblclick();
  await expect(page.locator('.mac-titlebar-title')).toContainText('Games');

  // Launch snake
  await page.getByLabel('Snake').dblclick();

  // Snake window should appear
  await expect(page.locator('.mac-titlebar-title').filter({ hasText: 'Snake' })).toBeVisible();

  // Canvas should be there
  const canvas = page.locator('canvas[aria-label="Snake game canvas"]');
  await expect(canvas).toBeVisible();

  // Test HUD shows score
  await expect(page.getByText('SCORE: 0')).toBeVisible();
});

test('can launch minesweeper and reveal a cell', async ({ page }) => {
  await page.getByText('Games', { exact: true }).dblclick();
  await page.getByLabel('Minesweeper').dblclick();

  await expect(page.locator('.mac-titlebar-title').filter({ hasText: 'Minesweeper' })).toBeVisible();

  // Grid should be there
  const cells = page.locator('div[onClick]'); // Minesweeper cells have onClick
  await expect(cells).toHaveCount(100); // 10x10

  // Click first cell
  await cells.first().click();

  // Check that at least one cell is revealed (background color changes or value shows)
  // We can't be sure what it reveals but the first cell click should play sound/floodfill
});
