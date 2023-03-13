import sharp from 'sharp';
import convert from 'color-convert';

export async function getSharpDominantColor(imageUrlOrPath) {

  const { dominant } = await sharp(imageUrlOrPath).stats();
  const { r, g, b } = dominant;
  return [
    convert.rgb.hex(r, g, b)
  ]
}

