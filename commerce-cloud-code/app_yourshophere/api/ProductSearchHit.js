function ProductSearchHit(hit) {
    const CacheMgr = require('dw/system/CacheMgr');
    this.productCache = CacheMgr.getCache('Product');
    this.relationCache = CacheMgr.getCache('ProductRelations');
    this.object = hit;
    this.representedVariationValuesAccessCache = {};
}

ProductSearchHit.prototype.getRepresentedVariationValues = function getRepresentedVariationValues(object) {
    if (!this.representedVariationValuesAccessCache[object.toString()]) {
        this.representedVariationValuesAccessCache[object.toString()] = this.object.getRepresentedVariationValues(object).toArray();
    }
    return this.representedVariationValuesAccessCache[object.toString()];
};

exports.get = function get(apiHit, config) {
    const swatchAttribute = config.swatchAttribute;
    const instance = new ProductSearchHit(apiHit);

    Object.defineProperty(instance, 'tileInclude', {
        get: function getTileInclude() {
            const pageParams = {};
            const productGroup = this.object.product;
            const colors = this.object.getRepresentedVariationValues(swatchAttribute).iterator().asList().toArray(0, 10);

            pageParams.pid = this.mainProductId;
            pageParams.lastModified = productGroup.lastModified.getTime();

            const maxPrice = this.object.getMaxPrice();
            const minPrice = this.object.getMinPrice();

            if (maxPrice && maxPrice.isAvailable()) {
                pageParams.maxPrice = maxPrice.getValue();
            }
            if (minPrice && minPrice.isAvailable()) {
                pageParams.minPrice = minPrice.getValue();
            }

            // the colorHash is a means to inform the product tile about out-of-stock colors
            // the hitTile knows which colors are in stock hence we "hash" them
            // and add them to the tile url to force a new tile vs the cached tile
            const colorHash = colors.reduce((accumulator, attrValue) => {
                let attrNumber = attrValue.value;
                if (Number.isNaN(attrNumber)) {
                    attrNumber = attrNumber.split('').map((char) => char.charCodeAt(0)).join(0);
                }
                return accumulator + parseInt(attrNumber, 10);
            }, 0);

            pageParams.colorHash = colorHash.toString();
            pageParams.color = colors && colors.length && colors[0].value;

            const PageMgr = require('dw/experience/PageMgr');
            const HashMap = require('dw/util/HashMap');
            const aspectAttributes = new HashMap();
            aspectAttributes.product = productGroup;

            return PageMgr.renderPage('product-tile', aspectAttributes, JSON.stringify(pageParams));
        },
        configurable: true,
    });

    Object.defineProperty(instance, 'name', {
        get() {
            return this.productCache.get(`name_${this.mainProductId}_${request.locale}`, () => this.mainProduct.name);
        },
    });

    Object.defineProperty(instance, 'productId', {
        get() {
            return this.object.productID;
        },
    });

    Object.defineProperty(instance, 'product', {
        get() {
            return this.object.product;
        },
    });

    Object.defineProperty(instance, 'minPrice', {
        get() {
            return this.object.minPrice;
        },
    });

    Object.defineProperty(instance, 'maxPrice', {
        get() {
            return this.object.maxPrice;
        },
    });

    Object.defineProperty(instance, 'mainProduct', {
        get() {
            const ProductMgr = require('dw/catalog/ProductMgr');
            return ProductMgr.getProduct(this.mainProductId);
        },
    });

    // @todo make sure name fits with products sets etc
    Object.defineProperty(instance, 'mainProductId', {
        get() {
            const isSimpleProduct = (this.object.hitType === 'product' && this.object.productID === this.object.firstRepresentedProductID);
            if (this.object.hitType === 'variation_group' || isSimpleProduct) {
                return this.relationCache.get(this.object.productID, () => ((this.object.product.variant || this.object.product.variationGroup) ? this.object.product.masterProduct.ID : this.object.product.ID));
            }

            return this.object.productID;
        },
    });

    return instance;
};
