
import { test, expect } from '@playwright/test';

test('translator form works correctly', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.fill('#wordInput', 'Haus');
  await page.selectOption('#modelSelect', 'llama3.1');
  await page.click('button');

  await expect(page.locator('#loading')).toBeVisible();
  await expect(page.locator('#result')).toContainText('Translation:');
  await expect(page.locator('#result')).toContainText('Example Sentence:');
});