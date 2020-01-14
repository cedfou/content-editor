import React from 'react';
import * as PropTypes from 'prop-types';
import {FieldPropTypes} from '~/EditPanel/FormDefinitions/FormData.proptypes';
import {FastField} from 'formik';
import {DropdownTreeSelect} from '~/DesignSystem/DropdownTreeSelect';
import {useQuery} from 'react-apollo-hooks';
import {GetCategories} from './category.gql-queries';
import {ProgressOverlay} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {adaptToCategoryTree} from './category.adapter';

const Category = ({field, value, id, editorContext}) => {
    const {t} = useTranslation();
    const {data, error, loading} = useQuery(GetCategories, {
        variables: {
            path: '/sites/systemsite/categories',
            language: editorContext.lang
        }
    });

    if (error) {
        const message = t(
            'content-media-manager:label.contentManager.error.queryingContent',
            {details: error.message ? error.message : ''}
        );
        return <>{message}</>;
    }

    if (loading) {
        return <ProgressOverlay/>;
    }

    const tree = adaptToCategoryTree({
        nodes: data.jcr.result.descendants.nodes,
        parent: data.jcr.result,
        selectedValues: value
    });

    return (
        <FastField data={data}
                   render={({form: {setFieldValue, setFieldTouched}}) => {
            const handleChange = (_, selectedValues) => {
                const newValues = selectedValues.map(v => v.value);
                setFieldValue(id, newValues);
                setFieldTouched(id, newValues);
            };

            return (
                <DropdownTreeSelect
                    id={id}
                    noMatchesLabel={t('content-editor:label.contentEditor.edit.fields.category.noMatches')}
                    aria-labelledby={`${field.name}-label`}
                    data={tree}
                    readOnly={field.readOnly}
                    onChange={handleChange}
                />
            );
        }}/>
    );
};

Category.propTypes = {
    field: FieldPropTypes.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    editorContext: PropTypes.shape({
        lang: PropTypes.string.isRequired
    }).isRequired
};

export default Category;
