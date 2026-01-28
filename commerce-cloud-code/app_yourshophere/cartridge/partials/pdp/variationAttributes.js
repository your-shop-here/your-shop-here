
/**
 * Gets the variation model for the product
 *
 * @param {Object} product The product object
 * @returns {Object} The variation model for the product
 */
exports.getVariationModel = function getVariationModel(product) {
    const HttpSearchParams = require('*/api/URLSearchParams');

    const variationModel = product.variationModel;
    const params = request.custom.model ? request.custom.model.httpParameter : request.httpParameterMap;
    const variationParameterMap = (new HttpSearchParams(params)).allowList([/dwvar_[^_]*_/]);
    variationParameterMap.forEach((value, name) => variationModel.setSelectedAttributeValue(name.split('_').pop(), value));

    return variationModel;
};

/**
 * Creates a model for the variation attributes
 *
 * @param {Object} params The parameters object
 * @param {Object} params.product The product object
 * @param {string} params.swatchDimension Comma-separated list of attribute IDs to display as swatches
 * @param {string} params.swatchViewType View type for swatch images (e.g., 'swatch', 'small')
 * @param {string} params.swatchDISConfig DIS parameters for swatch images (e.g., 'sw=300&sh=400')
 * @returns {Object} The model for the variation attributes
 */
exports.createModel = function createModel(params) {
    const URLUtils = require('dw/web/URLUtils');
    const Resource = require('dw/web/Resource');
    const product = params.product || params; // Support both old and new signature
    const swatchDimension = params.swatchDimension || '';
    const swatchViewType = params.swatchViewType || '';
    const swatchDISConfig = params.swatchDISConfig || '';
    const httpParams = request.custom.model ? request.custom.model.httpParameter : request.httpParameterMap;

    const variationModel = exports.getVariationModel(product);

    // Parse swatch dimension attribute IDs
    const swatchAttributeIds = swatchDimension
        ? swatchDimension.split(',').map((id) => id.trim()).filter(Boolean)
        : [];

    const masterId = variationModel.master.ID;
    const hxValue = httpParams.hx || 'main';
    const hxTarget = httpParams.hx ? `${httpParams.hx}` : 'main';
    const baseUrl = URLUtils.url('Product-Show', 'pid', masterId, 'hx', hxValue);

    // Collect all currently selected variation attributes for URL building
    const selectedAttributes = {};
    variationModel.productVariationAttributes.toArray().forEach((attr) => {
        const selected = variationModel.getSelectedValue(attr);
        if (selected) {
            selectedAttributes[attr.ID] = selected.value;
        }
    });

    const model = {
        variationAttributes: variationModel.productVariationAttributes.toArray().map(((attribute, index) => {
            let selectedValue = variationModel.getSelectedValue(attribute);
            // select first value if nothing has been selected yet / make sure this code is not shared with cart
            // @todo only infer this for color
            if (!selectedValue && index === 0) {
                variationModel.setSelectedAttributeValue(attribute.ID, variationModel.variants[0].custom[attribute.ID]);
                selectedValue = variationModel.getSelectedValue(attribute);
                selectedAttributes[attribute.ID] = selectedValue.value;
            }
            const isSwatch = swatchAttributeIds.indexOf(attribute.ID) !== -1;
            return {
                id: attribute.ID,
                name: attribute.displayName,
                isSwatch,
                values: variationModel[index ? 'getFilteredValues' : 'getAllValues'](attribute).toArray().map((value) => {
                    const isSelected = selectedValue && selectedValue.value === value.value;
                    const orderable = variationModel.hasOrderableVariants(attribute, value);
                    const valueObj = {
                        id: value.ID,
                        value: value.value,
                        displayValue: value.displayValue,
                        selected: isSelected ? 'selected' : '',
                        orderable,
                    };

                    // Add CSS classes and image for swatch attributes
                    if (isSwatch) {
                        const sanitizedValueId = String(value.ID).replace(/[^a-zA-Z0-9-_]/g, '-');
                        const baseCssClass = `swatch-${attribute.ID}-${sanitizedValueId}`;
                        const disabledClass = orderable ? '' : ' disabled';
                        const selectedClass = isSelected ? ' selected' : '';
                        valueObj.cssClass = `swatch ${baseCssClass}${disabledClass}${selectedClass}`.trim();

                        // Get swatch image - try from variation attribute value first, then from a variant with this value
                        const viewTypesToTry = swatchViewType
                            ? [swatchViewType, 'swatch', 'small']
                            : ['swatch', 'small', 'thumbnail'];
                        let image = null;
                        let imageSource = null;

                        // First try: get image directly from variation attribute value
                        for (let i = 0; i < viewTypesToTry.length && !image; i++) {
                            image = value.getImage(viewTypesToTry[i], 0);
                            if (image) {
                                imageSource = image;
                            }
                        }

                        // Second try: get image from a variant product that has this attribute value
                        if (!image) {
                            const variantMap = new (require('dw/util/HashMap'))();
                            variantMap.put(attribute.ID, value.value);
                            Object.keys(selectedAttributes).forEach((attrId) => {
                                if (attrId !== attribute.ID) {
                                    variantMap.put(attrId, selectedAttributes[attrId]);
                                }
                            });
                            const variants = variationModel.getVariants(variantMap).toArray();
                            if (variants.length > 0) {
                                const variant = variants[0];
                                for (let i = 0; i < viewTypesToTry.length && !image; i++) {
                                    image = variant.getImage(viewTypesToTry[i], 0);
                                    if (image) {
                                        imageSource = image;
                                    }
                                }
                            }
                        }

                        if (imageSource) {
                            let imageUrl = imageSource.url.toString();
                            if (!imageUrl.startsWith('http')) {
                                imageUrl = imageSource.getImageURL({ scaleWidth: 999 }).toString().split('?')[0];
                            }
                            const disConfig = swatchDISConfig || 'sw=40&sh=40';
                            valueObj.imageUrl = `${imageUrl}?${disConfig}`;
                            valueObj.imageAlt = value.displayValue;
                            valueObj.swatchContent = `<img src="${valueObj.imageUrl}" alt="${valueObj.imageAlt}" />`;
                        } else {
                            valueObj.swatchContent = `<span class="swatch-fallback">${value.displayValue}</span>`;
                        }

                        // Build URL for swatch values - preserve all other selected attributes
                        if (orderable) {
                            let swatchUrl = URLUtils.url('Product-Show', 'pid', masterId, 'hx', hxValue);
                            Object.keys(selectedAttributes).forEach((attrId) => {
                                if (attrId !== attribute.ID) {
                                    swatchUrl = swatchUrl.append(`dwvar_${masterId}_${attrId}`, selectedAttributes[attrId]);
                                }
                            });
                            swatchUrl = swatchUrl.append(`dwvar_${masterId}_${attribute.ID}`, value.value);
                            valueObj.url = swatchUrl.toString();
                            // Include the variation attribute value in the request using hx-vals
                            // This ensures the form always has the current selection when other attributes change
                            const selectName = `dwvar_${masterId}_${attribute.ID}`;
                            valueObj.hxAttributes = `hx-get="${valueObj.url}" hx-target="${hxTarget}" hx-include="form[name=pdp-actions]" hx-vals='{"${selectName}": "${value.value}"}' hx-trigger="click" hx-indicator=".progress"`;
                        } else {
                            valueObj.hxAttributes = '';
                        }
                    }
                    return valueObj;
                }),
                url: baseUrl.toString(),
                selectName: `dwvar_${masterId}_${attribute.ID}`,
                message: Resource.msgf('pdp.variation.select', 'translations', null, attribute.displayName),
            };
        })),
        defaultOption: Resource.msg('pdp.variation.select.option', 'translations', null),
        hxTarget,
    };

    return model;
};

/**
 * Renders a Product Description Component
 *
 * @param {Object} model The model for the variation attributes
 * @returns {string} The template to be displayed
 */
exports.template = (model) => `${model.variationAttributes.map((attribute) => {
    if (attribute.isSwatch) {
        const selectedValue = attribute.values.find((v) => v.selected);
        const hiddenInputValue = selectedValue ? selectedValue.value : '';
        return `
    <div>
        <label>${attribute.message}</label>
        <input type="hidden" name="${attribute.selectName}" id="hidden-${attribute.id}" value="${hiddenInputValue}" />
        <div class="swatch-container" role="group" aria-label="${attribute.name}">
            ${attribute.values.map((value) => `
            <button type="button"
                class="${value.cssClass}"
                ${value.hxAttributes}
                ${value.orderable ? '' : 'disabled'}
                aria-label="${value.displayValue}"
                aria-pressed="${value.selected ? 'true' : 'false'}"
                title="${value.displayValue}"
                onclick="document.getElementById('hidden-${attribute.id}').value='${value.value}'">
                ${value.swatchContent}
            </button>`).join('')}
        </div>
    </div>`;
    }
    return `
    <div>
        <label for="va-${attribute.id}">${attribute.message}</label>
        <select name="${attribute.selectName}" id="va-${attribute.id}"
            hx-get="${attribute.url}"
            hx-target="${model.hxTarget}"
            hx-include="form[name=pdp-actions]"
            hx-trigger="change"
            hx-indicator=".progress">
            <option value="">${model.defaultOption}</option>
            ${attribute.values.map((value) => `
            <option value="${value.value}" ${value.selected} ${value.orderable ? '' : 'disabled'}>${value.displayValue}</option>
            `).join('')}
        </select>
    </div>`;
}).join('')}`;
