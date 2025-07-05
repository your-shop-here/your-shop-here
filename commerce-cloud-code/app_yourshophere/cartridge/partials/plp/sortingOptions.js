/**
 * Render search sorting options
 *
 * @returns {Object} The model and template for sorting options
 */
exports.createModel = () => {
    const HttpSearchParams = require('*/api/URLSearchParams');
    const CatalogMgr = require('dw/catalog/CatalogMgr');
    const URLUtils = require('dw/web/URLUtils');
    const model = {};

    const httpParams = new HttpSearchParams(request.httpParameterMap);
    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));
    const search = require('*/api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings ? componentSettings.swatchAttribute : null });
    search.search();

    // Get all available sorting options
    const sortingOptions = CatalogMgr.getSortingOptions();
    const currentSortingRule = search.getEffectiveSortingRule();
    const currentSortId = currentSortingRule ? currentSortingRule.ID : 'best-matches';

    // Build sorting options for the template
    model.sortingOptions = sortingOptions.toArray().map(option => {
        const sortingRule = option.getSortingRule();
        const isSelected = sortingRule.ID === currentSortId;
        
        // Create URL for this sorting option
        const sortParams = new HttpSearchParams(request.httpParameterMap);
        sortParams.set('sort', sortingRule.ID);
        sortParams.sort();
        const queryString = sortParams.toString();
        const sortUrl = URLUtils.url('Search-Show').toString() + (queryString ? '?' + queryString : '');

        return {
            id: sortingRule.ID,
            displayName: option.getDisplayName(),
            url: sortUrl.toString(),
            isSelected: isSelected
        };
    });

    const selectedOption = model.sortingOptions.find(option => option.isSelected);
    model.currentSortName = selectedOption ? selectedOption.displayName : 'Best Matches';

    return model;
};

exports.template = (model) => `
    <div class="sorting-options">
        <div class="sorting-header">
            <label for="sort-selector">Sort by:</label>
        </div>
        <select id="sort-selector" onchange="window.location.href = this.value;">
            ${model.sortingOptions.map(option => `
                <option value="${option.url}" ${option.isSelected ? 'selected' : ''}>
                    ${option.displayName}
                </option>
            `).join('')}
        </select>
    </div>
`; 