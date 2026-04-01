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
  // Click to start boot
  await page.locator('.boot-screen').click();
  await expect(page.locator('.mac-desktop')).toBeVisible({ timeout: 15000 });
});

test('can open games folder and launch snake', async ({ page, macDblClick }) => {
  // Open games folder
  await macDblClick(page.getByTestId('icon-games'));
  await expect(page.getByTestId('window-games')).toBeVisible();

  // Launch snake
  await macDblClick(page.getByTestId('icon-snake'));

  // Snake window should appear
  await expect(page.getByTestId('window-snake')).toBeVisible();

  // Canvas should be there
  const canvas = page.locator('canvas[aria-label="Snake game canvas"]');
  await expect(canvas).toBeVisible();

  // Test HUD shows score
  await expect(page.getByText('SCORE: 0')).toBeVisible();
});

test('can launch minesweeper and reveal a cell', async ({ page, macDblClick }) => {
  // Open games folder
  await macDblClick(page.getByTestId('icon-games'));
  
  // Double click Minesweeper icon
  await macDblClick(page.getByTestId('icon-minesweeper'));

  // Minesweeper window should appear
  const msWindow = page.getByTestId('window-minesweeper');
  await expect(msWindow).toBeVisible();

  // The grid cells in Minesweeper
  const cells = msWindow.getByRole('gridcell');
  
  // Wait for the grid to be populated
  await expect(cells).toHaveCount(100, { timeout: 10000 });

  // Click first cell
  await cells.first().click();
});
