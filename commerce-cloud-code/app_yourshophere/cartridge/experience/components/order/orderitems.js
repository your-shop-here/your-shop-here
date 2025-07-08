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
    const Logger = require('dw/system/Logger');

    // use the orderNo from the runtime parameters or the session if not present
    const orderNo = request.custom.model.httpParameter.orderNo || session.privacy.placeOrderNo;

    if (!orderNo) {
        Logger.error('No orderNo found in runtime parameters or session');
        return '';
    }

    const order = orderNo !== 'invalid' ? OrderMgr.getOrder(orderNo) : BasketMgr.getCurrentBasket();

    if (request.custom.model.httpParameter.orderNo && order.customerNo !== customer.profile.customerNo) {
        Logger.error('OrderNo mismatch between runtime parameters and session, possible fraud attempt');
        throw new Error('Security violation', 'Possible unauthorized order data access attempt');
    }

    return require('*/api/partials').create('order/orderitems').html({
        settings: context.content,
        order,
    });
};
