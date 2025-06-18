const Logger = require('*/api/Logger');
const renderer = require('*/api/partials');

/**
 * @description Send a message to the user
 * @param {string} type - The type of message to send
 * @param {Object} options - The options for the message
 * @param {string} options.to - The recipient's email address
 * @param {string} options.from - The sender's email address
 * @param {string} options.subject - The email subject
 * @param {Object} options.data - The data to be used in the email template
 * @returns {boolean} Whether the email was sent successfully
 */
const sendMessage = (type, options) => {
    const Mail = require('dw/net/Mail');
    const email = new Mail();

    try {
        // Set basic email properties
        email.addTo(options.to);
        email.setFrom(options.from || exports.DEFAULT_FROM_EMAIL);
        email.setSubject(options.subject);

        // Generate HTML content using the appropriate partial
        const htmlContent = renderer.html(`mail/${type}`)(options.data);

        // Set the HTML content
        email.setContent(htmlContent, 'text/html', 'UTF-8');

        // Send the email
        const result = email.send();

        if (!result) {
            Logger.error(`Failed to send ${type} email to ${options.to}`);
            return false;
        }

        Logger.info(`Successfully sent ${type} email to ${options.to}`);
        return true;
    } catch (e) {
        Logger.error(`Error sending ${type} email to ${options.to}: ${e.message}`);
        return false;
    }
};

module.exports = {
    sendMessage,
    DEFAULT_FROM_EMAIL: 'noreply@yourshophere.com',
};
