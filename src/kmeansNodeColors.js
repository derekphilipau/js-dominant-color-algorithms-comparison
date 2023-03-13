import { getPixelsAsync, getFlatPixelArray } from "./util/pixels.js";
import { getKmeansNode } from "./clustering/kmeansNode.js";
import hsvDistance from "./distance/hsvDistance.js";
import convert from "color-convert";

export async function getKmeansNodeColors(imageUrlOrPath, numColors, skipRatio = 1, isHsv = false) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getFlatPixelArray(pixels, skipRatio, isHsv);

  if (isHsv) {
    const clusters = await getKmeansNode(dataArray, numColors, hsvDistance);
    return clusters.map(cluster => cluster.centroid)
      .map((color) => convert.hsv.hex(color[0], color[1], color[2]));
  }

  const clusters = await getKmeansNode(dataArray, numColors);
  return clusters.map(cluster => cluster.centroid)
    .map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}
