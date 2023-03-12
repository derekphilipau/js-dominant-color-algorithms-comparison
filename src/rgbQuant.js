/**
 * https://github.com/leeoniya/RgbQuant.js
 *
 * Color quantization is the process of reducing an image with thousands
 * or millions of colors to one with fewer (usually 256). The trick is to
 * balance speed, cpu and memory requirements while minimizing the
 * perceptual loss in output quality. More info can be found on wikipedia.
 * Various algorithms can be found on rosettacode.org.
 */
import fs from 'fs';
import { createCanvas, Image } from 'canvas';
import RgbQuant from 'rgbquant';
import { promisify } from 'util';
import convert from 'color-convert';

const readFileAsync = promisify(fs.readFile);

async function loadImage(imageUrlOrPath) {
  const data = await readFileAsync(imageUrlOrPath);
  const img = new Image();
  img.src = data;
  return img;
}

export async function rgbQuantColors(imageUrlOrPath, numColors) {
  const img = await loadImage(imageUrlOrPath);
  const can = createCanvas(img.width, img.height);
  const ctx = can.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  const q = new RgbQuant({colors: numColors});
  q.sample(can);
  const palette = q.palette(true);
  const out = q.reduce(can);
  return palette.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}