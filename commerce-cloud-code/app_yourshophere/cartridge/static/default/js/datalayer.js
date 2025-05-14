/* global window, document, MutationObserver */

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
            console.info(`loglog ${element.getAttribute('data-analytics')}`);
            const analyticsElement = JSON.parse(element.getAttribute('data-analytics'));
            let analyticsArray = [];
            if (Array.isArray(analyticsElement)) {
                analyticsArray = analyticsElement;
            } else {
                analyticsArray.push(analyticsElement);
            }
            analyticsArray.forEach((analyticsData) => {
                if (analyticsData && analyticsData.type) {
                    // Push the event to the data layer
                    window.dataLayer.push({
                        event: analyticsData.type,
                        ...analyticsData,
                    });
                } else if (analyticsData && analyticsData.enrichmentTypes) {
                    // we allow to enrich datalayer events from other elements in the DOM
                    // we go by the type of the element in the dataLayer to map it in
                    // enrichable property should be an array, which we push the value on
                    window.dataLayer.forEach((enrichmentItem) => {
                        if (analyticsData.enrichmentTypes.includes(enrichmentItem.type)) {
                            enrichmentItem[analyticsData.enrichmentProperty].push(analyticsData.value);
                        }
                    });
                }
                // Remove the attribute to prevent duplicate processing
                element.removeAttribute('data-analytics');
            });
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
