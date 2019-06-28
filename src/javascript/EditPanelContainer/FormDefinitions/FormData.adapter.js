import SelectorTypes from '../EditPanel/EditPanelContent/FormBuilder/SelectorTypes/SelectorTypes';

const isDetailField = field => field.readOnly && field.targets.find(target => target.name === 'metadata');

const getFields = (formDefinition, nodeData) => {
    return formDefinition.fields
        .filter(field => !isDetailField(field))
        .map(
            fieldDefinition => {
                return {
                    targets: fieldDefinition.targets,
                    formDefinition: fieldDefinition,
                    jcrDefinition: nodeData.primaryNodeType.properties.find(
                        prop => prop.name === fieldDefinition.name
                    ),
                    data: nodeData.properties.find(
                        prop => prop.name === fieldDefinition.name
                    )
                };
            }
        );
};

const getFieldValue = (formDefinition, value) => {
    const selectorType = SelectorTypes.resolveSelectorType(formDefinition.selectorType, formDefinition.selectorOptions);
    if (selectorType) {
        if (selectorType.formatValue) {
            return selectorType.formatValue(value);
        }
    }

    return value;
};

const getInitialValue = fields => {
    return fields.reduce(
        (initialValues, field) => {
            return {
                ...initialValues,
                [field.formDefinition.name]: field.data && getFieldValue(field.formDefinition, field.data.value)
            };
        },
        {}
    );
};

const getDetailsValue = (formDefinition, nodeData) => {
    return formDefinition.fields
        .filter(isDetailField)
        .map(field => {
            const jcrDefinition = nodeData.properties.find(
                prop => prop.name === field.name
            );

            return {
                name: field.name,
                value: jcrDefinition && jcrDefinition.value
            };
        });
};

export const adaptFormData = data => {
    const formDefinition = data.forms.editForm;
    const nodeData = data.jcr.result;
    const fields = getFields(formDefinition, nodeData);

    return {
        nodeData,
        fields,
        initialValues: getInitialValue(fields),
        details: getDetailsValue(formDefinition, nodeData)
    };
};