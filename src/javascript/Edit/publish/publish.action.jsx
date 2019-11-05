import {composeActions} from '@jahia/react-material';
import {withFormikAction} from '../../actions/withFormik.action';
import {Constants} from '~/ContentEditor.constants';
import {reduxAction} from '~/actions/redux.action';
import {publishNode} from './publish.request';
import {withPublicationInfoContextAction} from '../../actions/withPublicationInfoContext.action';

const mapStateToContext = state => {
    return {
        mode: state.mode
    };
};

export default composeActions(
    withFormikAction,
    withPublicationInfoContextAction,
    reduxAction(mapStateToContext),
    {
        init: context => {
            context.enabled = context.mode === Constants.routes.baseEditRoute && context.nodeData.hasPublishPermission;

            if (context.enabled) {
                if (context.publicationInfoContext.publicationInfoPolling && context.publicationInfoContext.publicationStatus === Constants.editPanel.publicationStatus.PUBLISHED) {
                    context.publicationInfoContext.stopPublicationInfoPolling();
                }

                context.disabled = context.publicationInfoContext.publicationStatus === undefined ||
                    context.publicationInfoContext.publicationInfoPolling ||
                    context.nodeData.lockInfo.isLocked ||
                    context.formik.dirty ||
                    [
                        Constants.editPanel.publicationStatus.PUBLISHED,
                        Constants.editPanel.publicationStatus.MANDATORY_LANGUAGE_UNPUBLISHABLE
                    ].includes(context.publicationInfoContext.publicationStatus);
            }
        },
        onClick: context => {
            publishNode({
                client: context.client,
                t: context.t,
                notificationContext: context.notificationContext,
                data: {
                    nodeData: context.nodeData,
                    language: context.language,
                    uiLang: context.uiLang
                },
                successCallback: context.publicationInfoContext.startPublicationInfoPolling()
            });
        }
    });
