
const Site = require('dw/system/Site');
/**
 * Init for the color picker custom editor
 */
module.exports.init = function (editor) {
    // eslint-disable-next-line no-unused-vars
    const args = arguments;
    // eslint-disable-next-line no-unused-vars
    const req = request;
    editor.configuration.put('clientid', request.httpHeaders.get('x-dw-client-id')); // eslint-disable-line no-undef
    editor.configuration.put('siteid', Site.getCurrent().ID);
    editor.configuration.put('typefilter', ['products-in-a-category']);
};
