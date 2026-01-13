
const BREAKPOINTS = require('*/cartridge/experience/breakpoints.json');

/**
 * Maps crop types to media query breakpoints
 * @param {string} cropType - The crop type (e.g., 'default', 'tablet', 'desktop')
 * @returns {string|null} Media query string or null for default/fallback
 */
function getMediaQueryForCropType(cropType) {
    const breakpointWidths = {
        mobile: BREAKPOINTS.mobile,
        default: BREAKPOINTS.mobile, // Default uses mobile breakpoint
        tablet: BREAKPOINTS.tablet,
        desktop: BREAKPOINTS.desktop,
    };

    const width = breakpointWidths[cropType];
    if (!width) {
        return null; // Fallback, no media query
    }

    // Generate media query based on breakpoint width
    // Mobile/default: no query (fallback)
    // Tablet: min-width of tablet breakpoint
    // Desktop: min-width of desktop breakpoint
    if (cropType === 'mobile' || cropType === 'default') {
        return null;
    }
    if (cropType === 'tablet') {
        return `(min-width: ${BREAKPOINTS.mobile + 1}px)`;
    }
    if (cropType === 'desktop') {
        return `(min-width: ${BREAKPOINTS.tablet + 1}px)`;
    }

    return null;
}

/**
 * Gets the target width for scaling based on crop type
 * @param {string} cropType - The crop type
 * @returns {number|null} Target width in pixels or null if no scaling needed
 */
function getTargetWidthForCropType(cropType) {
    const breakpointWidths = {
        mobile: BREAKPOINTS.mobile,
        default: BREAKPOINTS.mobile,
        tablet: BREAKPOINTS.tablet,
        desktop: BREAKPOINTS.desktop,
    };

    return breakpointWidths[cropType] || null;
}

/**
     * Calculate aspect ratio for a crop or fall back to source dimensions
     * @param {Object} crop - Crop object
     * @param {Object} sourceDimensions - Source dimensions
     * @returns {string|null} CSS aspect ratio string
     */
function calculateAspectRatio(crop, sourceDimensions) {
    if (crop.aspectRatio) {
        return `${crop.aspectRatio.w} / ${crop.aspectRatio.h}`;
    }

    if (crop && crop.sizePercent) {
        const cropWidth = crop.sizePercent.width || 0;
        const cropHeight = crop.sizePercent.height || 0;
        if (cropWidth > 0 && cropHeight > 0) {
            return getCssAspectRatio(cropWidth, cropHeight);
        }
    }

    if (sourceDimensions) {
        const sourceWidth = sourceDimensions.width || 0;
        const sourceHeight = sourceDimensions.height || 0;
        if (sourceWidth > 0 && sourceHeight > 0) {
            return getCssAspectRatio(sourceWidth, sourceHeight);
        }
    }

    return null;
}

/**
     * Build a source entry from a crop in a single pass
     * @param {Object} crop - Crop definition
     * @param {Object} sourceDimensions - Source dimensions
     * @param {number} quality - The image quality (1-100)
     * @param {string} outputFileType - The output file type
     * @param {number} forceWidth - The force width
     * @param {number} forceHeight - The force height
     * @returns {Object|null} Source entry
     */
function buildSource(imagePath, crop, sourceDimensions, quality, outputFileType, forceWidth, forceHeight) {
    if (!crop || !crop.type) {
        return null;
    }
    const URLUtils = require('dw/web/URLUtils');
    const ContentMgr = require('dw/content/ContentMgr');

    const transformationObject = {};
    let croppedWidth = null;

    if (crop.topLeft && crop.sizePercent && sourceDimensions) {
        const cropX = (crop.topLeft.x / 100) * sourceDimensions.width;
        const cropY = (crop.topLeft.y / 100) * sourceDimensions.height;
        const croppedHeight = (crop.sizePercent.height / 100) * sourceDimensions.height;
        croppedWidth = (crop.sizePercent.width / 100) * sourceDimensions.width;

        transformationObject.cropX = cropX;
        transformationObject.cropY = cropY;
        transformationObject.cropWidth = croppedWidth;
        transformationObject.cropHeight = croppedHeight;
    }
    transformationObject.format = outputFileType;

    const targetWidth = getTargetWidthForCropType(crop.type);
    const effectiveWidth = croppedWidth || (sourceDimensions && sourceDimensions.width);
    if (targetWidth && effectiveWidth && effectiveWidth > targetWidth) {
        transformationObject.scaleWidth = targetWidth;
        transformationObject.scaleMode = 'fit';
    } else {
        transformationObject.scaleWidth = targetWidth;
        transformationObject.scaleMode = 'fit';
    }

    if (forceWidth || forceHeight) {
        transformationObject.scaleMode = 'fit';
    }
    if (forceWidth) {
        transformationObject.scaleWidth = forceWidth;
    }
    if (forceHeight) {
        transformationObject.scaleHeight = forceHeight;
    }

    if (quality) {
        transformationObject.quality = quality;
    }
    const siteLibrary = ContentMgr.getSiteLibrary();

    const url = URLUtils.httpsImage(
        URLUtils.CONTEXT_LIBRARY,
        siteLibrary.ID,
        imagePath,
        transformationObject,
    );

    return {
        url,
        transformationObject,
        mediaQuery: getMediaQueryForCropType(crop.type),
        aspectRatio: calculateAspectRatio(crop, sourceDimensions),
        isFallback: crop.type === 'default' || crop.type === 'mobile',
    };
}

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
    buildSource,
};
