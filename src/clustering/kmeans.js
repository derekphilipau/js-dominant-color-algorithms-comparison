import { kmeans } from "ml-kmeans";

export function getKmeansPoints(points, numPoints) {
  const { centroids } = kmeans(points, numPoints, {
    initialization: 'kmeans++',
    seed: 2,
  });

  return centroids;
}