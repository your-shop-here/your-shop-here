(() => {
    /** The main Editor element to be tinkered with */
    let rootEditorElement;
    let loadingPlaceHolder;

    /**
      * Create an option element to shorten the api-calls, as this is called twice.
      * @param {string} text The text to show in the select box
      */
    function placeHolderOption(text) {
        const optionElement = document.createElement('option');
        optionElement.selected = 'selected';
        optionElement.disabled = 'disabled';
        optionElement.hidden = 'hidden';
        optionElement.value = '';
        optionElement.innerHTML = text;
        return optionElement;
    }

    /**
      * initializes the base markup before page is ready. This is not part of the API, and called explicitely at the end of this module.
      */
    function init() {
        rootEditorElement = document.createElement('div');
        rootEditorElement.innerHTML = `
          <div class="slds-box slds-grid slds-wrap">
              <div class="slds-p-around_xxx-small slds-size_2-of-2 slds-form-element__control">
                  <label for="srule-selector"class="slds-form-element__label">Sorting Rule</label>
                  <div class='slds-select_container'>
                      <select name="srule-selector" class='slds-select srule-selection'>
                      </select>
                  </div>
              </div>
              <div class="slds-p-around_xxx-small slds-size_1-of-2 slds-form-element__control">
                  <label for="attribute-selector" class="slds-form-element__label">Filter Attribute</label>
                  <div class='slds-select_container'>
                      <select name="attribute-selector" class='slds-select attribute-selection'>
                      </select>
                  </div>
              </div>
              <div class="slds-p-around_xxx-small slds-size_1-of-2 slds-form-element__control">
                  <label for="value-selector" class="slds-form-element__label">Filter Value</label>
                  <div class='slds-select_container'>
                      <select for="name-selector" class='slds-select value-selection'>
                      </select>
                  </div>
              </div>
          </div>
          `;
        // show "Loading.. "
        // loadingPlaceHolder = placeHolderOption('Loading...');
        rootEditorElement.querySelector('.srule-selection').appendChild(placeHolderOption('Loading...'));
        rootEditorElement.querySelector('.attribute-selection').appendChild(placeHolderOption('Loading...'));
        rootEditorElement.querySelector('.value-selection').appendChild(placeHolderOption('Loading...'));

        document.body.appendChild(rootEditorElement);
    }

    /** the page designer signals readiness to show this editor and provides an optionally pre selected value */
    listen('sfcc:ready', async ({
        value, config, isDisabled, isRequired, dataLocale, displayLocale,
    }) => {
        const selectedValue = typeof value === 'object' && value !== null && typeof value.value === 'string' ? value.value : null;
        const srules = config.srules;
        const selection = JSON.parse(selectedValue);

        const selectedSortingRule = selection ? selection.srule : 'XXXXXXXXXXX';
        const selectedFilterattribute = selection ? selection.filterattribute : 'XXXXXXXXXXX';
        const selectedFiltervalue = selection ? selection.filtervalue : 'XXXXXXXXXXX';

        const filterObject = JSON.parse(config.filters);
        const filterOptions = Object.keys(filterObject);
        rootEditorElement.querySelector('.srule-selection').removeChild(rootEditorElement.querySelector('.srule-selection').querySelector('option'));
        rootEditorElement.querySelector('.attribute-selection').removeChild(rootEditorElement.querySelector('.attribute-selection').querySelector('option'));
        rootEditorElement.querySelector('.value-selection').removeChild(rootEditorElement.querySelector('.value-selection').querySelector('option'));
        // if nothing was preselected we ask the user to select
        if (selectedValue === null) {
            rootEditorElement.querySelector('.srule-selection').appendChild(placeHolderOption('Please Select'));
            rootEditorElement.querySelector('.attribute-selection').appendChild(placeHolderOption('Please Select'));
            rootEditorElement.querySelector('.value-selection').appendChild(placeHolderOption('Please Select'));
        }

        // We add recommenders to select box
        srules.forEach((element) => {
            const sruleOption = document.createElement('option');
            if (selectedSortingRule === element) {
                sruleOption.selected = 'selected';
            }
            sruleOption.value = element;
            sruleOption.innerHTML = element;
            if (element) {
                sruleOption.title = element;
            }
            rootEditorElement.querySelector('.srule-selection').appendChild(sruleOption);
        });
        filterOptions.forEach((element) => {
            const filterOption = document.createElement('option');
            if (selectedFilterattribute === element) {
                filterOption.selected = 'selected';
                const values = filterObject[element];
                values.forEach((innerElement) => {
                    const valueOption = document.createElement('option');
                    if (selectedFiltervalue === innerElement) {
                        valueOption.selected = 'selected';
                    }
                    valueOption.value = innerElement;
                    valueOption.innerHTML = innerElement;
                    if (innerElement.description) {
                        valueOption = innerElement;
                    }
                    rootEditorElement.querySelector('.value-selection').appendChild(valueOption);
                });
            }
            filterOption.value = element;
            filterOption.innerHTML = element;
            if (element.description) {
                filterOption = element;
            }
            rootEditorElement.querySelector('.attribute-selection').appendChild(filterOption);
        });
        rootEditorElement.querySelector('.attribute-selection').addEventListener('change', (event) => {
            rootEditorElement.querySelector('.value-selection').innerHTML = '';
            const values = filterObject[event.target.value];
            values.forEach((element) => {
                const valueOption = document.createElement('option');
                if (selectedFiltervalue === element) {
                    valueOption.selected = 'selected';
                }
                valueOption.value = element;
                valueOption.innerHTML = element;
                if (element.description) {
                    valueOption = element;
                }
                rootEditorElement.querySelector('.value-selection').appendChild(valueOption);
            });
        });
        // Change listener will inform page designer about currently selected value
        rootEditorElement.querySelectorAll('select').forEach((element) => {
            element.addEventListener('change', (event) => {
                emit({
                    type: 'sfcc:interacted',
                });
                const valueObject = {
                    srule: rootEditorElement.querySelector('.srule-selection').value,
                    filterattribute: rootEditorElement.querySelector('.attribute-selection').value,
                    filtervalue: rootEditorElement.querySelector('.value-selection').value,
                };
                const selectedValue = JSON.stringify(valueObject);
                emit({
                    type: 'sfcc:value',
                    payload: selectedValue ? { value: selectedValue } : null,
                });
            });
        });
    });

    // When a value was selected
    listen('sfcc:value', (value) => {});
    // When the editor must require the user to select something
    listen('sfcc:required', (value) => {});
    // When the editor is asked to disable its controls
    listen('sfcc:disabled', (value) => {
        if (rootEditorElement) {
            rootEditorElement.querySelector('.srule-selection').disabled = true;
        }
    });

    init();
})();
