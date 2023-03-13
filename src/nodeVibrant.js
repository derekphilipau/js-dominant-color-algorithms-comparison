import Vibrant from 'node-vibrant';
import convert from 'color-convert';

export async function getVibrantDominantColors(imageUrlOrPath) {
  const palette = await Vibrant.from(imageUrlOrPath).getPalette();
  const colors = [];
  for (const swatch in palette) {
    const rgb = convert.rgb.hex(palette[swatch]._rgb);
    colors.push(rgb);
  }
  return colors;
}

