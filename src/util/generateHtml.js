import { writeFileSync } from "fs";
import {
  getKmeansColors,
  getKmeansSampledColors,
  getKmeansSampledWeightedColors,
  getKmeansWeightedColors,
} from "../kmeansColors.js";
import { modifiedMedianCutQuantization } from "../mmcqColors.js";
import {
  getMmcqKmeansColors,
  getMmcqKmeansWeightedColors,
} from "../mmcqKmeansColors.js";

async function getPalettes(imageFile, numColors) {
  console.time("getKmeansColors");
  const kmeansColors = await getKmeansColors(imageFile, numColors);
  console.timeEnd("getKmeansColors");
  console.time("getKmeansWeightedColors");
  const kmeansWeightedColors = await getKmeansWeightedColors(
    imageFile,
    numColors
  );
  console.timeEnd("getKmeansWeightedColors");
  /*
  const kmeansSampledColors = await getKmeansSampledColors(
    imageFile,
    numColors
  );
  const kmeansSampledWeightedColors = await getKmeansSampledWeightedColors(
    imageFile,
    numColors
  );
  */

  console.time("modifiedMedianCutQuantization");
  const mmcqColors = await modifiedMedianCutQuantization(imageFile, numColors);
  console.timeEnd("modifiedMedianCutQuantization");

  console.time("getMmcqKmeansColors");
  const mmcqKmeansColors = await getMmcqKmeansColors(imageFile, numColors);
  console.timeEnd("getMmcqKmeansColors");

  console.time("getMmcqKmeansWeightedColors");
  const mmcqKmeansWeightedColors = await getMmcqKmeansWeightedColors(
    imageFile,
    numColors
  );
  console.timeEnd("getMmcqKmeansWeightedColors");

  return [
    { name: "K-means Colors", colors: kmeansColors },
    { name: "K-means Weighted Colors", colors: kmeansWeightedColors },
    /*
    { name: "K-means Sampled Colors", colors: kmeansSampledColors },
    {
      name: "K-means Sampled Weighted Colors",
      colors: kmeansSampledWeightedColors,
    },
    */
    { name: "MMCQ Colors", colors: mmcqColors },
    { name: "MMCQ K-means Colors", colors: mmcqKmeansColors },
    {
      name: "MMCQ K-means Weighted Colors",
      colors: mmcqKmeansWeightedColors,
    },
  ];
}

export async function generateHtml(images, numColors) {
  const imageDivs = [];
  for (const image of images) {
    const imageFile = `./img/${image.filename}`;

    const palettes = await getPalettes(imageFile, numColors);

    const imageHtml = `
      <div class="columns">
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
                    <h4 class="subtitle mb-1">${palette.name}</h4>
                    <div style="display: flex;">
                    ${palette.colors
                      .map(
                        (color) =>
                          `<div>
                            <div style="background-color: ${color}; height: 40px; width: 80px;"></div>
                            <div class="is-size-7">${color}</div>
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
            </p>
            <p class="content">
              Naive, unoptimized implementations with some help from ChatGPT.
              Regardless, MMCQ seems much faster than K-means.
            </p>
            <p class="content">
              Typical run:
              <ul>
                <li>K-means: 3.684s</li>
                <li>K-means with weighting: 5.949s</li>
                <li>MMCQ: 239.532ms (Note this is ms, not s!)</li>
                <li>MMCQ then K-means: 6.201s</li>
                <li>MMCQ then K-means with weighting: 8.603s</li>
              </ul>
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
