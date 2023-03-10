import { writeFileSync } from "fs";
import { getKmeansColors, getKmeansWeightedColors } from "../kmeansColors.js";
import { modifiedMedianCutQuantization } from "../mmcqColors.js";
import {
  getMmcqKmeansColors,
  getMmcqKmeansWeightedColors,
} from "../mmcqKmeansColors.js";

export async function generateHtml(imageUrls, numColors) {
  const imageDivs = [];
  for (const imageUrl of imageUrls) {
    const kmeansColors = await getKmeansColors(imageUrl, numColors);
    const kmeansWeightedColors = await getKmeansWeightedColors(
      imageUrl,
      numColors
    );
    const mmcqColors = await modifiedMedianCutQuantization(imageUrl, numColors);
    const mmcqKmeansColors = await getMmcqKmeansColors(imageUrl, numColors);
    const mmcqKmeansWeightedColors = await getMmcqKmeansWeightedColors(
      imageUrl,
      numColors
    );

    const palettes = [
      { name: "K-means Colors", colors: kmeansColors },
      { name: "K-means Weighted Colors", colors: kmeansWeightedColors },
      { name: "MMCQ Colors", colors: mmcqColors },
      { name: "MMCQ K-means Colors", colors: mmcqKmeansColors },
      {
        name: "MMCQ K-means Weighted Colors",
        colors: mmcqKmeansWeightedColors,
      },
    ];

    const imageHtml = `
      <div class="columns">
        <div class="column">
          <figure class="image">
            <img src="${imageUrl}">
          </figure>
        </div>
        <div class="column">
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
                            <div>${color}</div>
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
          </div>
        </section>
        <section class="container">
          ${imageDivs.join("\n")}
        </section>
      </body>
    </html>
  `;

  writeFileSync("color-palette.html", html);
}
