import React from 'react';
import classes from './AdvancedOptionsNavigation.scss';
import {DisplayActions, registry} from '@jahia/ui-extender';
import {useContentEditorContext} from '~/ContentEditor.context';
import {MenuItem} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useRegisterEngineTabActions} from '~/Edit/engineTabs/useRegisterEngineTabActions';
import {ProgressOverlay} from '@jahia/react-material';
import {registerAdvancedOptionsActions} from '~/EditPanel/AdvancedOptions/AdvancedOptions.actions';
import {useTranslation} from 'react-i18next';

export const AdvancedOptionsNavigation = ({formik, activeOption, setActiveOption}) => {
    const {t} = useTranslation();
    const {mode, nodeData, siteInfo} = useContentEditorContext();

    // Engines tabs need the node Data to be registered
    const {loading, error} = useRegisterEngineTabActions();
    registerAdvancedOptionsActions(registry, t);

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

    return (
        <div className={classes.container}>
            <ul>
                <DisplayActions context={{nodeData, siteInfo, mode, formik, activeOption, setActiveOption}}
                                target="AdvancedOptionsActions"
                                render={({context}) => {
                                    return (
                                        <MenuItem
                                            isUpperCase
                                            isSelected={activeOption === context.value}
                                            label={context.buttonLabel}
                                            onClick={e => context.onClick(context, e)}
                                        />
);
                                }}
                />
            </ul>
        </div>
    );
};

AdvancedOptionsNavigation.propTypes = {
    formik: PropTypes.object.isRequired,
    activeOption: PropTypes.string.isRequired,
    setActiveOption: PropTypes.func.isRequired
};
export default AdvancedOptionsNavigation;
