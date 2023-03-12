import convert from "color-convert";

// Sort based on size of each centroid's cluster
export function sortBySize(centroids, assignments) {
  const clusterCounts = centroids.map((_, i) => ({
    centroid: centroids[i],
    count: assignments.filter(j => j === i).length,
  }));
  clusterCounts.sort((a, b) => b.count - a.count);
  return clusterCounts;
}

// Convert RGB values to HSL values and add hue angle then sort
export function sortByHueAngle(centroids) {
  const clusterHueAngles = centroids.map((_, i) => ({
    centroid: centroids[i],
    hueAngle: convert.rgb.hsl(...centroids[i])?.[0], // hue angle
  }));
  clusterHueAngles.sort((a, b) => b.hueAngle - a.hueAngle);
  return clusterHueAngles;
}

// Find the color with the highest saturation
function findHighestSaturationColor(points) {
  let maxSaturation = -1;
  let maxSaturationColor = null;

  for (let i = 0; i < points.length; i++) {
    const saturation = points[i][1]; // h S v
    if (saturation > maxSaturation) {
      maxSaturation = saturation;
      maxSaturationColor = points[i];
    }
  }

  return maxSaturationColor;
}