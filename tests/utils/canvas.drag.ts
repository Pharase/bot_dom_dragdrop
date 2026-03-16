// canvas.drag.ts
import { Page } from '@playwright/test';
import { Box } from './canvas.detect';

export async function dragAndDrop(
  page: Page,
  from: Box,
  to: Box
) {
  // 🔥 เอาตำแหน่ง canvas จริงใน viewport
  const canvasBox = await page.locator('canvas').boundingBox();
  if (!canvasBox) throw new Error('Canvas not found');

  const fx = canvasBox.x + from.x + from.width / 2;
  const fy = canvasBox.y + from.y + from.height / 2;

  const tx = (canvasBox.x + to.x + to.width / 2) - 200; // 👉 offset
  const ty = canvasBox.y + to.y + to.height / 2;

  console.log(`🖱️ Drag (${fx},${fy}) → (${tx},${ty})`);

  // 🐞 debug dots (ตรงกับ mouse 100%)
  await page.evaluate(({ fx, fy, tx, ty }) => {
    const mk = (x: number, y: number, c: string) => {
      const d = document.createElement('div');
      d.style.cssText = `
        position: fixed;
        left:${x - 6}px; top:${y - 6}px;
        width:12px;height:12px;
        background:${c};
        border-radius:50%;
        z-index:9999;
        pointer-events:none;
      `;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 10000);
    };
    mk(fx, fy, 'red');
    mk(tx, ty, 'lime');
  }, { fx, fy, tx, ty });

  // 🧠 human-like drag
  await page.mouse.move(fx, fy);
  await page.waitForTimeout(0);

  await page.mouse.down();
  await page.waitForTimeout(0);

  await page.mouse.move(tx, ty, { steps: 1 });

  await page.waitForTimeout(0);
  await page.mouse.up();
}