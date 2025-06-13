
/**
 * @description Create a new form by name
 * @param {string} name - The name of the form
 */
function Form(name) {
    this.name = name;
    const Locale = require('dw/util/Locale');
    this.scope = {};
    this.scope.country = Locale.getLocale(request.locale).getCountry();

    this.scope.language = Locale.getLocale(request.locale).getLanguage();

    require(`*/cartridge/forms/${name}`).forEach((definition) => {
        if (!this.definition) {
            this.definition = definition.fields;
        }
        // @todo add language support for lookup and define

        if (this.scope.country === definition.scope.county) {
            this.definition = definition.fields;
        }
    });
}

/**
 * @description Get the rows of the form without values
 * @returns {Array} The rows of the form
 */
Form.prototype.rows = function () {
    const CacheMgr = require('dw/system/CacheMgr');
    const rowCache = CacheMgr.getCache('Form');
    const Resource = require('dw/web/Resource');
    const cachedRows = rowCache.get(this.name + JSON.stringify(this.scope), () => {
        const rowMap = {};
        const rowArray = [];
        Object.keys(this.definition).forEach((fieldId) => {
            const field = this.definition[fieldId];
            field.fieldId = fieldId;

            field.label = Resource.msg(`forms.labels.${fieldId}`, 'translations', null);
            if (field.rowId) {
                if (!rowMap[field.rowId]) {
                    rowMap[field.rowId] = [];
                    rowArray.push(rowMap[field.rowId]);
                }

                rowMap[field.rowId].push(field);
            } else {
                rowMap[fieldId] = [field];
                rowArray.push(rowMap[fieldId]);
            }
        });
        return rowArray;
    });

    return cachedRows;
};

/**
 * @description Validate the form
 * @param {Object} parameterMap - The parameter map
 * @returns {Object} The validation result
 */
Form.prototype.validate = function (parameterMap) {
    const invalidFields = [];
    Object.keys(this.definition).forEach((fieldId) => {
        const field = this.definition[fieldId];

        if (field.validation && !field.validation(parameterMap[fieldId].stringValue)) {
            invalidFields.push(fieldId);
        }
    });
    return { ok: invalidFields.length === 0, invalidFields };
};

/**
 * @description Persist the form values to a business object
 * @param {Object} businessObject - The business object
 * @param {Object} parameterMap - The parameter map
 * @returns {Object} The business object
 */
Form.prototype.persist = function (businessObject, parameterMap) {
    Object.keys(this.definition).forEach((fieldId) => {
        const field = this.definition[fieldId];

        if (field.mapping && field.mapping.persist) {
            field.mapping.persist(businessObject, parameterMap[fieldId].stringValue);
        } else {
            businessObject[fieldId] = parameterMap[fieldId].stringValue;
        }
    });
    return businessObject;
};

/**
 * @description Get the rows with values initialized from a business object
 * @param {Object} businessObject - The business object
 * @returns {Object} The row values
 */
Form.prototype.rowValues = function (businessObject) {
    const result = {};
    Object.keys(this.definition).forEach((fieldId) => {
        const field = this.definition[fieldId];

        if (field.mapping && field.mapping.load) {
            result[fieldId] = field.mapping.load(businessObject);
        } else {
            result[fieldId] = businessObject[fieldId];
        }
    });
    const rows = JSON.parse(JSON.stringify(this.rows()));
    rows.forEach((row) => row.forEach((field) => {
        field.value = result[field.fieldId];
    }));
    return rows;
};

/**
 * @description Save form values
 * @param {Object} parameterMap - The parameter map
 * @returns {Object} an object with the form values
 */
Form.prototype.temp = function (parameterMap) {
    const CacheMgr = require('dw/system/CacheMgr');
    let tempObject = { custom: {} };
    tempObject = this.persist(tempObject, parameterMap);
    // Remove password fields from the temp object for security reasons
    Object.keys(this.definition)
        .filter((fieldId) => this.definition[fieldId].type === 'password')
        .forEach((fieldId) => {
            delete tempObject[fieldId];
        });
    const tempCache = CacheMgr.getCache('Form');
    tempCache.put(this.name + session.sessionID, tempObject);
    return tempObject;
};

/**
 * @description Save form values
 * @param {Object} parameterMap - The parameter map
 * @returns {Object} an object with the form values
 */
Form.prototype.clearTemp = function () {
    const CacheMgr = require('dw/system/CacheMgr');
    const tempObject = {};
    const tempCache = CacheMgr.getCache('Form');
    tempCache.put(this.name + session.sessionID, tempObject);
    return tempObject;
};

/**
 * @description Get the saved form values
 * @returns {Object} The saved form values
 */
Form.prototype.getTemp = function () {
    const CacheMgr = require('dw/system/CacheMgr');
    const tempCache = CacheMgr.getCache('Form');
    return tempCache.get(this.name + session.sessionID);
};

/**
 * @description Add an error to the form
 * @param {string} error - The error message
 */
Form.prototype.addFormError = function (error) {
    const errors = JSON.parse(session.privacy.formErrors || '{}');
    errors[this.name] = errors[this.name] || [];
    errors[this.name].push(error);
    session.privacy.formErrors = JSON.stringify(errors);
};

/**
 * @description Get the form errors
 * @returns {Array} The form errors
 */
Form.prototype.getFormErrors = function () {
    const errors = JSON.parse(session.privacy.formErrors || '{}');
    return errors[this.name] || [];
};

/**
 * @description Clear the form errors
 */
Form.prototype.clearFormErrors = function () {
    const errors = JSON.parse(session.privacy.formErrors || '{}');
    delete errors[this.name];
    session.privacy.formErrors = JSON.stringify(errors);
};

module.exports = Form;
