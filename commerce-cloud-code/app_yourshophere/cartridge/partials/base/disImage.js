const ContentMgr = require('dw/content/ContentMgr');
const URLUtils = require('dw/web/URLUtils');
const BREAKPOINTS = require('*/cartridge/experience/breakpoints.json');
const getCssAspectRatio = require('*/cartridge/utils/image').getCssAspectRatio;

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
     * @returns {Object|null} Source entry
     */
function buildSourceByCrop(imagePath, crop, sourceDimensions, quality) {
    if (!crop || !crop.type) {
        return null;
    }

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

    const targetWidth = getTargetWidthForCropType(crop.type);
    const effectiveWidth = croppedWidth || (sourceDimensions && sourceDimensions.width);
    if (targetWidth && effectiveWidth && effectiveWidth > targetWidth) {
        transformationObject.scaleWidth = targetWidth;
        transformationObject.scaleMode = 'fit';
        transformationObject.format = 'jpg'; // @todo make configurable
    } else {
        transformationObject.scaleWidth = targetWidth;
        transformationObject.scaleMode = 'fit';
        transformationObject.format = 'jpg'; // @todo make configurable
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
 * Creates a model for the DIS image component
 *
 * @param {Object} options - The options object
 * @param {string} options.imagePath - The image path
 * @param {Object} options.sourceDimensions - The source image dimensions {width, height}
 * @param {number} options.quality - The image quality (1-100)
 * @param {Array} options.crops - Array of crop objects
 * @param {string} options.altText - The alt text for the image
 * @param {string} options.link - The optional link URL
 * @param {string} options.width - The width of the image
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    if (!options.imagePath) {
        return {
            sources: [],
            fallbackUrl: null,
            altText: options.altText || '',
            link: options.link || null,
            width: options.width || '100%',
        };
    }

    const sources = [];
    const hasCrops = options.crops && Array.isArray(options.crops) && options.crops.length > 0;

    if (hasCrops) {
        options.crops.forEach((crop) => {
            const source = buildSourceByCrop(options.imagePath, crop, options.sourceDimensions, options.quality);
            if (source) {
                sources.push(source);
            }
        });
    }

    if (sources.length === 0) {
        const fallbackCrop = { type: 'default' };
        const source = buildSourceByCrop(options.imagePath, fallbackCrop, options.sourceDimensions, options.quality);
        if (source) {
            sources.push(source);
        }
    }

    // Sort sources: fallback first (no media query), then tablet, then desktop
    sources.sort((a, b) => {
        // Fallback (no media query) should be first
        if (!a.mediaQuery && b.mediaQuery) return -1;
        if (a.mediaQuery && !b.mediaQuery) return 1;
        if (!a.mediaQuery && !b.mediaQuery) {
            // If both are fallback, prefer default over mobile
            if (a.isFallback && !b.isFallback) return -1;
            if (!a.isFallback && b.isFallback) return 1;
            return 0;
        }

        // Extract breakpoint values for comparison
        const tabletBreakpoint = BREAKPOINTS.mobile + 1;
        const desktopBreakpoint = BREAKPOINTS.tablet + 1;
        const aIsTablet = a.mediaQuery && a.mediaQuery.indexOf(`${tabletBreakpoint}px`) !== -1;
        const bIsTablet = b.mediaQuery && b.mediaQuery.indexOf(`${tabletBreakpoint}px`) !== -1;
        const aIsDesktop = a.mediaQuery && a.mediaQuery.indexOf(`${desktopBreakpoint}px`) !== -1;
        const bIsDesktop = b.mediaQuery && b.mediaQuery.indexOf(`${desktopBreakpoint}px`) !== -1;

        if (aIsTablet && bIsDesktop) return -1;
        if (aIsDesktop && bIsTablet) return 1;
        return 0;
    });

    return {
        sources,
        altText: options.altText || '',
        link: options.link || null,
        width: options.width || '100%',
    };
};

/**
 * Renders a source element
 * @param {Object} source - The source object with url and optional mediaQuery
 * @returns {string} The source element HTML
 */
function renderSource(source) {
    if (source.mediaQuery) {
        return `<source srcset="${source.url}" media="${source.mediaQuery}" style="${source.aspectRatio ? `aspect-ratio: ${source.aspectRatio};` : ''}"/>`;
    }
    return `<source srcset="${source.url}" style="${source.aspectRatio ? `aspect-ratio: ${source.aspectRatio};` : ''}"/>`;
}

function generateImgStyle(source) {
    return `width: 100%; height: auto; display: block; ${source.aspectRatio ? `aspect-ratio: ${source.aspectRatio};` : ''}`;
}

/**
 * Renders the DIS image component as a responsive image
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = function template(model) {
    // Don't render anything if no sources are provided
    if (!model.sources || model.sources.length === 0) {
        return '<!-- No image selected. Please select an image using the Image Manager -->';
    }

    // Fallback is the first source (sorted to be first, has no mediaQuery)
    const fallback = model.sources[0];

    const pictureHtml = `
        <picture>
            ${model.sources.filter((source) => source.mediaQuery).map((source) => renderSource(source)).join('\n')}
            <img src="${fallback.url}" alt="${model.altText}" style="${generateImgStyle(fallback)}" loading="lazy" />
        </picture>`;

    // Wrap in link if provided
    if (model.link) {
        return `<a href="${model.link}">${pictureHtml}</a>`;
    }

    return pictureHtml;
};

