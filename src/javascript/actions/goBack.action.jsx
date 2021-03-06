import React, {useState} from 'react';
import {EditPanelDialogConfirmation} from '~/EditPanel/EditPanelDialogConfirmation';
import {useContentEditorConfigContext} from '~/ContentEditor.context';
import * as PropTypes from 'prop-types';

const GoBack = ({context, render: Render}) => {
    const {envProps} = useContentEditorConfigContext();
    const [open, setOpen] = useState(false);
    const executeGoBackAction = () => {
        if (envProps.unregisterListeners) {
            envProps.unregisterListeners();
        }

        envProps.back(context.uuid, context.operator);
    };

    return (
        <>
            <EditPanelDialogConfirmation
                open={open}
                titleKey="content-editor:label.contentEditor.edit.action.goBack.title"
                formik={context.formik}
                actionCallback={() => executeGoBackAction()}
                onCloseDialog={() => setOpen(false)}
            />
            <Render
                context={{
                    ...context,
                    componentProps: {
                        ...context.componentProps,
                        disabled: envProps.disabledBack()
                    },
                    onClick: () => {
                        if (context.formik) {
                            if (context.formik.dirty) {
                                setOpen(true);
                            } else {
                                executeGoBackAction();
                            }
                        }
                    }
                }}/>
        </>
    );
};

GoBack.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired
};

const goBackAction = {
    component: GoBack
};

export default goBackAction;
