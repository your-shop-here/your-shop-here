/**
 * Creates the model for the skin
 * @param {Object} params - The parameters for the model
 * @returns {Object} The model for the skin
 */
function createModel(params) {
    const model = {
        fonts: params.fonts || [],
        primaryAccentColor: (params.primaryAccentColor && params.primaryAccentColor.value) || '',
        primaryAccentColorInvert: (params.primaryAccentColorInvert && params.primaryAccentColorInvert.value) || '',
        secondaryAccentColor: (params.secondaryAccentColor && params.secondaryAccentColor.value) || '',
        secondaryAccentColorInvert: (params.secondaryAccentColorInvert && params.secondaryAccentColorInvert.value) || '',
        mainBackground: (params.mainBackground && params.mainBackground.value) || '',
        borderColorOne: (params.borderColorOne && params.borderColorOne.value) || '',
        linkColor: (params.linkColor && params.linkColor.value) || '',
        bannerBackground: (params.bannerBackground && params.bannerBackground.value) || '',
        bannerTextColor: (params.bannerTextColor && params.bannerTextColor.value) || '',
        menuTextColor: (params.menuTextColor && params.menuTextColor.value) || '',
        mainTextColor: (params.mainTextColor && params.mainTextColor.value) || '',
        selectBoxBackground: (params.selectBoxBackground && params.selectBoxBackground.value) || '',
        selectBoxTextColor: (params.selectBoxTextColor && params.selectBoxTextColor.value) || '',
        headingColor: (params.headingColor && params.headingColor.value) || '',
        headingColorInvert: (params.headingColorInvert && params.headingColorInvert.value) || '',
        priceTextColor: (params.priceTextColor && params.priceTextColor.value) || '',
        errorColor: (params.errorColor && params.errorColor.value) || '',
        successColor: (params.successColor && params.successColor.value) || '',
        warningColor: (params.warningColor && params.warningColor.value) || '',
        infoColor: (params.infoColor && params.infoColor.value) || '',
        headerfont: params.headerfont || '',
        bodyfont: params.bodyfont || '',
        menufont: params.menufont || '',
        editMode: params.editMode || false,
    };

    try {
        // eslint-disable-next-line
        model.fonts = model.fonts.map((fontName) => require(`*/cartridge/partials/header/${fontName}`).getFont());
    } catch (error) {
        const Logger = require('dw/system/Logger');
        Logger.error(`Error loading fonts in skins.js: ${error.message}`);
    }

    return model;
}

/**
 * Renders the skin
 * @param {Object} model - The model for the skin
 * @returns {string} The HTML for the skin
 */
const template = (model) => /* html */ `
    ${model.fonts.join('')}
    <style>
        :root {
            /* Primary theme colors from skin parameters */
            --skin-primary-color-1: ${model.primaryAccentColor};
            --skin-primary-color-invert-1: ${model.primaryAccentColorInvert};
            --skin-secondary-color-1: ${model.secondaryAccentColor};
            --skin-secondary-color-invert-1: ${model.secondaryAccentColorInvert};
            --skin-background-color-1: ${model.mainBackground};
            
            /* Text colors */
            --skin-main-text-color-1: ${model.mainTextColor};
            --skin-text-secondary-1: ${model.mainTextColor ? colorMix(model.mainTextColor, 0.7) : '#5f6368'};
            --skin-text-muted-1: ${model.mainTextColor ? colorMix(model.mainTextColor, 0.5) : '#80868b'};
            --skin-text-light-1: ${model.primaryAccentColorInvert || '#ffffff'};
            
            /* Background colors */
            --skin-bg-primary-1: ${model.mainBackground || '#ffffff'};
            --skin-bg-secondary-1: ${model.mainBackground ? colorMix(model.mainBackground, 0.97) : '#f8f9fa'};
            --skin-bg-tertiary-1: ${model.mainBackground ? colorMix(model.mainBackground, 0.91) : '#e8eaed'};
            
            /* Border colors */
            --skin-border-color-1: ${model.borderColorOne || '#dadce0'};
            --skin-border-color-hover-1: ${model.borderColorOne ? colorMix(model.borderColorOne, 0.8) : '#bdc1c6'};
            
            /* Component-specific colors */
            --skin-link-color-1: ${model.linkColor};
            --skin-banner-background-color-1: ${model.bannerBackground};
            --skin-banner-text-color-1: ${model.bannerTextColor};
            --skin-menu-color-1-invert: ${model.menuTextColor};
            --skin-selectbox-background-color-1: ${model.selectBoxBackground};
            --skin-selectbox-text-color-1: ${model.selectBoxTextColor};
            --skin-heading-color-1: ${model.headingColor};
            --skin-heading-color-1-invert: ${model.headingColorInvert};
            --skin-price-1: ${model.priceTextColor};
            
            /* Status colors */
            --skin-error-color-1: ${model.errorColor || model.priceTextColor || '#ea4335'};
            --skin-success-color-1: ${model.successColor || model.secondaryAccentColor || '#34a853'};
            --skin-warning-color-1: ${model.warningColor || (model.secondaryAccentColor ? colorMix(model.secondaryAccentColor, 0.95) : '#fbbc05')};
            --skin-info-color-1: ${model.infoColor || model.primaryAccentColor || '#4285f4'};
            
            /* Fonts */
            --skin-header-font: '${model.headerfont}';
            --skin-body-font: '${model.bodyfont}';
            --skin-menu-font: '${model.menufont}';
            
            /* Override Pico CSS variables to use theme colors */
            --color: var(--skin-main-text-color-1, hsl(205, 20%, 32%));
            --background-color: var(--skin-background-color-1, #fff);
            --primary: var(--skin-primary-color-1, hsl(195, 85%, 41%));
            --primary-hover: ${model.primaryAccentColor ? colorMix(model.primaryAccentColor, 0.9) : 'hsl(195, 90%, 32%)'};
            --primary-inverse: var(--skin-primary-color-invert-1, #fff);
            --secondary: var(--skin-secondary-color-1, hsl(205, 15%, 41%));
            --secondary-hover: ${model.secondaryAccentColor ? colorMix(model.secondaryAccentColor, 0.9) : 'hsl(205, 20%, 32%)'};
            --secondary-inverse: var(--skin-secondary-color-invert-1, #fff);
            --h1-color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1, hsl(205, 30%, 15%)));
            --h2-color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1, #24333e));
            --h3-color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1, hsl(205, 25%, 23%)));
            --h4-color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1, #374956));
            --h5-color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1, hsl(205, 20%, 32%)));
            --h6-color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1, #4d606d));
            --muted-color: var(--skin-text-muted-1, hsl(205, 10%, 50%));
            --muted-border-color: var(--skin-border-color-1, hsl(205, 20%, 94%));
            --form-element-background-color: var(--skin-selectbox-background-color-1, transparent);
            --form-element-border-color: var(--skin-border-color-1, hsl(205, 14%, 68%));
            --form-element-color: var(--skin-main-text-color-1, var(--color));
            --form-element-placeholder-color: var(--skin-text-muted-1, var(--muted-color));
        }
        
        /* Apply heading colors */
        h1, h2, h3, h4, h5, h6 {
            color: var(--skin-heading-color-1-invert, var(--h1-color, var(--skin-main-text-color-1)));
        }
        
        /* Apply heading background if specified */
        h1, h2, h3, h4, h5, h6 {
            background-color: var(--skin-heading-color-1, transparent);
        }
        
        /* Ensure all text elements use the proper text color */
        address, blockquote, dl, dt, dd, figure, form, ol, p, pre, table, ul, li {
            color: var(--skin-main-text-color-1, var(--color));
        }
        
        /* Ensure table cells use the text color */
        table td, table th {
            color: var(--skin-main-text-color-1, var(--color));
        }
        
        /* Ensure form elements use the text color (but allow form inputs to override) */
        form label, form legend {
            color: var(--skin-main-text-color-1, var(--color));
        }
    </style>
    ${model.editMode ? `
        <div style="width:100%; text-align:center; height:4em; padding-top:0.5em;">
            <svg aria-hidden="true" style="width:3em" viewbox="0 0 24 24" >
                <path fill="${model.primaryAccentColor || '#00a1e0'}" d="M22.5 3.4l-1.9-1.9c-.8-.8-1.9-.8-2.6 0L16.5 3c-.2.2-.2.5 0 .6l3.9 4c.2.2.5.2.6 0L22.6 6c.7-.7.7-1.8-.1-2.6zm-7.3 1.5c-.2-.1-.5-.1-.7 0L2.5 17 1 22.2c-.2.5.3 1 .8.9l5.3-1.5H7l12.1-12c.1-.2.1-.5 0-.7l-3.9-4z"></path>
            </svg>
            <span>Skin settings</span>
        </div>
    ` : ''}
`;

/**
 * Helper function to create color variations
 * @param {string} color - The base color
 * @param {number} opacity - The opacity factor (0-1)
 * @returns {string} The color with opacity
 */
function colorMix(color, opacity) {
    if (!color) return '';
    // Simple color mixing - in a real implementation, you'd want proper color manipulation
    return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}

module.exports = {
    createModel,
    template,
};
