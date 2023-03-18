import { getPixelsAsync, getDownscaledLabABPixels } from "./util/pixels.js";
import { getKmeansNode } from "./clustering/kmeansNode.js";
import convert from "color-convert";

const LUMINANCE_CONSTANT = 75;
const MAX_DIMENSION = 300;

function getHexColor(color, colorSpace, isShifted) {
  return convert.lab.hex(LUMINANCE_CONSTANT, color[0], color[1]);
}

export async function getKmeansNodeLabABColors(
  imageUrlOrPath,
  numColors,
) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getDownscaledLabABPixels(pixels, MAX_DIMENSION);
  const clusters = await getKmeansNode(dataArray, numColors);
  const totalLength = clusters.reduce(
    (acc, cluster) => acc + cluster.cluster.length,
    0
  );

  return clusters.map((cluster) => {
    return {
      color: getHexColor(cluster.centroid),
      percent: cluster.cluster.length / totalLength,
    };
  });
}
