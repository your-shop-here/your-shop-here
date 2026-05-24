const HashMap = require('dw/util/HashMap');
const URLUtils = require('dw/web/URLUtils');

module.exports.get = function get(product) {
    const model = new HashMap();
    let productImage = null;
    model.url = URLUtils.url('Product-Show', 'pid', product.ID);
    let images = product.getImages('medium');

    if (!images && product.master && product.variationModel.variants.length > 0) {
        const variationProduct = product.variationModel.variants[0];
        images = variationProduct.getImages('medium');
    }
    if (images) {
        const imageIterator = images.iterator();
        if (imageIterator && imageIterator.hasNext()) {
            productImage = imageIterator.next();
        }
    }

    model.text_headline = product.getName();
    if (productImage) {
        model.image = {
            src: productImage.getAbsURL(),
            alt: productImage.getAlt(),
        };
    }

    model.isSet = product.productSet;
    model.productId = product.ID;

    const priceFactory = require('*/cartridge/scripts/factories/price');
    model.price = priceFactory.getPrice(product, null);

    const id = product.ID;
    const sum = id.split('').reduce((total, letter) => total + letter.charCodeAt(0), 0);
    const rateVal = (Math.ceil(((sum % 3) + 2) + (((sum % 10) / 10) + 0.1)));
    model.rating = (rateVal < 5 ? rateVal + (((sum % 10) * 0.1) + 0.1) : rateVal);

    return model;
};
