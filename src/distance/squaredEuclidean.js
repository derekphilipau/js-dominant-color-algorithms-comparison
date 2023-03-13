/**
 * Same as https://github.com/mljs/distance-euclidean/blob/master/src/euclidean.ts
 */
export default function squaredEuclidean(p, q) {
  let d = 0;
  for (let i = 0; i < p.length; i++) {
    d += (p[i] - q[i]) * (p[i] - q[i]);
  }
  return d;
}