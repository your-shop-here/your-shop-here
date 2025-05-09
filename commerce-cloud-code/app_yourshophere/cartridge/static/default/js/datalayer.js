/* global window, document, MutationObserver */

/**
 * Data Layer implementation for tracking analytics events
 */
(function () {
    // Create the data layer array if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    /**
     * Initialize the data layer
     */
    function init() {
        // Set up mutation observer to watch for dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        processNode(node);
                    }
                });
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Process existing elements
        processNode(document.body);
    }

    /**
     * Process a node and its children for data-analytics attributes
     * @param {Element} node - The node to process
     */
    function processNode(node) {
        // Process the current node
        if (node.hasAttribute && node.hasAttribute('data-analytics')) {
            processAnalyticsAttribute(node);
        }

        // Process child nodes
        const children = node.querySelectorAll('[data-analytics]');
        children.forEach(processAnalyticsAttribute);
    }

    /**
     * Process a single element's data-analytics attribute
     * @param {Element} element - The element containing the data-analytics attribute
     */
    function processAnalyticsAttribute(element) {
        try {
            const analyticsData = JSON.parse(element.getAttribute('data-analytics'));
            if (analyticsData && analyticsData.type) {
                // Push the event to the data layer
                window.dataLayer.push({
                    event: analyticsData.type,
                    ...analyticsData,
                });

                // Remove the attribute to prevent duplicate processing
                element.removeAttribute('data-analytics');
            }
        } catch (error) {
            console.error('Error processing data-analytics attribute:', error);
        }
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
