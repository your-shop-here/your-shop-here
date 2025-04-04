'use strict';

const server = require('server');
const Logger = require('dw/system/Logger').getLogger('Cart');

server.use('Show', (req, res, next) => {
    const BasketMgr = require('dw/order/BasketMgr');
    const HookMgr = require('dw/system/HookMgr');
    const Transaction = require('dw/system/Transaction');
    const ShippingMgr = require('dw/order/ShippingMgr');
    const HttpSearchParams = require('api/URLSearchParams');
    const basket = BasketMgr.getCurrentOrNewBasket();

    Transaction.wrap(() => {
        HookMgr.callHook('dw.order.calculate', 'calculate', basket);
    });

    const productParams = new HttpSearchParams(request.httpParameterMap);
    productParams.sort();
    const queryString = productParams.toString();

    res.page('cart', JSON.stringify({ queryString }));
    next();
});

server.use('Add', (req, res, next) => {
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const ProductMgr = require('dw/catalog/ProductMgr');
    const HookMgr = require('dw/system/HookMgr');
    const URLUtils = require('dw/web/URLUtils');

    const redirectUrl = request.httpParameterMap.hx.submitted ? URLUtils.url('Cart-Show', 'hx', request.httpParameterMap.hx.stringValue || '') : URLUtils.url('Cart-Show');
    const basket = BasketMgr.getCurrentOrNewBasket();

    const pid = req.httpParameterMap.pid.stringValue;
    const qty = req.httpParameterMap.qty.submitted ? req.httpParameterMap.qty.doubleValue : 1;
    let lineitem;
    if (pid) {
        const variationModel = require('*/cartridge/partials/pdp/variationAttributes').getVariationModel(ProductMgr.getProduct(pid));

        const product = variationModel.selectedVariant;

        lineitem = basket.getProductLineItems(product.ID).toArray().pop();
        Transaction.wrap(() => {
            if (!lineitem) {
                lineitem = basket.createProductLineItem(product.ID, basket.defaultShipment);
                lineitem.quantityValue = qty;
            } else {
                lineitem.quantityValue += qty;
            }
            // @todo fill mini cart session.privacy.cartItemCount; session.privacy.cartItemValue
            HookMgr.callHook('dw.order.calculate', 'calculate', basket);
        });
    } else {
        res.redirect(redirectUrl.append('error', 'error.product.idnotprovided'));
        return next();
    }

    if (req.httpParameterMap.hx.stringValue === 'cart-modal') {
        res.renderPartial('cart/addtocart', { object: { lineitem, basket } });
    } else {
        res.redirect('Cart-Show');
    }
    next();
});

server.use('Delete', (req, res, next) => {
    // @todo confirm with a dialog
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const HookMgr = require('dw/system/HookMgr');
    const URLUtils = require('dw/web/URLUtils');
    const redirectUrl = request.httpParameterMap.hx.submitted ? URLUtils.url('Cart-Show', 'hx', request.httpParameterMap.hx.stringValue || '') : URLUtils.url('Cart-Show');

    const basket = BasketMgr.getCurrentBasket();
    const uuid = req.httpParameterMap.id.stringValue;
    let lineitem;
    if (uuid && basket) {
        lineitem = basket.getProductLineItems().toArray().filter((item) => uuid === item.UUID).pop();
        Transaction.wrap(() => {
            if (lineitem) {
                basket.removeProductLineItem(lineitem);
            } else {
                Logger.info(`Lineitem with UUID ${uuid} not found`);
                redirectUrl.append('error', 'error.lineitem.notfound');
            }
            HookMgr.callHook('dw.order.calculate', 'calculate', basket);
        });
    } else {
        Logger.info(`Error while attempting to remove lineitem with UUID ${uuid}`);
        redirectUrl.append('error', 'error.lineitem.notremoved');
    }

    res.redirect(redirectUrl);

    return next();
});

/**
 * Handles the AJAX request for updating the quantity of a product line item in the cart.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 *
 * @returns {void}
 */
function updateQuantity(req, res, next) {
    const BasketMgr = require('dw/order/BasketMgr'); // Import BasketMgr
    const Transaction = require('dw/system/Transaction');
    const URLUtils = require('dw/web/URLUtils');
    const redirectUrl = request.httpParameterMap.hx.submitted ? URLUtils.url('Cart-Show', 'hx', request.httpParameterMap.hx.stringValue || '') : URLUtils.url('Cart-Show');

    const basket = BasketMgr.getCurrentBasket();
    const uuid = request.httpParameterMap.uuid.stringValue;
    const newQuantity = request.httpParameterMap.quantity.doubleValue;

    if (!basket) {
        res.redirect(redirectUrl.append('error', 'error.basket.missing'));
        return next();
    }

    const lineItem = basket.getAllProductLineItems().toArray().filter((lineitem) => (lineitem.UUID === uuid)).pop();

    if (!lineItem) {
        Logger.info(`No line item with UUID ${uuid} found`);
        res.redirect(redirectUrl.append('error', 'error.lineitem.notfound'));
        return next();
    }

    Transaction.wrap(() => {
        lineItem.setQuantityValue(newQuantity);

        // Manually trigger recalculation of the basket
        basket.updateTotals();
    });

    res.redirect(redirectUrl);

    return next();
}

server.use('UpdateQuantity', updateQuantity);

/**
 * Updates the shipping method of the default shipment in the current basket.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
server.use('UpdateShipping', (req, res, next) => {
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const URLUtils = require('dw/web/URLUtils');
    const ShippingMgr = require('dw/order/ShippingMgr');
    const basket = BasketMgr.getCurrentBasket();
    const shippingMethodID = req.httpParameterMap.shippingMethod.stringValue;
    const redirectUrl = request.httpParameterMap.hx.submitted ? URLUtils.url('Cart-Show', 'hx', request.httpParameterMap.hx.stringValue || '') : URLUtils.url('Cart-Show');

    if (!basket) {
        // Handle the case where there is no basket
        res.redirect(redirectUrl.append('error', 'error.basket.missing'));
        return next();
    }

    const shipment = basket.getDefaultShipment();

    if (!shipment) {
        // Handle the case where there is no shipment
        res.redirect(redirectUrl.append('error', 'error.shipment.missing'));
        return next();
    }

    if (!shippingMethodID) {
        // Handle the case where shippingMethod parameter is missing
        res.redirect(redirectUrl.append('error', 'error.shippingmethodid.missing'));
        return next();
    }

    const shippingMethod = ShippingMgr.getAllShippingMethods().toArray().filter((method) => method.ID === shippingMethodID).pop();

    if (!shippingMethod) {
        // Handle the case where the shipping method is not found
        res.redirect(redirectUrl.append('error', 'error.shippingmethod.notfound'));
        return next();
    }

    Transaction.wrap(() => {
        shipment.setShippingMethod(shippingMethod);
    });

    // Redirect to the cart page with a success message
    res.redirect(redirectUrl.append('success', 'info.shipping.updated'));
    return next();
});

server.post('AddCoupon', server.middleware.https, (req, res, next) => {
    const BasketMgr = require('dw/order/BasketMgr');
    const URLUtils = require('dw/web/URLUtils');
    const Transaction = require('dw/system/Transaction');

    const CouponStatusCodes = require('dw/campaign/CouponStatusCodes');
    const currentBasket = BasketMgr.getCurrentBasket();
    const couponCode = req.httpParameterMap.couponCode.stringValue;
    const redirectUrl = request.httpParameterMap.hx.submitted ? URLUtils.url('Cart-Show', 'hx', request.httpParameterMap.hx.stringValue || '') : URLUtils.url('Cart-Show');

    if (!currentBasket) {
        res.redirect(redirectUrl.append('error','error.basket.empty'));
        Logger.info('No basket found');
        return next();
    }

    if (!couponCode) {
        res.redirect(redirectUrl.append('error','error.couponcode.missing'));
        Logger.info('No coupon code provided');
        return next();
    }

    try {
        Transaction.wrap(() => {
            currentBasket.createCouponLineItem(couponCode, true);
        });
    } catch (e) {
        if (e.errorCode === CouponStatusCodes.COUPON_CODE_ALREADY_IN_BASKET) {
            res.redirect(redirectUrl.append('error','error.couponcode.alreadyinbasket'));
            Logger.info('Coupon code already in basket');
            return next();
        }
    }

    // If successful, redirect to the cart page
    res.redirect(redirectUrl);

    next();
});

server.get('RemoveCoupon', server.middleware.https, (req, res, next) => {
    const BasketMgr = require('dw/order/BasketMgr');
    const URLUtils = require('dw/web/URLUtils');
    const Transaction = require('dw/system/Transaction');

    const currentBasket = BasketMgr.getCurrentOrNewBasket();
    const index = req.httpParameterMap.index.intValue || 0;
    const redirectUrl = request.httpParameterMap.hx.submitted ? URLUtils.url('Cart-Show', 'hx', request.httpParameterMap.hx.stringValue || '') : URLUtils.url('Cart-Show');

    if (currentBasket.couponLineItems.length <= index) {
        res.redirect(redirectUrl.append('error','error.coupon.invalidindex'));
        Logger.info('Invalid coupon index');
        return next();
    }

    try {
        Transaction.wrap(() => {
            currentBasket.removeCouponLineItem(currentBasket.couponLineItems[index]);
        });
    } catch (e) {
        redirectUrl.append('error','error.coupon.removefailed');
        Logger.info('Failed to remove coupon');
    }

    // If successful, redirect to the cart page
    res.redirect(redirectUrl);

    next();
});

module.exports = server.exports();
