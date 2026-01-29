/**
 * Overlay Position Editor (Client-side)
 * Custom editor for selecting overlay position (9-position grid) and padding
 */
(() => {
  let rootEditorElement;
  let config = null;
  let currentPosition = 'middle-center';
  let currentPadding = 10;
  let paddingUnit = 'percent';
  let backgroundColor = 'none';
  let transparency = 100;

  // Position options: [row, column] indices for 3x3 grid
  const positions = [
    { value: 'top-left', label: 'Top Left', row: 0, col: 0 },
    { value: 'top-center', label: 'Top Center', row: 0, col: 1 },
    { value: 'top-right', label: 'Top Right', row: 0, col: 2 },
    { value: 'middle-left', label: 'Middle Left', row: 1, col: 0 },
    { value: 'middle-center', label: 'Middle Center', row: 1, col: 1 },
    { value: 'middle-right', label: 'Middle Right', row: 1, col: 2 },
    { value: 'bottom-left', label: 'Bottom Left', row: 2, col: 0 },
    { value: 'bottom-center', label: 'Bottom Center', row: 2, col: 1 },
    { value: 'bottom-right', label: 'Bottom Right', row: 2, col: 2 }
  ];

  /**
   * Generates SVG icon for position (Lucidchart style)
   */
  function generatePositionIcon(position) {
    const icons = {
      'top-left': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b"><path d="M 74.534 233.151 C 66.534 225.151 66.534 214.151 74.534 206.151 L 224.534 59.151 C 232.534 51.151 244.534 51.151 252.534 59.151 L 403.534 206.151 C 411.534 214.151 411.534 225.151 403.534 233.151 L 375.534 260.151 C 367.757 267.774 355.311 267.774 347.534 260.151 L 300.534 214.151 C 292.534 206.151 278.534 211.151 278.534 223.151 L 278.534 493.151 C 278.534 503.151 269.534 513.151 258.534 513.151 L 218.534 513.151 C 207.534 513.151 198.534 502.151 198.534 493.151 L 198.534 223.151 C 198.534 211.151 184.534 206.151 176.534 214.151 L 129.534 260.151 C 121.757 267.774 109.311 267.774 101.534 260.151 L 74.534 233.151 Z" style="transform-origin: 239.034px 283.151px 0px;" transform="matrix(0.706348, -0.707865, 0.707865, 0.706348, 0, 0)"/></svg>`,
      'top-center': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 52 52" fill="#706e6b"><path d="M9.66 10.17a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h32.68a2 2 0 0 1 2 2v4.13a2 2 0 0 1-2 2ZM24 50a2.12 2.12 0 0 1-2.05-2V30.6a1.3 1.3 0 0 0-2.24-.92l-4.8 4.69a2 2 0 0 1-2.86 0l-2.9-2.75a1.86 1.86 0 0 1 0-2.76l15.42-15a2 2 0 0 1 2.86 0l15.32 15a1.86 1.86 0 0 1 0 2.76L40 34.37a2 2 0 0 1-2.86 0l-4.8-4.69a1.3 1.3 0 0 0-2.24.92V48a2.19 2.19 0 0 1-2.1 2h-4Z"/></svg>`,
      'top-right': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b"><path d="M 74.534 333.151 C 66.534 341.151 66.534 352.151 74.534 360.151 L 224.534 507.151 C 232.534 515.151 244.534 515.151 252.534 507.151 L 403.534 360.151 C 411.534 352.151 411.534 341.151 403.534 333.151 L 375.534 306.151 C 367.757 298.528 355.311 298.528 347.534 306.151 L 300.534 352.151 C 292.534 360.151 278.534 355.151 278.534 343.151 L 278.534 73.151 C 278.534 63.151 269.534 53.151 258.534 53.151 L 218.534 53.151 C 207.534 53.151 198.534 64.151 198.534 73.151 L 198.534 343.151 C 198.534 355.151 184.534 360.151 176.534 352.151 L 129.534 306.151 C 121.757 298.528 109.311 298.528 101.534 306.151 L 74.534 333.151 Z" style="transform-origin: 239.034px 283.151px 0px;" transform="matrix(-0.706348, -0.707865, 0.707865, -0.706348, 0, 0)"/></svg>`,
      'middle-left': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b"><path d="M102 423a20 20 0 0 1-20 20H40a20 20 0 0 1-20-20V97a20 20 0 0 1 20-20h41a20 20 0 0 1 20 20Zm398-143a21 21 0 0 1-20 20H306a13 13 0 0 0-10 23l48 48a20 20 0 0 1 0 28l-28 30a19 19 0 0 1-27 0L139 274a20 20 0 0 1 0-29L289 92a19 19 0 0 1 27 0l28 28a20 20 0 0 1 0 29l-47 48a13 13 0 0 0 9 22h174a22 22 0 0 1 20 21Z"/></svg>`,
      'middle-center': `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><path d="M26,2C12.7,2,2,12.7,2,26s10.7,24,24,24,24-10.7,24-24S39.3,2,26,2Z" fill="#706e6b" fill-rule="evenodd" stroke-width="0"/></svg>`,
      'middle-right': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b"><path d="M418 97a20 20 0 0 1 20-20h42a20 20 0 0 1 20 20v326a20 20 0 0 1-20 20h-41a20 20 0 0 1-20-20ZM20 240a21 21 0 0 1 20-20h174a13 13 0 0 0 10-22l-49-48a20 20 0 0 1 0-29l28-29a19 19 0 0 1 27 0l150 154a20 20 0 0 1 0 29L230 428a19 19 0 0 1-27 0l-27-28a20 20 0 0 1 0-29l47-48a13 13 0 0 0-9-22H40a22 22 0 0 1-20-21Z"/></svg>`,
      'bottom-left': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b">
  <path d="M 74.534 333.151 C 66.534 341.151 66.534 352.151 74.534 360.151 L 224.534 507.151 C 232.534 515.151 244.534 515.151 252.534 507.151 L 403.534 360.151 C 411.534 352.151 411.534 341.151 403.534 333.151 L 375.534 306.151 C 367.757 298.528 355.311 298.528 347.534 306.151 L 300.534 352.151 C 292.534 360.151 278.534 355.151 278.534 343.151 L 278.534 73.151 C 278.534 63.151 269.534 53.151 258.534 53.151 L 218.534 53.151 C 207.534 53.151 198.534 64.151 198.534 73.151 L 198.534 343.151 C 198.534 355.151 184.534 360.151 176.534 352.151 L 129.534 306.151 C 121.757 298.528 109.311 298.528 101.534 306.151 L 74.534 333.151 Z" style="transform-origin: 239.034px 283.151px 0px;" transform="matrix(0.706348, 0.707865, -0.707865, 0.706348, 0, 0)"/>
</svg>`,
      'bottom-center': `<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b"><path d="M423 418a20 20 0 0 1 20 20v42a20 20 0 0 1-20 20H97a20 20 0 0 1-20-20v-41a20 20 0 0 1 20-20ZM280 20a21 21 0 0 1 20 20v174a13 13 0 0 0 23 10l48-48a20 20 0 0 1 28 0l30 28a19 19 0 0 1 0 27L274 381a20 20 0 0 1-29 0L92 231a19 19 0 0 1 0-27l28-28a20 20 0 0 1 29 0l48 47a13 13 0 0 0 22-9V40a22 22 0 0 1 21-20h40Z"/></svg>`,
      'bottom-right': `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="0 0 520 520" fill="#706e6b">
  <path d="M 74.534 233.151 C 66.534 225.151 66.534 214.151 74.534 206.151 L 224.534 59.151 C 232.534 51.151 244.534 51.151 252.534 59.151 L 403.534 206.151 C 411.534 214.151 411.534 225.151 403.534 233.151 L 375.534 260.151 C 367.757 267.774 355.311 267.774 347.534 260.151 L 300.534 214.151 C 292.534 206.151 278.534 211.151 278.534 223.151 L 278.534 493.151 C 278.534 503.151 269.534 513.151 258.534 513.151 L 218.534 513.151 C 207.534 513.151 198.534 502.151 198.534 493.151 L 198.534 223.151 C 198.534 211.151 184.534 206.151 176.534 214.151 L 129.534 260.151 C 121.757 267.774 109.311 267.774 101.534 260.151 L 74.534 233.151 Z" style="transform-origin: 239.034px 283.151px 0px;" transform="matrix(-0.706348, 0.707865, -0.707865, -0.706348, 0, 0)"/>
</svg>`,
    };
    return icons[position] || '';
  }

  /**
   * Generates the position grid HTML
   */
  function generatePositionGridHTML() {
    const grid = positions.map((pos, index) => {
      const isChecked = currentPosition === pos.value ? 'checked' : '';
      const icon = generatePositionIcon(pos.value);
      return `
        <label class="overlay-position-btn" for="overlay-pos-${index}" title="${pos.label}">
          <input type="radio" name="overlayPosition" id="overlay-pos-${index}" value="${pos.value}" ${isChecked} />
          <span class="overlay-position-icon">${icon}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="overlay-position-grid">
        ${grid}
      </div>
    `;
  }

  // Background color options
  const backgroundColors = [
    { value: 'none', label: 'None' },
    { value: 'page-background', label: 'Page Background' },
    { value: 'primary-color', label: 'Primary Color' },
    { value: 'secondary-color', label: 'Secondary Color' },
    { value: 'text-color', label: 'Text Color' }
  ];

  /**
   * Generates the background color button bar HTML
   */
  function generateBackgroundColorHTML() {
    const buttons = backgroundColors.map((color, index) => {
      const isActive = backgroundColor === color.value ? 'active' : '';
      return `
        <button type="button" data-color="${color.value}" class="overlay-bg-color-btn ${isActive}" title="${color.label}">
          ${color.label}
        </button>
      `;
    }).join('');

    return `
      <div class="overlay-background-control">
        <label class="slds-form-element__label">Background Color</label>
        <div class="overlay-bg-color-group">
          ${buttons}
        </div>
      </div>
    `;
  }

  /**
   * Generates the transparency slider HTML
   */
  function generateTransparencySliderHTML() {
    return `
      <div class="overlay-transparency-control">
        <label class="slds-form-element__label" for="overlay-transparency-slider">
          Transparency: <span id="overlay-transparency-value">${transparency}</span>%
        </label>
        <div class="slds-form-element__control">
          <input 
            type="range" 
            id="overlay-transparency-slider" 
            class="slds-slider" 
            min="0" 
            max="100" 
            step="1" 
            value="${transparency}"
          />
        </div>
      </div>
    `;
  }

  /**
   * Generates the padding slider HTML
   */
  function generatePaddingSliderHTML() {
    const paddingConfig = config?.padding || {
      min: 0,
      max: 50,
      default: 10,
      unit: 'percent',
      step: 1
    };

    // Adjust max for pixels (typically higher range)
    const maxValue = paddingUnit === 'percent' ? (paddingConfig.max || 50) : (paddingConfig.maxPx || 200);
    const minValue = paddingConfig.min || 0;
    const stepValue = paddingUnit === 'percent' ? (paddingConfig.step || 1) : (paddingConfig.stepPx || 1);

    return `
      <div class="overlay-padding-control">
        <label class="slds-form-element__label" for="overlay-padding-slider">
          Padding: <span id="overlay-padding-value">${currentPadding}</span><span id="overlay-padding-unit">${paddingUnit === 'percent' ? '%' : 'px'}</span>
        </label>
        <div class="slds-form-element__control overlay-padding-slider-container">
          <input 
            type="range" 
            id="overlay-padding-slider" 
            class="slds-slider" 
            min="${minValue}" 
            max="${maxValue}" 
            step="${stepValue}" 
            value="${currentPadding}"
          />
          <div class="overlay-unit-toggle-group">
            <button type="button" data-unit="percent" class="overlay-unit-toggle ${paddingUnit === 'percent' ? 'active' : ''}" title="Percentage">
              %
            </button>
            <button type="button" data-unit="px" class="overlay-unit-toggle ${paddingUnit === 'px' ? 'active' : ''}" title="Pixels">
              px
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Updates the position button states
   */
  function updatePositionButtons(selectedValue) {
    const buttons = rootEditorElement.querySelectorAll('input[name="overlayPosition"]');
    buttons.forEach(btn => {
      const label = btn.closest('label');
      if (btn.value === selectedValue) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    });
  }

  /**
   * Updates the background color button states
   */
  function updateBackgroundColorButtons(selectedValue) {
    const buttons = rootEditorElement.querySelectorAll('.overlay-bg-color-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-color') === selectedValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Emits the current value to Page Designer
   */
  function emitValue() {
    emit({
      type: 'sfcc:value',
      payload: {
        position: currentPosition,
        padding: currentPadding,
        unit: paddingUnit,
        backgroundColor: backgroundColor,
        transparency: transparency
      }
    });
  }

  /**
   * Initializes the editor markup
   */
  function init() {
    rootEditorElement = document.createElement('div');
    rootEditorElement.className = 'overlay-position-editor';
    rootEditorElement.innerHTML = `
      <style>
        .overlay-position-editor {
          padding: 1rem;
        }
        .overlay-position-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          width: 100px;
        }
        .overlay-position-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #d8dde6;
          border-radius: 3px;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.2s ease;
          color: #3e3e3e;
        }
        .overlay-position-btn:hover {
          border-color: #0070d2;
          background: #f3f2f2;
          color: #0070d2;
        }
        .overlay-position-btn.selected {
          border-color: #0070d2;
          background: #e8f4f8;
          color: #0070d2;
        }
        .overlay-position-btn input[type="radio"] {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .overlay-position-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .overlay-position-icon svg {
          width: 16px;
          height: 16px;
        }
        .overlay-padding-control {
          margin-top: 1rem;
        }
        .overlay-padding-control label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .overlay-padding-slider-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .slds-slider {
          flex: 1;
          max-width: 250px;
        }
        .overlay-unit-toggle-group {
          display: flex;
          gap: 0;
          border: 1px solid #d8dde6;
          border-radius: 3px;
          overflow: hidden;
        }
        .overlay-unit-toggle {
          min-width: 36px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          height: 28px;
          line-height: 1;
          border: none;
          border-right: 1px solid #d8dde6;
          background: #ffffff;
          color: #3e3e3e;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .overlay-unit-toggle:last-child {
          border-right: none;
        }
        .overlay-unit-toggle:hover {
          background: #f3f2f2;
          color: #0070d2;
        }
        .overlay-unit-toggle.active {
          background: #0070d2;
          color: #ffffff;
          font-weight: 500;
        }
        .overlay-unit-toggle.active:hover {
          background: #005fb2;
        }
        .overlay-background-control {
          margin-top: 1.5rem;
        }
        .overlay-background-control label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .overlay-bg-color-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .overlay-bg-color-btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          border: 1px solid #d8dde6;
          border-radius: 3px;
          background: #ffffff;
          color: #3e3e3e;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .overlay-bg-color-btn:hover {
          border-color: #0070d2;
          background: #f3f2f2;
          color: #0070d2;
        }
        .overlay-bg-color-btn.active {
          border-color: #0070d2;
          background: #0070d2;
          color: #ffffff;
          font-weight: 500;
        }
        .overlay-bg-color-btn.active:hover {
          background: #005fb2;
        }
        .overlay-transparency-control {
          margin-top: 1rem;
        }
        .overlay-transparency-control label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .overlay-transparency-control .slds-slider {
          width: 100%;
          max-width: 300px;
        }
      </style>
      <div class="slds-form-element">
        <label class="slds-form-element__label">Overlay Position</label>
        ${generatePositionGridHTML()}
      </div>
      ${generatePaddingSliderHTML()}
      ${generateBackgroundColorHTML()}
      ${generateTransparencySliderHTML()}
    `;
    document.body.appendChild(rootEditorElement);

    // Set up event listeners
    const positionInputs = rootEditorElement.querySelectorAll('input[name="overlayPosition"]');
    positionInputs.forEach(input => {
      input.addEventListener('change', (event) => {
        currentPosition = event.target.value;
        updatePositionButtons(currentPosition);
        emitValue();
      });
    });

    const paddingSlider = rootEditorElement.querySelector('#overlay-padding-slider');
    const paddingValueDisplay = rootEditorElement.querySelector('#overlay-padding-value');
    const paddingUnitDisplay = rootEditorElement.querySelector('#overlay-padding-unit');
    const unitToggles = rootEditorElement.querySelectorAll('.overlay-unit-toggle');
    
    if (paddingSlider) {
      paddingSlider.addEventListener('input', (event) => {
        currentPadding = parseFloat(event.target.value);
        if (paddingValueDisplay) {
          paddingValueDisplay.textContent = currentPadding;
        }
        emitValue();
      });
    }

    // Handle unit toggle buttons
    unitToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const newUnit = toggle.getAttribute('data-unit');
        if (newUnit === paddingUnit) return; // Already selected
        
        paddingUnit = newUnit;
        
        // Update slider range based on unit
        const paddingConfig = config?.padding || {
          min: 0,
          max: 50,
          maxPx: 200,
          step: 1,
          stepPx: 1
        };
        
        const maxValue = paddingUnit === 'percent' ? (paddingConfig.max || 50) : (paddingConfig.maxPx || 200);
        const stepValue = paddingUnit === 'percent' ? (paddingConfig.step || 1) : (paddingConfig.stepPx || 1);
        
        // Convert value if needed (rough conversion: 1% ≈ 10px for typical images)
        if (paddingUnit === 'px' && currentPadding <= 50) {
          currentPadding = Math.round(currentPadding * 10);
        } else if (paddingUnit === 'percent' && currentPadding > 50) {
          currentPadding = Math.round(currentPadding / 10);
        }
        
        // Clamp to valid range
        currentPadding = Math.max(paddingConfig.min || 0, Math.min(maxValue, currentPadding));
        
        // Update UI
        paddingSlider.min = paddingConfig.min || 0;
        paddingSlider.max = maxValue;
        paddingSlider.step = stepValue;
        paddingSlider.value = currentPadding;
        
        if (paddingValueDisplay) {
          paddingValueDisplay.textContent = currentPadding;
        }
        if (paddingUnitDisplay) {
          paddingUnitDisplay.textContent = paddingUnit === 'percent' ? '%' : 'px';
        }
        
        // Update toggle button states
        unitToggles.forEach(btn => {
          if (btn.getAttribute('data-unit') === paddingUnit) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        
        emitValue();
      });
    });

    // Initialize button states
    updatePositionButtons(currentPosition);
    updateBackgroundColorButtons(backgroundColor);

    // Handle background color buttons
    const bgColorButtons = rootEditorElement.querySelectorAll('.overlay-bg-color-btn');
    bgColorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        backgroundColor = btn.getAttribute('data-color');
        updateBackgroundColorButtons(backgroundColor);
        emitValue();
      });
    });

    // Handle transparency slider
    const transparencySlider = rootEditorElement.querySelector('#overlay-transparency-slider');
    const transparencyValueDisplay = rootEditorElement.querySelector('#overlay-transparency-value');
    
    if (transparencySlider) {
      transparencySlider.addEventListener('input', (event) => {
        transparency = parseInt(event.target.value, 10);
        if (transparencyValueDisplay) {
          transparencyValueDisplay.textContent = transparency;
        }
        emitValue();
      });
    }
  }

  /** Page Designer signals readiness */
  listen('sfcc:ready', ({ value, config: editorConfig, isDisabled, isRequired, dataLocale, displayLocale }) => {
    // Get config from server-side initialization
    if (editorConfig && editorConfig.overlayPositionConfig) {
      config = editorConfig.overlayPositionConfig;
      if (config.padding) {
        currentPadding = config.padding.default || currentPadding;
        paddingUnit = config.padding.unit || paddingUnit;
      }
    }

    // Parse the incoming value
    if (value && typeof value === 'object') {
      if (value.position) {
        currentPosition = value.position;
      }
      if (value.padding !== undefined) {
        currentPadding = parseFloat(value.padding) || currentPadding;
      }
      if (value.unit) {
        paddingUnit = value.unit;
      }
      if (value.backgroundColor) {
        backgroundColor = value.backgroundColor;
      }
      if (value.transparency !== undefined) {
        transparency = parseInt(value.transparency, 10) || transparency;
      }
    }

    // Update UI
    updatePositionButtons(currentPosition);
    const paddingSlider = rootEditorElement.querySelector('#overlay-padding-slider');
    const paddingValueDisplay = rootEditorElement.querySelector('#overlay-padding-value');
    const paddingUnitDisplay = rootEditorElement.querySelector('#overlay-padding-unit');
    const unitToggles = rootEditorElement.querySelectorAll('.overlay-unit-toggle');
    
    if (paddingSlider && config && config.padding) {
      const maxValue = paddingUnit === 'percent' ? (config.padding.max || 50) : (config.padding.maxPx || 200);
      const stepValue = paddingUnit === 'percent' ? (config.padding.step || 1) : (config.padding.stepPx || 1);
      paddingSlider.min = config.padding.min || 0;
      paddingSlider.max = maxValue;
      paddingSlider.step = stepValue;
      paddingSlider.value = currentPadding;
    }
    
    if (paddingValueDisplay) {
      paddingValueDisplay.textContent = currentPadding;
    }
    
    if (paddingUnitDisplay) {
      paddingUnitDisplay.textContent = paddingUnit === 'percent' ? '%' : 'px';
    }
    
    // Update toggle button states
    unitToggles.forEach(btn => {
      if (btn.getAttribute('data-unit') === paddingUnit) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update background color buttons
    updateBackgroundColorButtons(backgroundColor);

    // Update transparency slider
    const transparencySlider = rootEditorElement.querySelector('#overlay-transparency-slider');
    const transparencyValueDisplay = rootEditorElement.querySelector('#overlay-transparency-value');
    
    if (transparencySlider) {
      transparencySlider.value = transparency;
    }
    
    if (transparencyValueDisplay) {
      transparencyValueDisplay.textContent = transparency;
    }

    // Handle disabled state
    if (isDisabled && rootEditorElement) {
      rootEditorElement.querySelectorAll('input, button').forEach(el => {
        el.disabled = true;
      });
    }
  });

  /** When editor is asked to disable its controls */
  listen('sfcc:disabled', (disabled) => {
    if (rootEditorElement) {
      rootEditorElement.querySelectorAll('input, button').forEach(el => {
        el.disabled = disabled;
      });
    }
  });

  /** When editor is asked to require selection */
  listen('sfcc:required', (required) => {
    // Handle required state if needed
  });

  init();
})();
