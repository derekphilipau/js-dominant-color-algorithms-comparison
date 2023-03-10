import { writeFileSync } from "fs";
import { getDominantColors } from "./dominant.js";
import { reduceColors } from "./quantize.js";
import { getDominantReducedColors } from "./dominantQuantize.js";

generateColorPalette(
  [
    "https://lokeshdhakar.com/projects/color-thief/image-1.e59bc3bd.jpg",
    "https://lokeshdhakar.com/projects/color-thief/image-3.919e184e.jpg",
    "https://lokeshdhakar.com/projects/color-thief/image-2.4461c1c0.jpg",
    "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size3/2021.45_PS11.jpg",
  ],
  8
);

async function generateColorPalette(imageUrls, numColors) {
  const imageDivs = [];
  for (const imageUrl of imageUrls) {
    const dominantColors = await getDominantColors(imageUrl, numColors, false);
    const dominantColorsWeighted = await getDominantColors(
      imageUrl,
      numColors,
      true
    );
    const reducedColors = await reduceColors(imageUrl, numColors);
    const dominantReducedColors = await getDominantReducedColors(
      imageUrl,
      numColors,
      true
    );

    const palettes = [
      { name: "Dominant Colors", colors: dominantColors },
      { name: "Dominant Colors Weighted", colors: dominantColorsWeighted },
      { name: "Reduced Colors", colors: reducedColors },
      { name: "Dominant Reduced Colors", colors: dominantReducedColors },
    ];

    const imageHtml = `
      <div class="row">
        <div style="display: flex;">
          <div style="margin-right: 20px;">
            <img src="${imageUrl}" width="400" height="400">
          </div>
          <div>
            ${palettes
              .map(
                (palette) =>
                  `<div>
                    <h4>${palette.name}</h4>
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
        <section>
          <h1 class="title">Dominant Image Color Algorithms</h1>
          ${imageDivs.join("\n")}
        </section>
      </body>
    </html>
  `;

  writeFileSync("color-palette.html", html);
}
