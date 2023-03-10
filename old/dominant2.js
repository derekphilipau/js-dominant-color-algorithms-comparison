import getPixels from "get-pixels";

export async function getDominantColors(imageUrl, numColors) {
  return new Promise((resolve, reject) => {
    getPixels(imageUrl, (err, pixels) => {
      if (err) {
        reject(err);
        return;
      }

      const colorCounts = new Map();
      const maxColors = Math.min(pixels.shape[0] * pixels.shape[1], 32768);
      // Restrict the number of pixels to be processed to 32k
      const pixelStep = Math.max(1, Math.floor(pixels.data.length / maxColors));

      // Count color occurrences
      for (let i = 0; i < pixels.data.length; i += 4 * pixelStep) {
        const r = pixels.data[i];
        const g = pixels.data[i + 1];
        const b = pixels.data[i + 2];
        const a = pixels.data[i + 3];
        // Ignore fully transparent pixels
        if (a < 255) continue;
        const rgb = (r << 16) + (g << 8) + b;
        const count = colorCounts.get(rgb) || 0;
        colorCounts.set(rgb, count + 1);
      }

      // Sort colors by frequency
      const sortedColors = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([rgb]) => rgb);

      // Group colors
      const numGroups = Math.min(numColors, sortedColors.length);
      const numColorsPerGroup = Math.floor(sortedColors.length / numGroups);
      const remainder = sortedColors.length % numGroups;
      let groupSize, startIndex;
      const groups = [];
      for (let i = 0; i < numGroups; i++) {
        groupSize = numColorsPerGroup + (i < remainder ? 1 : 0);
        startIndex = i * numColorsPerGroup + Math.min(i, remainder);
        groups.push(
          getAverageColor(
            sortedColors.slice(startIndex, startIndex + groupSize)
          )
        );
      }

      resolve(groups);
    });
  });
}

function getAverageColor(colors) {
  const numColors = colors.length;
  let rTotal = 0,
    gTotal = 0,
    bTotal = 0;
  for (let i = 0; i < numColors; i++) {
    rTotal += colors[i] >> 16;
    gTotal += (colors[i] >> 8) & 0xff;
    bTotal += colors[i] & 0xff;
  }
  const rAverage = Math.round(rTotal / numColors);
  const gAverage = Math.round(gTotal / numColors);
  const bAverage = Math.round(bTotal / numColors);
  return (rAverage << 16) + (gAverage << 8) + bAverage;
}
