import React, {useContext} from 'react';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {useFormDefinition} from '~/FormDefinitions';
import {useSiteInfo} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {Constants} from './ContentEditor.constants';
import {useTranslation} from 'react-i18next';
import {compose} from '~/utils';
import ApolloCacheFlushOnGWTSave from '~/Edit/engineTabs/ApolloCacheFlushOnGWTSave';

export const ContentEditorContext = React.createContext({});

export const useContentEditorContext = () => useContext(ContentEditorContext);

export const ContentEditorConfigContext = React.createContext({});

export const useContentEditorConfigContext = () => useContext(ContentEditorConfigContext);

export const withContentEditorDataContextProvider = (formQuery, formDataAdapter) => Children => {
    const ContentEditorDataContextProvider = props => {
        const {notificationContext} = props;
        const {t} = useTranslation();
        const {lang, uilang, site, uuid, contentType, mode} = useContentEditorConfigContext();

        // Get Data
        const formQueryParams = {
            uuid,
            language: lang,
            uilang: Constants.supportedLocales.includes(uilang) ? uilang : Constants.defaultLocale,
            primaryNodeType: contentType,
            writePermission: `jcr:modifyProperties_default_${lang}`
        };
        const {loading, error, errorMessage, data: formDefinition, refetch: refetchFormData} = useFormDefinition(formQuery, formQueryParams, formDataAdapter, t);
        const {nodeData, initialValues, details, technicalInfo, sections, title, nodeTypeName} = formDefinition || {};
        const siteInfoResult = useSiteInfo({
            siteKey: site,
            displayLanguage: lang
        });

        if (error) {
            console.error(error);
            return <>{errorMessage}</>;
        }

        if (siteInfoResult.error) {
            console.error('Error when fetching data: ' + siteInfoResult.error);
            let message = t('label.contentEditor.error.queryingContent', {details: (siteInfoResult.error.message ? siteInfoResult.error.message : '')});
            notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
            return null;
        }

        if (loading || siteInfoResult.loading) {
            return <ProgressOverlay/>;
        }

        // Build editor context
        const editorContext = {
            path: nodeData.path,
            lang,
            uilang,
            site,
            mode,
            siteInfo: {
                ...siteInfoResult.siteInfo,
                languages: siteInfoResult.siteInfo.languages.filter(language => language.activeInEdit)
            },
            sections,
            nodeData,
            details,
            technicalInfo,
            initialValues,
            title,
            formQueryParams,
            nodeTypeName,
            refetchFormData
        };

        return (
            <ContentEditorContext.Provider value={editorContext}>
                <ApolloCacheFlushOnGWTSave/>
                <Children {...props}/>
            </ContentEditorContext.Provider>
        );
    };

    ContentEditorDataContextProvider.propTypes = {
        notificationContext: PropTypes.object.isRequired
    };

    return compose(
        withNotifications()
    )(ContentEditorDataContextProvider);
};
