export default function hsvDistance(p, q) {
  const hueDistance = ((p[0] / 360) - (q[0] / 360)) ** 2; // H
  const saturationDistance = ((p[1] / 100) - (q[1] / 100)) ** 2; // S
  const valueDistance = ((p[2] / 100) - (q[2] / 100)) ** 2; // V
  return hueDistance + saturationDistance + valueDistance;
}
