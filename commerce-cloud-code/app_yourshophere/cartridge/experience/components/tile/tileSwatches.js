/**
 * Renders the swatches for the tile
 * @param {Object} context - The component context
 * @returns {string} The HTML template for the swatches component
 */
exports.render = function render(context) {
    const model = request.custom.model;
    model.config.put('swatchDISConfig', context.content.swatchDISConfig); // eslint-disable-line no-param-reassign
    model.config.put('swatchViewType', context.content.swatchViewType);
    return require('*/api/partials').create('tile/swatches').html({
        model,
    });
};
