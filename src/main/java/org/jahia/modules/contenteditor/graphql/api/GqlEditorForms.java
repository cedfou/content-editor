/*
 * ==========================================================================================
 * =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
 * ==========================================================================================
 *
 *                                 http://www.jahia.com
 *
 *     Copyright (C) 2002-2020 Jahia Solutions Group SA. All rights reserved.
 *
 *     THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
 *     1/GPL OR 2/JSEL
 *
 *     1/ GPL
 *     ==================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *     2/ JSEL - Commercial and Supported Versions of the program
 *     ===================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     Alternatively, commercial and supported versions of the program - also known as
 *     Enterprise Distributions - must be used in accordance with the terms and conditions
 *     contained in a separate written agreement between you and Jahia Solutions Group SA.
 *
 *     If you are unsure which license is appropriate for your use,
 *     please contact the sales department at sales@jahia.com.
 */
package org.jahia.modules.contenteditor.graphql.api;

import graphql.annotations.annotationTypes.*;
import org.apache.commons.lang.LocaleUtils;
import org.jahia.api.Constants;
import org.jahia.data.templates.JahiaTemplatesPackage;
import org.jahia.modules.contenteditor.api.forms.EditorForm;
import org.jahia.modules.contenteditor.api.forms.EditorFormException;
import org.jahia.modules.contenteditor.api.forms.EditorFormService;
import org.jahia.modules.contenteditor.graphql.api.definitions.GqlNodeTypeTreeEntry;
import org.jahia.modules.contenteditor.utils.ContentEditorUtils;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.osgi.BundleUtils;
import org.jahia.registries.ServicesRegistry;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.utils.NodeTypeTreeEntry;
import org.jahia.utils.NodeTypesUtils;
import org.osgi.framework.Bundle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * The root class for the GraphQL form API
 */
public class GqlEditorForms {

    private static Logger logger = LoggerFactory.getLogger(GqlEditorForms.class);

    private EditorFormService editorFormService = null;

    public GqlEditorForms() {
        this.editorFormService = BundleUtils.getOsgiService(EditorFormService.class, null);
    }

    @GraphQLField
    @GraphQLName("createForm")
    @GraphQLDescription("Get a editor form to create a new content from its nodetype and parent")
    public EditorForm getCreateForm(
        @GraphQLName("primaryNodeType")
        @GraphQLNonNull
        @GraphQLDescription("The primary node type name identifying the form we want to retrieve")
            String nodeType,
        @GraphQLName("uiLocale")
        @GraphQLNonNull
        @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...")
            String uiLocale,
        @GraphQLName("locale")
        @GraphQLNonNull
        @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...")
            String locale,
        @GraphQLName("uuidOrPath")
        @GraphQLNonNull
        @GraphQLDescription("uuid or path of an existing node under with the new content will be created.")
            String uuidOrPath) {
        try {
            return editorFormService.getCreateForm(nodeType, LocaleUtils.toLocale(uiLocale), LocaleUtils.toLocale(locale), uuidOrPath);
        } catch (EditorFormException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLName("editForm")
    @GraphQLDescription("Get a editor form from a locale and an existing node")
    public EditorForm getEditForm(
        @GraphQLName("uiLocale")
        @GraphQLNonNull
        @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...")
            String uiLocale,
        @GraphQLName("locale")
        @GraphQLNonNull
        @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...")
            String locale,
        @GraphQLName("uuidOrPath")
        @GraphQLNonNull
        @GraphQLDescription("UUID or path of an existing node under with the new content will be created.")
            String uuidOrPath) {
        try {
            return editorFormService.getEditForm(LocaleUtils.toLocale(uiLocale), LocaleUtils.toLocale(locale), uuidOrPath);
        } catch (EditorFormException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLName("contentTypesAsTree")
    @GraphQLDescription("Get a list of allowed child nodeTypes for a given nodeType and path. (Note that it returns nothing for type [jnt:page]. [jnt:contentFolder] is filterered by [jmix:editorialContent])")
    public List<GqlNodeTypeTreeEntry> getContentTypesAsTree(
        @GraphQLName("nodeTypes")
        @GraphQLDescription("List of types we want to retrieve, null for all")
            List<String> nodeTypes,
        @GraphQLName("excludedNodeTypes")
        @GraphQLDescription("List of types we want to exclude, null for all")
            List<String> excludedNodeTypes,
        @GraphQLName("includeSubTypes")
        @GraphQLDefaultValue(GqlUtils.SupplierTrue.class)
        @GraphQLDescription("if true, retrieves all the sub types of the given node types, if false, returns the type only. Default value is true")
            boolean includeSubTypes,
        @GraphQLName("useContribute")
        @GraphQLDefaultValue(GqlUtils.SupplierTrue.class)
        @GraphQLDescription("if true, check the contribute property of the node. Default value is true")
            boolean useContribute,
        @GraphQLName("nodePath")
        @GraphQLNonNull
        @GraphQLDescription("thPath of an existing node under with the new content will be created.")
            String nodePath,
        @GraphQLName("uiLocale")
        @GraphQLNonNull
        @GraphQLDescription("A string representation of a locale, in IETF BCP 47 language tag format, ie en_US, en, fr, fr_CH, ...")
            String uiLocale
    ) {
        try {
            // Todo: BACKLOG-11556
            // Special Content Editor Filters to match CMM behavior
            // No action on jnt:page
            JCRNodeWrapper parentNode = getSession().getNode(nodePath);
            if (parentNode.isNodeType("jnt:page")) {
                return Collections.emptyList();
            }
            // Only jmix:editorialContent on jnt:contentFolder
            if (parentNode.isNodeType("jnt:contentFolder") && (nodeTypes == null || nodeTypes.isEmpty())) {
                nodeTypes = Collections.singletonList("jmix:editorialContent");
            }
            // check write access
            if (!parentNode.hasPermission("jcr:addChildNodes")) {
                return Collections.emptyList();
            }
            final String nodeIdentifier = parentNode.getIdentifier();
            Locale locale = LocaleUtils.toLocale(uiLocale);
            List<String> allowedNodeTypes = new ArrayList<>(ContentEditorUtils.getAllowedNodeTypesAsChildNode(parentNode, useContribute, nodeTypes));
            Set<NodeTypeTreeEntry> entries = NodeTypesUtils.getContentTypesAsTree(allowedNodeTypes, excludedNodeTypes, includeSubTypes, nodePath, getSession(locale), locale);
            return entries.stream().map(entry -> new GqlNodeTypeTreeEntry(entry, nodeIdentifier)).collect(Collectors.toList());
        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    @GraphQLField
    @GraphQLName("ckeditorConfigPath")
    @GraphQLDescription("Retrieve the custom configuration path for CKEditor")
    public String ckeditorConfigPath(@GraphQLName("nodePath") @GraphQLDescription("node path") String nodePath) throws RepositoryException {
        // Retrieve custom configuration from template set module
        String templatesSet = getSession().getNode(nodePath).getResolveSite().getPropertyAsString("j:templatesSet");
        String configPath = getConfigPath(templatesSet, "/javascript/ckeditor_config.js");

        // Otherwise, retrieve custom configuration from global configuration
        if (configPath.isEmpty()) {
            configPath = getConfigPath("ckeditor", "/javascript/config.js");
        }

        return configPath;
    }

    @GraphQLField
    @GraphQLName("ckeditorToolbar")
    @GraphQLDescription("Retrieve the toolbar type for CKEditor")
    public String ckeditorToolbar(@GraphQLName("nodePath") @GraphQLDescription("node path") String nodePath) throws RepositoryException {
        String toolbar = "Light";

        JCRNodeWrapper node = getSession().getNode(nodePath);
        if (node.hasPermission("view-full-wysiwyg-editor")) {
            toolbar = "Full";
        } else if (node.hasPermission("view-basic-wysiwyg-editor")) {
            toolbar = "Basic";
        }

        return toolbar;
    }

    private String getConfigPath(String moduleId, String resource) {
        String configPath = "";
        JahiaTemplatesPackage ckeditorModule = ServicesRegistry.getInstance().getJahiaTemplateManagerService().getTemplatePackageById(moduleId);

        if (ckeditorModule != null) {
            Bundle ckeditorBundle = ckeditorModule.getBundle();

            if (ckeditorBundle != null && ckeditorBundle.getResource(resource) != null) {
                configPath = "$context" + ckeditorModule.getRootFolderPath() + resource;
            }
        }
        return configPath;
    }

    private JCRSessionWrapper getSession() throws RepositoryException {
        return JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE);
    }

    private JCRSessionWrapper getSession(Locale locale) throws RepositoryException {
        if (locale == null) {
            return getSession();
        }
        return JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE, locale);
    }
}
