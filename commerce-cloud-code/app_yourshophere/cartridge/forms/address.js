module.exports = [{
    scope: { country: 'IE' },
    fields: {
        // @todo get realistic regexps
        firstName: {
            type: 'string',
            rowId: 'name',
            validation: (fieldValue) => /[a-zA-Z]{1,20}/.test(fieldValue),
        },
        lastName: {
            type: 'string',
            rowId: 'name',
            validation: (fieldValue) => /[a-zA-Z]{1,20}/.test(fieldValue),
        },
        houseNumber: {
            type: 'string',
            rowId: 'street_house_no',
            mapping: {
                persist: (businessObject, fieldValue) => { businessObject.custom.yshHouseNumber = fieldValue; },
                load: (businessObject) => businessObject.custom.yshHouseNumber,
            },
            validation: (fieldValue) => /[0-9]{1,2}/.test(fieldValue),
        },
        address1: {
            type: 'string',
            rowId: 'street_house_no',
            validation: (fieldValue) => /[a-zA-Z]{1,20}/.test(fieldValue),
        },
        address2: {
            type: 'string',
        },
        postalCode: {
            type: 'string',
            rowId: 'postal_city',
            validation: (fieldValue) => /[0-9]{5}/.test(fieldValue),
        },
        city: {
            type: 'string',
            rowId: 'postal_city',
            validation: (fieldValue) => /[a-zA-Z]{1,20}/.test(fieldValue),
        },
    },
}];
