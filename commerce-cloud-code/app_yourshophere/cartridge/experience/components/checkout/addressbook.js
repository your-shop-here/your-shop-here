/**
 * Renders the Address Book component for the checkout page.
 * This component displays the user's saved addresses and allows selection or deletion.
 *
 * @param {dw.experience.ComponentScriptContext} context - The component context, including content and configuration.
 * @returns {string} The rendered HTML template for the address book.
 */
exports.render = function render(context) {
    const result = require('*/api/partials').create('checkout/addressbook').html({
        title: context.content.title,
    });
    return result;
};
