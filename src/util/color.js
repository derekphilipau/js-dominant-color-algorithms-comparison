
/**
 * Calculate distance using cone model formula
 * See comparison with cylinder model here:
 * https://math.stackexchange.com/questions/4016084/how-can-i-calculate-distance-from-two-pixels-hsv
 * This cylinder model has the problem that it does not take into account
 * that all hues and saturations at (or very near) zero value are black.
 * The HSV cone (or hexagonal pyramid) described in the Wikipedia HSL and
 * HSV article might work better.
 */
export function hsvDistance(h1, s1, v1, h2, s2, v2) {
  // Convert hue values to radians (Math.cos() requirement)
  const h1rad = h1 / 180 * Math.PI;
  const h2rad = h2 / 180 * Math.PI;
  const deltaV = (v2 - v1) * (v2 - v1);
  const sv1 = (s1 * s1) * (v1 * v1);
  const sv2 = (s2 * s2) * (v2 * v2);
  const cos = 2 * s1 * s2 * v1 * v2 * Math.cos(h2rad - h1rad);
  const distance = deltaV + sv1 + sv2 - cos;
  return Math.sqrt(distance);
}