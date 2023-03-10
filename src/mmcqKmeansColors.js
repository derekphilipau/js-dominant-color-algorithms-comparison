import quantize from "quantize";
import { getKmeansColors, getKmeansWeightedColors } from "./kmeansColors.js";
import { getPixelsAsync, getSampledPixelsAsync } from "./util/pixels.js";
import { rgbToHsl, hslToHex } from "./util/color.js";

export async function getMmcqKmeansColors(imageUrlOrPath, numColors) {
  return process(imageUrlOrPath, numColors, false);
}

export async function getMmcqKmeansWeightedColors(imageUrlOrPath, numColors) {
  return process(imageUrlOrPath, numColors, true);
}

export async function process(imageUrlOrPath, numColors, useWeighted = false) {
  const maximumColorCount = 255;
  const pixels = await getPixelsAsync(imageUrlOrPath);

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

  if (useWeighted)
    return getKmeansWeightedColors(imageUrlOrPath, numColors, reducedArray);
  return getKmeansColors(imageUrlOrPath, numColors, reducedArray);
}
