
const BREAKPOINTS = require('*/cartridge/experience/breakpoints.json');
const buildSource = require('*/cartridge/utils/image').buildSource;

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
        overlayRegion: options.regions.overlay || null,
        valign: options.valign,
        cssWidth: options.forceWidth ? 'auto' : '100%',
    };
};

/**
 * Generates CSS media queries for aspect ratios based on sources
 * @param {Array} sources - Array of source objects with mediaQuery and aspectRatio
 * @param {string} fallbackAspectRatio - The fallback aspect ratio for mobile/default
 * @returns {string} CSS rules string with media queries for use in style tag
 */
function generateAspectRatioStyles(sources, fallbackAspectRatio) {
    // @todo inline to template function
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
    // @todo inline to template function
    return `width: ${cssWidth}; height: auto; display: block;`;
}

/**
 * Renders the DIS image component as a responsive image
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = function template(model) {
    // Don't render anything if no sources are provided
    // @todo harmonize with other template functions. I.e. more ternaries, less variables etc.
    if (!model.sources || model.sources.length === 0) {
        return '<!-- No image selected. Please select an image using the Image Manager -->';
    }

    // Fallback is the first source (sorted to be first, has no mediaQuery)
    const fallback = model.sources[0];

    // Generate aspect ratio styles for the img element
    const aspectRatioStyles = generateAspectRatioStyles(model.sources, fallback.aspectRatio);

    // Create a unique ID for this image component to scope the styles
    const imageId = `dis-image-${Math.random().toString(36).substr(2, 9)}`;

    // Generate style tag with media queries for aspect ratios
    const styleTag = aspectRatioStyles ? `
        <style>
            #${imageId} img {
                ${aspectRatioStyles}
            }
        </style>
    ` : '';

    const pictureHtml = `
    ${styleTag}
    <div class="image-component" id="${imageId}">
        <picture>
            ${model.sources.filter((source) => source.mediaQuery).map((source) => (source.mediaQuery ? `<source srcset="${source.url}" media="${source.mediaQuery}"/>` : `<source srcset="${source.url}"/>`)).join('\n')}
            <img src="${fallback.url}" alt="${model.altText}" style="${generateImgStyle(model.cssWidth)}" loading="lazy" />
            </picture>
            ${model.overlayRegion.setTagName('figcaption').setClassName(`dis-image-overlay fg-bgcolor image-on valign-${model.valign}`).render()}
        </div>
        `;

    // Wrap in link if provided
    if (model.link) {
        return `<a href="${model.link}">${pictureHtml}</a>`;
    }

    return pictureHtml;
};

