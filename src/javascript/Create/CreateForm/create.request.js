import {CreateNode} from './createForm.gql-mutation';
import {getDataToMutate} from '~/EditPanel/EditPanel.utils';
import {adaptCreateRequest} from '../Create.adapter';
import {onServerError} from '~/Validation/validation.utils';

export const createNode = ({
    client,
    t,
    notificationContext,
    actions,
    createCallback,
    data: {
        primaryNodeType,
        nodeData,
        sections,
        values,
        language
    }
}) => {
    const {propsToSave, mixinsToAdd} = getDataToMutate({formValues: values, sections, lang: language});
    client.mutate({
        variables: adaptCreateRequest({
            uuid: nodeData.uuid,
            primaryNodeType,
            mixins: mixinsToAdd,
            properties: propsToSave
        }),
        mutation: CreateNode
    }).then(data => {
        if (createCallback) {
            createCallback(data.data.jcr.modifiedNodes[0].uuid);
        }

        notificationContext.notify(t('content-editor:label.contentEditor.create.createButton.success'), ['closeButton']);
        client.cache.flushNodeEntryById(nodeData.uuid);
        actions.setSubmitting(false);
    }, error => {
        onServerError(error, actions, notificationContext, t, 'content-editor:label.contentEditor.create.createButton.error');
    });
};
