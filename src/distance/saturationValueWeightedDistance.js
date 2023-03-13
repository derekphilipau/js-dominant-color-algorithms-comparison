export default function saturationValueWeightedDistance(p1, p2) {
  const saturation = p1[1] / 100; // [hue, saturation, value]
  const value = p1[2] / 100;
  const sqe = squaredEuclidean(p1, p2);
  const valueWeightedSqe = sqe + (Math.pow(value, 3) * sqe) + (Math.pow(saturation, 3) * sqe);
  return valueWeightedSqe;
}