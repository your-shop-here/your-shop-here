/* global window, document, MutationObserver */

(function () {
    // Create the data layer array if it doesn't exist. This array is used to
    // hold event data that will be sent to analytics platforms.
    window.dataLayer = window.dataLayer || [];

    /**
     * Processes a value to ensure it's an array.
     * If it's already an array, it's returned as is.
     * If it's a single object, it's wrapped in an array.
     * This utility function helps handle cases where the 'value' in
     * data-analytics attributes might be a single item or a list.
     * @param {any} value - The value to process.
     * @returns {Array} - The value as an array.
     */
    function ensureArray(value) {
        return Array.isArray(value) ? value : [value];
    }

    /**
     * Initializes the data layer and sets up a Mutation Observer to watch for
     * dynamically added elements in the DOM. This ensures that analytics
     * attributes on elements added after the initial page load are also processed.
     */
    function init() {
        // Set up mutation observer to watch for dynamically added elements.
        // When new elements are added to the DOM, the observer's callback function
        // will be executed.
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    // Only process element nodes (nodeType 1).
                    if (node.nodeType === 1) {
                        processNode(node);
                    }
                });
            });
        });

        // Start observing the document.body for changes to its children and
        // any changes within its descendants (subtree).
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Process existing elements in the DOM when the script initializes.
        processNode(document.body);
    }

    /**
     * Processes a given DOM node and its children to find and handle
     * 'data-analytics' and 'data-analytics-contribution' attributes.
     * @param {Element} node - The DOM node to process.
     */
    function processNode(node) {
        // Process the current node if it has the 'data-analytics' attribute.
        if (node.hasAttribute) {
            if (node.hasAttribute('data-analytics')) {
                processAnalyticsAttribute(node);
            }
            // Process the current node if it has the 'data-analytics-contribution' attribute.
            if (node.hasAttribute('data-analytics-contribution')) {
                processAnalyticsContributionAttribute(node);
            }
        }

        // Find all descendant elements that have the 'data-analytics' attribute
        // and process them.
        const analyticsElements = node.querySelectorAll('[data-analytics]');
        analyticsElements.forEach(processAnalyticsAttribute);

        // Find all descendant elements that have the 'data-analytics-contribution'
        // attribute and process them.
        const contributionElements = node.querySelectorAll('[data-analytics-contribution]');
        contributionElements.forEach(processAnalyticsContributionAttribute);
    }

    /**
     * Processes a single element's 'data-analytics' attribute. This attribute
     * is expected to contain a JSON object or an array of JSON objects, where
     * each object represents an analytics event to be pushed to the dataLayer.
     * @param {Element} element - The element containing the 'data-analytics' attribute.
     */
    function processAnalyticsAttribute(element) {
        try {
            // Parse the JSON string from the 'data-analytics' attribute.
            const analyticsElement = JSON.parse(element.getAttribute('data-analytics'));
            // Ensure that the parsed data is always an array to simplify processing.
            const analyticsArray = ensureArray(analyticsElement);

            // Iterate over each analytics event object in the array.
            analyticsArray.forEach((analyticsData) => {
                // Check if the event object has a 'type' property, which is typically
                // used to identify the type of analytics event.
                if (analyticsData && analyticsData.type) {
                    // Push the event data to the global dataLayer array. The spread
                    // syntax (...) is used to merge all properties of the analyticsData
                    // object into the object being pushed to the dataLayer.
                    window.dataLayer.push({
                        event: analyticsData.type,
                        ...analyticsData,
                    });
                }
            });
            // Remove the 'data-analytics' attribute after processing to prevent
            // the element from being processed again.
            element.removeAttribute('data-analytics');
        } catch (error) {
            console.error('Error processing data-analytics attribute:', error);
        }
    }

    /**
     * Processes a single element's 'data-analytics-contribution' attribute.
     * This attribute is used to enrich existing events in the dataLayer. It expects
     * a JSON object containing information about which dataLayer event to target
     * ('contributesTo'), how to update it ('contributionOptions'), and the
     * value to contribute.
     * @param {Element} element - The element containing the 'data-analytics-contribution' attribute.
     */
    function processAnalyticsContributionAttribute(element) {
        try {
            // Parse the JSON string from the 'data-analytics-contribution' attribute.
            const contributionConfig = JSON.parse(element.getAttribute('data-analytics-contribution'));

            // Check if the configuration object has the 'contributesTo' property,
            // which specifies the 'type' of dataLayer events to modify.
            if (contributionConfig && contributionConfig.contributesTo) {
                // Ensure that the 'value' to contribute is always an array to
                // handle both single objects and lists consistently.
                const contributionValues = ensureArray(contributionConfig.value);

                window.dataLayer.forEach((contribution) => {
                    // Check if the 'type' of the current dataLayer entry is included
                    // in the 'contributesTo' array from the attribute.
                    if (contributionConfig.contributesTo.includes(contribution.type)) {
                        // Get the name of the property to update in the dataLayer entry.
                        const property = contributionConfig.contributionOptions.property;
                        // Get the mode of contribution ('array-push' or 'object-assign').
                        const mode = contributionConfig.contributionOptions.mode;

                        // Iterate over each value that needs to be contributed.
                        contributionValues.forEach((contributionValue) => {
                            // If the mode is 'array-push', push the contribution value
                            // to the specified array property in the dataLayer entry.
                            if (mode === 'array-push') {
                                // Ensure the property is an array before pushing.
                                if (!Array.isArray(contribution[property])) {
                                    contribution[property] = [];
                                }
                                contribution[property].push(contributionValue);
                            }

                            // If the mode is 'object-assign', merge the contribution value
                            // (which should be an object) into the specified property
                            // of the dataLayer entry. The spread syntax creates a new
                            // object with the existing properties and overwrites/adds
                            // properties from the contribution value.
                            else if (mode === 'object-assign') {
                                contribution[property] = { ...contribution[property], ...contributionValue };
                            }
                        });
                    }
                });
            }
            // Remove the 'data-analytics-contribution' attribute after processing
            // to prevent the element from being processed again.
            element.removeAttribute('data-analytics-contribution');
        } catch (error) {
            console.error('Error processing data-analytics-contribution attribute:', error);
        }
    }

    // Initialize the script when the DOM is ready. This ensures that all
    // initially present elements are processed.
    if (document.readyState === 'loading') {
        // If the DOM is still loading, add an event listener for the
        // 'DOMContentLoaded' event, which fires when the initial HTML
        // document has been completely loaded and parsed.
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // If the DOM is already loaded, execute the init function immediately.
        init();
    }
}());
