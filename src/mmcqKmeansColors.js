import quantize from "quantize";
import { getPixelsAsync, getRgbDataArray } from "./util/pixels.js";
import { removeDuplicatePoints } from "./util/pixels.js";
import { getKmeansPoints } from "./clustering/kmeans.js";
import convert from "color-convert";

export async function getMmcqKmeansColors(imageUrlOrPath, numColors) {
  const maximumColorCount = 60;
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getRgbDataArray(pixels);
  const colorMap = quantize(dataArray, maximumColorCount); // maximumColorCount 2-256
  const uniquePalette = removeDuplicatePoints(colorMap.palette());
  const kmeansPoints = getKmeansPoints(uniquePalette, numColors);
  return kmeansPoints.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}
