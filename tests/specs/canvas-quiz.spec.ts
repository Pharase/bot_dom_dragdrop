import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

import { waitForCanvasStable } from '../utils/wait';
import { clickAt } from '../utils/click';
import { captureCanvas } from '../utils/canvas.capture';
import { detectSlots } from '../utils/canvas.detect';
import { buildMapping, labelSlots} from '../utils/canvas.match';
import { dragAndDrop } from '../utils/canvas.drag';
import { loadTemplates } from '../utils/canvas.templates';

const debugDir = 'debug/slots'; // 🐞 set debug slot crops from debugDir
const debugDirUse = 'debug/user';

const users = fs
  .readFileSync(path.resolve(__dirname, '../data/usernames.txt'), 'utf-8')
  .split('\n')
  .map(u => u.trim())
  .filter(Boolean);

for (const username of users) {
  test(`Solve Wordwall Canvas as "${username}"`, async ({ page }) => {
    await page.goto('https://wordwall.net/play/107003/445/121');

    await page.getByRole('textbox', { name: 'Name...' }).fill(username);
    await page.getByRole('button', { name: 'Start' }).click();

    await page.waitForSelector('canvas');

    // ▶️ start game
    await clickAt(page, 640, 680);
    await page.waitForTimeout(500);

    await waitForCanvasStable(page);
    await clickAt(page, 640, 680);
    await page.waitForTimeout(1000);

    // 1) capture canvas
    fs.mkdirSync(debugDir, { recursive: true });

    const canvasPath = await captureCanvas(page);
    const canvasPNG = PNG.sync.read(fs.readFileSync(canvasPath));

    // 2) detect left/right boxes + crop images
    const { sources, targets } = detectSlots(canvasPath);

    const templates = loadTemplates(
      path.resolve(__dirname, '../assets/templates')
    );

    const leftLabeled = labelSlots(
      canvasPNG,
      sources,
      templates,
      debugDir,
      'left'
    );

    const rightLabeled = labelSlots(
      canvasPNG,
      targets,
      templates,
      debugDir,
      'right'
    );

    console.table(leftLabeled.map(l => ({
      index: l.index,
      label: l.label,
      score: l.score.toFixed(3)
    })));

    console.table(rightLabeled.map(r => ({
      index: r.index,
      label: r.label,
      score: r.score.toFixed(3)
    })));

    const mapping = buildMapping(leftLabeled, rightLabeled);

    console.table(mapping.map(m => ({
      from: m.fromLabel,
      to: m.toLabel,
      base: m.label
    })));

    for (const m of mapping.reverse()) {
      await dragAndDrop(page, m.from, m.to);
      await page.waitForTimeout(rand(100, 1500));
    }

    // submit
    await clickAt(page, 640, 680);

    await page.waitForTimeout(10000);

    await page.screenshot({ path: path.join(debugDirUse, `final-${username}.png`) });

    await page.waitForTimeout(5000);

  });
}

function rand(msMin: number, msMax: number) {
  return Math.floor(Math.random() * (msMax - msMin + 1)) + msMin;
}

// --- Guides ---
// Debug: save cropped slots
// Debug: save canvas after each drag
// Debug: log similarity scores
// Debug: log mapping from-to
// Optimize: similarity threshold
// Optimize: drag speed / steps
// Optimize: wait times
// Refactor: separate functions for clarity
// Refactor: use constants for repeated values
// Tests: add more usernames
// Tests: vary canvas states (different quizzes)