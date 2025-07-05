function ProductSearchModel(httpParams, config) {
    // @todo decouple from http params
    const ApiProductSearchModel = require('dw/catalog/ProductSearchModel');

    const instance = new ApiProductSearchModel();
    this.pagePosition = 0;
    this.pageSize = 24;
    this.swatchAttribute = 'yshColor';
    if (config && config.swatchAttribute) {
        this.swatchAttribute = config.swatchAttribute;
    }

    this.representedVariationValuesAccessCache = {};

    const cgid = httpParams.get('cgid');
    if (cgid) {
        instance.setCategoryID(cgid);
    }

    const productId = httpParams.get('pid');
    if (productId) {
        instance.addRefinementValues('ID', productId);
    }

    // @todo make use of http parameters consistent
    if (request.httpParameterMap.pmin.submitted) {
        instance.setPriceMin(request.httpParameterMap.pmin.doubleValue);
    }

    if (request.httpParameterMap.pmax.submitted) {
        instance.setPriceMax(request.httpParameterMap.pmax.doubleValue);
    }

    const promotionId = httpParams.get('pmid');
    if (promotionId) {
        instance.setPromotionID(promotionId);
    }

    const query = httpParams.get('q');
    if (query) {
        instance.setSearchPhrase(query);
    }

    const startParam = httpParams.get('start');
    if (startParam) {
        this.pagePosition = Number(startParam);
    }

    const sizeParam = httpParams.get('sz');
    if (sizeParam) {
        this.pageSize = Number(sizeParam);
    }

    const productRefinements = httpParams.allowList([/^prefn/]);
    productRefinements.sort();

    productRefinements.forEach((refinementAttribute, key) => {
        const refinementValue = httpParams.get(key.replace('prefn', 'prefv'));
        instance.addRefinementValues(refinementAttribute, refinementValue);
    });

    // Handle sorting rule
    const sortParam = httpParams.get('sort');
    if (sortParam) {
        const CatalogMgr = require('dw/catalog/CatalogMgr');
        const sortingRule = CatalogMgr.getSortingRule(sortParam);
        if (sortingRule) {
            instance.setSortingRule(sortingRule);
        }
    }

    Object.defineProperty(this, 'foundProducts', {
        get: function initSearchHits() {
            if (!this._viewResults) {
                const ProductSearchHit = require('*/api/ProductSearchHit');
                const PagingModel = require('dw/web/PagingModel');

                this.pagingModel = new PagingModel(this.object.productSearchHits, this.object.count);
                this.pagingModel.setStart(this.pagePosition);
                this.pagingModel.setPageSize(this.pageSize);

                this._viewResults = this.pagingModel.pageElements.asList().toArray().map((hit) => ProductSearchHit.get(hit, { swatchAttribute: this.swatchAttribute }));
            }
            return this._viewResults;
        },
    });

    Object.defineProperty(this, 'minPrice', {
        get: function getMinPrice() {
            if (!this._minPrice) {
                if (this.object.count <= this.pageSize) {
                    const minPrices = this.foundProducts.map((hit) => hit.minPrice.value);
                    this._minPrice = Math.min.apply(Math, minPrices);
                } else {
                    throw new Error('too many colors');
                }
            }
            return this._minPrice;
        },
    });

    Object.defineProperty(this, 'maxPrice', {
        get: function getMaxPrice() {
            if (!this._maxPrice) {
                if (this.object.count <= this.pageSize) {
                    const maxPrices = this.foundProducts.map((hit) => hit.maxPrice.value);
                    this._maxPrice = Math.max.apply(Math, maxPrices);
                } else {
                    throw new Error('too many colors');
                }
            }
            return this._maxPrice;
        },
    });

    Object.defineProperty(this, 'resultCount', {
        get: function getMaxPrice() {
            return this.object.count;
        },
    });

    this.object = instance;
}

ProductSearchModel.prototype.nextPageUrl = function nextPageUrl(action) {
    let url = this.object.url(action);
    url = this.pagingModel.appendPaging(url, this.pagePosition + this.pageSize);
    return url;
};
[
    'search',
    'getCategory',
    'getCategoryID',
    'getRefinements',
    'getSearchPhrase',
    'getSortingRule',
    'getEffectiveSortingRule',
    'isRefinedByCategory',
    'isCategorySearch',
    'canRelax',
    'urlRelaxCategory',
].forEach((method) => {
    ProductSearchModel.prototype[method] = function () {
        return this.object[method]();
    };
});

[
    'urlRefineCategory',
    'isRefinedByPriceRange',
    'urlRelaxPrice',
    'urlRefinePrice',
    'urlRefinePromotion',
    'isRefinedByAttributeValue',
    'urlRelaxAttributeValue',
    'urlRefineAttributeValue',
].forEach((method) => {
    ProductSearchModel.prototype[method] = function () {
        return this.object[method].apply(this.object, arguments);
    };
});

ProductSearchModel.prototype.getRepresentedVariationValues = function getRepresentedVariationValues(arg) {
    const argKey = arg.toString();
    if (!this.representedVariationValuesAccessCache[argKey]) {
        this.representedVariationValuesAccessCache[argKey] = [];
        if (this.object.count <= this.pageSize) {
            const HashSet = require('dw/util/HashSet');
            const colors = new HashSet();
            this.foundProducts.forEach((hit) => colors.add(hit.getRepresentedVariationValues(arg)));
            this.representedVariationValuesAccessCache[argKey] = colors.toArray();
        } else {
            throw new Error('too many colors');
        }
    }
    return this.representedVariationValuesAccessCache[argKey];
};

const urlAllowListBase = [
    'cgid',
    'q',
    // product refinement names and values, i.e. prefn1, prefv4
    /^pref/,
    // pmin, pmax, pmid
    /^pm/,
];

const urlAllowListPagination = urlAllowListBase.concat([
    'start',
    'sz',
]);

const urlAllowListAll = urlAllowListPagination.concat(['sort']);

exports.constants = {
    urlAllowListBase,
    urlAllowListPagination,
    urlAllowListAll,
};

exports.get = function initProductSearchModel(httpParams, config) {
    return new ProductSearchModel(httpParams, config);
};
