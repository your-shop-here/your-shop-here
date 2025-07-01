
/**
 *    Allows to select users search criterial like sorting rule and filters (refinements)
 */
module.exports.init = function (editor) {
    const sortingRules = dw.catalog.CatalogMgr.getSortingRules().toArray();
    // request.setLocale('en_DE');
    // convert into serializable array
    const sortingRuleIDs = sortingRules.map((element) => element.ID);
    editor.configuration.put('srules', sortingRuleIDs);

    const searchModel = (new dw.catalog.ProductSearchModel());
    searchModel.setCategoryID('root');
    searchModel.search();
    const filters = {};
    const refinements = searchModel.getRefinements();
    const refinementDefinitions = refinements.getRefinementDefinitions().toArray();
    refinementDefinitions.forEach((definition) => {
        if (!definition.getAttributeID()) {
            return;
        }
        const values = refinements.getAllRefinementValues(definition).toArray();
        const allValues = [];
        values.forEach((value) => {
            allValues.push(value.value);
        });
        filters[definition.getAttributeID()] = allValues;
    });
    // dw.system.Logger.warn(JSON.stringify(filters));
    editor.configuration.put('filters', JSON.stringify(filters));
};
