import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/ds-mui-theme';
import {MediaPickerDialog} from './MediaPickerDialog';

jest.mock('./MediaPickerDialog.gql-queries', () => {
    return {
        useImagesData: () => ({
            images: [],
            loading: false,
            error: null
        })
    };
});

describe('mediaPicker modal', () => {
    let defaultProps;

    beforeEach(() => {
        defaultProps = {
            idInput: 'IDdd',
            site: 'mySite',
            lang: 'en',
            onCloseDialog: jest.fn(),
            onImageSelection: jest.fn()
        };
    });

    it('should close the modal when click on Cancel button', () => {
        const cmp = shallowWithTheme(
            <MediaPickerDialog {...defaultProps}/>,
            {},
            dsGenericTheme
        )
            .dive()
            .dive();

        cmp.find('WithStyles(Button)[color="secondary"]').simulate('click');

        expect(defaultProps.onCloseDialog).toHaveBeenCalled();
    });

    it('should emmit onImageSelection when an image is doubleClicked', () => {
        const cmp = shallowWithTheme(
            <MediaPickerDialog {...defaultProps}/>,
            {},
            dsGenericTheme
        )
            .dive()
            .dive();

        cmp.find('WithStyles(ImageListCmp)').simulate('imageDoubleClick', {name: 'imageName'});

        expect(defaultProps.onImageSelection).toHaveBeenCalledWith([{name: 'imageName'}]);
    });

    it('should disabled button when no image is selected', () => {
        const cmp = shallowWithTheme(
            <MediaPickerDialog {...defaultProps}/>,
            {},
            dsGenericTheme
        )
            .dive()
            .dive();

        expect(cmp.find('WithStyles(Button)[variant="contained"]').props().disabled).toBe(true);
    });

    it('should not disabled button when image is selected', () => {
        const cmp = shallowWithTheme(
            <MediaPickerDialog {...defaultProps}/>,
            {},
            dsGenericTheme
        )
            .dive()
            .dive();

        cmp.find('WithStyles(ImageListCmp)').simulate('imageSelection', [{name: 'imageName'}]);

        expect(cmp.find('WithStyles(Button)[variant="contained"]').props().disabled).toBe(false);
    });

    it('should emmit onImageSelection when an image is selected', () => {
        const cmp = shallowWithTheme(
            <MediaPickerDialog {...defaultProps}/>,
            {},
            dsGenericTheme
        )
            .dive()
            .dive();

        cmp.find('WithStyles(ImageListCmp)').simulate('imageSelection', [{name: 'imageName'}]);

        expect(defaultProps.onImageSelection).not.toHaveBeenCalledWith([{name: 'imageName'}]);

        cmp.find('WithStyles(Button)[variant="contained"]').simulate('click');

        expect(defaultProps.onImageSelection).toHaveBeenCalledWith([{name: 'imageName'}]);
    });
});