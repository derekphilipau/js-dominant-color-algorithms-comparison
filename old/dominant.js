import getPixels from "get-pixels";
import { Matrix } from "ml-matrix";
import { kmeans } from "ml-kmeans";

export async function getDominantColors(imageUrl, numColors) {
  return new Promise((resolve, reject) => {
    getPixels(imageUrl, (err, pixels) => {
      if (err) {
        reject(err);
        return;
      }
      const colors = [];
      for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i];
        const g = pixels.data[i + 1];
        const b = pixels.data[i + 2];
        const a = pixels.data[i + 3];
        // Ignore fully transparent pixels
        if (a < 255) continue;
        const rgb = (r << 16) + (g << 8) + b;
        colors.push(rgb);
      }
      const sortedColors = sortColors(colors);
      const groupedColors = groupColors(sortedColors, numColors);
      const rankedColors = groupedColors.sort((a, b) => b.count - a.count);
      const myrank = rankedColors.map((colorObj) => colorObj.color);
      resolve(myrank);
    });
  });
}

function sortColors(colors) {
  const compare = (a, b) => {
    const rDiff = (a >> 16) - (b >> 16);
    const gDiff = ((a >> 8) & 0xff) - ((b >> 8) & 0xff);
    const bDiff = (a & 0xff) - (b & 0xff);
    return rDiff || gDiff || bDiff;
  };
  return colors.sort(compare);
}

function groupColors(colors, numGroups) {
  const numColors = colors.length;
  const numColorsPerGroup = Math.floor(numColors / numGroups);
  const remainder = numColors % numGroups;
  let groupSize, startIndex;
  const groups = [];

  // Convert the colors array to a matrix
  const data = new Matrix(
    colors.map((color) => [
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff,
    ])
  );

  /*
  const dataArray = [];
  for (let i = 0; i < data.rows; i++) {
    const row = [];
    for (let j = 0; j < data.columns; j++) {
      row.push(data.get(i, j));
    }
    dataArray.push(row);
  }
  */
  const dataArray = [];
  for (let i = 0; i < data.rows; i++) {
    const row = Array.from(data.getRow(i));
    dataArray.push(row);
  }

  // Cluster the colors using k-means
  const clusterIds = kmeans(dataArray, numGroups).assignments;

  // Calculate the average color of each cluster
  for (let i = 0; i < numGroups; i++) {
    let count = 0;
    let clusterColors = [];
    for (let j = 0; j < numColors; j++) {
      if (clusterIds?.[j] === i) {
        count++;
        clusterColors.push(colors[j]);
      }
    }
    const averageColor = getAverageColor(clusterColors);
    groups.push({
      color: averageColor,
      count: count,
    });
  }
  return groups;
}

/*
function groupColors(colors, numGroups) {
  const numColors = colors.length;
  const numColorsPerGroup = Math.floor(numColors / numGroups);
  const remainder = numColors % numGroups;
  let groupSize, startIndex;
  const groups = [];

  // Convert the colors array to a matrix
  const data = new Matrix(
    colors.map((color) => [
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff,
    ])
  );

  //const dataArray = data.toArray();
  // Convert the matrix to a 2D array
  const dataArray = [];
  for (let i = 0; i < data.rows; i++) {
    const row = [];
    for (let j = 0; j < data.columns; j++) {
      row.push(data.get(i, j));
    }
    dataArray.push(row);
  }

  // Cluster the colors using k-means
  const clusterIds = kmeans(dataArray, numGroups).assignments;

  // Count the number of colors in each cluster
  const counts = new Array(numGroups).fill(0);
  for (let i = 0; i < numColors; i++) {
    counts[clusterIds[i]]++;
  }

  // Calculate the average color of each cluster
  for (let i = 0; i < numGroups; i++) {
    groupSize = numColorsPerGroup + (i < remainder ? 1 : 0);
    startIndex = i * numColorsPerGroup + Math.min(i, remainder);
    const clusterColors = colors.filter(
      (color, index) => clusterIds[index] === i
    );
    const averageColor = getAverageColor(clusterColors);
    //const averageColor = getAverageColor(clusterColors.toArray()); // Convert the Matrix object to an array
    groups.push({
      color: averageColor,
      count: counts[i],
    });
  }
  return groups;
}
*/

function getAverageColor(colors) {
  const numColors = colors.length;
  let rTotal = 0,
    gTotal = 0,
    bTotal = 0;
  for (let i = 0; i < numColors; i++) {
    rTotal += colors[i] >> 16;
    gTotal += (colors[i] >> 8) & 0xff;
    bTotal += colors[i] & 0xff;
  }
  const rAverage = Math.round(rTotal / numColors);
  const gAverage = Math.round(gTotal / numColors);
  const bAverage = Math.round(bTotal / numColors);
  return (rAverage << 16) + (gAverage << 8) + bAverage;
}

export function convertRgbToHex(colors) {
  return colors.map((color) => {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  });
}

/*
function groupColors(colors, numGroups) {
  const numColors = colors.length;
  const numColorsPerGroup = Math.floor(numColors / numGroups);
  const remainder = numColors % numGroups;
  let groupSize, startIndex;
  const groups = [];
  for (let i = 0; i < numGroups; i++) {
    groupSize = numColorsPerGroup + (i < remainder ? 1 : 0);
    startIndex = i * numColorsPerGroup + Math.min(i, remainder);
    const averageColor = getAverageColor(
      colors.slice(startIndex, startIndex + groupSize)
    );
    groups.push({
      color: averageColor,
      count: groupSize,
    });
  }
  return groups;
}
*/
