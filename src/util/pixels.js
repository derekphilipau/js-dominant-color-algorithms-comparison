import getPixels from "get-pixels";
import savePixels from "save-pixels";
import ndarray from "ndarray";
import fs from "fs";
import { rgbToHsl } from "./color.js";

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

/**
 * Still not working properly.
 */
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

export function getHslDataArray(pixels) {
  const dataArray = [];
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
  return dataArray;
}

/*
// Example usage:
getPixels("input.png", function(err, pixels) {
  // Modify the pixel data here
  // ...

  // Save the modified pixel data to a new file
  await saveImage(pixels, pixels.shape[0], pixels.shape[1], 'output.png');
});
*/
export async function saveImage(pixels, width, height, filename) {
  width = width || pixels.shape[0];
  height = height || pixels.shape[1];
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
