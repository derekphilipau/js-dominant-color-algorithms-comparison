import getPixels from "get-pixels";
import { kmeans } from "ml-kmeans";

function rgbToHex(rgb) {
  const hex = ((rgb[0] << 16) + (rgb[1] << 8) + rgb[2])
    .toString(16)
    .padStart(6, "0");
  return "#" + hex;
}

export async function getDominantColors(imageUrl, numClusters) {
  const pixels = await new Promise((resolve, reject) => {
    getPixels(imageUrl, (err, pixels) => {
      if (err) {
        reject(err);
      } else {
        resolve(pixels);
      }
    });
  });

  const dataArray = [];
  for (let i = 0; i < pixels.shape[0]; i++) {
    const row = [];
    for (let j = 0; j < pixels.shape[1]; j++) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      row.push(
        pixels.data[idx] / 255,
        pixels.data[idx + 1] / 255,
        pixels.data[idx + 2] / 255
      );
      //      row.push(pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2]);
    }
    dataArray.push(row);
  }

  //const clusters = kmeans(dataArray, numClusters);

  const clusters = kmeans(dataArray, numClusters, { init: "kmeans++" });

  // Calculate the size of each cluster
  const clusterSizes = clusters.clusters.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  // Sort the centroids based on their cluster sizes in descending order
  const centroids = clusters.centroids
    .map((centroid, index) => ({ centroid, size: clusterSizes[index] }))
    .sort((a, b) => b.size - a.size)
    .map(({ centroid }) => centroid.map((val) => Math.round(val * 255)));

  return centroids.map((centroid) => rgbToHex(centroid));
}
