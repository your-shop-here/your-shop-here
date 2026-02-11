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
            const source = buildSource(options.imagePath, crop, options.sourceDimensions, options.quality, options.outputFileType, options.forceWidth, options.forceHeight);
            if (source) {
                sources.push(source);
            }
        });
    }

    if (sources.length === 0) {
        const fallbackCrop = { type: 'default' };
        const source = buildSource(options.imagePath, fallbackCrop, options.sourceDimensions, options.quality, options.outputFileType, options.forceWidth, options.forceHeight);
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
        regions: options.regions || null,
        valign: options.valign,
        overlayPosition: options.overlayPosition || null,
        cssWidth: options.forceWidth ? 'auto' : '100%',
        imageId: `dis-image-${Math.random().toString(36).substr(2, 9)}`,
    };
};

/**
 * Renders a source element
 * @param {Object} source - The source object with url and optional mediaQuery
 * @returns {string} The source element HTML
 */
function renderSource(source) {
    if (source.mediaQuery) {
        return `<source srcset="${source.url}" media="${source.mediaQuery}"/>`;
    }
    return `<source srcset="${source.url}"/>`;
}

/**
 * Generates CSS media queries for aspect ratios based on sources
 * @param {Array} sources - Array of source objects with mediaQuery and aspectRatio
 * @param {string} fallbackAspectRatio - The fallback aspect ratio for mobile/default
 * @returns {string} CSS rules string with media queries for use in style tag
 */
function generateAspectRatioStyles(sources, fallbackAspectRatio) {
    const rules = [];

    // Base style for fallback (mobile/default) - applied directly to img
    if (fallbackAspectRatio) {
        rules.push(`aspect-ratio: ${fallbackAspectRatio};`);
    }

    // Generate media queries for each breakpoint
    sources.forEach((source) => {
        if (source.mediaQuery && source.aspectRatio) {
            rules.push(`@media ${source.mediaQuery} { aspect-ratio: ${source.aspectRatio}; }`);
        }
    });

    return rules.join('\n    ');
}

function generateImgStyle(cssWidth) {
    return `width: ${cssWidth}; height: auto; display: block;`;
}

/**
 * Generates shared CSS classes and image specific styles for the overlay on top of the image
 * @param {Object} overlayConfig - The overlay configuration object
 * @returns {Object} An object containing the classes and style string
 */
function generateOverlayCss(overlayConfig) {
    const classes = [];
    let style = '';
    const position = overlayConfig.position || 'middle-center';
    const padding = overlayConfig.padding || 10;
    const unit = overlayConfig.unit || overlayConfig.paddingUnit || 'percent';
    const bgColor = overlayConfig.backgroundColor || 'none';
    const transparency = overlayConfig.transparency !== undefined ? parseInt(overlayConfig.transparency, 10) : 100;

    classes.push('dis-image-overlay');
    classes.push('fg-bgcolor');
    classes.push('image-on');
    classes.push(`overlay-position-${position}`);

    // Apply padding based on position
    const paddingValue = unit === 'percent' ? `${padding}%` : `${padding}px`;
    style += `padding: ${paddingValue};`;

    // Apply background color and transparency
    if (bgColor !== 'none') {
        let bgColorVar = '';
        const opacity = transparency / 100;

        if (bgColor === 'page-background') {
            bgColorVar = 'var(--skin-background-color-1, #ffffff)';
        } else if (bgColor === 'primary-color') {
            bgColorVar = 'var(--skin-primary-color-1, #1a73e8)';
        } else if (bgColor === 'secondary-color') {
            bgColorVar = 'var(--skin-secondary-color-1, #5f6368)';
        } else if (bgColor === 'text-color') {
            bgColorVar = 'var(--skin-main-text-color-1, #202124)';
        }

        // Use CSS custom properties and pseudo-element to isolate background transparency
        // This ensures content remains fully opaque

        // @todo check if this can be done without custom properties / what happens with multiple images on the page.
        style += ` --overlay-bg-color: ${bgColorVar}; --overlay-bg-opacity: ${opacity};`;
        classes.push(' overlay-has-background');
    }

    return { classes, style };
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

    // Generate aspect ratio styles for the img element
    const aspectRatioStyles = generateAspectRatioStyles(model.sources, fallback.aspectRatio);

    const cssConfig = generateOverlayCss(model.overlayPosition);

    const pictureHtml = `
        ${aspectRatioStyles ? `
            <style>
                #${model.imageId} img {
                    ${aspectRatioStyles}
                }
            </style>
        ` : ''}
        <div class="image-component" id="${model.imageId}">
            <picture>
                ${model.sources.filter((source) => source.mediaQuery).map((source) => renderSource(source)).join('\n')}
                <img src="${fallback.url}" alt="${model.altText}" style="${generateImgStyle(model.cssWidth)}" loading="lazy" />
            </picture>
            ${model.regions.overlay.setTagName('figcaption').setClassName(cssConfig.classes.join(' ')).setAttribute('style', cssConfig.style).render()}
        </div>
        `;

    // Wrap in link if provided
    if (model.link) {
        return `<a href="${model.link}">${pictureHtml}</a>`;
    }

    return pictureHtml;
};

