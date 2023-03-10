import quantize from "quantize";
import { getPixelsAsync, rgbToHex } from "./util.js";

export async function reduceColors(imageUrl, numColors) {
  const pixels = await getPixelsAsync(imageUrl);

  const dataArray = [];
  for (let i = 0; i < pixels.shape[0]; i++) {
    const row = [];
    for (let j = 0; j < pixels.shape[1]; j++) {
      const idx = (i * pixels.shape[1] + j) * pixels.shape[2];
      row.push(pixels.data[idx], pixels.data[idx + 1], pixels.data[idx + 2]);
    }
    dataArray.push(row);
  }
  const palette = quantize(dataArray, numColors + 1).palette();
  return palette.map((color) => rgbToHex(color[0], color[1], color[2]));
}
