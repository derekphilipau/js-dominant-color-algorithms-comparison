import { promisify } from "util";
import getPixels from "get-pixels";

export async function getDominantColors(imageUrl, radius) {
  const pixels = await promisify(getPixels)(imageUrl);
  console.log("got pixels", pixels);
  const pixelArray = new Uint8Array(pixels.data.buffer);
  const points = [];
  for (let i = 0; i < pixelArray.length; i += 4) {
    points.push([pixelArray[i], pixelArray[i + 1], pixelArray[i + 2]]);
  }
  console.log("got points:", points);
  const shiftedPoints = meanShift(points, radius);
  console.log("got shifted:", shiftedPoints);
  const colors = shiftedPoints.map((color) =>
    rgbToHex(color[0], color[1], color[2])
  );
  console.log("4 got colors:", colors);
  return colors;
}

function rgbToHex(r, g, b) {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function meanShift(data, radius) {
  const shiftedPoints = new Map();
  const visited = new Set();
  const points = data.map((point) => [point[0], point[1]]);

  const shiftPoint = (point, radius) => {
    const neighbors = getNeighbors(point, radius);
    const sum = neighbors.reduce(
      (acc, neighbor) => [acc[0] + neighbor[0], acc[1] + neighbor[1]],
      [0, 0]
    );
    const count = neighbors.length;
    return [sum[0] / count, sum[1] / count];
  };

  const getNeighbors = (point, radius) => {
    const neighbors = [];
    for (const p of points) {
      if (distance(p, point) < radius) {
        neighbors.push(p);
      }
    }
    return neighbors;
  };

  const distance = (p1, p2) => {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  for (let i = 0; i < points.length; i++) {
    if (!visited.has(points[i])) {
      let point = points[i];
      for (let j = 0; j < 5; j++) {
        point = shiftPoint(point, radius);
      }
      shiftedPoints.set(points[i], point);
      visited.add(points[i]);
    }
  }

  return [...shiftedPoints.values()];
}

/*
import { promisify } from "util";
import getPixels from "get-pixels";
import quantize from "quantize";
import { meanShift } from "meanshift";



export async function getDominantColors(imageUrl, numColors) {
  const pixels = await promisify(getPixels)(imageUrl);
  const pixelArray = new Uint8Array(pixels.data.buffer);

  // Perform mean shift clustering to segment the image
  const segments = meanShift(pixelArray, 10, 30);

  // Calculate the dominant colors in each segment
  const colors = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const colorMap = quantize(segment, numColors, 0, false, false);
    const palette = colorMap.palette();
    const segmentColors = palette.map((color) =>
      rgbToHex(color[0] / 255, color[1] / 255, color[2] / 255)
    );
    colors.push(...segmentColors);
  }

  return colors;
}

function rgbToHex(r, g, b) {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
*/
