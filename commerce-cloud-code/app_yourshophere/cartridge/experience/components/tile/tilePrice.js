/**
 * Renders the price for the tile
 * @returns {string} The HTML template for the price component
 */
exports.render = function render() {
    const model = request.custom.model;

    return require('*/api/partials').create('tile/price').html({
        model,
    });
};
