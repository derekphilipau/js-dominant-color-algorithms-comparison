/*
 *
 * This function performs hierarchical clustering on a set of 3D points while preserving the original points in the
 * clusters. It first creates a distance matrix between all pairs of points and uses this matrix to merge the closest
 * clusters until the desired number of clusters is reached. The function then calculates the center point of each
 * remaining cluster and selects the existing point in the cluster closest to the center as the representative point.
 * The function returns an array of the representative points, with one point for each remaining cluster.
 *
 * @param {Array<Array<number>>} points - An array of 3D points, each represented as an array of 3 numbers.
 * @param {number} numClusters - The desired number of clusters.
 * @returns {Array<Array<number>>} An array of representative points, with one point for each remaining cluster.
 */
export function hierarchicalClusteringPreserve(points, numClusters) {
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

  // Sort clusters by size
  const sortedClusters = clusters.sort((a, b) => a.length - b.length);

  // Return final clusters
  return sortedClusters.map((cluster) => {
    let minDistance = Infinity;
    let closestPoint;
    const clusterPoints = cluster.map((pointIndex) => points[pointIndex]);
    for (let i = 0; i < cluster.length; i++) {
      const distance = getDistanceToCenter(points[cluster[i]], clusterPoints);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = cluster[i];
      }
    }
    return points[closestPoint];
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

function getDistanceToCenter(point, cluster) {
  const center = [    cluster.reduce((sum, p) => sum + p[0], 0) / cluster.length,
    cluster.reduce((sum, p) => sum + p[1], 0) / cluster.length,
    cluster.reduce((sum, p) => sum + p[2], 0) / cluster.length,
  ];

  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  const dz = point[2] - center[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}