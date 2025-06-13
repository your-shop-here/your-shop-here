/**
 * Renders a Product productBreadcrumbs Component
 *
 */
exports.render = function render() {
    return require('*/api/partials').html('pdp/breadcrumbs')(request.custom.model.product);
};
