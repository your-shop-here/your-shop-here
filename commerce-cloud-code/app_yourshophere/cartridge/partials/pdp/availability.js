/**
 * Creates a model for the product availability partial
 * @param {Object} options - { product }
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const Resource = require('dw/web/Resource');
    const StringUtils = require('dw/util/StringUtils');
    const product = options.product;
    const availabilityModel = product.availabilityModel;
    let message = '';
    let date = null;
    let statusClass = '';

    if (availabilityModel.isOrderable()) {
        const inventoryRecord = availabilityModel.getInventoryRecord();
        // no record but orderable means perpetual inventory
        if (!inventoryRecord || availabilityModel.inStock) {
            message = Resource.msg('availability.instock', 'translations', null);
            statusClass = 'product-availability-instock';
        } else if (inventoryRecord.preorderable) {
            message = Resource.msg('availability.preorder', 'translations', null);
            date = StringUtils.formatDate(inventoryRecord.inStockDate);
            statusClass = 'product-availability-prebackorder';
        } else if (inventoryRecord.backorderable) {
            message = Resource.msg('availability.backorder', 'translations', null);
            date = StringUtils.formatDate(inventoryRecord.inStockDate);
            statusClass = 'product-availability-prebackorder';
        } else {
            message = Resource.msg('availability.instock', 'translations', null);
            statusClass = 'product-availability-instock';
        }
    } else {
        message = Resource.msg('availability.outofstock', 'translations', null);
        statusClass = 'product-availability-outofstock';
    }

    return {
        message,
        date,
        statusClass,
    };
};

/**
 * Renders the product availability partial
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => `
    <div class="product-availability-status">
        <div class="${model.statusClass}">${model.message}</div>
        ${model.date ? `<div class="product-availability-date">${model.date}</div>` : ''}
    </div>
`;
