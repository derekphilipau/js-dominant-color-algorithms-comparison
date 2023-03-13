import kmeans from "node-kmeans";
import squaredEuclidean from "../distance/squaredEuclidean.js";

export async function getKmeansNode(points, numPoints, distanceFunction = squaredEuclidean) {
  return new Promise((resolve, reject) => {
    kmeans.clusterize(points, {
      k: numPoints,
      seed: 0.3,
      distance: distanceFunction,
    }, (err,res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

