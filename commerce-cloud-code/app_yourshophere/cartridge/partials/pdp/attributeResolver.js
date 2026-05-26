/**
 * Resolves a dot-notation attribute path against a product object.
 * Supports top-level product properties (e.g. "longDescription")
 * and custom attributes via "custom.{name}" notation.
 *
 * @param {dw.catalog.Product} product
 * @param {string} path - e.g. "longDescription" or "custom.yshWeight"
 * @returns {string} resolved string value, or empty string if not found
 */
exports.resolve = function resolve(product, path) {
    if (!product || !path) return '';
    const parts = path.split('.');
    let value;
    if (parts[0] === 'custom' && parts[1]) {
        value = product.custom[parts[1]];
    } else {
        value = product[parts[0]];
    }
    if (value == null || value === 'undefined') return '';
    return String(value);
};
