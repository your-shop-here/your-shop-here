/**
 * @description PDP prices partial
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const StringUtils = require('dw/util/StringUtils');
    const PromotionMgr = require('dw/campaign/PromotionMgr');
    const PriceBookMgr = require('dw/catalog/PriceBookMgr');
    const product = options.product.master ? options.product.variants[0] : options.product;
    const priceModel = product.priceModel;

    // find all list prices and use the highest one
    const listPrices = PriceBookMgr.getSitePriceBooks().toArray()
        .map((priceBook) => (priceBook.getParentPriceBook() && priceBook.getParentPriceBook().ID))
        .filter((id) => id !== null)
        .map((id) => priceModel.getPriceBookPrice(id));
    listPrices.sort((a, b) => a.value - b.value);
    const listPrice = listPrices.pop();

    // @todo optimise performance for getActiveCustomerPromotions calls
    const promotions = PromotionMgr.getActiveCustomerPromotions().getProductPromotions(product);
    let salesPrice = priceModel.price;
    if (promotions && promotions.length > 0) {
        salesPrice = promotions.toArray().reduce((lowestPrice, promo) => {
            const promoPrice = promo.getPromotionalPrice(product);
            return !lowestPrice || (promoPrice && promoPrice.value < lowestPrice.value) ? promoPrice : lowestPrice;
        }, priceModel.price);
    }

    const model = {
        price: salesPrice && salesPrice.value < priceModel.price.value
            ? StringUtils.formatMoney(salesPrice)
            : StringUtils.formatMoney(priceModel.price),
        strikePrice: listPrice && listPrice.value !== priceModel.price.value
            ? StringUtils.formatMoney(listPrice)
            : null,
    };

    return model;
};

/**
 * @description PDP prices template
 * @param {Object} model - The model object
 * @returns {string} The template string
 */
exports.template = (model) => `<span class="price">${model.price}</span>
${model.strikePrice ? `<span class="strike">${model.strikePrice}</span>` : ''}`;
