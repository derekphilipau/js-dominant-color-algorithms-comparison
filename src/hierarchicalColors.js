import { getPixelsAsync, getRgbDataArray } from "./util/pixels.js";
import { hierarchicalClusteringPreserve } from "./clustering/hierarchicalClusteringPreserve.js";
import convert from "color-convert";

export async function getHierarchicalClustering(imageUrlOrPath, numColors) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getRgbDataArray(pixels);
  // const clusteredPoints = hierarchicalClustering(dataArray, numColors);
  const clusteredPointsPreserve = hierarchicalClusteringPreserve(dataArray, numColors);
  return clusteredPointsPreserve.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}