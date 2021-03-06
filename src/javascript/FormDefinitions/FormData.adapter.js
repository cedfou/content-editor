import {resolveSelectorType} from '~/EditPanel/EditPanelContent/FormBuilder/Section/FieldSet/Field/SelectorTypes/SelectorTypes.utils';
import {Constants} from '~/ContentEditor.constants';
import {decodeSystemName} from '~/utils';

const isContentOrFileNode = formData => {
    const pattern = '^/sites/[^/]*/(contents|files)$';
    const regex = RegExp(pattern);
    return formData.technicalInfo.filter(info => {
        return regex.test(info.value);
    }).length !== 0;
};

export const adaptSystemNameField = (rawData, formData, lang, t, primaryNodeType, isCreate) => {
    const optionsSection = formData.sections.find(section => section.name === 'options');
    if (optionsSection) {
        const ntBaseFieldSet = optionsSection.fieldSets.find(fieldSet => fieldSet.name === 'nt:base');
        if (ntBaseFieldSet) {
            // Add i18ns label to System fieldset
            ntBaseFieldSet.displayName = t('content-editor:label.contentEditor.section.fieldSet.system.displayName');
            const systemNameField = ntBaseFieldSet.fields.find(field => field.name === 'ce:systemName');
            if (systemNameField) {
                // Add i18ns label to field
                systemNameField.displayName = t('content-editor:label.contentEditor.section.fieldSet.system.fields.systemName');

                // Add description to the field
                systemNameField.description = t('content-editor:label.contentEditor.section.fieldSet.system.fields.systemNameDescription',
                    {maxNameSize: window.contextJsParameters.config.maxNameSize});

                // Add max name size validation
                systemNameField.selectorOptions = [
                    {
                        name: 'maxLength',
                        value: window.contextJsParameters.config.maxNameSize
                    }
                ];

                // System name should be readonly for this specific nodetypes
                if (Constants.systemName.READONLY_FOR_NODE_TYPES.includes(primaryNodeType.name) ||
                    isContentOrFileNode(formData) ||
                    (!isCreate && !formData.nodeData.hasWritePermission)) {
                    systemNameField.readOnly = true;
                }

                // Move the systemName field to the top first section, fieldset, for specifics nodetypes
                if (Constants.systemName.MOVED_TO_CONTENT_FIELDSET_FOR_NODE_TYPES.includes(primaryNodeType.name)) {
                    let contentSection = formData.sections.find(section => section.name === 'content');
                    if (!contentSection) {
                        // Section doesnt exist, create it
                        contentSection = {
                            name: 'content',
                            displayName: t('content-editor:label.contentEditor.section.fieldSet.content.displayName'),
                            fieldSets: []
                        };
                        formData.sections.unshift(contentSection);
                    }

                    let toBeMovedToFieldSet = contentSection.fieldSets.find(fieldSet => Constants.systemName.MOVED_TO_CONTENT_FIELDSET_FOR_NODE_TYPES.includes(fieldSet.name));
                    if (!toBeMovedToFieldSet) {
                        // FieldSet doesnt exist, create it
                        toBeMovedToFieldSet = {
                            name: primaryNodeType.name,
                            displayName: primaryNodeType.displayName,
                            description: '',
                            dynamic: false,
                            activated: true,
                            fields: []
                        };
                        contentSection.fieldSets.unshift(toBeMovedToFieldSet);
                    }

                    // Move system name field on top of this fieldset
                    toBeMovedToFieldSet.fields.unshift(systemNameField);

                    // Remove system fieldSet, not used anymore
                    optionsSection.fieldSets = optionsSection.fieldSets.filter(fieldSet => fieldSet.name !== 'nt:base');
                }
            }
        }
    }

    // Set initial value for system name
    if (isCreate) {
        formData.initialValues['ce:systemName'] = rawData.jcr.result.newName;
    } else {
        formData.initialValues['ce:systemName'] = decodeSystemName(rawData.jcr.result.name);
    }
};

export const adaptSections = sections => {
    const cloneSections = JSON.parse(JSON.stringify(sections));

    return cloneSections
        .reduce((result, section) => {
            if (section.name === 'metadata') {
                section.fieldSets = section.fieldSets.reduce((fieldSetsField, fieldSet) => {
                    if (fieldSet.fields.find(f => f.readOnly)) {
                        return [...fieldSetsField];
                    }

                    return [...fieldSetsField, fieldSet];
                }, []);
            }

            return [...result, section];
        }, [])
        .filter(section => (section.fieldSets && section.fieldSets.length > 0));
};

export const getFieldValuesFromDefaultValues = field => {
    const selectorType = resolveSelectorType(field);
    const formFields = {};

    if (field.defaultValues && field.defaultValues.length > 0) {
        const mappedValues = field.defaultValues.map(defaultValue => {
            return defaultValue.string;
        });

        if (selectorType.adaptValue) {
            formFields[field.name] = selectorType.adaptValue(field, {
                value: mappedValues[0],
                notZonedDateValue: mappedValues[0],
                values: mappedValues,
                notZonedDateValues: mappedValues
            });
        } else {
            formFields[field.name] = field.multiple ? mappedValues : mappedValues[0];
        }
    } else if (selectorType && selectorType.initValue) {
        formFields[field.name] = selectorType.initValue(field);
    }

    return formFields;
};
