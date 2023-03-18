import { getPixelsAsync, getSampledFlatPixelArray, getDownscaledFlatPixelArray, unshiftColor } from "./util/pixels.js";
import { getKmeansNode } from "./clustering/kmeansNode.js";
import hsvDistance from "./distance/hsvDistance.js";
import convert from "color-convert";

const MAX_DIMENSION = 300;

function getHexColor(color, colorSpace, isShifted) {
  if (colorSpace === "hsv") {
    return convert.hsv.hex(...unshiftColor(color, colorSpace, isShifted));
  } else if (colorSpace === "lab") {
    return convert.lab.hex(...unshiftColor(color, colorSpace, isShifted));
  }
  return convert.rgb.hex(...color);
}

export async function getKmeansNodeColors(
  imageUrlOrPath,
  numColors,
  skipRatio = 1,
  colorSpace = 'rgb',
  isDownscaled = false,
  isShifted = false,
) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = isDownscaled ?
    getDownscaledFlatPixelArray(pixels, MAX_DIMENSION, colorSpace, isShifted)
    :
    getSampledFlatPixelArray(pixels, skipRatio, colorSpace);
  const clusters = colorSpace === 'hsv'
    ? await getKmeansNode(dataArray, numColors, hsvDistance)
    : await getKmeansNode(dataArray, numColors);
  const totalLength = clusters.reduce(
    (acc, cluster) => acc + cluster.cluster.length,
    0
  );

  return clusters.map((cluster) => {
    return {
      color: getHexColor(cluster.centroid, colorSpace, isShifted),
      percent: cluster.cluster.length / totalLength,
    };
  });
}
