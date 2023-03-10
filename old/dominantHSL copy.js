import getPixels from "get-pixels";
import { kmeans } from "ml-kmeans";

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hDecimal = l / 100;
  const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    // Convert to Hex and prefix with "0" if required
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
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
      const r = pixels.data[idx] / 255;
      const g = pixels.data[idx + 1] / 255;
      const b = pixels.data[idx + 2] / 255;
      const [h, s, l] = rgbToHsl({ r: r * 255, g: g * 255, b: b * 255 });
      row.push(h, s, l);
    }
    dataArray.push(row);
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
    .map((centroid, index) => ({
      centroid,
      size: clusterSizes[index],
      weightedAverage: weightedAverageColor(
        { centroids, cluster: clusters.clusters },
        pixels
      ),
    }))
    .sort((a, b) => b.size - a.size)
    .map(({ weightedAverage }) => weightedAverage)
    .map((centroid) => hslToHex(centroid[0], centroid[1], centroid[2]));

  return centroids.map((centroid) =>
    hslToHex(centroid[0], centroid[1], centroid[2])
  );
}

/*
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
      const r = pixels.data[idx] / 255;
      const g = pixels.data[idx + 1] / 255;
      const b = pixels.data[idx + 2] / 255;
      const [h, s, l] = rgbToHsl({ r: r * 255, g: g * 255, b: b * 255 });
      row.push(h, s, l);
    }
    dataArray.push(row);
  }

  const clusters = kmeans(dataArray, numClusters, {
    init: "kmeans++",
    seed: 2,
  });

  const clusterSizes = clusters.clusters.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  
  const weightedAverageColors = clusters.centroids.map((centroid, index) => {
    const pixelColors = [];
    for (let i = 0; i < dataArray.length; i++) {
      if (clusters.clusters[i] === index) {
        const pixelsInCluster = clusterSizes[index];
        const pixelColor = dataArray[i];
        for (let j = 0; j < pixelsInCluster; j++) {
          pixelColors.push(pixelColor);
        }
      }
    }

    const totalPixelCount = pixelColors.length;
    const weightedPixelSum = [0, 0, 0];
    for (const pixelColor of pixelColors) {
      for (let i = 0; i < 3; i++) {
        weightedPixelSum[i] += pixelColor[i];
      }
    }

    const weightedPixelAvg = weightedPixelSum.map(
      (sum) => sum / totalPixelCount
    );

    return weightedPixelAvg;
  });

  const dominantColors = weightedAverageColors.map((weightedColor) =>
    hslToHex(weightedColor[0], weightedColor[1], weightedColor[2])
  );

  return dominantColors;
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
      const r = pixels.data[idx] / 255;
      const g = pixels.data[idx + 1] / 255;
      const b = pixels.data[idx + 2] / 255;
      const [h, s, l] = rgbToHsl({ r: r * 255, g: g * 255, b: b * 255 });
      row.push(h, s, l);
    }
    dataArray.push(row);
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

  return centroids.map((centroid) =>
    hslToHex(centroid[0], centroid[1], centroid[2])
  );
}
*/

function weightedAverageColor(cluster, pixels) {
  let totalPixels = 0;
  let totalHue = 0;
  let totalSaturation = 0;
  let totalLightness = 0;

  for (let i = 0; i < pixels.shape[0]; i++) {
    for (let j = 0; j < pixels.shape[1]; j++) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      const r = pixels.data[idx] / 255;
      const g = pixels.data[idx + 1] / 255;
      const b = pixels.data[idx + 2] / 255;
      const [h, s, l] = rgbToHsl({ r: r * 255, g: g * 255, b: b * 255 });

      if (cluster[idx / 3] === cluster.centroids.indexOf(cluster[idx / 3])) {
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

function rgbToHsl(rgb) {
  const { r, g, b } = rgb;
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const maxColor = Math.max(r1, g1, b1);
  const minColor = Math.min(r1, g1, b1);
  let h,
    s,
    l = (maxColor + minColor) / 2;

  if (maxColor === minColor) {
    h = s = 0; // achromatic
  } else {
    const d = maxColor - minColor;
    s = l > 0.5 ? d / (2 - maxColor - minColor) : d / (maxColor + minColor);
    switch (maxColor) {
      case r1:
        h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
        break;
      case g1:
        h = (b1 - r1) / d + 2;
        break;
      case b1:
        h = (r1 - g1) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
