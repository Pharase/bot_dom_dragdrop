import { Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export async function waitForCanvasStable(
  page: Page,
  {
    diffThreshold = 0.02,
    timeoutMs = 5000,
    pollMs = 200,
    debug = false //Set to true to enable debug image saving
  } = {}
) {
  const canvas = page.locator('canvas');
  await canvas.waitFor({ timeout: timeoutMs });

  const debugDir = path.resolve(__dirname, '../../debug');
  if (debug && !fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  const templatePath = path.resolve(__dirname, '../assets/start.png');
  const templateBuffer = fs.readFileSync(templatePath);
  const template = PNG.sync.read(templateBuffer);

  // 🔥 save template once
  if (debug) {
    fs.writeFileSync(
      path.join(debugDir, `template.png`),
      templateBuffer
    );
  }

  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;

    const buffer = await canvas.screenshot();
    const current = PNG.sync.read(buffer);

    // 📸 save current frame
    if (debug) {
      fs.writeFileSync(
        path.join(debugDir, `current-${attempt}.png`),
        buffer
      );
    }

    // ⚠️ SIZE MISMATCH
    if (
      current.width !== template.width ||
      current.height !== template.height
    ) {
      if (debug) {
        fs.writeFileSync(
          path.join(debugDir, `size-mismatch-${attempt}.png`),
          buffer
        );
      }
      await page.waitForTimeout(pollMs);
      continue;
    }

    // 🧪 diff image
    const diff = new PNG({
      width: current.width,
      height: current.height,
    });

    const diffPixels = pixelmatch(
      current.data,
      template.data,
      diff.data,
      current.width,
      current.height,
      { threshold: 0.15 }
    );

    const diffRatio =
      diffPixels / (current.width * current.height);

    // 🧠 save diff
    if (debug) {
      fs.writeFileSync(
        path.join(debugDir, `diff-${attempt}-${diffRatio.toFixed(4)}.png`),
        PNG.sync.write(diff)
      );
    }

    if (diffRatio <= diffThreshold) {
      console.log(
        `✅ Canvas stable at attempt ${attempt}, diff=${diffRatio.toFixed(4)}`
      );
      return;
    }

    await page.waitForTimeout(pollMs);
  }

  throw new Error('Start canvas image not detected within timeout');
}
