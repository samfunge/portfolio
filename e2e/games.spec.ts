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
  await page.getByRole('button', { name: 'Snake' }).dblclick();

  // Snake window should appear
  await expect(page.locator('.mac-titlebar-title').filter({ hasText: 'Snake' })).toBeVisible();

  // Canvas should be there
  const canvas = page.locator('canvas[aria-label="Snake game canvas"]');
  await expect(canvas).toBeVisible();

  // Test HUD shows score
  await expect(page.getByText('SCORE: 0')).toBeVisible();
});

test('can launch minesweeper and reveal a cell', async ({ page }) => {
  // Open games folder
  await page.getByText('Games', { exact: true }).dblclick();
  
  // Double click Minesweeper icon
  await page.getByRole('button', { name: 'Minesweeper' }).dblclick();

  // Minesweeper window should appear
  const msWindow = page.locator('.mac-window').filter({ hasText: 'Minesweeper' });
  await expect(msWindow).toBeVisible();

  // The grid cells in Minesweeper are divs inside the window body
  const cells = msWindow.getByRole('gridcell');
  
  // Wait for the grid to be populated
  await expect(cells).toHaveCount(100, { timeout: 5000 });

  // Click first cell
  await cells.first().click();
});
