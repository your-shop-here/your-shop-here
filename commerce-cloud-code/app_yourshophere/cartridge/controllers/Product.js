/**
 * @namespace Product
 */
const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');
const pageMetaData = require('*/cartridge/middleware/pageMetaData');

/**
 * @name controller/Product-Show
 */
server.get('Show', cache.applyDefaultCache, (req, res, next) => {
    const Site = require('dw/system/Site');
    const PageMgr = require('dw/experience/PageMgr');
    const ProductMgr = require('dw/catalog/ProductMgr');
    const Logger = require('*/api/Logger');
    const HashMap = require('dw/util/HashMap');

    pageMetaData.setPageMetaTags(req.pageMetaData, Site.current);
    const productId = request.httpParameterMap.pid.submitted ? request.httpParameterMap.pid.stringValue : null;
    let product = productId && ProductMgr.getProduct(productId);
    let error;

    if (!product || !product.online) {
        error = `Product with ID ${productId} could not be found, rendering notfound page`;
        Logger.error(error);
        res.render('pages/notfound', { reason: error });
        return next();
    }

    let page = PageMgr.getPageByProduct(product, true, 'product');
    const master = product.variant ? product.masterProduct : product;
    const variationGroup = product.variationGroup;
    const variationMap = new HashMap();

    // determine wether variation selection is complete and render selected variant if it is
    if (master || variationGroup) {
        const subMap = request.httpParameterMap.getParameterMap(`dwvar_${productId}_`);
        subMap.getParameterNames().toArray().forEach((variationAttribeId) => {
            const variationAttributeValue = subMap.get(variationAttribeId).stringValue;
            variationMap.put(variationAttribeId, variationAttributeValue);
        });
        const variants = product.variationModel.getVariants(variationMap).toArray();
        if (variants.length === 1) {
            product = variants.pop();
        }
    }

    if (!(page && page.isVisible())) {
        let category = master.primaryCategory;
        if (!category) {
            category = master.classificationCategory;
        }
        if (!category && master.categories && master.categories.length) {
            category = master.categories[0];
        }
        if (category) {
            page = PageMgr.getPageByCategory(category, true, 'product');
        }
    }

    if (page && page.isVisible()) {
        const aspectAttributes = new HashMap();
        aspectAttributes.product = product;

        const HttpSearchParams = require('*/api/URLSearchParams');

        // Filter out any parameters that are not required for the PDP to optimise caching
        const productParams = (new HttpSearchParams(request.httpParameterMap)).allowList(['pid', /^dwvar_.*|^dwopt_.*/]);
        productParams.sort();
        const queryString = productParams.toString();

        res.page(page.ID, JSON.stringify({ queryString }), aspectAttributes);
    } else {
        error = `No page for product ${productId} found`;
        Logger.error(error);
        res.render('pages/notfound', { reason: error });
    }

    return next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
