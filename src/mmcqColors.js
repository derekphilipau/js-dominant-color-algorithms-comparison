/**
 * Use quantize npm package: https://www.npmjs.com/package/quantize
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.com/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 * http://www.leptonica.org/color-quantization.html
 */
import quantize from "quantize";
import { getPixelsAsync, getRgbDataArray } from "./util/pixels.js";
import convert from "color-convert";

export async function modifiedMedianCutQuantization(imageUrlOrPath, numColors) {
  const totalNumColors = numColors > 4 ? numColors + 1 : numColors;
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getRgbDataArray(pixels);
  const palette = quantize(dataArray, totalNumColors).palette();
  return palette.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}
