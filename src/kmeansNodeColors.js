import { getPixelsAsync, getFlatPixelArray } from "./util/pixels.js";
import { getKmeansNode } from "./clustering/kmeansNode.js";
import hsvDistance from "./distance/hsvDistance.js";
import convert from "color-convert";

export async function getKmeansNodeColors(
  imageUrlOrPath,
  numColors,
  skipRatio = 1,
  isHsv = false
) {
  const pixels = await getPixelsAsync(imageUrlOrPath);
  const dataArray = getFlatPixelArray(pixels, skipRatio, isHsv);

  const clusters = isHsv
    ? await getKmeansNode(dataArray, numColors, hsvDistance)
    : await getKmeansNode(dataArray, numColors);
  const totalLength = clusters.reduce(
    (acc, cluster) => acc + cluster.cluster.length,
    0
  );

  return clusters.map((cluster) => {
    return {
      color: isHsv
        ? convert.hsv.hex(
            cluster.centroid[0],
            cluster.centroid[1],
            cluster.centroid[2]
          )
        : convert.rgb.hex(
            cluster.centroid[0],
            cluster.centroid[1],
            cluster.centroid[2]
          ),
      percent: cluster.cluster.length / totalLength,
    };
  });
}
