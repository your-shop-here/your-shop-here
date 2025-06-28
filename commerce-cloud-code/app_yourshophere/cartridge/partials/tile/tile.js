const name = require('./name');
const image = require('./image');
const price = require('./price');
const swatches = require('./swatches');
const addToCartButton = require('./addtocartbutton');

/**
 * Create a model for the product tile
 * @returns {Object} The model for the product tile
 * @todo Break out the tile into a separate components
 */
exports.createModel = (input) => {
    const HttpSearchParams = require('*/api/URLSearchParams');
    let httpParams = new HttpSearchParams(request.custom.model.renderParameters);
    if (!httpParams.get('pid')) {
        httpParams = new HttpSearchParams({ pid: request.custom.model.product.ID });
    }

    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));

    const tileSearch = require('*/api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings.swatchDimension });
    tileSearch.search();

    const imageFilter = {
        key: componentSettings.swatchDimension,
        value: httpParams.get('color'),
    };

    const hit = tileSearch.foundProducts[0];
    const model = {};
    model.regions = input.model.regions;
    if (hit) {
        model.name = name.createModel(hit);
        model.image = image.createModel({
            hit,
            search: tileSearch,
            imageFilter,
            config: {
                imageViewType: componentSettings.imageViewType,
                imageDISConfig: componentSettings.imageDISConfig,
            },
        });
        model.price = price.createModel({
            hit,
            tileSearch,
            httpParams,
        });
        model.swatches = swatches.createModel({
            hit,
            search: tileSearch,
            config: { swatchAttribute: componentSettings.swatchDimension },
        });
        model.addToCartButton = require('./addtocartbutton').createModel(hit);
        model.analytics = JSON.stringify({
            type: 'productView',
            id: hit.object.productID,
        });
        model.analyticsContribution = JSON.stringify({
            contributesTo: [
                'viewCategory',
                'viewSearch',
            ],
            contributionOptions: { property: 'products', mode: 'array-push' },
            value: {
                id: hit.object.productID,
                sku: '',
                altId: '',
                altIdType: '',
            },
        });
    }
    request.custom.partialTileModel = model;

    return model;
};

/**
 * Render the product tile
 * @param {Object} model - The model for the product tile
 * @returns {string} The HTML for the product tile
 */
exports.template = (model) => `
<article data-include-url="${request.httpQueryString}" data-analytics='${model.analytics}' data-analytics-contribution='${model.analyticsContribution}'>
    <header>${name.template(model.name)}</header>
    <body>
        ${model.regions.tileBody.render()}
        ${price.template(model.price)}
        ${swatches.template(model.swatches)}
    </body>
    <footer>${addToCartButton.template(model.addToCartButton)}</footer>
</article>`;
