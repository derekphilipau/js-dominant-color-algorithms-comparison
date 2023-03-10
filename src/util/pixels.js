import getPixels from "get-pixels";
import savePixels from "save-pixels";
import ndarray from "ndarray";
import fs from "fs";

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

export async function getSampledPixelsAsync(imageUrlOrPath, maxPixels = 10000) {
  const pixels = await getPixelsAsync(imageUrlOrPath); // get the pixels of the image
  const sampleSize = Math.min(pixels.shape[0] * pixels.shape[1], maxPixels); // calculate the target sample size based on the size of the image
  const sampledPixels = samplePixels(pixels, sampleSize); // sample the pixels
  return sampledPixels;
}

function samplePixels(pixels, x) {
  const [width, height, channels] = pixels.shape;
  const result = ndarray(new Uint8Array(width * height * channels), [
    width,
    height,
    channels,
  ]);
  for (let i = 0; i < width; i += x) {
    for (let j = 0; j < height; j += x) {
      for (let k = 0; k < channels; k++) {
        result.set(i, j, k, pixels.get(i, j, k));
      }
    }
  }
  return result;
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
async function saveImage(pixels, width, height, filename) {
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
