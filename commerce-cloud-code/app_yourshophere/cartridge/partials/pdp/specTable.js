exports.createModel = function createModel(options) {
    var product = options.product;
    var settings = options.settings;
    var attrPath = settings.productAttribute || 'yshSpecsJson';
    var parts = attrPath.split('.');
    var raw;
    if (parts[0] === 'custom' && parts[1]) {
        raw = product.custom[parts[1]];
    } else if (parts.length === 1) {
        raw = product.custom[parts[0]];
    } else {
        raw = product[parts[0]];
    }

    var rows = [];
    if (raw) {
        try {
            rows = JSON.parse(raw);
        } catch (e) {
            rows = [];
        }
    }

    return {
        title: settings.title || '',
        showBorder: settings.showBorder !== false,
        labelAlign: settings.labelAlign || 'left',
        valueAlign: settings.valueAlign || 'left',
        rows: rows,
    };
};

exports.template = function template(model) {
    if (!model.rows || !model.rows.length) return '';
    var rowsHtml = model.rows.map(function (row) {
        return '<tr>'
            + '<td style="text-align:' + model.labelAlign + '">' + row.label + '</td>'
            + '<td style="text-align:' + model.valueAlign + '">' + row.value + '</td>'
            + '</tr>';
    }).join('');
    return '<div class="pdp-spec-table' + (model.showBorder ? ' pdp-spec-table--bordered' : '') + '">'
        + (model.title ? '<h3 class="pdp-spec-table__title">' + model.title + '</h3>' : '')
        + '<table><tbody>' + rowsHtml + '</tbody></table>'
        + '</div>';
};
