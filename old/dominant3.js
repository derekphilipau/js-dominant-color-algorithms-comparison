//import getPixels from "get-pixels";
//import quantize from "quantize";

import { promisify } from "util";
import getPixels from "get-pixels";
import quantize from "quantize";

export async function getDominantColors(imageUrl, numColors) {
  //console.log("getting dominant colors for", imageUrl);
  const pixels = await promisify(getPixels)(imageUrl);
  //console.log("pixels", pixels);
  const pixelArray = new Uint8Array(pixels.data.buffer);
  //console.log("pixelArray", pixelArray);
  const colorMap = quantize(pixelArray, numColors, 0, false, false); // use RGB color space
  const palette = colorMap.palette();
  //console.log(palette);
  // const colors = palette.map((color) => rgbToHex(color[0], color[1], color[2]));
  const colors = palette.map((color) =>
    rgbToHex(color[0] / 255, color[1] / 255, color[2] / 255)
  );
  return colors;
}

function rgbToHex(r, g, b) {
  const componentToHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/*
function rgbToHex(r, g, b) {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
/**
 * Finds the dominant colors in an image using k-means clustering.
 * @param {string} imageUrl - The URL of the image.
 * @param {number} numColors - The number of dominant colors to find.
 * @returns {Promise<Array<string>>} - A Promise that resolves to an array of hex color strings.
 */
/*
export async function getDominantColors(imageUrl, numColors) {
  return new Promise((resolve, reject) => {
    // Load the image using the get-pixels library.
    getPixels(imageUrl, (err, pixels) => {
      if (err) {
        reject(err);
        return;
      }
      // Convert the image data to a 1D array of RGB values.
      const pixelArray = [];
      for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i];
        const g = pixels.data[i + 1];
        const b = pixels.data[i + 2];
        pixelArray.push(r, g, b);
      }
      // Use the quantize library to perform k-means clustering on the pixel data.
      const palette = quantize(pixelArray, numColors);
      console.log(palette.palette());
      // Convert the palette colors to an array of hex color strings.
      const hexColors = palette.palette().map((color) => {
        const r = color[0].toString(16).padStart(2, "0");
        const g = color[1].toString(16).padStart(2, "0");
        const b = color[2].toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
      });
      resolve(hexColors);
    });
  });
}
*/
