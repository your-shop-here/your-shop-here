/**
 * Creates a model for the order history partial
 * @param {Object} options - The options object
 * @param {Object} options.settings - The component settings
 * @returns {Object} The model object containing order history data
 */
exports.createModel = function createModel(options) {
    const StringUtils = require('dw/util/StringUtils');
    const URLUtils = require('dw/web/URLUtils');
    const Resource = require('dw/web/Resource');
    const Calendar = require('dw/util/Calendar');
    const OrderMgr = require('dw/order/OrderMgr');

    const settings = options.settings || {};

    // Check if customer is authenticated
    if (!customer.isAuthenticated()) {
        return {
            empty: true,
            emptyMessage: Resource.msg('order.history.not.authenticated', 'translations', 'Please log in to view your order history'),
            labels: {
                orderNumber: Resource.msg('order.number', 'translations', 'Order Number'),
                creationDate: Resource.msg('order.creation.date', 'translations', 'Creation Date'),
                status: Resource.msg('order.status', 'translations', 'Status'),
                actions: Resource.msg('order.actions', 'translations', 'Actions'),
                viewOrder: Resource.msg('order.view', 'translations', 'View Order'),
            },
        };
    }

    // Get customer orders
    const customerProfile = customer.getProfile();
    const maxOrders = settings.maxOrders || 20;
    const orders = OrderMgr.searchOrders('customerNo = {0}', 'creationDate desc', customerProfile.getCustomerNo()).asList(0, maxOrders).toArray();

    if (!orders || orders.length === 0) {
        return {
            empty: true,
            emptyMessage: Resource.msg('order.history.empty', 'translations', 'You have no orders yet'),
            labels: {
                orderNumber: Resource.msg('order.number', 'translations', 'Order Number'),
                creationDate: Resource.msg('order.creation.date', 'translations', 'Creation Date'),
                status: Resource.msg('order.status', 'translations', 'Status'),
                actions: Resource.msg('order.actions', 'translations', 'Actions'),
                viewOrder: Resource.msg('order.view', 'translations', 'View Order'),
            },
        };
    }

    const model = {
        empty: false,
        orders: orders.map((order) => {
            const creationDate = order.getCreationDate();
            const calendar = new Calendar(creationDate);

            return {
                orderNumber: order.orderNo,
                creationDate: StringUtils.formatCalendar(calendar, 'yyyy-MM-dd HH:mm'),
                status: getOrderStatus(order),
                viewOrderUrl: URLUtils.url('Order-Details', 'orderNo', order.orderNo).toString(),
            };
        }),
        labels: {
            orderNumber: Resource.msg('order.number', 'translations', 'Order Number'),
            creationDate: Resource.msg('order.creation.date', 'translations', 'Creation Date'),
            status: Resource.msg('order.status', 'translations', 'Status'),
            actions: Resource.msg('order.actions', 'translations', 'Actions'),
            viewOrder: Resource.msg('order.view', 'translations', 'View Order'),
        },
        showOrderNumber: settings.showOrderNumber !== false,
        showCreationDate: settings.showCreationDate !== false,
        showStatus: settings.showStatus !== false,
        showActions: settings.showActions !== false,
        visibleColumns: [],
    };

    // Build visible columns array
    if (model.showOrderNumber) model.visibleColumns.push('orderNumber');
    if (model.showCreationDate) model.visibleColumns.push('creationDate');
    if (model.showStatus) model.visibleColumns.push('status');
    if (model.showActions) model.visibleColumns.push('actions');

    return model;
};

/**
 * Helper function to get a human-readable order status
 * @param {dw.order.Order} order - The order object
 * @returns {string} The formatted order status
 */
function getOrderStatus(order) {
    const Resource = require('dw/web/Resource');

    const orderStatus = order.getStatus().getValue();
    const confirmationStatus = order.getConfirmationStatus().getValue();

    if (confirmationStatus === 2) { // CONFIRMED
        return Resource.msg('order.status.confirmed', 'translations', 'Confirmed');
    }
    if (orderStatus === 1) { // OPEN
        return Resource.msg('order.status.open', 'translations', 'Open');
    }
    if (orderStatus === 2) { // COMPLETED
        return Resource.msg('order.status.completed', 'translations', 'Completed');
    }
    if (orderStatus === 3) { // CANCELLED
        return Resource.msg('order.status.cancelled', 'translations', 'Cancelled');
    }
    if (orderStatus === 4) { // FAILED
        return Resource.msg('order.status.failed', 'translations', 'Failed');
    }
    return Resource.msg('order.status.unknown', 'translations', 'Unknown');
}

/**
 * Renders the order history template
 * @param {Object} model - The model object created by createModel
 * @returns {string} The rendered HTML template
 */
exports.template = (model) => {
    if (model.empty) {
        return /* html */`
            <div class="order-history-empty" role="alert">
                <p>${model.emptyMessage}</p>
            </div>
        `;
    }

    return /* html */`
        <div class="order-history">
            <table role="grid" class="order-history-table">
                <thead>
                    <tr>
                        ${model.showOrderNumber ? `<th scope="col">${model.labels.orderNumber}</th>` : ''}
                        ${model.showCreationDate ? `<th scope="col">${model.labels.creationDate}</th>` : ''}
                        ${model.showStatus ? `<th scope="col">${model.labels.status}</th>` : ''}
                        ${model.showActions ? `<th scope="col">${model.labels.actions}</th>` : ''}
                    </tr>
                </thead>
                <tbody>
                    ${model.orders.map((order) => `
                        <tr>
                            ${model.showOrderNumber ? `<td><a href="${order.viewOrderUrl}"
                            hx-get="${order.viewOrderUrl}&hx=main"
                            hx-target="main" hx-trigger="click"
                            hx-push-url="${order.viewOrderUrl}"
                            hx-indicator=".progress">${order.orderNumber}</a></td>` : ''}
                            ${model.showCreationDate ? `<td>${order.creationDate}</td>` : ''}
                            ${model.showStatus ? `<td>${order.status}</td>` : ''}
                            ${model.showActions ? `
                                <td>
                                    <a href="${order.viewOrderUrl}"
                                        class="btn btn-primary btn-sm"
                                        hx-get="${order.viewOrderUrl}&hx=main"
                                        hx-target="main"
                                        hx-trigger="click"
                                        hx-push-url="${order.viewOrderUrl}"
                                        hx-indicator=".progress">
                                        ${model.labels.viewOrder}
                                    </a>
                                </td>
                            ` : ''}
                        </tr>
                    `).join('\n')}
                </tbody>
            </table>
        </div>
    `;
};
