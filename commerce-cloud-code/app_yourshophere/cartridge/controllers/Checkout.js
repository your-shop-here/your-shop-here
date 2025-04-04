
const server = require('server');

server.get('Show', (req, res, next) => {
    const hxPartial = request.httpParameterMap.hxpartial;
    if (hxPartial.submitted) {
        const options = { object: { forceEdit: request.httpParameterMap.forceEdit.stringValue } };
        res.renderPartial(hxPartial.stringValue, options);
    } else {
        res.page('checkout', { forceEdit: request.httpParameterMap.forceEdit.stringValue });
    }
    next();
});

server.post('SaveAddresses', (req, res, next) => {
    // @todo add csrf stuff
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const HookMgr = require('dw/system/HookMgr');
    const Form = require('api/Form');
    const form = new Form('address');
    const validationResult = form.validate(request.httpParameterMap);

    if (validationResult.ok) {
        Transaction.wrap(() => {
            const basket = BasketMgr.getCurrentOrNewBasket();
            if (!basket.billingAddress) {
                basket.createBillingAddress();
            }
            if (!basket.defaultShipment.shippingAddress) {
                basket.defaultShipment.createShippingAddress();
            }
            form.persist(basket.billingAddress, request.httpParameterMap);
            form.persist(basket.defaultShipment.shippingAddress, request.httpParameterMap);

            HookMgr.callHook('dw.order.calculate', 'calculate', basket);
        });
    } else {
        form.temp(request.httpParameterMap);
    }
    const options = { object: { forceEdit: request.httpParameterMap.forceEdit.stringValue } };

    const hxPartial = request.httpParameterMap.hxpartial;
    if (hxPartial.submitted) {
        res.renderPartial(hxPartial.stringValue, options);
        if (session.privacy.submitPartialId) {
            res.appendPartial(session.privacy.submitPartialId, { object: { outOfBandSwap: true } });
        }
    } else {
        res.page('checkout');
    }

    next();
});

server.post('SaveShipping', (req, res, next) => {
    // @todo add csrf stuff
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const HookMgr = require('dw/system/HookMgr');

    Transaction.wrap(() => {
        const basket = BasketMgr.getCurrentOrNewBasket();
        const ShippingMgr = require('dw/order/ShippingMgr');
        // @todo cant we get shipping method by id
        const allMethods = ShippingMgr.getAllShippingMethods();
        const selectedId = request.httpParameterMap.shippingmethod.stringValue;
        const shippingMethod = allMethods.toArray().find((method) => selectedId === method.ID);
        basket.defaultShipment.setShippingMethod(shippingMethod);

        HookMgr.callHook('dw.order.calculate', 'calculate', basket);
    });

    const hxPartial = request.httpParameterMap.hxpartial;
    if (hxPartial.submitted) {
        res.renderPartial(hxPartial.stringValue);
        if (session.privacy.submitPartialId) {
            res.appendPartial(session.privacy.submitPartialId, { object: { outOfBandSwap: true } });
        }
    } else {
        res.page('checkout');
    }

    next();
});

server.post('SavePayment', (req, res, next) => {
    // @todo add csrf stuff
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const HookMgr = require('dw/system/HookMgr');

    Transaction.wrap(() => {
        const basket = BasketMgr.getCurrentOrNewBasket();
        const selectedId = request.httpParameterMap.paymentmethod.stringValue;
        basket.createPaymentInstrument(selectedId, basket.totalGrossPrice);
        HookMgr.callHook('dw.order.calculate', 'calculate', basket);
    });

    const hxPartial = request.httpParameterMap.hxpartial;
    if (hxPartial.submitted) {
        res.renderPartial(hxPartial.stringValue);
        if (session.privacy.submitPartialId) {
            res.appendPartial(session.privacy.submitPartialId, { object: { outOfBandSwap: true } });
        }
    } else {
        res.page('checkout');
    }

    next();
});

server.post('Submit', (req, res, next) => {
    // @todo add csrf stuff
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const URLUtils = require('dw/web/URLUtils');
    const OrderMgr = require('dw/order/OrderMgr');
    Transaction.wrap(() => {
        const basket = BasketMgr.getCurrentOrNewBasket();
        const order = OrderMgr.createOrder(basket);
        session.privacy.placeOrderNo = order.orderNo;
    });

    res.redirect(URLUtils.url('Checkout-AsyncIntegrations'));

    next();
});

server.get('AsyncIntegrations', (req, res, next) => {
    // @todo add csrf stuff
    const Transaction = require('dw/system/Transaction');
    const URLUtils = require('dw/web/URLUtils');
    const OrderMgr = require('dw/order/OrderMgr');
    const HookMgr = require('dw/system/HookMgr');
    const order = OrderMgr.getOrder(session.privacy.placeOrderNo);

    const hasGetUrlHook = HookMgr.hasHook('dw.order.thirdParty');
    if (hasGetUrlHook) {
        const url = HookMgr.callHook('dw.order.thirdParty', 'getUrl', order);
        res.redirect(url);
    } else {
        Transaction.wrap(() => {
            OrderMgr.placeOrder(order);
            session.privacy.cartItemCount = 0;
            session.privacy.cartItemValue = 0;
        });
        res.redirect(URLUtils.url('Order-Confirm'));
    }

    next();
});

module.exports = server.exports();
