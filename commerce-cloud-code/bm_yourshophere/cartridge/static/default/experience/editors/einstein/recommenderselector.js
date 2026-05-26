(() => {
    /** The main Editor element to be tinkered with */
    let rootEditorElement;
    let loadingPlaceHolder;
    /**
   * Calls commerce cloud instance to retrieve permission to get recommenders
   */
    async function getAccessToken(config) {
        const url = new URL(document.baseURI);

        const response = await fetch(`https://${url.host}/dw/oauth2/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=urn%3Ademandware%3Aparams%3Aoauth%3Agrant-type%3Aclient-id%3Adwsid%3Adwsecuretoken&client_id=${config.clientid}`,
        });
        const body = await response.json();
        return body.access_token;
    }
    /**
   * Calls recommender open commerce api
   */
    // eslint-disable-next-line camelcase
    async function getRecommenders(config, access_token) {
        const url = new URL(document.baseURI);

        const recommenderresponse = await fetch(`https://${url.host}/s/-/dw/data/v19_3/sites/${config.siteid}/ai/recommender_names`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${access_token}`, // eslint-disable-line camelcase
            },
        });
        const newbody = await recommenderresponse.json();
        const filteredRecommenders = newbody.recommenders.filter((element) => config.typefilter.indexOf(element.recommenderType) > -1);
        return filteredRecommenders;
    }

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
      <div class='slds-select_container'>
        <select class='slds-select recommendation-selection'>
        </select>
      </div>
      `;
        // show "Loading.. "
        loadingPlaceHolder = placeHolderOption('Loading...');
        rootEditorElement.querySelector('.recommendation-selection').appendChild(loadingPlaceHolder);
        document.body.appendChild(rootEditorElement);
    }

    /** the page designer signals readiness to show this editor and provides an optionally pre selected value */
    /* eslint-disable no-unused-vars */
    listen('sfcc:ready', async ({
        value, config, isDisabled, isRequired, dataLocale, displayLocale,
    }) => {
    /* eslint-enable no-unused-vars */
        const selectedValue = typeof value === 'object' && value !== null && typeof value.value === 'string' ? value.value : null;
        const accessToken = await getAccessToken(config);
        const recommenders = await getRecommenders(config, accessToken);

        rootEditorElement.querySelector('.recommendation-selection').removeChild(loadingPlaceHolder);
        // if nothing was preselected we ask the user to select
        if (selectedValue === null) {
            rootEditorElement.querySelector('.recommendation-selection').appendChild(placeHolderOption('Please Select'));
        }

        // We add recommenders to select box
        recommenders.forEach((element) => {
            if (element.name) {
                const recommenderOption = document.createElement('option');
                if (selectedValue === element.name) {
                    recommenderOption.selected = 'selected';
                }
                recommenderOption.value = element.name;
                recommenderOption.innerHTML = element.name;
                if (element.description) {
                    recommenderOption.title = element.description;
                }
                rootEditorElement.querySelector('.recommendation-selection').appendChild(recommenderOption);
            }
        });
        // Change listener will inform page designer about currently selected value
        rootEditorElement.querySelector('.recommendation-selection').addEventListener('change', (event) => {
            emit({
                type: 'sfcc:interacted',
            });
            const newValue = event.target.value;
            emit({
                type: 'sfcc:value',
                payload: newValue ? { value: newValue } : null,
            });
        });
    });

    // When a value was selected
    listen('sfcc:value', () => {});
    // When the editor must require the user to select something
    listen('sfcc:required', () => {});
    // When the editor is asked to disable its controls
    listen('sfcc:disabled', () => {
        if (rootEditorElement) {
            rootEditorElement.querySelector('.recommendation-selection').disabled = true;
        }
    });

    init();
})();
