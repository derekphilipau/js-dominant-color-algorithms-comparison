import { writeFileSync } from "fs";
import { modifiedMedianCutQuantization } from "../mmcqColors.js";
import { getMmcqKmeansColors } from "../mmcqKmeansColors.js";
import { rgbQuantColors } from "../rgbQuant.js";
import { getMmcqHierarchicalClustering } from "../mmcqHierarchicalColors.js";
import { getKmeansSimpleColors } from "../kmeansSimple.js";
import { getHierarchicalClustering } from "../hierarchicalColors.js";
import { performance } from "perf_hooks";

async function getPalettes(imageFile, numColors) {
  const functions = [
    { name: "K-means Simple RGB no sampling", func: getKmeansSimpleColors, args: [imageFile, numColors, 1, false] },
    { name: "K-means Simple HSV", func: getKmeansSimpleColors, args: [imageFile, numColors, true] },
    { name: "K-means Simple RGB sampled 1/2", func: getKmeansSimpleColors, args: [imageFile, numColors, 2, false] },
    { name: "K-means Simple RGB sampled 1/4", func: getKmeansSimpleColors, args: [imageFile, numColors, 4, false] },
    { name: "MMCQ", func: modifiedMedianCutQuantization, args: [imageFile, numColors] },
    { name: "Two steps: MMCQ then K-means", func: getMmcqKmeansColors, args: [imageFile, numColors] },
    { name: "Two steps: MMCQ then Hierarchical Clustering", func: getMmcqHierarchicalClustering, args: [imageFile, numColors] },
    // { name: "Hierarchical Clustering", func: getHierarchicalClustering, args: [imageFile, numColors] },
    { name: "RGB Quant", func: rgbQuantColors, args: [imageFile, numColors] },
  ];

  const results = [];
  for (const f of functions) {
    const startTime = performance.now();
    const colors = await f.func(...f.args);
    const endTime = performance.now();
    const time = endTime - startTime;
    results.push({ name: f.name, colors, time });
    console.log(`${f.name} took ${getSeconds(time)}s`);
  }

  return results;
}

function getSeconds(ms) {
  return Math.round((ms / 1000) * 100) / 100;
}

export async function generateHtml(images, numColors) {
  const imageDivs = [];
  for (const image of images) {
    const imageFile = `./img/${image.filename}`;

    const palettes = await getPalettes(imageFile, numColors);

    const imageHtml = `
      <div class="columns mb-6">
        <div class="column is-one-third">
          <figure class="image">
            <img src="img/${image.filename}">
            <figcaption>
              <a href="image.url">"${image.title}", ${image.artist}</a>
            </figcaption>
          </figure>
        </div>
        <div class="column is-two-thirds">
          ${palettes
        .map(
          (palette) =>
            `<div class="pb-3">
                    <h4 class="subtitle mb-1">${palette.name} (${getSeconds(palette.time)}s)</h4>
                    <div style="display: flex;">
                    ${palette.colors
              .map(
                (color) =>
                  `<div>
                            <div style="background-color: #${color}; height: 40px; width: 80px;"></div>
                            <div class="is-size-7">#${color}</div>
                          </div>`
              )
              .join("\n")}
                    </div>
                  </div>`
        )
        .join("\n")}
        </div>
      </div>
    `;
    imageDivs.push(imageHtml);
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Dominant Image Color Algorithms</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
      </head>
      <body>
        <section class="hero">
          <div class="hero-body">
            <p class="title">
              Dominant Image Color Algorithms
            </p>
            <p class="subtitle">
              <a href="https://github.com/derekphilipau/dominant-color-algorithms">View on Github</a>
            </p>
            <p class="content">
              K-means clustering using the <a href="">ml-kmeans</a> library.
              MMCQ (modified median cut quantization) algorithm from
              <a href="http://www.leptonica.org/color-quantization.html">Leptonica library</a>
              implemented in <a href="https://github.com/olivierlesnicki/quantize">quantize</a> Javascript package.
              (<a href="https://github.com/olivierlesnicki/quantize">quantize</a> is the code used in
              the <a href="https://github.com/lokesh/color-thief">Color Thief</a> library.)
              RGB Quant using <a href="https://github.com/leeoniya/RgbQuant.js">RgbQuant.js</a> with
              <a href="https://github.com/leeoniya/RgbQuant.js/compare/master...Hypfer:RgbQuant.js:patch-2">this patch</a>.
            </p>
          </div>
        </section>
        <section class="container">
          ${imageDivs.join("\n")}
        </section>
      </body>
    </html>
  `;

  writeFileSync("index.html", html);
}
