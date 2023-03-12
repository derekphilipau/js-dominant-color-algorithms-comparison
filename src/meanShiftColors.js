import { getPixelsAsync, getRgbDataArray } from "./util/pixels.js";
import { meanShiftClustering } from "./clustering/meanShiftClustering.js";
import convert from "color-convert";

export async function getMeanShiftClustering(imageUrlOrPath, numColors) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getRgbDataArray(pixels);
  const clusteredPoints = meanShiftClustering(dataArray, numColors);
  return clusteredPoints.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}