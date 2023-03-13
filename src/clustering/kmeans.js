import { kmeans } from "ml-kmeans";
import squaredEuclidean from "../distance/squaredEuclidean.js";

export function getKmeansCentroids(points, numPoints, distanceFunction = squaredEuclidean) {
  const { clusters, centroids } = kmeans(points, numPoints, {
    initialization: 'kmeans++',
    seed: 2,
    distanceFunction
  });

  return centroids;
}

export async function getKmeansHsvDistance(points, numPoints, hsvDistance) {
  return getKmeansNode(points, numPoints, hsvDistance);
}
