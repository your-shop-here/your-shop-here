/**
 * Creates the model for the Promo Code component.
 * @returns {Object} The model object.
 */
exports.createModel = () => {
    const BasketMgr = require('dw/order/BasketMgr');
    const basket = BasketMgr.getCurrentBasket();
    return {
        promoCode: basket && basket.couponLineItems.length > 0 ? basket.couponLineItems[0].couponCode : '',
        promoCodeApplied: basket && basket.couponLineItems.length > 0,
        promoCodeError: false, // Initialize promo code error to false
        addCouponUrl: require('dw/web/URLUtils').url('Cart-AddCoupon'),
        removeCouponUrl: require('dw/web/URLUtils').url('Cart-RemoveCoupon', 'index', '0'),
        promoCodeText: require('dw/web/Resource').msg('code_applied', 'translations', null),
        removeLinkText: require('dw/web/Resource').msg('remove', 'translations', null),
        promptPromoCode: require('dw/web/Resource').msg('promo_code', 'translations', null),
        applyButtonText: require('dw/web/Resource').msg('button_apply', 'translations', null),
        invalidPromoCodeText: require('dw/web/Resource').msg('code_invalid', 'translations', null),
    };
};

/**
 * Renders the Promo Code component using a string template.
 * @param {Object} model The component context
 * @returns {string} The rendered HTML.
 */
exports.template = (model) => {
    let template = '';

    if (model.promoCodeApplied) {
        template = `
            <div class="promo-code-applied">
                <p>${model.promoCodeText}: ${model.promoCode}</p>
                <a href="${model.removeCouponUrl}" class="remove-promo-code"
                    hx-get="${model.removeCouponUrl}&hx=main"
                    hx-target="main"
                    hx-trigger="click">${model.removeLinkText}</a>
            </div>
        `;
    } else {
        template = `
            <div class="promo-code-form">
                ${model.promoCodeError ? `
                    <div class="promo-code-error">
                        <p>${model.invalidPromoCodeText}</p>
                    </div>
                ` : ''}
                <form action="${model.addCouponUrl}" method="post">
                    <input type="text" name="couponCode" placeholder="${model.promptPromoCode}" value="${model.promoCode}">
                    <button type="submit" class="apply-promo-code"
                        hx-post="${model.addCouponUrl}?hx=main"
                        hx-target="main"
                        hx-include="form"
                        hx-trigger="click">${model.applyButtonText}</button>
                </form>
            </div>
        `;
    }

    return template;
};
