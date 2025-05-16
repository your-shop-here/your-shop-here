const SuggestModel = require('dw/suggest/SuggestModel');
const URLUtils = require('dw/web/URLUtils');

/**
 * Creates the model for search suggestions
 * @returns {Object} The model for suggestions
 */
function createModel() {
    const StringUtils = require('dw/util/StringUtils');
    const suggestModel = new SuggestModel();
    suggestModel.setSearchPhrase(request.httpParameterMap.get('q').stringValue || '');
    suggestModel.setMaxSuggestions(5); // Limit to 5 suggestions per type

    const model = {
        hasSuggestions: false,
        productSuggestions: [],
        categorySuggestions: [],
        brandSuggestions: [],
        contentSuggestions: [],
        customSuggestions: [],
        suggestedTerms: [],
    };

    // Get product suggestions
    // @todo replace with product tiles
    const productSuggestions = suggestModel.getProductSuggestions();
    if (productSuggestions) {
        model.productSuggestions = productSuggestions.getSuggestedProducts().asList().toArray()
            .map((suggestedProduct) => suggestedProduct.getProductSearchHit())
            .map((product) => ({
                name: product.getProduct().name,
                url: URLUtils.url('Product-Show', 'pid', product.productID),
                image: product.getProduct().getImage('small').url,
                price: StringUtils.formatMoney(product.minPrice),
            }));
        model.hasSuggestions = true;
    }

    // Get category suggestions
    const categorySuggestions = suggestModel.getCategorySuggestions();
    if (categorySuggestions) {
        model.categorySuggestions = categorySuggestions.getSuggestedCategories().asList().toArray()
            .map((suggestedCategory) => suggestedCategory.getCategory())
            .map((category) => ({
                name: category.displayName,
                url: URLUtils.url('Search-Show', 'cgid', category.ID),
            }));
        model.hasSuggestions = true;
    }

    // Get brand suggestions
    const brandSuggestions = suggestModel.getBrandSuggestions();
    if (brandSuggestions) {
        model.brandSuggestions = brandSuggestions.getSuggestedPhrases().asList().toArray().map((brand) => ({
            name: brand.phrase,
            url: URLUtils.url('Search-Show', 'brand', brand.phrase),
        }));
        model.hasSuggestions = true;
    }

    // Get content suggestions
    const contentSuggestions = suggestModel.getContentSuggestions();
    if (contentSuggestions) {
        model.contentSuggestions = contentSuggestions.getSuggestedContent().asList().toArray()
            .map((suggestedContent) => suggestedContent.getContent())
            .map((content) => ({
                name: content.displayName,
                url: URLUtils.url('Page-Show', 'cid', content.ID),
            }));
        model.hasSuggestions = true;
    }

    // Get custom suggestions
    const customSuggestions = suggestModel.getCustomSuggestions();
    if (customSuggestions) {
        model.customSuggestions = customSuggestions.getSuggestedPhrases().asList().toArray().map((phrase) => ({
            name: phrase,
            url: URLUtils.url('Search-Show', 'q', phrase),
        }));
        model.hasSuggestions = true;
    }

    // Get suggested terms from any suggestion type
    if (productSuggestions) {
        model.suggestedTerms = productSuggestions.getSearchPhraseSuggestions().getSuggestedPhrases().asList().toArray().map((phrase) => phrase.phrase);
    } else if (categorySuggestions) {
        model.suggestedTerms = categorySuggestions.getSearchPhraseSuggestions().getSuggestedPhrases().asList().toArray().map((phrase) => phrase.phrase);
    } else if (brandSuggestions) {
        model.suggestedTerms = brandSuggestions.getSearchPhraseSuggestions().getSuggestedPhrases().asList().toArray().map((phrase) => phrase.phrase);
    }

    return model;
}

/**
 * Renders the suggestions
 * @param {Object} model - The model for suggestions
 * @returns {string} The HTML for suggestions
 */
function template(model) {
    if (!model.hasSuggestions) {
        return '';
    }

    return `
        <div class="search-suggestions">
            ${model.suggestedTerms.length > 0 ? `
                <div class="suggestions-terms"><span>Did you mean:</span>
                    ${model.suggestedTerms.map((term) => `
                        <a href="${URLUtils.url('Search-Show', 'q', term)}" class="suggestion-term">
                            ${term}
                        </a>
                    `).join('')}
                </div>
            ` : ''}
            ${model.productSuggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h3>Products</h3>
                    <div class="suggestions-products">
                        ${model.productSuggestions.map((product) => `
                            <a href="${product.url}" class="suggestion-product">
                                <img src="${product.image}" alt="${product.name}">
                                <div class="suggestion-product-details">
                                    <div class="suggestion-product-name">${product.name}</div>
                                    <div class="suggestion-product-price">${product.price}</div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${model.categorySuggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h3>Categories</h3>
                    <div class="suggestions-categories">
                        ${model.categorySuggestions.map((category) => `
                            <a href="${category.url}" class="suggestion-category">
                                ${category.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${model.brandSuggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h3>Brands</h3>
                    <div class="suggestions-brands">
                        ${model.brandSuggestions.map((brand) => `
                            <a href="${brand.url}" class="suggestion-brand">
                                ${brand.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${model.contentSuggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h3>Content</h3>
                    <div class="suggestions-content">
                        ${model.contentSuggestions.map((content) => `
                            <a href="${content.url}" class="suggestion-content">
                                ${content.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${model.customSuggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h3>Popular Searches</h3>
                    <div class="suggestions-custom">
                        ${model.customSuggestions.map((custom) => `
                            <a href="${custom.url}" class="suggestion-custom">
                                ${custom.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

module.exports = {
    createModel,
    template,
}; 