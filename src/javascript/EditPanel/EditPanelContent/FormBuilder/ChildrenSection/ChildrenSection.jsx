import React from 'react';
import PropTypes from 'prop-types';

import {withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';

import {ChildrenSectionPropTypes} from '~/FormDefinitions/FormData.proptypes';
import {ChildrenOrderField} from './ChildrenOrderField';
import {FastField} from 'formik';

const styles = theme => ({
    section: {
        borderBottom: `1px solid ${theme.palette.ui.omega}`,
        paddingBottom: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
        backgroundColor: theme.palette.ui.epsilon
    },
    sectionTitle: {
        textTransform: 'uppercase',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px`
    }
});

const ChildrenSectionCmp = ({section, classes}) => {
    return (
        <section className={classes.section} data-sel-content-editor-fields-group={section.displayName}>
            <Typography component="h2" className={classes.sectionTitle} color="alpha" variant="gamma">{section.displayName}</Typography>
            <FastField name="Children::Order"
                       render={({field, form: {setFieldValue, setFieldTouched}}) => {
                       const handleChange = newOrder => {
                           setFieldValue(field.name, newOrder);
                           setFieldTouched(field.name, true);
                       };

                       return (
                           <ChildrenOrderField {...field} onChange={handleChange}/>
                       );
                   }}
            />
        </section>
    );
};

ChildrenSectionCmp.propTypes = {
    section: ChildrenSectionPropTypes.isRequired,
    classes: PropTypes.object.isRequired
};

export const ChildrenSection = withStyles(styles)(ChildrenSectionCmp);
ChildrenSection.displayName = 'ChildrenSection';
