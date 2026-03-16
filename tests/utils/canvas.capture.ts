// utils/canvas.capture.ts
import { Page } from '@playwright/test';
import fs from 'fs';

export async function captureCanvas(page: Page): Promise<string> {
  const canvas = page.locator('canvas');
  const buffer = await canvas.screenshot();

  if (!fs.existsSync('tmp')) fs.mkdirSync('tmp');

  const path = 'tmp/canvas.png';
  fs.writeFileSync(path, buffer);

  console.log('📸 Canvas captured:', path);
  return path;
}
