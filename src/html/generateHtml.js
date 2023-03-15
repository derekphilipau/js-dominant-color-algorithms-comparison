import { writeFileSync } from "fs";
import { modifiedMedianCutQuantization } from "../mmcqColors.js";
import { getMmcqKmeansColors } from "../mmcqKmeansColors.js";
import { getMmcqHierarchicalClustering } from "../mmcqHierarchicalColors.js";
import { getKmeansColors } from "../kmeansColors.js";
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
    { name: "K-means RGB", func: getKmeansColors, args: [1, false] },
    {
      name: "K-means RGB sampled 1/4",
      func: getKmeansColors,
      args: [2, false],
    },
    {
      name: "K-means RGB sampled 1/16",
      func: getKmeansColors,
      args: [4, false],
    },
    {
      name: "K-means RGB sampled 1/64",
      func: getKmeansColors,
      args: [8, false],
    },
    { name: "K-means HSV", func: getKmeansColors, args: [1, true] },
    {
      name: "K-means HSV sampled 1/16",
      func: getKmeansColors,
      args: [4, true],
    },
    {
      name: "K-means HSV sampled 1/16 (node-kmeans)",
      func: getKmeansNodeColors,
      args: [4, true],
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
    const palettes = [
      await f.func(imageFile, numColors, ...f.args),
      await f.func(imageFile, numColors / 2, ...f.args),
      await f.func(imageFile, numColors / 4, ...f.args),
    ];
    const endTime = performance.now();
    const time = endTime - startTime;
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
              <a href="image.url">"${image.title}", ${image.artist}</a>
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
                      ${palette
                        .map(
                          (color) =>
                            `<div style="background-color: #${color}; height: 60px; width: 30px;"></div>`
                        )
                        .join("\n")}
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
              Vibrant using <a href="https://github.com/Vibrant-Colors/node-vibrant">node-vibrant</a>.
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
