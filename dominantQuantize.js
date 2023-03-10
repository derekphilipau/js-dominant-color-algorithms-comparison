import quantize from "quantize";
import { getPixelsAsync, rgbToHsl, rgbToHex } from "./util.js";
import { getDominantColors } from "./dominant.js";

export async function getDominantReducedColors(
  imageUrl,
  numColors,
  useWeighted = false
) {
  const maximumColorCount = 255;
  const pixels = await getPixelsAsync(imageUrl);

  const dataArray = [];
  for (let i = 0; i < pixels.shape[0]; i++) {
    const row = [];
    for (let j = 0; j < pixels.shape[1]; j++) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      row.push(pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2]);
    }
    dataArray.push(row);
  }
  const colorMap = quantize(dataArray, maximumColorCount);

  const reducedArray = [];
  for (let i = 0; i < pixels.shape[0]; i++) {
    const row = [];
    for (let j = 0; j < pixels.shape[1]; j++) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      const mappedColor = colorMap.map([
        pixels.data[idx],
        pixels.data[idx + 1],
        pixels.data[idx + 2],
      ]);
      const [h, s, l] = rgbToHsl({
        r: mappedColor[0],
        g: mappedColor[1],
        b: mappedColor[2],
      });
      row.push(h, s, l);
    }
    reducedArray.push(row);
  }

  return getDominantColors(imageUrl, numColors, useWeighted, reducedArray);
}
