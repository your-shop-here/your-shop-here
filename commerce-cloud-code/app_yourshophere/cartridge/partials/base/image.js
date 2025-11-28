/**
 * Creates a model for the base image component
 *
 * @param {Object} options - The options object
 * @param {Object} options.image - The image object
 * @param {string} options.width - The width of the image
 * @param {string} options.link - The optional link URL
 * @param {Object} options.overlayRegion - The overlay region model
 * @param {string} options.overlayPosition - The overlay position
 * @param {string} options.overlayWidth - The overlay width
 * @param {string} options.overlayHeight - The overlay height
 * @param {string} options.overlayOffsetX - The horizontal offset
 * @param {string} options.overlayOffsetY - The vertical offset
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const model = {
        imageUrl: options.image.URL,
        width: options.width || '100%',
        link: options.link,
        overlayRegion: options.overlayRegion || null,
        overlayPosition: options.overlayPosition || 'center',
        overlayWidth: options.overlayWidth || 'auto',
        overlayHeight: options.overlayHeight || 'auto',
        overlayOffsetX: options.overlayOffsetX || '0px',
        overlayOffsetY: options.overlayOffsetY || '0px',
    };
    return model;
};

/**
 * Calculates CSS positioning styles for the overlay based on position and offsets
 *
 * @param {string} position - The overlay position (e.g., 'top-left', 'center', etc.)
 * @param {string} offsetX - The horizontal offset
 * @param {string} offsetY - The vertical offset
 * @returns {string} The CSS style string for positioning
 */
function calculateOverlayPosition(position, offsetX, offsetY) {
    const positions = {
        'top-left': { top: '0', left: '0', transform: 'translate(0, 0)' },
        'top-center': { top: '0', left: '50%', transform: 'translate(-50%, 0)' },
        'top-right': { top: '0', right: '0', transform: 'translate(0, 0)' },
        'center-left': { top: '50%', left: '0', transform: 'translate(0, -50%)' },
        center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        'center-right': { top: '50%', right: '0', transform: 'translate(0, -50%)' },
        'bottom-left': { bottom: '0', left: '0', transform: 'translate(0, 0)' },
        'bottom-center': { bottom: '0', left: '50%', transform: 'translate(-50%, 0)' },
        'bottom-right': { bottom: '0', right: '0', transform: 'translate(0, 0)' },
    };

    const pos = positions[position] || positions.center;
    let style = 'position: absolute;';

    // Set position properties
    if (pos.top !== undefined) style += ` top: ${pos.top};`;
    if (pos.bottom !== undefined) style += ` bottom: ${pos.bottom};`;
    if (pos.left !== undefined) style += ` left: ${pos.left};`;
    if (pos.right !== undefined) style += ` right: ${pos.right};`;

    // Apply transform and offsets
    // Parse offsets
    const offsetXNum = parseFloat(offsetX) || 0;
    const offsetYNum = parseFloat(offsetY) || 0;
    const offsetXMatch = offsetX.match(/[0-9.-]+(.*)/);
    const offsetYMatch = offsetY.match(/[0-9.-]+(.*)/);
    const offsetXUnit = (offsetXMatch && offsetXMatch[1]) || 'px';
    const offsetYUnit = (offsetYMatch && offsetYMatch[1]) || 'px';

    // Adjust transform to include offsets
    // Handle percentage-based transforms separately from pixel offsets
    const transformMatch = pos.transform.match(/translate\(([^)]+)\)/);
    if (transformMatch) {
        const existingTransform = transformMatch[1];
        const parts = existingTransform.split(',').map((part) => part.trim());
        const existingX = parts[0];
        const existingY = parts[1];

        // Check if existing transform uses percentages
        const xIsPercent = existingX.indexOf('%') !== -1;
        const yIsPercent = existingY.indexOf('%') !== -1;

        let newX; let newY;
        let xPercent; let yPercent;
        if (xIsPercent && offsetXUnit === 'px') {
            // Mix percentage and pixels using calc()
            xPercent = existingX.replace('%', '');
            newX = `calc(${xPercent}% + ${offsetXNum}${offsetXUnit})`;
        } else if (xIsPercent) {
            // Both are percentages, can add them
            xPercent = parseFloat(existingX) || 0;
            newX = `${xPercent + offsetXNum}%`;
        } else {
            // Both are pixels or other units
            const xNum = parseFloat(existingX) || 0;
            newX = (xNum + offsetXNum) + offsetXUnit;
        }

        if (yIsPercent && offsetYUnit === 'px') {
            // Mix percentage and pixels using calc()
            yPercent = existingY.replace('%', '');
            newY = `calc(${yPercent}% + ${offsetYNum}${offsetYUnit})`;
        } else if (yIsPercent) {
            // Both are percentages, can add them
            yPercent = parseFloat(existingY) || 0;
            newY = `${yPercent + offsetYNum}%`;
        } else {
            // Both are pixels or other units
            const yNum = parseFloat(existingY) || 0;
            newY = (yNum + offsetYNum) + offsetYUnit;
        }

        style += ` transform: translate(${newX}, ${newY});`;
    } else {
        style += ` transform: translate(${offsetXNum}${offsetXUnit}, ${offsetYNum}${offsetYUnit});`;
    }

    return style;
}

/**
 * Renders the base image component
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => {
    const imageHtml = `<img src="${model.imageUrl}" style="width:${model.width}; margin-left:auto;"/>`;

    let imageContainer = imageHtml;
    if (model.link) {
        imageContainer = `<a href="${model.link}">${imageHtml}</a>`;
    }

    // If there's an overlay region, wrap everything in a relative container
    if (model.overlayRegion) {
        const overlayStyle = calculateOverlayPosition(
            model.overlayPosition,
            model.overlayOffsetX,
            model.overlayOffsetY,
        );

        const overlayWidth = model.overlayWidth !== 'auto' ? `width: ${model.overlayWidth};` : '';
        const overlayHeight = model.overlayHeight !== 'auto' ? `height: ${model.overlayHeight};` : '';

        const overlayHtml = model.overlayRegion.render();

        return `<div style="position: relative; display: inline-block;">
            ${imageContainer}
            <div style="${overlayStyle} ${overlayWidth} ${overlayHeight}">
                ${overlayHtml}
            </div>
        </div>`;
    }

    return imageContainer;
};
