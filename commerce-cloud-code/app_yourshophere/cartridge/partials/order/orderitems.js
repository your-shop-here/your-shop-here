/**
 * Creates a model for the order items partial
 * @param {Object} options - The options object
 * @param {dw.order.Order} options.order - The order object to display
 * @param {Object} options.settings - The component settings
 * @param {string} [options.settings.imageViewType] - The type of image view to use
 * @param {string} [options.settings.imageDISConfig] - The DIS configuration for images
 * @param {boolean} [options.settings.showOrderNumber] - Whether to show the order number in the title
 * @param {boolean} [options.settings.showTableHeader] - Whether to show the table header
 * @returns {Object} The model object containing order details and display settings
 */
exports.createModel = function createModel(options) {
    const StringUtils = require('dw/util/StringUtils');
    const URLUtils = require('dw/web/URLUtils');
    const Resource = require('dw/web/Resource');

    const order = options.order;

    if (!order) {
        return {
            empty: true,
            items: [],
            emptyMessage: Resource.msg('order.empty', 'translations', null),
            labels: {
                quantity: Resource.msg('order.quantity', 'translations', null),
                product: Resource.msg('order.product', 'translations', null),
                price: Resource.msg('order.price', 'translations', null),
                total: Resource.msg('label.total', 'translations', null),
            },
        };
    }

    const model = {
        empty: false,
        orderNo: options.settings.showOrderNumber !== false ? order.orderNo : '',
        orderDetailsTitle: options.settings.showOrderNumber !== false
            ? Resource.msgf('order.details', 'translations', null, order.orderNo)
            : '',
        showTableHeader: options.settings.showTableHeader !== false,
        items: order.productLineItems.toArray().map((item) => ({
            quantity: item.quantityValue,
            text: item.lineItemText,
            price: StringUtils.formatMoney(item.price),
            images: item.product.getImages(options.settings.imageViewType || 'small').toArray().slice(0, 1).map((image) => ({
                url: `${image.url}?${options.settings.imageDISConfig}`,
                alt: image.alt,
            })),
            pdpUrl: options.settings.linkProducts !== false ? URLUtils.url('Product-Show', 'pid', item.productID).toString() : null,
            analyticsContribution: JSON.stringify({
                contributesTo: [
                    'beginCheckout',
                ],
                contributionOptions: { property: 'products', mode: 'array-push' },
                value: {
                    id: item.productID,
                    sku: '',
                    price: item.price.value,
                    quantity: item.quantityValue,
                },
            }),
        })),
        merchandiseTotal: options.settings.showSubtotal !== false ? StringUtils.formatMoney(order.adjustedMerchandizeTotalPrice) : null,
        total: options.settings.showSubtotal !== false ? StringUtils.formatMoney(order.totalGrossPrice) : null,
        labels: {
            quantity: Resource.msg('order.quantity', 'translations', null),
            product: Resource.msg('order.product', 'translations', null),
            price: Resource.msg('order.price', 'translations', null),
            total: Resource.msg('label.total', 'translations', null),
        },
    };

    return model;
};

/**
 * Renders the order items template
 * @param {Object} model - The model object created by createModel
 * @param {boolean} model.empty - Whether the order is empty
 * @param {string} model.emptyMessage - Message to display when order is empty
 * @param {string} model.orderDetailsTitle - The title to display for the order details
 * @param {boolean} model.showTableHeader - Whether to show the table header
 * @param {Array<Object>} model.items - Array of order line items
 * @param {string} model.merchandiseTotal - Formatted merchandise total
 * @param {string} model.total - Formatted order total
 * @param {Object} model.labels - Object containing translated labels
 * @returns {string} The rendered HTML template
 */
exports.template = (model) => (model.empty ? /* html */`
    <div class="order-error-message" role="alert">
        <p>${model.emptyMessage}</p>
    </div>
` : /* html */`<div class="order-details">
    ${model.orderDetailsTitle ? `<h2>${model.orderDetailsTitle}</h2>` : ''}
    <table role="grid">
        ${model.showTableHeader ? `<thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">${model.labels.quantity}</th>
                <th scope="col">${model.labels.product}</th>
                <th scope="col">${model.labels.price}</th>
            </tr>
        </thead>` : ''}
        <tbody>
        ${model.items.map((item) => `<tr data-analytics-contribution='${item.analyticsContribution}'>
                <th scope="row">
                    ${item.pdpUrl
        ? `<a href="${item.pdpUrl}"
                hx-get="${item.pdpUrl}?hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-push-url="${item.pdpUrl}"
                hx-indicator=".progress">
                    ${item.images.map((image) => `<img src="${image.url}" alt="${image.alt}"/>`).join('\n')}
                </a>`
        : `${item.images.map((image) => `<img src="${image.url}" alt="${image.alt}"/>`).join('\n')}`}
                </th>
                <td>${item.quantity}</td>
                <td>${item.pdpUrl
        ? `<a href="${item.pdpUrl}"
                        hx-get="${item.pdpUrl}?hx=main"
                        hx-target="main"
                        hx-trigger="click"
                        hx-push-url="${item.pdpUrl}"
                        hx-indicator=".progress">${item.text}</a></td>`
        : `${item.text}`}
                <td>${item.price}</td>
            </tr>`).join('\n')}
        </tbody>
        ${model.merchandiseTotal ? `
        <tfoot>
            <tr>
                <th scope="col"></th>
                <td scope="col"></td>
                <td scope="col">${model.labels.total}</td>
                <td scope="col">${model.merchandiseTotal}</td>
            </tr>
        </tfoot>` : ''}
    </table>
</div>`);
