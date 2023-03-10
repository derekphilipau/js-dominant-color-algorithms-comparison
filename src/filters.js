


/**
 * The function takes the pixels array, along with the rounding values for H, S, and L,
 * and iterates through each pixel. For each pixel, it rounds the H, S, and L values
 * by the given rounding values, and pushes the new rounded values into a new array.
 * Finally, the function returns the new array with the more granular data.
 * Note that this function will not reduce the number of colors used in the image.
 *
 * @param {*} pixels array of HSL values for each pixel
 * @param {*} hRounding rounding values for H, S, and L
 * @param {*} sRounding rounding values for H, S, and L
 * @param {*} lRounding rounding values for H, S, and L
 * @returns new array with the more granular data
 */
function reduceGranularity(pixels, hRounding, sRounding, lRounding) {
  var result = [];
  for (var i = 0; i < pixels.length; i++) {
    var h = Math.round(pixels[i][0] / hRounding) * hRounding;
    var s = Math.round(pixels[i][1] / sRounding) * sRounding;
    var l = Math.round(pixels[i][2] / lRounding) * lRounding;
    result.push([h, s, l]);
  }
  return result;
}

/**
 * Takes an array of HSL values for each pixel along with a kernel size,
 * and returns a new array with the filtered pixel values.
 *
 * Size of the kernel can affect the smoothing effect of median filter.
 * Larger kernels will result in more smoothing, but may also
 * blur out more details in the image.
 *
 * @param {*} pixels Array of image pixels in HSL format
 * @param {*} kernelSize specifies the size of the median filter kernel (e.g., 3x3, 5x5, etc.)
 * @returns Array of median filtered pixel values
 */
function medianFilter(pixels, kernelSize) {
  var result = [];
  var halfKernel = Math.floor(kernelSize / 2);

  for (var i = 0; i < pixels.length; i++) {
    var hValues = [];
    var sValues = [];
    var lValues = [];

    // Loop through each pixel in the kernel
    for (var y = -halfKernel; y <= halfKernel; y++) {
      for (var x = -halfKernel; x <= halfKernel; x++) {
        var pixelIndex = i + (y * pixels[0].length) + x;
        if (pixelIndex >= 0 && pixelIndex < pixels.length) {
          // for each pixel,collects H, S, and L values of all pixels within the kernel around the current pixel.
          hValues.push(pixels[pixelIndex][0]);
          sValues.push(pixels[pixelIndex][1]);
          lValues.push(pixels[pixelIndex][2]);
        }
      }
    }

    // Find the median H, S, and L values in the kernel
    var medianH = findMedian(hValues);
    var medianS = findMedian(sValues);
    var medianL = findMedian(lValues);

    // Add the median pixel value to the result array
    result.push([medianH, medianS, medianL]);
  }

  return result;
}

/**
 * The findMedian function is a helper function that takes an array of values
 * and returns the median value. The medianFilter function uses this function
 * to find the median H, S, and L values in the kernel.
 *
 * @param {*} values
 * @returns
 */
function findMedian(values) {
  var sortedValues = values.slice().sort(function(a, b) { return a - b; });
  var medianIndex = Math.floor(sortedValues.length / 2);
  return sortedValues[medianIndex];
}