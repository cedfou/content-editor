import {replaceAction} from './replace.action';

describe('replaceAction', () => {
    it('should open modal when clicking on it', () => {
        const open = jest.fn();
        replaceAction.onClick({open});

        expect(open).toHaveBeenCalledWith(true);
    });

    it('should enabled the action if field is not readonly', () => {
        const context = {
            field: {
                formDefinition: {
                    readOnly: false
                }
            }
        };
        replaceAction.init(context);

        expect(context.enabled).toBe(true);
    });

    it('should not enabled the action if field is readonly', () => {
        const context = {
            field: {
                formDefinition: {
                    readOnly: true
                }
            }
        };
        replaceAction.init(context);

        expect(context.enabled).toBe(false);
    });
});
