/**
 * Calculates the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 *
 * @param {number} a - The first non-negative integer.
 * @param {number} b - The second non-negative integer.
 * @returns {number} The greatest common divisor of `a` and `b`.
 */
function greatestCommonDivisor(a, b) {
    return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/**
 * Calculates the simplified aspect ratio for CSS `aspect-ratio` property from given width and height.
 * The aspect ratio is returned in the format "width / height".
 *
 * @param {number} sw - The original width. Must be a positive number.
 * @param {number} sh - The original height. Must be a positive number.
 * @returns {string|null} A string representing the simplified aspect ratio (e.g., "16 / 9")
 * or `null` if `sw` or `sh` are zero or negative.
 */
function getCssAspectRatio(sw, sh) {
    if (sw <= 0 || sh <= 0) {
        return null;
    }

    // @todo Consider caching the result of greatestCommonDivisor if this function is called
    // very frequently with the same sw/sh pairs and performance is critical.
    // For most web applications, the overhead of calculating GCD on demand is negligible.
    const commonDivisor = greatestCommonDivisor(sw, sh);
    const simplifiedWidth = sw / commonDivisor;
    const simplifiedHeight = sh / commonDivisor;

    return `${simplifiedWidth} / ${simplifiedHeight}`;
}

module.exports = {
    getCssAspectRatio,
};
