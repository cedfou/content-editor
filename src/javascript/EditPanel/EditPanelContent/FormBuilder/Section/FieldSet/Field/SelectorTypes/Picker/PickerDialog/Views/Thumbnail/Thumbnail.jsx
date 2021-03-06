import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {ProgressOverlay} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {ImageList} from '~/DesignSystem/ImageList';
import {encodeJCRPath} from '~/EditPanel/EditPanel.utils';
import {registry} from '@jahia/ui-extender';
import {useDialogPickerContent} from '../useDialogPickerContent';
import {CountDisplayer} from '../CountDisplayer';

export const Thumbnail = ({
    setSelectedItem,
    onThumbnailDoubleClick,
    selectedPath,
    initialSelection,
    searchTerms,
    pickerConfig,
    lang
}) => {
    const {t} = useTranslation();
    const {
        nodes,
        totalCount,
        hasMore,
        error,
        loading,
        refetch,
        loadMore
    } = useDialogPickerContent({
        lang,
        pickerConfig,
        selectedPath,
        searchTerms,
        fieldSorter: {
            fieldName: 'lastModified.value',
            sortType: 'DESC'
        }
    });

    useEffect(() => {
        registry.addOrReplace('refetch-upload', 'refetch-image-list', {
            refetch: refetch
        });
    });

    if (error) {
        const message = t(
            'content-media-manager:label.contentManager.error.queryingContent',
            {details: error.message ? error.message : ''}
        );
        console.warn(message);
    }

    if (loading || !nodes) {
        return <ProgressOverlay/>;
    }

    const images = error ?
        [] :
        nodes.map(rawImg => {
            return {
                uuid: rawImg.uuid,
                url: `${
                    window.contextJsParameters.contextPath
                }/files/default${encodeJCRPath(rawImg.path)}?lastModified=${rawImg.lastModified.value}&t=thumbnail2`,
                path: rawImg.path,
                name: rawImg.displayName,
                type: rawImg.metadata.nodes[0].mimeType.value.replace('image/', ''),
                width: rawImg.width ? `${rawImg.width.value}` : null,
                height: rawImg.height ? `${rawImg.height.value}` : null
            };
        });

    return (
        <>
            <CountDisplayer totalCount={totalCount}/>
            <ImageList
                labelEmpty={
                    searchTerms ?
                        t('content-editor:label.contentEditor.edit.fields.contentPicker.noSearchResults') :
                        t('content-editor:label.contentEditor.edit.fields.contentPicker.noContent')
                }
                images={images}
                hasMore={hasMore}
                loadMore={loadMore}
                error={error}
                initialSelection={initialSelection}
                onImageSelection={setSelectedItem}
                onImageDoubleClick={onThumbnailDoubleClick}
            />
        </>
    );
};

Thumbnail.defaultProps = {
    initialSelection: null,
    searchTerms: ''
};

Thumbnail.propTypes = {
    lang: PropTypes.string.isRequired,
    setSelectedItem: PropTypes.func.isRequired,
    onThumbnailDoubleClick: PropTypes.func.isRequired,
    selectedPath: PropTypes.string.isRequired,
    pickerConfig: PropTypes.object.isRequired,
    initialSelection: PropTypes.array,
    searchTerms: PropTypes.string
};
