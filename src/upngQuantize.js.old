/**
 *
 * UPNG.js contains a very good Quantizer of 4-component 8-bit vectors (i.e. pixels).
 * It can be used to generate nice color palettes (e.g. Photopea uses UPNG.js to make
 * palettes for GIF images).
 *
 * Quantization consists of two important steps: Finding a nice palette and Finding
 * the closest color in the palette for each sample (non-trivial for large palettes).
 * UPNG perfroms both steps.
 *
 * var res  = UPNG.quantize(data, psize);
 * data: ArrayBuffer of samples (byte length is a multiple of four)
 * psize : Palette size (how many colors you want to have)
 * The result object "res" has following properties:
 *
 * abuf: ArrayBuffer corresponding to data, where colors are remapped by a palette
 * inds: Uint8Array : the index of a color for each sample (only when psize<=256)
 * plte: Array : the Palette - a list of colors, plte[i].est.q and plte[i].est.rgba is the color value
 */
import UPNG from "upng-js";
import { loadImage } from 'canvas';
import { readFile } from 'fs';

function readFileAsArrayBuffer(filePath) {
  return new Promise((resolve, reject) => {
    readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      resolve(arrayBuffer);
    });
  });
}

// NOT WORKING
export async function upngQuantize(imageUrlOrPath, numColors) {
  const quality = 100;
  const image = await loadImage(imageUrlOrPath);
  console.log(imageUrlOrPath, image.width, image.height)
  const arrayBuffer = await readFileAsArrayBuffer(imageUrlOrPath);
  var png = UPNG.encode([arrayBuffer], image.width, image.height, quality);
  var decodedImg  = UPNG.decode(png);        // put ArrayBuffer of the PNG file into UPNG.decode
  var rgba = UPNG.toRGBA8(decodedImg)[0];     // UPNG.toRGBA8 returns array of frames, size: width * height * 4 bytes.
  var res  = UPNG.quantize(rgba, numColors);
  console.log(res.plte.map((plte) => JSON.stringify(plte)));
}
