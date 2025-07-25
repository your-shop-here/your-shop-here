/**
 * Gets the highest list price from all price book's parent price books
 * @param {Object} priceModel - The product's price model
 * @returns {Object} The highest list price
 */
const getListPrice = (priceModel) => {
    const PriceBookMgr = require('dw/catalog/PriceBookMgr');
    const selectedCurrency = session.currency.currencyCode;
    return (PriceBookMgr.getApplicablePriceBooks().isEmpty() ? PriceBookMgr.getSitePriceBooks().toArray() : PriceBookMgr.getApplicablePriceBooks().toArray())
        .filter((priceBook) => priceBook.currencyCode === selectedCurrency)
        .map((priceBook) => (priceBook.getParentPriceBook() && priceBook.getParentPriceBook().ID))
        .filter(Boolean)
        .map((id) => priceModel.getPriceBookPrice(id))
        .sort((a, b) => a.value - b.value)
        .pop();
};

/**
 * Gets the first active promotional price for a product.
 *
 * Note: One could get all active promotional prices for a product, but in case of multiple active promotions,
 * there is no way to get the correct price in case they stack. Therefore any price is as good as any other and
 * the first one is returned.
 *
 * @param {Object} product - The product object
 * @param {Object} priceModel - The product's price model
 * @returns {Object} The first active promotional price
 */
const getPromotionalPrice = (product, priceModel) => {
    const Promotions = require('*/api/Promotions');
    const promotions = Promotions.getProductPromotions(product);
    if (promotions && promotions.length > 0) {
        const promoPrice = promotions[0].getPromotionalPrice(product);
        return promoPrice || priceModel.price;
    }
    return priceModel.price;
};

/**
 * @description PDP prices partial
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @returns {Object} The model object
 */
const createModel = (options) => {
    const StringUtils = require('dw/util/StringUtils');
    const product = options.product.master ? options.product.variants[0] : options.product;
    const priceModel = product.priceModel;

    const listPrice = getListPrice(priceModel);
    const salesPrice = getPromotionalPrice(product, priceModel);

    const model = {
        price: salesPrice && salesPrice.value < priceModel.price.value
            ? StringUtils.formatMoney(salesPrice)
            : (priceModel.price && StringUtils.formatMoney(priceModel.price)),
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
const template = (model) => `<span class="price">${model.price}</span>
${model.strikePrice ? `<span class="strike">${model.strikePrice}</span>` : ''}`;

module.exports = {
    createModel,
    template,
};
