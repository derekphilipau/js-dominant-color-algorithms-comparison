import getPixels from "get-pixels";
import savePixels from "save-pixels";
import ndarray from "ndarray";
import fs from "fs";
import convert from "color-convert";

export async function getPixelsAsync(imageUrlOrPath) {
  return new Promise((resolve, reject) => {
    getPixels(imageUrlOrPath, (err, pixels) => {
      if (err) {
        reject(err);
      } else {
        resolve(pixels);
      }
    });
  });
}

export function getRgbDataArray(pixels) {
  const dataArray = [];
  for (let i = 0; i < pixels.shape[0]; i++) {
    const row = [];
    for (let j = 0; j < pixels.shape[1]; j++) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      row.push(pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2]);
    }
    dataArray.push(row);
  }
  return dataArray;
}

export function getSampledFlatPixelArray(pixels, skipRatio = 1, colorSpace = 'rgb') {
  const pixelArray = [];
  for (let i = 0; i < pixels.shape[0]; i += skipRatio) {
    for (let j = 0; j < pixels.shape[1]; j += skipRatio) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      const [r, g, b, a] = [pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2], pixels.data[idx + 3]];
      if (typeof a === 'undefined' || a >= 125) { // Color thief: If pixel is mostly opaque and not white
        if (colorSpace === 'hsv') pixelArray.push(convert.rgb.hsv(r, g, b))
        else if (colorSpace === 'lab') pixelArray.push(convert.rgb.lab(r, g, b))
        else pixelArray.push([r, g, b]);
      }
    }
  }
  return pixelArray;
}

export function getDownscaledFlatPixelArray(pixels, maxDimension = 600, colorSpace = 'rgb', isShifted = false) {
  const labLShift = 8 - 4;
  const hsvVShift = 8 - 4;

  const width = pixels.shape[0];
  const height = pixels.shape[1];
  const maxOriginalDimension = Math.max(width, height);

  // If the image is smaller than the max dimension, no downscaling is needed
  if (maxOriginalDimension <= maxDimension) {
    return getSampledFlatPixelArray(pixels, 1, colorSpace);
  }

  const downscaleFactor = maxOriginalDimension / maxDimension;
  const newWidth = Math.floor(width / downscaleFactor);
  const newHeight = Math.floor(height / downscaleFactor);
  const downscaledPixels = [];

  for (let i = 0; i < newWidth; i++) {
    for (let j = 0; j < newHeight; j++) {
      const originalIdx = (Math.floor(i * downscaleFactor) * height + Math.floor(j * downscaleFactor)) * pixels.shape[2];

      const r = pixels.data[originalIdx];
      const g = pixels.data[originalIdx + 1];
      const b = pixels.data[originalIdx + 2];
      const a = pixels.data[originalIdx + 3];

      if (typeof a === "undefined" || a >= 125) {
        if (colorSpace === 'hsv') {
          const hsv = convert.rgb.hsv(r, g, b);
          if (isShifted) hsv[2] = hsv[2] >> hsvVShift;
          downscaledPixels.push(hsv);
        } else if (colorSpace === 'lab') {
          const lab = convert.rgb.lab(r, g, b);
          if (isShifted) lab[0] = lab[0] >> labLShift;
          downscaledPixels.push(lab);
        } else {
          downscaledPixels.push([r, g, b]);
        }
      }
    }
  }
  return downscaledPixels;
}

export function unshiftColor(color, colorSpace, isShifted) {
  if (isShifted) {
    const shift = 8 - 4; // TODO
    const [c0, c1, c2] = color;
    if (colorSpace === 'hsv') {
      const cx = c2 << shift;
      return [c0, c1, cx];
    } else if (colorSpace === 'lab') {
      const cx = c0 << shift;
      return [cx, c1, c2];
    }
  }
  return color;
}

export function getDownscaledLabABPixels(pixels, maxDimension = 600) {
  const width = pixels.shape[0];
  const height = pixels.shape[1];
  const maxOriginalDimension = Math.max(width, height);

  // If the image is smaller than the max dimension, no downscaling is needed
  if (maxOriginalDimension <= maxDimension) {
    const pixelArray = [];
    for (let i = 0; i < pixels.shape[0]; i += skipRatio) {
      for (let j = 0; j < pixels.shape[1]; j += skipRatio) {
        const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
        const [r, g, b, a] = [pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2], pixels.data[idx + 3]];
        if (typeof a === 'undefined' || a >= 125) {
          const lab = convert.rgb.lab(r, g, b);
          pixelArray.push([lab[1], lab[2]]);
        }
      }
    }
    return pixelArray;
  }

  const downscaleFactor = maxOriginalDimension / maxDimension;
  const newWidth = Math.floor(width / downscaleFactor);
  const newHeight = Math.floor(height / downscaleFactor);
  const downscaledPixels = [];

  for (let i = 0; i < newWidth; i++) {
    for (let j = 0; j < newHeight; j++) {
      const originalIdx = (Math.floor(i * downscaleFactor) * height + Math.floor(j * downscaleFactor)) * pixels.shape[2];

      const r = pixels.data[originalIdx];
      const g = pixels.data[originalIdx + 1];
      const b = pixels.data[originalIdx + 2];
      const a = pixels.data[originalIdx + 3];

      if (typeof a === "undefined" || a >= 125) {
        const lab = convert.rgb.lab(r, g, b);
        downscaledPixels.push([lab[1], lab[2]]);
      }
    }
  }
  return downscaledPixels;
}

export async function saveImage(pixels, filename) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filename);
    stream.on("finish", () => {
      console.log(`Image saved to file: ${filename}`);
      resolve();
    });
    stream.on("error", (err) => {
      reject(err);
    });
    savePixels(pixels, "png").pipe(stream);
  });
}

export function removeDuplicatePoints(points) {
  const uniquePoints = [];
  const seen = new Set();

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const key = point.join('|');
    if (!seen.has(key)) {
      uniquePoints.push(point);
      seen.add(key);
    }
  }

  return uniquePoints;
}

/*

// Shifting works, but loses too much color information and is too inaccurate
export function getShiftedFlatPixelArray(pixels, skipRatio = 1, colorSpace = 'rgb') {
  const pixelArray = [];
  const rShift = 8 - 5;
  const gShift = 8 - 5;
  const bShift = 8 - 5;

  for (let i = 0; i < pixels.shape[0]; i += skipRatio) {
    for (let j = 0; j < pixels.shape[1]; j += skipRatio) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      const [r, g, b, a] = [pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2], pixels.data[idx + 3]];
      if (typeof a === "undefined" || a >= 125) {
        const rQuant = r >> rShift;
        const gQuant = g >> gShift;
        const bQuant = b >> bShift;

        if (colorSpace === 'hsv') {
          pixelArray.push(convert.rgb.hsv(rQuant, gQuant, bQuant));
        } else if (colorSpace === 'lab') {
          pixelArray.push(convert.rgb.lab(rQuant, gQuant, bQuant));
        } else {
          pixelArray.push([rQuant, gQuant, bQuant]);
        }
      }
    }
  }
  return pixelArray;
}

export function unShiftColor(color) {
  const rShift = 8 - 5;
  const gShift = 8 - 5;
  const bShift = 8 - 5;

  return [color[0] << rShift, color[1] << gShift, color[2] << bShift];
}


// This was bad, took way too long to run due to distance calcs.
export function getFlatAdaptiveSampledPixelArray(pixels, gridSize = 8, colorSpace = 'rgb') {
  const pixelArray = [];
  const width = pixels.shape[0];
  const height = pixels.shape[1];
  const gridWidth = Math.ceil(width / gridSize);
  const gridHeight = Math.ceil(height / gridSize);

  function getColor(pixelIndex) {
    const [r, g, b, a] = [
      pixels.data[pixelIndex],
      pixels.data[pixelIndex + 1],
      pixels.data[pixelIndex + 2],
      pixels.data[pixelIndex + 3],
    ];

    if (colorSpace === 'hsv') {
      return convert.rgb.hsv(r, g, b);
    } else if (colorSpace === 'lab') {
      return convert.rgb.lab(r, g, b);
    } else {
      return [r, g, b];
    }
  }

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      let maxDist = -1;
      let maxDistColor = null;

      for (let y = i * gridSize; y < (i + 1) * gridSize && y < height; y++) {
        for (let x = j * gridSize; x < (j + 1) * gridSize && x < width; x++) {
          const idx = (y * width + x) * pixels.shape[2];
          const a = pixels.data[idx + 3];

          if (typeof a === 'undefined' || a >= 125) {
            const color = getColor(idx);
            let minDist = Infinity;

            for (const sampledColor of pixelArray) {
              const dist = euclideanDistance(color, sampledColor);
              minDist = Math.min(minDist, dist);
            }

            if (minDist > maxDist) {
              maxDist = minDist;
              maxDistColor = color;
            }
          }
        }
      }

      if (maxDistColor !== null) {
        pixelArray.push(maxDistColor);
      }
    }
  }

  return pixelArray;
}

function euclideanDistance(a, b) {
  return a.reduce((acc, val, idx) => acc + Math.pow(val - b[idx], 2), 0);
}

// Other old try that didn't work
export async function getSampledPixelsAsync(
  imageUrlOrPath,
  maxPixels = 100000
) {
  const pixels = await getPixelsAsync(imageUrlOrPath); // get the pixels of the image
  const sampleSize = Math.min(pixels.shape[0] * pixels.shape[1], maxPixels); // calculate the target sample size based on the size of the image
  //const sampleSize = Math.floor((pixels.shape[0] * pixels.shape[1]) / 2);
  //const sampleSize = Math.floor(pixels.shape[0] * pixels.shape[1]);
  if (sampleSize < 1) {
    throw new Error("Image is too small");
  }
  const sampledPixels = samplePixels(pixels, sampleSize); // sample the pixels
  return sampledPixels;
}

// Still not working properly.
function samplePixels(pixels, targetPixels) {
  const [width, height, channels] = pixels.shape;
  const ratio = Math.sqrt(targetPixels / (width * height));
  const newWidth = Math.floor(width * ratio);
  const newHeight = Math.floor(height * ratio);
  const result = ndarray(new Uint8Array(newWidth * newHeight * channels), [
    newWidth,
    newHeight,
    channels,
  ]);
  for (let i = 0; i < newWidth; i++) {
    const origX = Math.floor(i / ratio);
    for (let j = 0; j < newHeight; j++) {
      const origY = Math.floor(j / ratio);
      for (let k = 0; k < channels; k++) {
        result.set(i, j, k, pixels.get(origX, origY, k));
      }
    }
  }
  return result;
}

// no longer used
export function getPixelArray(pixels, skipRatio = 1, colorSpace = 'rgb') {
  const pixelArray = [];
  for (let i = 0; i < pixels.shape[0]; i += skipRatio) {
    const row = [];
    for (let j = 0; j < pixels.shape[1]; j += skipRatio) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      const [r, g, b, a] = [pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2], pixels.data[idx + 3]];
      //if (typeof a === 'undefined' || a >= 125) { // Color thief: If pixel is mostly opaque and not white
      if (colorSpace === 'hsv') row.push(convert.rgb.hsv(r, g, b))
      else row.push([r, g, b]);
      //}
    }
    pixelArray.push(row);
  }
  return pixelArray;
}
*/