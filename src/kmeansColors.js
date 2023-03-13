import { getPixelsAsync, getPixelArray, downsample, getFlatPixelArray } from "./util/pixels.js";
import { getKmeansCentroids } from "./clustering/kmeans.js";
import hsvDistance from "./distance/hsvDistance.js";
import convert from "color-convert";

export async function getKmeansColors(imageUrlOrPath, numColors, skipRatio = 1, isHsv = false) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getFlatPixelArray(pixels, skipRatio, isHsv);
  /*
  // Downsample didn't work as well as just skipping over pixels, maybe there's a problem with the downsample function.
  const dataArray = skipRatio > 1 ? downsample(getPixelArray(pixels, 1, isHsv), skipRatio)
    : getFlatPixelArray(pixels, skipRatio, isHsv);
  */
  if (isHsv) {
    const clusters = getKmeansCentroids(dataArray, numColors, hsvDistance);
    return clusters.map((color) => convert.hsv.hex(color[0], color[1], color[2]));
  }

  const clusters = getKmeansCentroids(dataArray, numColors);
  return clusters.map((color) => convert.rgb.hex(color[0], color[1], color[2]));
}
