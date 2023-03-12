import { getPixelsAsync, getFlatPixelArray } from "./util/pixels.js";
import { getKmeansPoints } from "./clustering/kmeans.js";
import convert from "color-convert";

export async function getKmeansSimpleColors(imageUrlOrPath, numColors, skipRatio = 1, isHsv = false) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getFlatPixelArray(pixels, skipRatio, isHsv);
  const kmeansPoints = getKmeansPoints(dataArray, numColors);
  return kmeansPoints.map(
    (color) => isHsv
      ? convert.hsv.hex(color[0], color[1], color[2])
      : convert.rgb.hex(color[0], color[1], color[2])
  );
}
