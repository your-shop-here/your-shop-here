/**
 * Renders the Address Book component for the checkout page.
 * This component displays the user's saved addresses and allows selection or deletion.
 *
 * @param {dw.experience.ComponentScriptContext} context - The component context, including content and configuration.
 * @returns {string} The rendered HTML template for the address book.
 */
exports.render = function render(context) {
    const result = require('*/cartridge/partials/renderer').html('checkout/addressbook')({
        title: context.content.title,
    });
    return result;
    
};
