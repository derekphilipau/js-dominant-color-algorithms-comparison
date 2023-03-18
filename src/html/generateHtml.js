import { writeFileSync } from "fs";
import { modifiedMedianCutQuantization } from "../mmcqColors.js";
import { getMmcqKmeansColors } from "../mmcqKmeansColors.js";
import { getMmcqHierarchicalClustering } from "../mmcqHierarchicalColors.js";
import { getKmeansNodeColors } from "../kmeansNodeColors.js";
import { getHierarchicalClustering } from "../hierarchicalColors.js";
import { getMeanShiftClustering } from "../meanShiftColors.js";
import { getVibrantDominantColors } from "../nodeVibrant.js";
import { performance } from "perf_hooks";

async function getPalettes(imageFile, numColors) {
  const functions = [
    {
      name: "Naive Hierarchical Clustering",
      func: getHierarchicalClustering,
      args: [],
    },
    {
      name: "Naive Mean Shift Clustering",
      func: getMeanShiftClustering,
      args: [],
    },
    {
      name: "K-means RGB (node-kmeans)",
      func: getKmeansNodeColors,
      args: [1, 'rgb'],
    },
    {
      name: "K-means RGB sampled 1/4 (node-kmeans)",
      func: getKmeansNodeColors,
      args: [2, 'rgb'],
    },
    {
      name: "K-means RGB sampled 1/16 (node-kmeans)",
      func: getKmeansNodeColors,
      args: [4, 'rgb'],
    },
    {
      name: "K-means RGB sampled 1/64 (node-kmeans)",
      func: getKmeansNodeColors,
      args: [8, 'rgb'],
    },
    {
      name: "K-means HSV sampled 1/16 (node-kmeans)",
      func: getKmeansNodeColors,
      args: [4, 'hsv'],
    },
    {
      name: "K-means Lab sampled 1/16 (node-kmeans)",
      func: getKmeansNodeColors,
      args: [4, 'lab'],
    },
    { name: "MMCQ", func: modifiedMedianCutQuantization, args: [] },
    { name: "2 step: MMCQ then K-means", func: getMmcqKmeansColors, args: [] },
    {
      name: "2 step: MMCQ then Hierarchical Clustering",
      func: getMmcqHierarchicalClustering,
      args: [],
    },
  ];

  const results = [];
  for (const f of functions) {
    const startTime = performance.now();
    const fullPalette = await f.func(imageFile, numColors, ...f.args);
    const endTime = performance.now();
    const time = endTime - startTime;
    const palettes = [
      fullPalette,
      await f.func(imageFile, numColors / 2, ...f.args),
      await f.func(imageFile, numColors / 4, ...f.args),
    ];
    results.push({ name: f.name, palettes, time });
    console.log(`${f.name} took ${getSeconds(time)}s`);
  }

  const startTime = performance.now();
  const vibrant = await getVibrantDominantColors(imageFile, numColors);
  const endTime = performance.now();
  const time = endTime - startTime;
  results.push({ name: "Vibrant", palettes: [vibrant], time });

  return results;
}

function getSeconds(ms) {
  return Math.round((ms / 1000) * 100) / 100;
}

function getPalette(palette) {
  if (palette.length > 0 && palette[0].percent) {
    // palette has percent info
    const totalLength = 30 * palette.length;
    return `
    <div class="is-flex mr-6">
    ${palette
      .map(
        (color) =>
          `<div style="background-color: #${
            color.color
          }; height: 60px; width: ${Math.floor(
            color.percent * totalLength
          )}px;"></div>`
      )
      .join("\n")}
    </div>`;
  }

  return `
    <div class="is-flex mr-6">
    ${palette
      .map(
        (color) =>
          `<div style="background-color: #${color}; height: 60px; width: 30px;"></div>`
      )
      .join("\n")}
    </div>`;
}

export async function generateHtml(images, numColors) {
  const imageDivs = [];
  for (const image of images) {
    const imageFile = `./img/${image.filename}`;

    console.log(`Processing colors for ${imageFile}`);
    const results = await getPalettes(imageFile, numColors);

    const imageHtml = `
      <div class="columns mb-6">
        <div class="column is-one-third">
          <figure class="image">
            <img src="img/${image.filename}">
            <figcaption>
              <a href="${image.url}">"${image.title}", ${image.artist}</a>
            </figcaption>
          </figure>
        </div>
        <div class="column is-two-thirds">
          ${results
            .map(
              (result) =>
                `<div class="pb-1">
                <h4 class="mb-1 is-size-6">${result.name} (${getSeconds(
                  result.time
                )}s)</h4>
                <div class="is-flex">
                ${result.palettes
                  .map(
                    (palette) =>
                      `<div class="is-flex mr-6">
                      ${getPalette(palette)}
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
              This is just a playground for testing out different algorithms for extracting
              dominant colors from images.  I've tried various techniques for improving optimization,
              including downsampling, shifting certain color space channels, and eliminating Lab
              luminance altogether.  Difficult to beat the speed of the MMCQ algorithm, though.
            </p>
            <p class="content">
              K-means clustering using the <a href="https://github.com/mljs/kmeans">ml-kmeans</a> and
              <a href="https://github.com/Philmod/node-kmeans">node-kmeans</a> libraries.
              MMCQ (modified median cut quantization) algorithm from
              <a href="http://www.leptonica.org/color-quantization.html">Leptonica library</a> in
              <a href="https://github.com/DanBloomberg/leptonica/blob/master/src/colorquant2.c">colorquant2.c</a>,
              later implemented in the <a href="https://github.com/olivierlesnicki/quantize">quantize</a> Javascript package.
              (<a href="https://github.com/olivierlesnicki/quantize">quantize</a> is the code used in
              the <a href="https://github.com/lokesh/color-thief">Color Thief</a> library.)
              <a href="https://github.com/Vibrant-Colors/node-vibrant">node-vibrant</a> also uses MMCQ.
              Huge shoutout to the original author of MMCQ as implemented in Leptonica,
              <a href="https://github.com/DanBloomberg">Dan Bloomberg</a>.
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
