/**
 * Renders a Product productBreadcrumbs Component
 *
 */
exports.render = function render() {
    return require('*/api/partials').create('pdp/breadcrumbs').html({
        product: request.custom.model.product,
    });
};
