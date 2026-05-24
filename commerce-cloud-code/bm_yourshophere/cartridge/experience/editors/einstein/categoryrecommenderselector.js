
const Site = require('dw/system/Site');
/**
 * Init for the recommender selector custom editor
 *
 * Initialises the custom attribute editor with server side information such as URLs
 * or in this case the  client ID the Business Manager uses, so the client can request all recommenders
 * @param {Object} editor - object representing a custom attribute editor
 */
module.exports.init = function (editor) {
    editor.configuration.put('clientid', request.httpHeaders.get('x-dw-client-id')); // eslint-disable-line no-undef
    editor.configuration.put('siteid', Site.getCurrent().ID);
    editor.configuration.put('typefilter', ['products-in-a-category']);
};
