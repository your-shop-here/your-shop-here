/**
 * Renders a Product productBreadcrumbs Component
 *
 */
exports.render = function render() {
    return require('*/api/partials').create('pdp/breadcrumbs').html(request.custom.model.product);
};
