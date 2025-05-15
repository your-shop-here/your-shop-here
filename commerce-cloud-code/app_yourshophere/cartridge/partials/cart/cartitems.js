exports.createModel = function createModel(options) {
    const BasketMgr = require('dw/order/BasketMgr');
    const StringUtils = require('dw/util/StringUtils');
    const URLUtils = require('dw/web/URLUtils');
    const Resource = require('dw/web/Resource');

    const basket = BasketMgr.getCurrentBasket();

    if (!basket || basket.getProductQuantityTotal() === 0) {
        return {
            empty: true,
            items: [],
            emptyMessage: Resource.msg('cart.empty', 'translations', null),
            labels: {
                quantity: Resource.msg('cart.quantity', 'translations', null),
                product: Resource.msg('cart.product', 'translations', null),
                price: Resource.msg('cart.price', 'translations', null),
                actions: Resource.msg('cart.actions', 'translations', null),
                total: Resource.msg('label.total', 'translations', null),
                update: Resource.msg('cart.update', 'translations', null),
                delete: Resource.msg('cart.delete', 'translations', null),
            },
        };
    }

    const model = {
        empty: false,
        items: basket.productLineItems.toArray().map((item) => ({
            quantity: item.quantityValue,
            text: item.lineItemText,
            price: StringUtils.formatMoney(item.price),
            images: item.product.getImages(options.settings.imageViewType || 'small').toArray().slice(0, 1).map((image) => ({
                url: `${image.url}?${options.settings.imageDISConfig}`,
                alt: image.alt,
            })),
            pdpUrl: URLUtils.url('Product-Show', 'pid', item.productID).toString(),
            deleteUrl: URLUtils.url('Cart-Delete', 'id', item.UUID).toString(),
            updateQuantityUrl: URLUtils.url('Cart-UpdateQuantity', 'uuid', item.UUID).toString(),
            bundledItems: item.bundledProductLineItems.toArray().map((bundledProduct) => ({
                quantity: bundledProduct.quantityValue,
                text: bundledProduct.lineItemText,
                price: StringUtils.formatMoney(bundledProduct.price),
                pdpUrl: URLUtils.url('Product-Show', 'pid', bundledProduct.productID).toString(),
            })),
        })),
        merchandiseTotal: StringUtils.formatMoney(basket.adjustedMerchandizeTotalPrice),
        total: StringUtils.formatMoney(basket.totalGrossPrice),
        labels: {
            quantity: Resource.msg('cart.quantity', 'translations', null),
            product: Resource.msg('cart.product', 'translations', null),
            price: Resource.msg('cart.price', 'translations', null),
            actions: Resource.msg('cart.actions', 'translations', null),
            total: Resource.msg('label.total', 'translations', null),
            update: Resource.msg('cart.update', 'translations', null),
            delete: Resource.msg('cart.delete', 'translations', null),
        },
    };

    return model;
};

exports.template = (model) => (model.empty ? /* html */ `
    <div class="cart-error-message" role="alert">
        <p>${model.emptyMessage}</p>
    </div>
` : /* html */ `<table role="grid">
<thead>
    <tr>
        <th scope="col"></th>
        <th scope="col">${model.labels.quantity}</th>
        <th scope="col">${model.labels.product}</th>
        <th scope="col">${model.labels.price}</th>
        <th scope="col">${model.labels.actions}</th>
    </tr>
</thead>
<tbody>
${model.items.map((item) => /* html */ `<tr>
        <th scope="row"><a href="${item.pdpUrl}"
                hx-get="${item.pdpUrl}?hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-push-url="${item.pdpUrl}"
                hx-indicator=".progress">
                    ${item.images.map((image) => `<img src="${image.url}" alt="${image.alt}"/>`).join('\n')}
                </a></th>
        <td>
            <form action="${item.updateQuantityUrl}" method="post" class="quantity-form">
                <input type="number" name="quantity" value="${item.quantity}" min="1" 
                hx-post="${item.updateQuantityUrl}&hx=main"
                hx-target="main"
                hx-trigger="change"
                hx-indicator=".progress"
                hx-include="form">
                <button type="submit">${model.labels.update}</button>
            </form>
        </td>
        <td><a href="${item.pdpUrl}"
                hx-get="${item.pdpUrl}?hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-push-url="${item.pdpUrl}"
                hx-indicator=".progress">${item.text}</a>${item.bundledItems.length > 0
        ? `<div class="bundled-items-header">Includes:</div><div class="bundled-items">${item.bundledItems.map(
            (bundledItem) => `<div>${bundledItem.text}</div>`).join('\n')}</div>` : ''}</td>
        <td>${item.price}</td>
        <td><a href="${item.deleteUrl}" class="close"
                hx-get="${item.deleteUrl}&hx=main"
                hx-target="main"
                hx-trigger="click"
                hx-indicator=".progress">${model.labels.delete}</a></td>
    </tr>`).join('\n')}
</tbody>
<tfoot>
    <tr>
        <th scope="col"></th>
        <td scope="col"></td>
        <td scope="col"></td>
        <td scope="col">${model.labels.total}</td>
        <td scope="col">${model.merchandiseTotal}</td>
    </tr>
</tfoot>
</table>`);
