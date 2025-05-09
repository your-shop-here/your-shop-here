/* global window, document, navigator */

/**
 * SFCC Analytics implementation for tracking events to Einstein Activities API
 */
(function () {
    const EINSTEIN_API_ENDPOINT = 'https://api.cquotient.com/v3/activities/';

    /**
     * Get the current user's information
     * @returns {Object} User information including ID and cookie ID
     */
    function getUserInfo() {
        const userInfo = {
            userId: '',
            cookieId: '',
        };

        // Get the anonymous cookie ID
        const cookies = document.cookie.split('; ');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            if (cookie.indexOf('dwanonymous_') === 0) {
                userInfo.cookieId = cookie.split('=')[1];
                break;
            }
        }

        // If we have a logged-in user, get their ID
        if (window.dw && window.dw.customer && window.dw.customer.profile) {
            userInfo.userId = window.dw.customer.profile.customerNo;
        }

        return userInfo;
    }

    /**
     * Send a product view event to Einstein Activities API
     * @param {Object} data - The product view data
     * @param {string} data.id - The product ID
     */
    function sendProductView(data) {
        if (!data || !data.id) {
            console.error('Invalid product view data:', data);
            return;
        }

        const userInfo = getUserInfo();

        window.CQuotient = {
            clientId: '',
            siteId: 'zzzz-SiteGenesis',
            realm: 'zzzz',
        };

        // TODO: Better way to get the realm and  site ID
        const payload = {
            product: {
                id: data.id,
                sku: data.sku || '',
                altId: data.altId || '',
                altIdType: data.altIdType || '',
            },
            userId: userInfo.userId,
            cookieId: userInfo.cookieId,
            clientIp: '', // This should be set server-side
            clientUserAgent: navigator.userAgent,
            realm: window.CQuotient.realm,
        };

        console.info('Sending product view event:', payload);

        fetch(`${EINSTEIN_API_ENDPOINT}${window.CQuotient.siteId}/viewProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cq-client-id': window.CQuotient.clientId,
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((responseData) => {
                console.debug('Product view tracked successfully:', responseData);
            })
            .catch((error) => {
                console.error('Error tracking product view:', error);
            });
    }

    /**
     * Initialize the analytics event listeners
     */
    function init() {
        // Listen for product view events from the data layer
        window.addEventListener('productView', (event) => {
            sendProductView(event.detail);
        });

        // Process any existing product view events in the data layer
        if (window.dataLayer) {
            window.dataLayer.forEach((item) => {
                if (item.type === 'productView') {
                    sendProductView(item);
                }
            });
        }
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
