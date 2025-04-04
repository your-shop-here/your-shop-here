exports.createModel = function createModel(options) {
    const BasketMgr = require('dw/order/BasketMgr');
    const StringUtils = require('dw/util/StringUtils');
    const URLUtils = require('dw/web/URLUtils');

    const basket = BasketMgr.getCurrentBasket();

    if (!basket || basket.getProductQuantityTotal() === 0) {
        return {
            empty: true,
            items: [],
        };
    }

    const model = {
        empty: false,
        items: basket.productLineItems.toArray().map((item) => ({
            quantity: item.quantityValue,
            text: item.lineItemText,
            price: StringUtils.formatMoney(item.price),
            images: item.product.getImages(options.settings.imageViewType || 'small').toArray().slice(0, 1).map(image => ({
                url: `${image.url}?${options.settings.imageDISConfig}`,
                alt: image.alt,
            })),
            pdpUrl: URLUtils.url('Product-Show', 'pid', item.productID).toString(),
            deleteUrl: URLUtils.url('Cart-Delete', 'id', item.UUID).toString(),
            updateQuantityUrl: URLUtils.url('Cart-UpdateQuantity', 'uuid', item.UUID).toString(), // Add updateQuantityUrl
        })),
        merchandiseTotal: StringUtils.formatMoney(basket.adjustedMerchandizeTotalPrice),
        total: StringUtils.formatMoney(basket.totalGrossPrice),
    };

    return model;
};

// @TODO Localise text
exports.template = (model) => (model.empty ? 'Your cart is empty' : `<table role="grid">
<thead>
    <tr>
        <th scope="col"></th>
        <th scope="col">Quantity</th>
        <th scope="col">Product</th>
        <th scope="col">Price</th>
        <th scope="col">Actions</th>
    </tr>
</thead>
<tbody>
${model.items.map((item) => `<tr>
        <th scope="row"><a href="${item.pdpUrl}"
                hx-get="${item.pdpUrl}?hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-push-url="${item.pdpUrl}"
                hx-indicator=".progress">
                    ${item.images.map(image => `<img src="${image.url}" alt="${image.alt}"/>`).join('\n')}
                </a></th>
        <td>
            <form action="${item.updateQuantityUrl}" method="post" class="quantity-form">
                <input type="number" name="quantity" value="${item.quantity}" min="1" 
                hx-post="${item.updateQuantityUrl}&hx=main"
                hx-target="main"
                hx-trigger="change"
                hx-indicator=".progress"
                hx-include="form">
                <button type="submit">Update</button>
            </form>
        </td>
        <td><a href="${item.pdpUrl}"
                hx-get="${item.pdpUrl}?hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-push-url="${item.pdpUrl}"
                hx-indicator=".progress">${item.text}</a></td>
        <td>${item.price}</td>
        <td><a href="${item.deleteUrl}" class="close"
                hx-get="${item.deleteUrl}&hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-indicator=".progress">Delete</a></td>
    </tr>`).join('\n')}
</tbody>
<tfoot>
    <tr>
        <th scope="col"></th>
        <td scope="col"></td>
        <td scope="col"></td>
        <td scope="col">Total</td>
        <td scope="col">${model.merchandiseTotal}</td>
    </tr>
</tfoot>
</table>`);
