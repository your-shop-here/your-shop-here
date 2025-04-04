exports.createModel = function createModel() {
    const Money = require('dw/value/Money');
    const StringUtils = require('dw/util/StringUtils');
    const BasketMgr = require('dw/order/BasketMgr');
    let estimatedTotal = Money.NOT_AVAILABLE;

    const basket = BasketMgr.getCurrentBasket();

    if (basket) {
        estimatedTotal = basket.getTotalGrossPrice();
    }

    return {
        estimatedTotal: StringUtils.formatMoney(estimatedTotal),
    };
};

exports.template = model => `
    <div class="estimated-total">
        Estimated Total: ${model.estimatedTotal}
    </div>
`;
