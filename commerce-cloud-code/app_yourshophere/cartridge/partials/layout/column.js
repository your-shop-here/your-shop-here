const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Create view model for column layout
 * @param {Object} input - The input parameters containing context, component, and model
 * @returns {Object} The view model containing column layout data
 */
exports.createModel = (input) => {
    const { context, component, model } = input;
    const columnConfiguration = context.content.columnConfiguration || {};

    const desktopColumns = columnConfiguration.desktopColumns;
    const columnWidths = columnConfiguration.columnWidths;
    const mobileColumnWidths = columnConfiguration.mobileColumnWidths;
    const columnClasses = columnConfiguration.columnClasses || [];

    const baseCssClass = `cmp_${component.ID}`;

    const viewModel = {
        regions: PageRenderHelper.getRegionModelRegistry(component),
        cssClass: baseCssClass,
        desktopGap: columnConfiguration.desktopGap ? `gap: ${columnConfiguration.desktopGap}%` : '',
        mobileGap: columnConfiguration.mobileGap ? `gap: ${columnConfiguration.mobileGap}%` : '',
        columnWidths,
        mobileColumnWidths,
        desktopColumns,
        columnClasses,
        regionNames: Array.from(Array(desktopColumns).keys()).map((index) => `column${index + 1}`),
    };

    // Merge with existing model if provided
    if (model) {
        Object.keys(model).forEach((key) => {
            viewModel[key] = model[key];
        });
    }

    return viewModel;
};

/**
 * Render column layout template
 * @param {Object} model - The view model containing column layout data
 * @returns {string} The HTML template for the column layout
 */
exports.template = (model) => {
    const styleBlock = `<style>.${model.cssClass} { grid-template-columns: ${model.columnWidths.join('% ')}%; ${model.desktopGap}; }
        @media (max-width: 768px) {.${model.cssClass} { grid-template-columns: ${model.mobileColumnWidths.join('% ')}%; ${model.mobileGap}; }}
    </style>`;

    const columns = model.regionNames.map((regionName, index) => {
        let className;
        if (index === 0) {
            className = 'left';
        } else if (index === model.desktopColumns - 1) {
            className = 'right';
        } else {
            className = 'center';
        }
        // Add custom CSS class if provided
        const customClass = model.columnClasses[index] && model.columnClasses[index].trim() ? model.columnClasses[index].trim() : '';
        const finalClassName = customClass ? `div-${className} ${customClass}` : `div-${className}`;
        return model.regions[regionName].setClassName(finalClassName).render();
    }).join('\n');

    const gridClasses = ['grid', model.style, model.cssClass]
        .filter((cls) => cls && cls.trim() !== '')
        .join(' ');

    return `${styleBlock}
    <div class="${gridClasses}">
        ${columns}
    </div>`;
};
