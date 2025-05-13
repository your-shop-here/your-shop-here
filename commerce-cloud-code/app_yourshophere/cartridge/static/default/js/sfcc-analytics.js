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
     * Send an activity event to Einstein Activities API
     * @param {Object} data - The activity data
     * @param {string} data.type - The type of activity (e.g., 'productView', 'addToCart')
     * @param {string} data.id - The product ID
     */
    function sendEinsteinActivity(data) {
        if (!data || !data.type) {
            console.error('Invalid activity data:', data);
            return;
        }

        const userInfo = getUserInfo();

        const CLIENT_ID = window.ysh.einsteinApiClient;
        const SITE_ID = window.ysh.einsteinSiteId;
        const REALM = window.ysh.einsteinSiteId.split('-')[0];

        const payload = {
            userId: userInfo.userId,
            cookieId: userInfo.cookieId,
            clientIp: '', // This should be set server-side
            clientUserAgent: navigator.userAgent,
            realm: REALM,
        };

        if (data.type === 'productView') {
            payload.product = {
                id: data.id,
                sku: data.sku || '',
                altId: data.altId || '',
                altIdType: data.altIdType || '',
            };
        }

        // Add additional data for specific event types
        if (data.type === 'addToCart' || data.type === 'beginCheckout' || data.type === 'viewSearch' || data.type === 'viewCategory') {
            payload.products = (data.products || []).map((product) => ({
                id: product.id,
                sku: product.sku || '',
                ...(data.altId && { altId: data.altId }),
                ...(data.altIdType && { altIdType: data.altIdType }),
                ...(product.quantity && { quantity: product.quantity }),
                ...(product.price && { price: product.price }),
            }));
            if (data.amount) {
                payload.amount = data.amount;
            }
            if (data.searchText) {
                payload.searchText = data.searchText;
            }
            if (data.category) {
                payload.category = {
                    id: data.category,
                };
            }
            if (data.sortingRule) {
                payload.sortingRule = data.sortingRule;
            }
            if (data.itemRange) {
                payload.itemRange = data.itemRange;
            }
        }

        if (window.ysh.debug) console.info(`${data.type} event:`, payload);

        if (!CLIENT_ID || !SITE_ID || !REALM) {
            console.error('Client ID, Site ID, or Realm is not set, activity event will not be tracked');
            return;
        }

        fetch(`${EINSTEIN_API_ENDPOINT}${SITE_ID}/${data.type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cq-client-id': CLIENT_ID,
            },
            body: JSON.stringify(payload),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then((responseData) => {
            console.debug(`${data.type} tracked successfully:`, responseData);
        }).catch((error) => {
            console.error(`Error tracking ${data.type}:`, error);
        });
    }

    /**
     * Initialize the analytics event listeners
     */
    function init() {
        // Listen for activity events from the data layer
        window.addEventListener('productView', (event) => {
            sendEinsteinActivity(event.detail);
        });

        window.addEventListener('addToCart', (event) => {
            sendEinsteinActivity(event.detail);
        });

        window.addEventListener('beginCheckout', (event) => {
            sendEinsteinActivity(event.detail);
        });

        window.addEventListener('viewSearch', (event) => {
            sendEinsteinActivity(event.detail);
        });

        window.addEventListener('viewCategory', (event) => {
            sendEinsteinActivity(event.detail);
        });

        // Process any existing events in the data layer
        if (window.dataLayer) {
            window.dataLayer.forEach((item) => {
                const validTypes = ['productView', 'addToCart', 'beginCheckout', 'viewCategory', 'viewSearch'];
                if (validTypes.find((type) => type === item.type) && !item.processed) {
                    sendEinsteinActivity(item);
                    item.processed = true;
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

    setInterval(() => {
        init();
    }, 200);
}());
