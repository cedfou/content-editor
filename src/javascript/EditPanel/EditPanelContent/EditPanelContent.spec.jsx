import {EditPanelContent} from './EditPanelContent';
import React from 'react';
import {shallow} from '@jahia/test-framework';

describe('EditPanelContent', () => {
    let defaultProps;
    let wrapper;

    beforeEach(() => {
        defaultProps = {
            fields: [],
            siteInfo: {},
            classes: {},
            mode: 'edit'
        };
        wrapper = shallow(<EditPanelContent {...defaultProps}/>);
    });

    it('should not throw an error', () => {
        expect(wrapper).toBeDefined();
    });
});
