/**
 * Implementation of the Mean Shift Clustering algorithm that takes an
 * array of three-dimensional pixel colors (in RGB format) and a bandwidth
 * value as input. The function performs Mean Shift Clustering on the
 * input data to determine clusters of similar pixel colors. The bandwidth
 * value determines the radius around each point that should be considered
 * when determining the similarity of neighboring points. The function
 * returns an array of the centroid points of each cluster found.
 */
export function meanShiftClustering(points, numClusters) {
  const bandwidth = calculateBandwidth(points);
  const assignments = new Array(points.length);
  assignments.fill(-1);

  const centroids = [];

  for (let i = 0; i < points.length; i++) {
    if (assignments[i] !== -1) {
      continue;
    }

    let centroid = points[i];
    let numPoints = 0;

    while (true) {
      let sumX = 0, sumY = 0, sumZ = 0;
      let numPointsInRange = 0;

      for (let j = 0; j < points.length; j++) {
        const distance = euclideanDistance(centroid, points[j]);

        if (distance <= bandwidth) {
          sumX += points[j][0];
          sumY += points[j][1];
          sumZ += points[j][2];
          numPointsInRange++;
        }
      }

      if (numPointsInRange === 0) {
        break;
      }

      const newCentroid = [sumX / numPointsInRange, sumY / numPointsInRange, sumZ / numPointsInRange];

      if (euclideanDistance(newCentroid, centroid) < 1e-5) {
        break;
      }

      centroid = newCentroid;
    }

    centroids.push(centroid);

    for (let j = 0; j < points.length; j++) {
      const distance = euclideanDistance(centroid, points[j]);

      if (distance <= bandwidth) {
        assignments[j] = centroids.length - 1;
      }
    }
  }

  if (centroids.length > numClusters) {
    const assignmentsMap = new Map();
    for (let i = 0; i < centroids.length; i++) {
      assignmentsMap.set(i, []);
    }
    for (let i = 0; i < points.length; i++) {
      const assignment = assignments[i];
      if (assignment >= 0 && assignment < centroids.length) {
        assignmentsMap.get(assignment).push(points[i]);
      }
    }
    const sortedCentroids = [...centroids];
    sortedCentroids.sort((a, b) => {
      const aIndex = centroids.indexOf(a);
      const bIndex = centroids.indexOf(b);
      return assignmentsMap.get(bIndex).length - assignmentsMap.get(aIndex).length;
    });
    const topCentroids = sortedCentroids.slice(0, numClusters);
    for (let i = 0; i < topCentroids.length; i++) {
      const clusterPoints = assignmentsMap.get(centroids.indexOf(topCentroids[i]));
      if (clusterPoints.length > 0) {
        const sum = clusterPoints.reduce((acc, val) => {
          acc[0] += val[0];
          acc[1] += val[1];
          acc[2] += val[2];
          return acc;
        }, [0, 0, 0]);
        const len = clusterPoints.length;
        topCentroids[i] = [          Math.round(sum[0] / len),
          Math.round(sum[1] / len),
          Math.round(sum[2] / len),
        ];
      }
    }
    return topCentroids;
  }

  return centroids;
}

function calculateBandwidth(points) {
  const numDimensions = 3; // RGB has 3 dimensions
  const numPoints = points.length;

  // Calculate the mean for each dimension
  const means = points.reduce((acc, val) => {
    acc[0] += val[0];
    acc[1] += val[1];
    acc[2] += val[2];
    return acc;
  }, [0, 0, 0]).map((val) => val / numPoints);

  // Calculate the standard deviation for each dimension
  const stdevs = points.reduce((acc, val) => {
    acc[0] += (val[0] - means[0]) ** 2;
    acc[1] += (val[1] - means[1]) ** 2;
    acc[2] += (val[2] - means[2]) ** 2;
    return acc;
  }, [0, 0, 0]).map((val) => Math.sqrt(val / numPoints));

  // Calculate the starting bandwidth
  const bandwidth = stdevs.reduce((acc, val) => acc + val ** 2, 0);
  return Math.sqrt(bandwidth) / (Math.sqrt(2) * numDimensions);
}

function euclideanDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) * (a[0] - b[0]) +
    (a[1] - b[1]) * (a[1] - b[1]) +
    (a[2] - b[2]) * (a[2] - b[2])
  );
}