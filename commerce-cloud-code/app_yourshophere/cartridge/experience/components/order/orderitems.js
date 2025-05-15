/**
 * Renders an Order Items Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 * @todo: add preview capability for editing mode
 */
exports.render = function render(context) {
    const OrderMgr = require('dw/order/OrderMgr');
    const BasketMgr = require('dw/order/BasketMgr');

    return require('*/cartridge/partials/renderer').html('order/orderitems')({
        settings: context.content,
        order: session.privacy.placeOrderNo !== 'invalid' ? OrderMgr.getOrder(session.privacy.placeOrderNo) : BasketMgr.getCurrentBasket(),
    });
};
