# Forms Handling in Your-Shop-Here

## Overview

The forms handling system in Your-Shop-Here provides a flexible way to manage form data, layout, validation, and persistence across the application. It's implemented as a reusable module that can be used for various forms throughout the application.

## Why not classic xml forms

B2C Commerce proprietary forms lack the flexibility to adopt features of forms to all application needs. With form handling offered as part of a ref app in an open way, developers can adjust form needs to their application

Localization of data entry and data display were main considerations

## Core Components

### Form Class

The main form handling is implemented in `Form.js` which provides the following key features:

- Form initialization with name and locale support
- Form field definitions and validation
- Data persistence to business objects
- Temporary storage of form data
- Error handling and management


### Form Fields and Rows

- Forms are organized into rows and fields
   - this is a deliberate choice to bundle parts of ui and backoffice. 
   - Main reason is localization - a form, its fields and its display is often different around the globe. How countries think about an address differs greatly
- Fields can be grouped into rows using `rowId`
- Each field has properties like:
  - `fieldId`: Unique identifier
  - `type`: Input type (text, password, etc.)
  - `label`: Field label
  - `validation`: Validation function
  - `mapping`: Data mapping configuration

### Data Management

The form system provides several methods for data handling:

1. **Validation**
   - `validate(parameterMap)`: Validates form data
   - Returns object with validation status and invalid fields

2. **Persistence**
   - `persist(businessObject, parameterMap)`: Saves form data to business objects
   - Supports custom mapping through field definitions

3. **Temporary Storage**
   - `temp(parameterMap)`: Stores form data temporarily
   - `getTemp()`: Retrieves stored form data
   - `clearTemp()`: Clears stored form data
   - Automatically handles security by removing password fields

### Error Handling

The system includes error management:

- `addFormError(error)`: Adds error messages to the form
- `getFormErrors()`: Retrieves form errors
- `clearFormErrors()`: Clears form errors

## Usage Example

Here's a typical usage pattern:

```javascript
const Form = require('*/api/Form');
const form = new Form('address');

// Get form structure
const rows = form.rows();

// Validate form data
const validation = form.validate(parameterMap);

// Persist data
form.persist(businessObject, parameterMap);

// Handle temporary storage
form.temp(parameterMap);
const tempData = form.getTemp();
```

## Security Considerations

- Password fields are automatically removed from temporary storage
- Form data is validated before persistence
- Session-based error storage

## Best Practices

1. Always validate form data before persistence
2. Use temporary storage for multi-step forms
3. Clear temporary data when no longer needed
4. Implement proper error handling and user feedback
5. Use appropriate field types and validation rules

## Integration with Templates

The form system integrates with the template system, providing:

- Form rendering helpers
- Field-level validation display
- Error message formatting
- HTMX integration for dynamic updates

## Related Files

- `Form.js`: Core form handling implementation
- Form definition files in `cartridge/forms/`
- Template files using form functionality 