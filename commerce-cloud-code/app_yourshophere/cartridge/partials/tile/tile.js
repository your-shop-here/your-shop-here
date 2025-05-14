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
exports.createModel = () => {
    const HttpSearchParams = require('api/URLSearchParams');
    const httpParams = new HttpSearchParams(request.httpParameterMap);
    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));

    const tileSearch = require('api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings.swatchDimension });
    tileSearch.search();

    const imageFilter = {
        key: componentSettings.swatchDimension,
        value: httpParams.get('color'),
    };

    const hit = tileSearch.foundProducts[0];
    const model = {};

    if (hit) {
        model.name = name.createModel(hit);
        model.image = image.createModel(hit, tileSearch, imageFilter, { imageViewType: componentSettings.imageViewType, imageDISConfig: componentSettings.imageDISConfig });
        model.price = price.createModel(hit, tileSearch, httpParams);
        model.swatches = swatches.createModel(hit, tileSearch, { swatchAttribute: componentSettings.swatchDimension });
        model.addToCartButton = require('./addtocartbutton').createModel(hit);
        model.analytics = JSON.stringify([{
            type: 'productView',
            id: hit.object.productID,
        }, {
            enrichmentTypes: [
                'viewCategory',
                'viewSearch',
            ],
            enrichmentProperty: 'products',
            value: {
                id: hit.object.productID,
                sku: '',
                altId: '',
                altIdType: '',
            },
        },
        ]);
    }

    return model;
};

/**
 * Render the product tile
 * @param {Object} model - The model for the product tile
 * @returns {string} The HTML for the product tile
 */
exports.template = (model) => `
<article data-include-url="${request.httpQueryString}" data-analytics='${model.analytics}'>
    <header>${name.template(model.name)}</header>
    <body>
        ${image.template(model.image)}
        ${price.template(model.price)}
        ${swatches.template(model.swatches)}
    </body>
    <footer>${addToCartButton.template(model.addToCartButton)}</footer>
</article>`;
