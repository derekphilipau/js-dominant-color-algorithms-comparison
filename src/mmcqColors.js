/**
 * Use quantize npm package: https://www.npmjs.com/package/quantize
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.com/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 * http://www.leptonica.org/color-quantization.html
 */
import quantize from "quantize";
import { getPixelsAsync, getSampledPixelsAsync } from "./util/pixels.js";
import { rgbToHex } from "./util/color.js";

export async function modifiedMedianCutQuantization(imageUrlOrPath, numColors) {
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
  const palette = quantize(dataArray, numColors + 1).palette();
  return palette.map((color) => rgbToHex(color[0], color[1], color[2]));
}
