export function rgbToHsl(rgb) {
  const { r, g, b } = rgb;
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const maxColor = Math.max(r1, g1, b1);
  const minColor = Math.min(r1, g1, b1);
  let h,
    s,
    l = (maxColor + minColor) / 2;

  if (maxColor === minColor) {
    h = s = 0; // achromatic
  } else {
    const d = maxColor - minColor;
    s = l > 0.5 ? d / (2 - maxColor - minColor) : d / (maxColor + minColor);
    switch (maxColor) {
      case r1:
        h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
        break;
      case g1:
        h = (b1 - r1) / d + 2;
        break;
      case b1:
        h = (r1 - g1) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hDecimal = l / 100;
  const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    // Convert to Hex and prefix with "0" if required
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function rgbToHex(r, g, b) {
  const hex = ((r << 16) | (g << 8) | b).toString(16);
  return "#" + hex.padStart(6, "0");
}
