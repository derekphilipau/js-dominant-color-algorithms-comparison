import quantize from "quantize";
import { getPixelsAsync, getRgbDataArray } from "./util/pixels.js";
import { hierarchicalClustering } from "./clustering/hierarchicalClustering.js";
import { hierarchicalClusteringPreserve } from "./clustering/hierarchicalClusteringPreserve.js";
import { removeDuplicatePoints } from "./util/pixels.js";
import convert from "color-convert";

export async function getMmcqHierarchicalClustering(imageUrlOrPath, numColors) {
  const maximumColorCount = 50;
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getRgbDataArray(pixels);
  const colorMap = quantize(dataArray, maximumColorCount); // maximumColorCount 2-256
  const uniquePalette = removeDuplicatePoints(colorMap.palette());
  // const clusteredPoints = hierarchicalClustering(uniquePalette, numColors);
  const clusteredPointsPreserve = hierarchicalClusteringPreserve(uniquePalette, numColors);
  return clusteredPointsPreserve.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}