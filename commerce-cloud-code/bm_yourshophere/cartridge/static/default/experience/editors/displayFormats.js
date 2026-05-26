(() => {
    let rootEditorElement;
    /**
   * initializes the base markup before page is ready. This is not part of the API, and called explicitely at the end of this module.
   */
    function init() {
        rootEditorElement = document.createElement('div');
        rootEditorElement.innerHTML = `
    <div class="slds-radio_button-group">
      <span class="slds-button slds-radio_button">
        <input type="radio" name="displayFormat" id="tile" value="tile" checked />
        <label class="slds-radio_button__label" for="tile">
          <span class="slds-radio_faux">Single Tile</span>
        </label>
      </span>
      <span class="slds-button slds-radio_button">
        <input type="radio" name="displayFormat" id="row" value="row" />
        <label class="slds-radio_button__label" for="row">
          <span class="slds-radio_faux">Full Row</span>
        </label>
      </span>
    </div>
      `;
        document.body.appendChild(rootEditorElement);
    }

    /** the page designer signals readiness to show this editor and provides an optionally pre selected value */
    /* eslint-disable no-unused-vars */
    listen('sfcc:ready', async ({
        value, config, isDisabled, isRequired, dataLocale, displayLocale,
    }) => {
    /* eslint-enable no-unused-vars */
        const selectedValue = typeof value === 'object' && value !== null && typeof value.value === 'string' ? value.value : null;
        // if nothing was preselected we ask the user to select
        if (selectedValue === 'row') {
            rootEditorElement.querySelector('#row').checked = true;
        }

        // Change listener will inform page designer about currently selected value
        const inputs = rootEditorElement.querySelectorAll('input[name="displayFormat"]');
        Array.from(inputs).forEach((input) => input.addEventListener('change', (event) => {
            const newValue = event.target.value;
            console.log('selectedValue:', newValue);
            emit({
                type: 'sfcc:value',
                payload: newValue ? { value: newValue } : null,
            });
        }));
    });

    // When a value was selected
    listen('sfcc:value', () => { });
    // When the editor must require the user to select something
    listen('sfcc:required', () => { });
    // When the editor is asked to disable its controls
    listen('sfcc:disabled', () => {
        if (rootEditorElement) {
            rootEditorElement.querySelector('.btn-group').disabled = true;
        }
    });

    init();
})();
