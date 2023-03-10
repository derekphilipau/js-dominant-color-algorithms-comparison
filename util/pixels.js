import getPixels from "get-pixels";
import savePixels from "save-pixels";
import fs from 'fs';

export async function getPixelsAsync(imageUrl) {
  return new Promise((resolve, reject) => {
    getPixels(imageUrl, (err, pixels) => {
      if (err) {
        reject(err);
      } else {
        resolve(pixels);
      }
    });
  });
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
    stream.on('finish', () => {
      console.log(`Image saved to file: ${filename}`);
      resolve();
    });
    stream.on('error', (err) => {
      reject(err);
    });
    savePixels(pixels, 'png').pipe(stream);
  });
}