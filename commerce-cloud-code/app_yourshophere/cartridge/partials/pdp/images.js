/**
 * Creates a model for the PDP images slider
 *
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @param {Object} options.settings - The settings object
 * @param {string} options.settings.viewType - The view type
 * @param {number} options.settings.imageCount - The number of images to display
 * @param {string} options.settings.displayMode - Display mode: 'carousel' or 'grid'
 * @param {string} options.settings.carouselOrientation - Carousel orientation: 'horizontal' or 'vertical'
 * @param {boolean} options.settings.showThumbnails - Whether to show thumbnails
 * @param {string} options.settings.thumbnailPosition - Thumbnail position: 'below' or 'side'
 * @param {boolean} options.settings.showDots - Whether to show navigation dots
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    let imageSource = options.product;
    if (options.product.variant || options.product.master || options.product.variationGroup) {
        imageSource = require('./variationAttributes').getVariationModel(options.product);
    }

    // Set default values for new settings
    const settings = {
        displayMode: options.settings.displayMode || 'carousel',
        carouselOrientation: options.settings.carouselOrientation || 'horizontal',
        showThumbnails: options.settings.showThumbnails !== false, // Default to true
        thumbnailPosition: options.settings.thumbnailPosition || 'bottom',
        showDots: options.settings.showDots !== false, // Default to true
        viewType: options.settings.viewType,
        imageCount: options.settings.imageCount
    };

    const images = imageSource.getImages(settings.viewType).toArray()
        .slice(0, settings.imageCount).map((image, index) => ({
            url: image.url,
            alt: image.alt,
            id: `slide-${index + 1}`,
            thumbnailUrl: image.url, // We'll use the same URL for thumbnails, could be optimized with smaller size
        }));

    const model = {
        images,
        settings,
        // Generate CSS classes based on configuration
        containerClasses: [
            'image-container',
            `display-${settings.displayMode}`,
            settings.displayMode === 'carousel' ? `orientation-${settings.carouselOrientation}` : '',
            settings.showThumbnails ? `thumbnails-${settings.thumbnailPosition}` : 'no-thumbnails',
            settings.showDots ? 'show-dots' : 'hide-dots',
        ].filter(Boolean).join(' '),
    };

    return model;
};

/**
 * Renders the PDP images slider
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = model => {
    if (model.settings.displayMode === 'grid') {
        return `
            <div class="${model.containerClasses}">
                <div class="image-grid">
                    ${model.images.map(image => `
                        <div class="grid-item">
                            <img src="${image.url}" alt="${image.alt}" loading="lazy" />
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Carousel mode
    const thumbnailsHtml = model.settings.showThumbnails ? `
        <div class="thumbnail-nav ${model.settings.thumbnailPosition}">
            ${model.images.map(image => `
                <label for="${image.id}-radio" class="thumbnail-item">
                    <img src="${image.thumbnailUrl}" alt="${image.alt}" loading="lazy" />
                </label>
            `).join('')}
        </div>
    ` : '';

    const dotsHtml = model.settings.showDots ? `
        <div class="slider-nav dots">
            ${model.images.map(image => `
                <label for="${image.id}-radio" class="nav-dot"></label>
            `).join('')}
        </div>
    ` : '';

    // Determine layout order based on thumbnail position
    const carouselId = `carousel-${Date.now()}`;
    const viewportHtml = `
        <div class="slider-viewport" id="${carouselId}">
            <ul class="slider-track">
                ${model.images.map((image, index) => `
                    <li class="slide" id="${image.id}">
                        <input type="radio" name="slider-${carouselId}" id="${image.id}-radio" ${image.id === 'slide-1' ? 'checked' : ''}>
                        <img src="${image.url}" alt="${image.alt}" loading="lazy" />
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    let layoutHtml = '';
    if (model.settings.thumbnailPosition === 'top') {
        layoutHtml = thumbnailsHtml + dotsHtml + viewportHtml;
    } else if (model.settings.thumbnailPosition === 'left') {
        layoutHtml = `
            <div class="carousel-content">
                ${thumbnailsHtml}
                <div class="carousel-main">
                    ${viewportHtml}
                    ${dotsHtml}
                </div>
            </div>
        `;
    } else if (model.settings.thumbnailPosition === 'right') {
        layoutHtml = `
            <div class="carousel-content">
                <div class="carousel-main">
                    ${viewportHtml}
                    ${dotsHtml}
                </div>
                ${thumbnailsHtml}
            </div>
        `;
    } else { // bottom (default)
        layoutHtml = viewportHtml + dotsHtml + thumbnailsHtml;
    }

    return `
        <div class="${model.containerClasses}" data-carousel="true">
            ${layoutHtml}
        </div>
    `;
};
