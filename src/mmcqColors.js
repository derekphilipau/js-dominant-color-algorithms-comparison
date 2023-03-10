/**
 * Use quantize npm package: https://www.npmjs.com/package/quantize
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.com/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 * http://www.leptonica.org/color-quantization.html
 */
import quantize from "quantize";
import {
  getPixelsAsync,
  getSampledPixelsAsync,
  getHslDataArray,
} from "./util/pixels.js";
import { rgbToHex } from "./util/color.js";

export async function modifiedMedianCutQuantization(imageUrlOrPath, numColors) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getHslDataArray(pixels);
  const palette = quantize(dataArray, numColors + 1).palette();
  return palette.map((color) => rgbToHex(color[0], color[1], color[2]));
}
