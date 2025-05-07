/**
 * Generates HTML for the registration email
 * @module registration
 */

/**
 * Creates a model for the registration email
 * @param {Object} input - Input data for the model
 * @param {Object} input.customer - The customer object
 * @param {string} input.customer.firstName - Customer's first name
 * @param {string} input.customer.lastName - Customer's last name
 * @param {string} input.customer.email - Customer's email address
 * @returns {Object} Model object with registration email data
 */
exports.createModel = (input) => ({
    firstName: input.customer.firstName,
    lastName: input.customer.lastName,
    email: input.customer.email,
});

/**
 * Generates HTML template string for the registration email
 * @param {Object} model - Model object containing registration email data
 * @returns {string} HTML template string for the registration email
 */
exports.template = (model) => `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to Your Shop Here</title>
        </head>
        <body>
            <h1>Welcome ${model.firstName} ${model.lastName}!</h1>
            <p>Thank you for registering with Your Shop Here. We're excited to have you as a customer!</p>
            <p>Your account has been created with the email address: ${model.email}</p>
            <p>If you have any questions, please don't hesitate to contact our customer service team.</p>
            <p>Best regards,<br>The Your Shop Here Team</p>
        </body>
    </html>`;
