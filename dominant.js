import { kmeans } from "ml-kmeans";
import { getPixelsAsync } from "./util/pixels.js";
import { rgbToHsl, hslToHex } from "./util/color.js";

export async function getDominantColors(
  imageUrl,
  numClusters,
  useWeighted,
  dataArray = []
) {
  const pixels = await getPixelsAsync(imageUrl);

  if (dataArray.length === 0) {
    for (let i = 0; i < pixels.shape[0]; i++) {
      const row = [];
      for (let j = 0; j < pixels.shape[1]; j++) {
        const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
        const [h, s, l] = rgbToHsl({
          r: pixels.data[idx],
          g: pixels.data[idx + 1],
          b: pixels.data[idx + 2],
        });
        row.push(h, s, l);
      }
      dataArray.push(row);
    }
  }

  const clusters = kmeans(dataArray, numClusters, {
    init: "kmeans++",
    seed: 2,
  });

  const clusterSizes = clusters.clusters.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  const centroids = clusters.centroids
    .map((centroid, index) => ({ centroid, size: clusterSizes[index] }))
    .sort((a, b) => b.size - a.size)
    .map(({ centroid }) =>
      centroid.map((val, index) => (index === 0 ? val * 360 : val * 100))
    );

  const dominantColors = centroids.map((centroid) =>
    hslToHex(centroid[0], centroid[1], centroid[2])
  );

  if (!useWeighted) return dominantColors;

  const weightedColors = [];

  // for (const cluster of clusters.centroids) {
  for (const [i, cluster] of clusters.centroids.entries()) {
    weightedColors.push(
      weightedAverageColor(cluster, i, pixels, clusters.centroids)
    );
  }

  const weightedDominantColors = weightedColors
    .map((centroid) =>
      hslToHex(centroid[0] * 360, centroid[1] * 100, centroid[2] * 100)
    )
    .sort(
      (a, b) =>
        clusterSizes[weightedColors.indexOf(b)] -
        clusterSizes[weightedColors.indexOf(a)]
    );

  return weightedDominantColors;
}

function weightedAverageColor(cluster, clusterIndex, pixels, clusters) {
  let totalPixels = 0;
  let totalHue = 0;
  let totalSaturation = 0;
  let totalLightness = 0;

  for (let i = 0; i < pixels.shape[0]; i++) {
    for (let j = 0; j < pixels.shape[1]; j++) {
      const pixelIndex = (i * pixels.shape[1] + j) * pixels.shape[2];
      const r = pixels.data[pixelIndex] / 255;
      const g = pixels.data[pixelIndex + 1] / 255;
      const b = pixels.data[pixelIndex + 2] / 255;
      const [h, s, l] = rgbToHsl({ r: r * 255, g: g * 255, b: b * 255 });

      let minDist = Infinity;
      let closestCluster = -1;
      for (let k = 0; k < clusters.length; k++) {
        const [h2, s2, l2] = clusters[k];
        const dist = (h - h2) ** 2 + (s - s2) ** 2 + (l - l2) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closestCluster = k;
        }
      }

      if (closestCluster === clusterIndex) {
        totalPixels += 1;
        totalHue += h;
        totalSaturation += s;
        totalLightness += l;
      }
    }
  }

  const averageHue = totalHue / totalPixels;
  const averageSaturation = totalSaturation / totalPixels;
  const averageLightness = totalLightness / totalPixels;

  return [averageHue, averageSaturation, averageLightness];
}
