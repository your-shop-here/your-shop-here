(() => {
    let rootEditorElement;
    let currentConfig = {
        desktopColumns: 2,
        mobileColumns: 1,
        columnWidths: [50, 50], // Default 50/50 split
        mobileColumnWidths: [100], // Default 100% for mobile
        desktopGap: 2, // Default 10px gap
        mobileGap: 2, // Default 10px gap
    };

    /**
     * Creates a slider element with label and value display
     * @param {string} id - The ID of the slider
     * @param {string} label - The label of the slider
     * @param {number} min - The minimum value of the slider
     * @param {number} max - The maximum value of the slider
     * @param {number} value - The current value of the slider
     * @param {number} step - The step size of the slider
     * @returns {HTMLElement} The created slider element
     */
    function createSlider(id, label, min, max, value, step = 1) {
        const container = document.createElement('div');
        container.className = 'slds-form-element slds-p-around_small';

        const labelElement = document.createElement('label');
        labelElement.className = 'slds-form-element__label';
        labelElement.textContent = label;

        const controlContainer = document.createElement('div');
        controlContainer.className = 'slds-form-element__control';

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slds-slider';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = id;
        slider.className = 'slds-slider__range';
        slider.min = min;
        slider.max = max;
        slider.value = value;
        slider.step = step;

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'slds-slider__value';
        valueDisplay.textContent = value;

        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
            updateColumnWidths();
        });

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        controlContainer.appendChild(sliderContainer);
        container.appendChild(labelElement);
        container.appendChild(controlContainer);

        return container;
    }

    /**
     * Creates a percentage slider for column width
     * @param {number} columnIndex - The index of the column
     * @param {number} maxWidth - The maximum width of the column
     * @param {string} type - The type of slider ('desktop' or 'mobile')
     * @param {boolean} isLastColumn - Whether this is the last column (auto-adjusting)
     * @returns {HTMLElement} The created column width slider element
     */
    function createColumnWidthSlider(columnIndex, maxWidth, type = 'desktop', isLastColumn = false) {
        const container = document.createElement('div');
        container.className = 'slds-form-element slds-p-around_small';

        const labelElement = document.createElement('label');
        labelElement.className = 'slds-form-element__label';
        labelElement.textContent = `Column ${columnIndex + 1} Width (%)${isLastColumn ? ' (Auto)' : ''}`;

        const controlContainer = document.createElement('div');
        controlContainer.className = 'slds-form-element__control';

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slds-slider';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `${type}-column-width-${columnIndex}`;
        slider.className = `slds-slider__range ${type}-column-width-slider`;
        slider.min = 10;
        slider.max = maxWidth;

        // Set initial value based on type
        if (type === 'mobile') {
            slider.value = currentConfig.mobileColumnWidths ? currentConfig.mobileColumnWidths[columnIndex] || 50 : 50;
        } else {
            slider.value = currentConfig.columnWidths ? currentConfig.columnWidths[columnIndex] || 50 : 50;
        }

        slider.step = 1;
        slider.dataset.columnIndex = columnIndex;
        slider.dataset.type = type;
        slider.dataset.isLastColumn = isLastColumn.toString();

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'slds-slider__value';
        valueDisplay.textContent = slider.value;

        slider.addEventListener('change', (e) => {
            valueDisplay.textContent = e.target.value;
            updateColumnWidths(e);
        });

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        controlContainer.appendChild(sliderContainer);
        container.appendChild(labelElement);
        container.appendChild(controlContainer);

        return container;
    }

    /**
     * Updates column widths based on slider values
     * @param {Event} e - The event that triggered the update (optional)
     * @returns {void}
     */
    function updateColumnWidths(e) {
        const desktopColumns = parseInt(document.getElementById('desktop-columns').value);
        const mobileColumns = parseInt(document.getElementById('mobile-columns').value);

        // Check if the event was triggered by a last column slider
        const isLastColumnEvent = e && e.target && e.target.dataset.isLastColumn === 'true';
        const eventType = e && e.target ? e.target.dataset.type : null;

        // Handle desktop sliders
        const desktopSliders = document.querySelectorAll('.desktop-column-width-slider');
        const desktopValues = Array.from(desktopSliders).map((slider) => parseInt(slider.value));

        // Handle mobile sliders
        const mobileSliders = document.querySelectorAll('.mobile-column-width-slider');
        const mobileValues = Array.from(mobileSliders).map((slider) => parseInt(slider.value));

        // Calculate available space considering gaps
        const desktopGap = currentConfig.desktopGap || 0;
        const mobileGap = currentConfig.mobileGap || 0;
        const desktopGapSpace = desktopColumns > 1 ? (desktopColumns - 1) * desktopGap : 0;
        const mobileGapSpace = mobileColumns > 1 ? (mobileColumns - 1) * mobileGap : 0;
        const desktopAvailableSpace = 100 - desktopGapSpace;
        const mobileAvailableSpace = 100 - mobileGapSpace;

        // If the last column was manually adjusted or the slider is initialised, don't adjust last column to maintain available space but use actual value
        if (isLastColumnEvent || !e) {
            const lastSliderIndex = e ? parseInt(e.target.dataset.columnIndex) : desktopValues.length - 1;
            const lastValue = e ? parseInt(e.target.value) : desktopAvailableSpace - desktopValues.reduce((sum, val) => sum + val, 0);

            if (eventType === 'desktop') {
                // Calculate how much the last column changed
                const previousTotal = desktopValues.reduce((sum, val, index) => (index === lastSliderIndex ? sum : sum + val), 0);
                const newTotal = previousTotal + lastValue;

                if (newTotal > desktopAvailableSpace) {
                    // If total exceeds available space, adjust other columns proportionally
                    const excess = newTotal - desktopAvailableSpace;
                    const otherColumns = desktopValues.filter((_, index) => index !== lastSliderIndex);
                    const otherTotal = otherColumns.reduce((sum, val) => sum + val, 0);

                    if (otherTotal > 0) {
                        const scaleFactor = (otherTotal - excess) / otherTotal;
                        desktopValues.forEach((val, index) => {
                            if (index !== lastSliderIndex) {
                                const newValue = Math.max(10, Math.round(val * scaleFactor));
                                desktopValues[index] = newValue;
                                desktopSliders[index].value = newValue;
                                desktopSliders[index].nextElementSibling.textContent = newValue;
                            }
                        });
                    }
                }
            } else if (eventType === 'mobile') {
                // Same logic for mobile
                const previousTotal = mobileValues.reduce((sum, val, index) => (index === lastSliderIndex ? sum : sum + val), 0);
                const newTotal = previousTotal + lastValue;

                if (newTotal > mobileAvailableSpace) {
                    const excess = newTotal - mobileAvailableSpace;
                    const otherColumns = mobileValues.filter((_, index) => index !== lastSliderIndex);
                    const otherTotal = otherColumns.reduce((sum, val) => sum + val, 0);

                    if (otherTotal > 0) {
                        const scaleFactor = (otherTotal - excess) / otherTotal;
                        mobileValues.forEach((val, index) => {
                            if (index !== lastSliderIndex) {
                                const newValue = Math.max(10, Math.round(val * scaleFactor));
                                mobileValues[index] = newValue;
                                mobileSliders[index].value = newValue;
                                mobileSliders[index].nextElementSibling.textContent = newValue;
                            }
                        });
                    }
                }
            }
        } else {
            // Normal auto-calculation for non-last columns
            const desktopNonLastValues = desktopValues.slice(0, -1);
            const mobileNonLastValues = mobileValues.slice(0, -1);

            const desktopOtherTotal = desktopNonLastValues.reduce((sum, val) => sum + val, 0);
            const mobileOtherTotal = mobileNonLastValues.reduce((sum, val) => sum + val, 0);

            // Calculate last column values (remaining percentage)
            const desktopLastValue = Math.max(10, desktopAvailableSpace - desktopOtherTotal);
            const mobileLastValue = Math.max(10, mobileAvailableSpace - mobileOtherTotal);

            // Update last column sliders and their displays
            const desktopLastSlider = document.querySelector('.desktop-column-width-slider[data-is-last-column="true"]');
            if (desktopLastSlider) {
                desktopLastSlider.value = desktopLastValue;
                desktopLastSlider.nextElementSibling.textContent = desktopLastValue;
                desktopValues[desktopValues.length - 1] = desktopLastValue;
            }

            const mobileLastSlider = document.querySelector('.mobile-column-width-slider[data-is-last-column="true"]');
            if (mobileLastSlider) {
                mobileLastSlider.value = mobileLastValue;
                mobileLastSlider.nextElementSibling.textContent = mobileLastValue;
                mobileValues[mobileValues.length - 1] = mobileLastValue;
            }
        }

        // Update current config
        currentConfig.columnWidths = desktopValues.slice(0, desktopColumns);
        currentConfig.mobileColumnWidths = mobileValues.slice(0, mobileColumns);

        // Emit the updated value
        emit({
            type: 'sfcc:value',
            payload: {
                desktopColumns: currentConfig.desktopColumns,
                mobileColumns: currentConfig.mobileColumns,
                columnWidths: currentConfig.columnWidths,
                mobileColumnWidths: currentConfig.mobileColumnWidths,
                desktopGap: currentConfig.desktopGap,
                mobileGap: currentConfig.mobileGap,
            },
        });
    }

    /**
     * Handles desktop gap slider changes
     * @param {Event} e - The change event
     */
    function handleDesktopGapChange(e) {
        currentConfig.desktopGap = parseInt(e.target.value, 10);
        emit({
            type: 'sfcc:value',
            payload: {
                desktopColumns: currentConfig.desktopColumns,
                mobileColumns: currentConfig.mobileColumns,
                columnWidths: currentConfig.columnWidths,
                mobileColumnWidths: currentConfig.mobileColumnWidths,
                desktopGap: currentConfig.desktopGap,
                mobileGap: currentConfig.mobileGap,
            },
        });
    }

    /**
     * Handles mobile gap slider changes
     * @param {Event} e - The change event
     */
    function handleMobileGapChange(e) {
        currentConfig.mobileGap = parseInt(e.target.value, 10);
        emit({
            type: 'sfcc:value',
            payload: {
                desktopColumns: currentConfig.desktopColumns,
                mobileColumns: currentConfig.mobileColumns,
                columnWidths: currentConfig.columnWidths,
                mobileColumnWidths: currentConfig.mobileColumnWidths,
                desktopGap: currentConfig.desktopGap,
                mobileGap: currentConfig.mobileGap,
            },
        });
    }

    /**
     * Rebuilds the column width sliders based on number of columns
     */
    function rebuildColumnWidthSliders() {
        const desktopColumns = parseInt(document.getElementById('desktop-columns').value);
        const mobileColumns = parseInt(document.getElementById('mobile-columns').value);

        currentConfig.desktopColumns = desktopColumns;
        currentConfig.mobileColumns = mobileColumns;

        // Remove existing desktop column width sliders
        const existingDesktopSliders = rootEditorElement.querySelectorAll('.desktop-column-width-slider');
        existingDesktopSliders.forEach((slider) => {
            slider.parentElement.parentElement.parentElement.remove();
        });

        // Remove existing mobile column width sliders
        const existingMobileSliders = rootEditorElement.querySelectorAll('.mobile-column-width-slider');
        existingMobileSliders.forEach((slider) => {
            slider.parentElement.parentElement.parentElement.remove();
        });

        // Add new desktop column width sliders
        const columnWidthsContainer = rootEditorElement.querySelector('#column-widths-container');
        columnWidthsContainer.innerHTML = '';

        for (let i = 0; i < desktopColumns; i++) {
            const isLastColumn = i === desktopColumns - 1;
            const maxWidth = isLastColumn ? 100 : 90; // Last column can use remaining space
            const slider = createColumnWidthSlider(i, maxWidth, 'desktop', isLastColumn);
            columnWidthsContainer.appendChild(slider);
        }

        // Add new mobile column width sliders
        const mobileWidthsContainer = rootEditorElement.querySelector('#mobile-widths-container');
        if (mobileWidthsContainer) {
            mobileWidthsContainer.innerHTML = '';
            for (let i = 0; i < mobileColumns; i++) {
                const isLastColumn = i === mobileColumns - 1;
                const maxWidth = isLastColumn ? 100 : 90; // Last column can use remaining space
                const slider = createColumnWidthSlider(i, maxWidth, 'mobile', isLastColumn);
                mobileWidthsContainer.appendChild(slider);
            }
        }

        // Calculate available space considering gaps
        const desktopGap = currentConfig.desktopGap || 0;
        const mobileGap = currentConfig.mobileGap || 0;
        const desktopGapSpace = desktopColumns > 1 ? (desktopColumns - 1) * desktopGap : 0;
        const mobileGapSpace = mobileColumns > 1 ? (mobileColumns - 1) * mobileGap : 0;
        const desktopAvailableSpace = 100 - desktopGapSpace;
        const mobileAvailableSpace = 100 - mobileGapSpace;

        // Initialize desktop column widths if not set or if column count changed
        if (!currentConfig.columnWidths || currentConfig.columnWidths.length !== desktopColumns) {
            const equalWidth = Math.floor(desktopAvailableSpace / desktopColumns);
            currentConfig.columnWidths = Array(desktopColumns).fill(equalWidth);

            // Adjust the last column to use remaining space
            const total = equalWidth * (desktopColumns - 1);
            currentConfig.columnWidths[desktopColumns - 1] = desktopAvailableSpace - total;
        }

        // Initialize mobile column widths if not set or if column count changed
        if (!currentConfig.mobileColumnWidths || currentConfig.mobileColumnWidths.length !== mobileColumns) {
            const equalWidth = Math.floor(mobileAvailableSpace / mobileColumns);
            currentConfig.mobileColumnWidths = Array(mobileColumns).fill(equalWidth);

            // Adjust the last column to use remaining space
            const total = equalWidth * (mobileColumns - 1);
            currentConfig.mobileColumnWidths[mobileColumns - 1] = mobileAvailableSpace - total;
        }

        // Set desktop slider values
        const desktopSliders = rootEditorElement.querySelectorAll('.desktop-column-width-slider');
        desktopSliders.forEach((slider, index) => {
            if (currentConfig.columnWidths[index] !== undefined) {
                slider.value = currentConfig.columnWidths[index];
                slider.nextElementSibling.textContent = currentConfig.columnWidths[index];
            }
        });

        // Set mobile slider values
        const mobileSliders = rootEditorElement.querySelectorAll('.mobile-column-width-slider');
        mobileSliders.forEach((slider, index) => {
            if (currentConfig.mobileColumnWidths && currentConfig.mobileColumnWidths[index] !== undefined) {
                slider.value = currentConfig.mobileColumnWidths[index];
                slider.nextElementSibling.textContent = currentConfig.mobileColumnWidths[index];
            }
        });

        // Show/hide gap settings based on column count
        const gapSettingsContainer = rootEditorElement.querySelector('#gap-settings-container');
        const desktopGapContainer = rootEditorElement.querySelector('#desktop-gap-container');
        const mobileGapContainer = rootEditorElement.querySelector('#mobile-gap-container');
        
        // Clear existing gap sliders
        desktopGapContainer.innerHTML = '';
        mobileGapContainer.innerHTML = '';
        
        // Show desktop gap slider if more than 1 column
        if (desktopColumns > 1) {
            const desktopGapSlider = createSlider('desktop-gap', 'Desktop Gap (%)', 0, 50, currentConfig.desktopGap || 2);
            desktopGapContainer.appendChild(desktopGapSlider);
        }
        
        // Show mobile gap slider if more than 1 column
        if (mobileColumns > 1) {
            const mobileGapSlider = createSlider('mobile-gap', 'Mobile Gap (%)', 0, 50, currentConfig.mobileGap || 2);
            mobileGapContainer.appendChild(mobileGapSlider);
        }
        
        // Show gap settings container if any gap sliders are visible
        if (desktopColumns > 1 || mobileColumns > 1) {
            gapSettingsContainer.style.display = 'block';
        } else {
            gapSettingsContainer.style.display = 'none';
        }

        // Add event listeners for gap sliders (they are recreated each time, so we need to add listeners)
        const desktopGapSlider = rootEditorElement.querySelector('#desktop-gap');
        const mobileGapSlider = rootEditorElement.querySelector('#mobile-gap');
        
        if (desktopGapSlider) {
            // Remove existing listener to prevent duplicates
            desktopGapSlider.removeEventListener('change', handleDesktopGapChange);
            desktopGapSlider.addEventListener('change', handleDesktopGapChange);
        }
        
        if (mobileGapSlider) {
            // Remove existing listener to prevent duplicates
            mobileGapSlider.removeEventListener('change', handleMobileGapChange);
            mobileGapSlider.addEventListener('change', handleMobileGapChange);
        }

        updateColumnWidths();
    }

    /**
     * Initializes the editor markup
     */
    function init() {
        rootEditorElement = document.createElement('div');
        rootEditorElement.className = 'slds-box';
        rootEditorElement.innerHTML = `
            <div class="slds-grid slds-wrap">
                <div class="slds-size_1-of-1 slds-p-bottom_medium">
                    <h3 class="slds-text-heading_small">Column Configuration</h3>
                </div>
                
                <div class="slds-size_1-of-2 slds-p-right_small">
                    <div id="desktop-columns-container"></div>
                </div>
                
                <div class="slds-size_1-of-2 slds-p-left_small">
                    <div id="mobile-columns-container"></div>
                </div>
                
                <div class="slds-size_1-of-1 slds-p-top_medium" id="gap-settings-container" style="display: none;">
                    <div class="slds-divider slds-divider_vertical"></div>
                    <h4 class="slds-text-heading_small slds-p-top_small">Column Gap Settings</h4>
                    <div class="slds-grid slds-wrap">
                        <div class="slds-size_1-of-2 slds-p-right_small">
                            <div id="desktop-gap-container"></div>
                        </div>
                        <div class="slds-size_1-of-2 slds-p-left_small">
                            <div id="mobile-gap-container"></div>
                        </div>
                    </div>
                </div>
                
                <div class="slds-size_1-of-1 slds-p-top_medium">
                    <div class="slds-divider slds-divider_vertical"></div>
                    <h4 class="slds-text-heading_small slds-p-top_small">Column Widths (Desktop)</h4>
                    <div id="column-widths-container"></div>
                </div>
                <div class="slds-size_1-of-1 slds-p-top_medium">
                    <div class="slds-divider slds-divider_vertical"></div>
                    <h4 class="slds-text-heading_small slds-p-top_small">Column Widths (Mobile)</h4>
                    <div id="mobile-widths-container"></div>
                </div>
            </div>
        `;

        document.body.appendChild(rootEditorElement);
    }

    /**
     * Handles the sfcc:ready event
     * @param {object} value - The value of the editor
     * @param {object} config - The config of the editor
     * @param {boolean} isDisabled - Whether the editor is disabled
     * @param {boolean} isRequired - Whether the editor is required
     * @param {string} dataLocale - The data locale
     * @param {string} displayLocale - The display locale
     */
    listen('sfcc:ready', async ({
        value, config, isDisabled, isRequired, dataLocale, displayLocale,
    }) => {
        // Parse existing value if available
        if (value && typeof value === 'object') {
            currentConfig = {
                desktopColumns: value.desktopColumns || 2,
                mobileColumns: value.mobileColumns || 1,
                columnWidths: value.columnWidths || [50, 50],
                mobileColumnWidths: value.mobileColumnWidths || [100],
                desktopGap: value.desktopGap || 2,
                mobileGap: value.mobileGap || 2,
            };
        }

        // Create desktop columns slider
        const desktopContainer = rootEditorElement.querySelector('#desktop-columns-container');
        const desktopSlider = createSlider('desktop-columns', 'Desktop Columns', 1, 4, currentConfig.desktopColumns);
        desktopContainer.appendChild(desktopSlider);

        // Create mobile columns slider
        const mobileContainer = rootEditorElement.querySelector('#mobile-columns-container');
        const mobileSlider = createSlider('mobile-columns', 'Mobile Columns', 1, 4, currentConfig.mobileColumns);
        mobileContainer.appendChild(mobileSlider);

        // Add event listeners for column count changes
        document.getElementById('desktop-columns').addEventListener('change', rebuildColumnWidthSliders);
        document.getElementById('mobile-columns').addEventListener('change', rebuildColumnWidthSliders);

        // Build initial column width sliders
        rebuildColumnWidthSliders();

        // Emit initial value
        emit({
            type: 'sfcc:value',
            payload: {
                desktopColumns: currentConfig.desktopColumns,
                mobileColumns: currentConfig.mobileColumns,
                columnWidths: currentConfig.columnWidths,
                mobileColumnWidths: currentConfig.mobileColumnWidths,
                desktopGap: currentConfig.desktopGap,
                mobileGap: currentConfig.mobileGap,
            },
        });
    });

    // Handle value events
    listen('sfcc:value', (value) => {
        // Handle incoming value updates if needed
    });

    // Handle required events
    listen('sfcc:required', (value) => {
        // Handle required state if needed
    });

    // Handle disabled events
    listen('sfcc:disabled', (value) => {
        if (rootEditorElement) {
            const inputs = rootEditorElement.querySelectorAll('input');
            inputs.forEach((input) => {
                input.disabled = value;
            });
        }
    });

    // Initialize the editor
    init();
})();
