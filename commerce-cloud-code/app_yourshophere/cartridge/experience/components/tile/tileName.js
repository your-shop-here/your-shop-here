/**
 * Renders the name for the tile
 * @returns {string} The HTML template for the name component
 */
exports.render = function render() {
    const model = request.custom.model;

    return require('*/api/partials').create('tile/name').html({
        model,
    });
};
