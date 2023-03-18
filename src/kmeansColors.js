import { getPixelsAsync, getSampledFlatPixelArray } from "./util/pixels.js";
import { getKmeansCentroids } from "./clustering/kmeans.js";
import hsvDistance from "./distance/hsvDistance.js";
import convert from "color-convert";

export async function getKmeansColors(imageUrlOrPath, numColors, skipRatio = 1, colorSpace = 'rgb') {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getSampledFlatPixelArray(pixels, skipRatio, colorSpace);

  if (colorSpace === 'hsv') {
    const clusters = getKmeansCentroids(dataArray, numColors, hsvDistance);
    return clusters.map((color) => convert.hsv.hex(color[0], color[1], color[2]));
  }

  const clusters = getKmeansCentroids(dataArray, numColors);
  return clusters.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}
