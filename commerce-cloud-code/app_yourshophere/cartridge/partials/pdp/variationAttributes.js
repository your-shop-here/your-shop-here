exports.getVariationModel = function getVariationModel(product) {
    const HttpSearchParams = require('api/URLSearchParams');

    const variationModel = product.variationModel;
    const params = request.custom.model ? request.custom.model.httpParameter : request.httpParameterMap;
    const variationParameterMap = (new HttpSearchParams(params)).allowList([/dwvar_[^_]*_/]);
    variationParameterMap.forEach((value, name) => variationModel.setSelectedAttributeValue(name.split('_').pop(), value));

    return variationModel;
};

exports.createModel = function createModel(product) {
    const URLUtils = require('dw/web/URLUtils');
    const params = request.custom.model ? request.custom.model.httpParameter : request.httpParameterMap;

    const variationModel = exports.getVariationModel(product);

    const model = {
        variationAttributes: variationModel.productVariationAttributes.toArray().map(((attribute, index) => {
            const selectedValue = variationModel.getSelectedValue(attribute);
            // select first value if nothing has been selected yet / make sure this code is not shared with cart
            // @todo only infer this for color 
            if (!selectedValue && index === 0) {
                variationModel.setSelectedAttributeValue(attribute.ID, variationModel.variants[0].custom[attribute.ID]);
            }
            return {
                id: attribute.ID,
                name: attribute.displayName,
                values: variationModel[index ? 'getFilteredValues' : 'getAllValues'](attribute).toArray().map(value => ({
                    id: value.ID,
                    value: value.value,
                    displayValue: value.displayValue,
                    selected: ((selectedValue && selectedValue.value === value.value) ? 'selected' : ''),
                })),
                url: URLUtils.url('Product-Show', 'pid', variationModel.master.ID, 'hx', 'main'),
                selectName: `dwvar_${variationModel.master.ID}_${attribute.ID}`,
            };
        })),
        hxTarget: params.hx || 'main',
    };

    return model;
};

/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.template = model => `${model.variationAttributes.map(attribute => `
    <div>
        <label for="va-${attribute.id}">Select ${attribute.name}</label>
        <select name="${attribute.selectName}" id="va-${attribute.id}"
            hx-get="${attribute.url}"
            hx-target="${model.hxTarget}"
            hx-include="form[name=pdp-actions]"
            hx-trigger="change"
            hx-indicator=".progress">
            ${attribute.values.map(value => `
            <option value="${value.value}" ${value.selected}>${value.displayValue}</option>
            `).join('')}
        </select>
    </div>
`).join('')}`;
