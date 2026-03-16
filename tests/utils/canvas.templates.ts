import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

export interface TemplateImage {
  label: string;
  img: PNG;
}

export function loadTemplates(dir: string): TemplateImage[] {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .map(file => ({
      label: path.basename(file, '.png'),
      img: PNG.sync.read(
        fs.readFileSync(path.join(dir, file))
      )
    }));
}
