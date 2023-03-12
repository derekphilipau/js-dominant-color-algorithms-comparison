/**
 * Perform hierarchical clustering on an array of three-dimensional points,
 * reducing the number of points to a specified number of clusters.
 * This implementation does not preserve the original points, but instead
 * returns the centroids of each cluster.
 * @param {Array<Array<number>>} points - An array of three-dimensional points
 * @param {number} numClusters - The desired number of clusters
 * @returns {Array<Array<number>>} - An array of cluster centroids
*/
export function hierarchicalClustering(points, numClusters) {
  const distances = [];
  const clusters = [];

  // Create distance matrix
  for (let i = 0; i < points.length; i++) {
    distances[i] = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        distances[i][j] = Infinity;
      } else {
        const dx = points[i][0] - points[j][0];
        const dy = points[i][1] - points[j][1];
        const dz = points[i][2] - points[j][2];
        distances[i][j] = Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
    }
    clusters[i] = [i];
  }

  while (clusters.length > numClusters) {
    // Find closest clusters
    let minDistance = Infinity;
    let c1, c2;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const dist = getDistance(clusters[i], clusters[j], distances);
        if (dist < minDistance) {
          minDistance = dist;
          c1 = i;
          c2 = j;
        }
      }
    }

    // Merge closest clusters
    clusters[c1] = clusters[c1].concat(clusters[c2]);
    clusters.splice(c2, 1);

    // Update distance matrix
    for (let i = 0; i < clusters.length; i++) {
      if (c1 !== i) {
        const dist = getDistance(clusters[c1], clusters[i], distances);
        distances[c1][i] = dist;
        distances[i][c1] = dist;
      }
      distances[c2][i] = Infinity;
      distances[i][c2] = Infinity;
    }
  }

  // Return final clusters
  return clusters.map((cluster) => {
    const sum = cluster.reduce((acc, val) => {
      acc[0] += points[val][0];
      acc[1] += points[val][1];
      acc[2] += points[val][2];
      return acc;
    }, [0, 0, 0]);
    const len = cluster.length;
    return [
      Math.round(sum[0] / len),
      Math.round(sum[1] / len),
      Math.round(sum[2] / len),
    ];
  });
}

function getDistance(cluster1, cluster2, distances) {
  let minDistance = Infinity;
  for (let i = 0; i < cluster1.length; i++) {
    for (let j = 0; j < cluster2.length; j++) {
      const distance = distances[cluster1[i]][cluster2[j]];
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
  }
  return minDistance;
}
