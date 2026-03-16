// canvas.match.ts
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { Box, cropImage } from './canvas.detect';

export interface LabeledSlot {
  index: number;
  box: Box;
  label: string;
  score: number;
  img: PNG;
}

export function similarity(a: PNG, b: PNG): number {
  const diff = new PNG({ width: a.width, height: a.height });
  const mismatches = pixelmatch(
    a.data,
    b.data,
    diff.data,
    a.width,
    a.height,
    { threshold: 0.30 }
  );

  return mismatches / (a.width * a.height);
}

export function labelSlots(
  canvas: PNG,
  slots: Box[],
  templates: { label: string; img: PNG }[],
  debugDir?: string,
  side: 'left' | 'right' = 'left'
): LabeledSlot[] {
  const results: LabeledSlot[] = [];

  slots.forEach((slot, index) => {
    const cropped = cropImage(
      canvas,
      slot.x,
      slot.y,
      slot.width,
      slot.height
    );

    let bestLabel = '';
    let bestScore = Infinity;

    for (const t of templates) {
      if (
        t.img.width !== cropped.width ||
        t.img.height !== cropped.height
      ) continue;

      const s = similarity(cropped, t.img);
      if (s < bestScore) {
        bestScore = s;
        bestLabel = t.label;
      }
    }

    // 🐞 debug crop
    if (debugDir) {
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(
        path.join(debugDir, `${side}-${index}-${bestLabel}-${bestScore.toFixed(3)}.png`),
        PNG.sync.write(cropped)
      );
    }

    results.push({
      index,
      box: slot,
      label: bestLabel,
      score: bestScore,
      img: cropped,
    });
  });

  return results;
}

export function buildMapping(
  left: LabeledSlot[],
  right: LabeledSlot[]
) {
  return left.map(l => {
    const base = baseLabel(l.label);

    const target = right.find(
      r => baseLabel(r.label) === base
    );

    if (!target) {
      throw new Error(`No match for ${l.label}`);
    }

    return {
      from: l.box,
      to: target.box,
      label: base,
      fromLabel: l.label,
      toLabel: target.label,
    };
  });
}

function baseLabel(label: string): string {
  return label.replace(/_[AQ]$/, '');
}