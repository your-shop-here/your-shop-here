const server = require('server');

/**
 * Copies all fields and custom fields from a customer address to the basket's billing and shipping addresses.
 * Used for both checkout initialization and when selecting an address from the address book.
 * @todo when checkout is fully implemented, we should move this to a utility library
 *
 * @param {dw.customer.CustomerAddress} customerAddress - The source customer address to copy from.
 * @param {dw.order.Basket} basket - The target basket to copy the address into.
 */
function copyCustomerAddressToBasket(customerAddress, basket) {
    if (!customerAddress || !basket) return;
    const billingAddress = basket.createBillingAddress();
    const shippingAddress = basket.defaultShipment.createShippingAddress();
    const customerAddressKeys = Object.keys(customerAddress);
    customerAddressKeys.forEach((key) => {
        try {
            billingAddress[key] = customerAddress[key];
            shippingAddress[key] = customerAddress[key];
        } catch (e) {
            require('dw/system/Logger').error(`Error setting billing address key: ${e.message}`);
        }
    });
    const customerCustomAddressKeys = Object.keys(customerAddress.custom);
    customerCustomAddressKeys.forEach((key) => {
        try {
            billingAddress.custom[key] = customerAddress.custom[key];
            shippingAddress.custom[key] = customerAddress.custom[key];
        } catch (e) {
            require('dw/system/Logger').error(`Error setting billing address custom key: ${e.message}`);
        }
    });
}

/**
 * Initializes the checkout process by pre-filling the basket's billing and shipping addresses
 * with the customer's preferred or first address, if the customer is registered and no billing address exists yet.
 * @todo when checkout is fully implemented, we should move this to a utility library
 *
 * @param {dw.order.Basket} currentBasket - The current basket to initialize addresses for.
 */
function initializeCheckout(currentBasket) {
    const Transaction = require('dw/system/Transaction');
    if (!currentBasket.billingAddress && customer.isRegistered()) {
        const addressBook = customer.getProfile().getAddressBook();
        if (addressBook.getAddresses().size() > 0) {
            const customerAddress = addressBook.getPreferredAddress() || addressBook.getAddresses().get(0);
            Transaction.wrap(() => {
                copyCustomerAddressToBasket(customerAddress, currentBasket);
            });
        }
    }
}

server.get('Show', (req, res, next) => {
    const BasketMgr = require('dw/order/BasketMgr');
    const currentBasket = BasketMgr.getCurrentBasket();

    initializeCheckout(currentBasket);

    const URLUtils = require('dw/web/URLUtils');
    session.privacy.placeOrderNo = 'invalid';
    // If the basket is empty, redirect to the cart page
    if (!currentBasket || currentBasket.getAllProductLineItems().empty) {
        res.redirect(URLUtils.url('Cart-Show'));
        return next();
    }
    session.privacy.loginRedirectUrl = URLUtils.url('Checkout-Show').toString();
    const hxPartial = request.httpParameterMap.hxpartial;
    if (hxPartial.submitted) {
        const options = {
            object: {
                forceEdit: request.httpParameterMap.forceEdit.stringValue,
                newAddress: request.httpParameterMap.new.booleanValue,
            },
        };
        res.renderPartial(hxPartial.stringValue, options);
    } else {
        res.page('checkout', {
            forceEdit: request.httpParameterMap.forceEdit.stringValue,
            newAddress: request.httpParameterMap.new.booleanValue,
        });
    }
    return next();
});

server.post('SaveAddresses', (req, res, next) => {
    // @todo add csrf stuff
    const BasketMgr = require('dw/order/BasketMgr');
    const Transaction = require('dw/system/Transaction');
    const HookMgr = require('dw/system/HookMgr');
    const Form = require('api/Form');
    const form = new Form('address');
    const basket = BasketMgr.getCurrentOrNewBasket();
    let validationResult = null;
    const outOfBandSwaps = [];
    if (session.privacy.submitPartialId) {
        outOfBandSwaps.push(session.privacy.submitPartialId);
    }

    if (request.httpParameterMap.addressId.stringValue) {
        if (!customer.isRegistered()) {
            throw new Error('Unauthorized');
        }
        const addressBook = customer.getProfile().getAddressBook();
        const customerAddress = addressBook.getAddress(request.httpParameterMap.addressId.stringValue);
        Transaction.wrap(() => {
            copyCustomerAddressToBasket(customerAddress, basket);
            outOfBandSwaps.push('checkout/addresses');
        });
    } else {
        validationResult = form.validate(request.httpParameterMap);
        if (validationResult.ok) {
            Transaction.wrap(() => {
                if (!basket.billingAddress) {
                    basket.createBillingAddress();
                }

                if (!basket.defaultShipment.shippingAddress) {
                    basket.defaultShipment.createShippingAddress();
                }
                form.persist(basket.billingAddress, request.httpParameterMap);
                form.persist(basket.defaultShipment.shippingAddress, request.httpParameterMap);

                HookMgr.callHook('dw.order.calculate', 'calculate', basket);

                if (customer.isAuthenticated()) {
                    const addressBook = customer.getProfile().getAddressBook();
                    const firstAddresses = addressBook.getAddresses().slice(0, 5);
                    let hasAddressAlready = false;
                    firstAddresses.toArray().forEach((address) => {
                        if (address.isEquivalentAddress(basket.billingAddress)) {
                            hasAddressAlready = true;
                        }
                    });
                    if (!hasAddressAlready) {
                        const customerAddress = addressBook.createAddress(`ysh-address-${(new Date()).toISOString()}`);
                        form.persist(customerAddress, request.httpParameterMap);
                    }
                }
            });
        } else {
            form.temp(request.httpParameterMap);
        }
    }
    const invalidFields = validationResult ? validationResult.invalidFields : [];
    const options = {
        object: {
            forceEdit: request.httpParameterMap.forceEdit.stringValue,
            newAddress: request.httpParameterMap.new.booleanValue,
            addressValidation: { invalidFields },
        },
    };

    const hxPartial = request.httpParameterMap.hxpartial;
    if (hxPartial.submitted) {
        res.renderPartial(hxPartial.stringValue, options);
        outOfBandSwaps.forEach((partialId) => {
            res.appendPartial(partialId, { object: { outOfBandSwap: true }, addressValidation: { invalidFields } });
        });
    } else {
        res.page('checkout', { addressValidation: { invalidFields } });
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
