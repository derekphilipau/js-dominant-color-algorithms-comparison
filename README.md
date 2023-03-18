# dominant-color-algorithms

Comparison of various dominant color algorithms.

See the results here:

https://derekphilipau.github.io/js-dominant-color-algorithms-comparison/

This is just a playground for testing out different algorithms for extracting dominant colors from images. I've tried various techniques for improving optimization, including downsampling, shifting certain color space channels, and eliminating Lab luminance altogether. Difficult to beat the speed of the MMCQ algorithm, though.

K-means clustering using the [ml-kmeans](https://github.com/mljs/kmeans) and [node-kmeans](https://github.com/Philmod/node-kmeans) libraries. MMCQ (modified median cut quantization) algorithm from [Leptonica library](http://www.leptonica.org/color-quantization.html) in [colorquant2.c](https://github.com/DanBloomberg/leptonica/blob/master/src/colorquant2.c), later implemented in the [quantize](https://github.com/olivierlesnicki/quantize) Javascript package. (quantize is the code used in the [Color Thief](https://github.com/lokesh/color-thief) library.) [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant) also uses MMCQ. Huge shoutout to the original author of MMCQ as implemented in Leptonica, [Dan Bloomberg](https://github.com/DanBloomberg).