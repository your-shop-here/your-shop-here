/* global window, document, MutationObserver */

(function () {
    // Create the data layer array if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    /**
     * Processes a value to ensure it's an array.
     * If it's already an array, it's returned as is.
     * If it's a single object, it's wrapped in an array.
     * @param {any} value - The value to process.
     * @returns {Array} - The value as an array.
     */
    function ensureArray(value) {
        return Array.isArray(value) ? value : [value];
    }

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
        if (node.hasAttribute) {
            if (node.hasAttribute('data-analytics')) {
                processAnalyticsAttribute(node);
            }
            if (node.hasAttribute('data-analytics-contribution')) {
                processAnalyticsContributionAttribute(node);
            }
        }

        // Process child nodes
        const analyticsElements = node.querySelectorAll('[data-analytics]');
        analyticsElements.forEach(processAnalyticsAttribute);

        const contributionElements = node.querySelectorAll('[data-analytics-contribution]');
        contributionElements.forEach(processAnalyticsContributionAttribute);
    }

    /**
     * Process a single element's data-analytics attribute
     * @param {Element} element - The element containing the data-analytics attribute
     */
    function processAnalyticsAttribute(element) {
        try {
            const analyticsElement = JSON.parse(element.getAttribute('data-analytics'));
            const analyticsArray = ensureArray(analyticsElement);

            analyticsArray.forEach((analyticsData) => {
                if (analyticsData && analyticsData.type) {
                    // Push the event to the data layer
                    window.dataLayer.push({
                        event: analyticsData.type,
                        ...analyticsData,
                    });
                }
            });
            // Remove the attribute to prevent duplicate processing
            element.removeAttribute('data-analytics');
        } catch (error) {
            console.error('Error processing data-analytics attribute:', error);
        }
    }

    /**
     * Process a single element's data-analytics-contribution attribute
     * @param {Element} element - The element containing the data-analytics-contribution attribute
     */
    function processAnalyticsContributionAttribute(element) {
        try {
            const contributionConfig = JSON.parse(element.getAttribute('data-analytics-contribution'));

            if (contributionConfig && contributionConfig.contributesTo) {
                const contributionValues = ensureArray(contributionConfig.value);

                window.dataLayer.forEach((contribution) => {
                    if (contributionConfig.contributesTo.includes(contribution.type)) {
                        const property = contributionConfig.contributionOptions.property;
                        const mode = contributionConfig.contributionOptions.mode;

                        contributionValues.forEach((contributionValue) => {
                            if (mode === 'array-push') {
                                if (!Array.isArray(contribution[property])) {
                                    contribution[property] = [];
                                }

                                contribution[property].push(contributionValue);
                            } else if (mode === 'object-assign') {
                                contribution[property] = { ...contribution[property], ...contributionValue };
                            }
                        });
                    }
                });
            }
            // Remove the attribute to prevent duplicate processing
            element.removeAttribute('data-analytics-contribution');
        } catch (error) {
            console.error('Error processing data-analytics-contribution attribute:', error);
        }
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
