import { Page } from '@playwright/test';

export async function clickAt(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.mouse.click(x, y);
}
