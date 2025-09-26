/**
 * Wrap the content with the DW marker
 * @param {string} content - The HTML content to wrap
 * @param {Object} object - The object to render the marker for
 * @param {string} type -  one value of 'none' or 'searchhit' or 'recommendation' or 'setproduct' or 'detail'.
 * @returns {string} The wrapped content
 */
function wrapWithDWMarker(content, object, type) {
    const HashMap = require('dw/util/HashMap');
    const Template = require('dw/util/Template');
    const dataMap = new HashMap();
    dataMap.put('object', object);
    dataMap.put('content', content);
    const isobject = new Template(`tracking/isobject_${type}`);
    return isobject.render(dataMap).text;
}

module.exports = {
    wrapWithDWMarker,
};
