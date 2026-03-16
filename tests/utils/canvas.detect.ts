// canvas.detect.ts
import { PNG } from 'pngjs';
import fs from 'fs';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
  img?: PNG;
}

export function cropImage(
  image: PNG,
  x: number,
  y: number,
  w: number,
  h: number
): PNG {
  const cropped = new PNG({ width: w, height: h });
  PNG.bitblt(image, cropped, x, y, w, h, 0, 0);
  return cropped;
}

export function detectSlots(imagePath: string): {
  sources: Box[];
  targets: Box[];
} {
  const png = PNG.sync.read(fs.readFileSync(imagePath));

  const sources: Box[] = [];
  const targets: Box[] = [];

  // LEFT 6
  for (let i = 0; i < 6; i++) {
    
    const box = {
        x: 100,
        y: 83 + (i * 202),
        width: 88,
        height: 145,
        order: i,
      };

    if (i >= 3) {
      box.x = 230; // adjust for 2nd column
      box.y = 83 + ((i-3) * 202);
    }

    const img = cropImage(png, box.x, box.y, box.width, box.height);
    const buffer = PNG.sync.write(img);
    fs.writeFileSync(`tmp/left_${i}.png`, buffer);

    sources.push({ ...box, img });
  }

  // RIGHT 6
  for (let i = 0; i < 6; i++) {
    const box = {
      x: 590,
      y: 60 + (i * 200),
      width: 120,
      height: 190,
      order: i,
    };

    if (i >= 3) {
      box.x = 1010; // adjust for 2nd column
      box.y = 60 + ((i-3) * 200);
    }

    const img = cropImage(png, box.x, box.y, box.width, box.height);
    const buffer = PNG.sync.write(img);
    fs.writeFileSync(`tmp/right_${i}.png`, buffer);

    targets.push({ ...box, img });
  }

  console.log('🧠 Slots detected');
  return { sources, targets };
}