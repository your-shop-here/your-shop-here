
/**
 * Replaces a single $url(...)$ placeholder with the actual URL
 * @param {string} match - The full matched string
 * @param {string} argsString - The arguments string inside the parentheses
 * @returns {string} The URL string or the original match if parsing fails
*/
function replaceUrlPlaceholder(match, argsString) {
    try {
        // Parse the arguments from the placeholder
        const sanitizedArgsString = argsString.replace(/'/g, '');
        const args = sanitizedArgsString.split(',');
        if (args.length === 0) {
            return match; // Return original if no arguments
        }

        // Call URLUtils.url() with the parsed arguments
        // URLUtils.url() accepts variable arguments, so we need to use apply
        const URLUtils = require('dw/web/URLUtils');
        const url = URLUtils.url.apply(URLUtils, args);

        // Return the URL as a string
        return url.toString();
    } catch (e) {
        const myError = e;
        dw.system.Logger.error(`Error resolving URL placeholder: ${myError.message}`);
        // If there's an error, return the original placeholder
        // This prevents breaking the page if there's invalid syntax
        return match;
    }
}

/**
 * Resolves $url(...)$ placeholders in markup text by replacing them with actual URLs
 * @param {string} markup - The markup text containing $url(...)$ placeholders
 * @returns {string} The markup text with placeholders replaced by URLs
 */
function resolveMarkupTextLinks(markup) {
    if (!markup || typeof markup !== 'string') {
        return markup || '';
    }

    // Regex to match $url(...)$ patterns
    const urlPattern = /\$url\(([^)]+)\)\$/g;

    return markup.replace(urlPattern, replaceUrlPlaceholder);
}

/**
 * Renders a base richText component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const html = resolveMarkupTextLinks(context.content.richText.value);

    return require('*/api/partials').create('base/richText').html({
        content: { richText: html },
        textContrast: '',
        horizontalAlign: 'center',
        debuggy: true,
    });
};
