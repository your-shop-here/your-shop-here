/**
 * Creates a model for search refinements
 * @returns {Object} Object containing refinement data including:
 * - refinements: Array of refinement objects with:
 *   - id: {String} Attribute ID of the refinement
 *   - name: {String} Display name of the refinement
 *   - category: {Boolean} Whether this is a category refinement
 *   - price: {Boolean} Whether this is a price refinement
 *   - promotions: {Boolean} Whether this is a promotions refinement
 *   - values: {Array} Array of refinement values containing:
 *     - id: {String} ID of the refinement value
 *     - value: {String} Value of the refinement
 *     - displayValue: {String} Display value
 *     - url: {String} URL to apply/remove this refinement
 *     - cssClasses: {Array} CSS classes to apply
 */

exports.createModel = () => {
    const Resource = require('dw/web/Resource');

    const searchModel = models.get('search').init({ cgid: request.httpParameterMap.cgid.stringValue });
    searchModel.search();

    const category = searchModel.getCategory();
    const refinements = searchModel.getRefinements();
    const parameterMap = request.httpParameterMap;

    // @TODO implement color swatches
    return {
        refinements: refinements.getRefinementDefinitions().toArray().map((refinement) => {
            let refinementValues = [];
            if (refinement.categoryRefinement) {
                refinementValues = refinements.getNextLevelCategoryRefinementValues(category).toArray();
            } else {
                refinementValues = refinements.getRefinementValues(refinement).toArray();
            }

            return {
                id: refinement.getAttributeID(),
                name: refinement.getDisplayName(),
                category: refinement.categoryRefinement,
                price: refinement.priceRefinement,
                promotions: refinement.promotionRefinement,
                cutoff: refinement.getCutoffThreshold(),
                values: refinementValues.map((refinementValue) => {
                    let url = '';
                    const cssClasses = [];
                    if (refinement.categoryRefinement) {
                        if (searchModel.isRefinedByCategory() && searchModel.canRelax() && parameterMap.cgid.value === refinementValue.getValue()) {
                            url = searchModel.urlRelaxCategory('Search-Show');
                            cssClasses.push('selected');
                        } else {
                            url = searchModel.urlRefineCategory('Search-Show', refinementValue.getValue());
                        }
                    } else if (refinement.priceRefinement) {
                        if (searchModel.isRefinedByPriceRange(refinementValue.getValueFrom(), refinementValue.getValueTo())) {
                            url = searchModel.urlRelaxPrice('Search-Show');
                            cssClasses.push('selected');
                        } else {
                            url = searchModel.urlRefinePrice('Search-Show', refinementValue.getValueFrom(), refinementValue.getValueTo());
                        }
                    } else if (refinement.promotionRefinement) {
                        // url = searchModel.urlRefinePrice('Search-Show',refinementValue.getValueFrom(),refinementValue.getValueTo());
                    } else if (refinement.attributeRefinement) {
                        if (searchModel.isRefinedByAttributeValue(refinementValue.getID(), refinementValue.getValue())) {
                            url = searchModel.urlRelaxAttributeValue('Search-Show', refinementValue.getID(), refinementValue.getValue());
                            cssClasses.push('selected');
                        }
                        url = searchModel.urlRefineAttributeValue('Search-Show', refinementValue.getID(), refinementValue.getValue());
                    } else {
                        throw new Error('Unexpected Refinement Type');
                    }
                    return {
                        id: refinementValue.getValue(),
                        name: refinementValue.getDisplayValue(),
                        hitCount: refinementValue.getHitCount(),
                        url: url.toString(),
                        hxUrl: url.append('hx', 'main').toString(),
                        cssClasses: cssClasses.join(' '),
                    };
                }),
            };
        }).map((refinement) => {
            // prepend "back to <parent>" to category refinements
            if (refinement.category && category && category.getParent() && category.getParent().ID !== 'root') {
                const parentCategory = category.getParent();
                const url = searchModel.urlRefineCategory('Search-Show', parentCategory.ID);
                // @todo move Resource.msg to page designer / translate wrapper
                refinement.values.unshift({
                    id: 'backtoparent',
                    name: Resource.msgf('back_to', 'translations', 'Back to {0}', parentCategory.displayName),
                    hitCount: 0,
                    url: url.toString(),
                    hxUrl: url.append('hx', 'main').toString(),
                    cssClasses: 'backtoparent',
                });
            }
            return refinement;
        }),
    };
};

/**
 * Generates HTML template for displaying refinements
 * @param {Object} model - The model containing refinement data
 * @param {Array} model.refinements - Array of refinement objects
 * @param {string} model.refinements[].name - Name of the refinement
 * @param {Array} model.refinements[].values - Array of refinement values
 * @param {string} model.refinements[].values[].url - URL for the refinement value
 * @param {string} model.refinements[].values[].cssClasses - CSS classes for styling
 * @param {string} model.refinements[].values[].name - Display name of the refinement value
 * @returns {string} HTML string for rendering refinements
 */

exports.template = (model) => `<div class="refinements">
    ${model.refinements.map((refinement) => `<div class="refinement-group">
        <h3>${refinement.name}</h3>
        <ul role="navigation">
        ${refinement.values.map((value) => `<li><a href="${value.url}"${(value.cssClasses ? ` class="${value.cssClasses}"` : '')}
                    hx-push-url="${value.url}"
                    hx-get="${value.hxUrl}"
                    hx-target="main" hx-indicator=".progress">
                ${value.name}
            </a></li>`).join('')}
        </ul>
    </div>
    `).join('')}</div>`;
