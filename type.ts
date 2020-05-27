// #!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {Mapping} from 'clientnode/type'
import {
    Configuration as BaseConfiguration,
    PluginHandler as BasePluginHandler,
    Service as BaseService,
    Services as BaseServices,
    ServicePromises as BaseServicePromises
} from 'web-node/type'

import Template from './index'
// endregion
// region exports
export type TemplateFiles = Mapping<Function|null>
export type Configuration = BaseConfiguration & {
    template:{
        cache:boolean;
        cacheInPlaceReplacements:boolean;
        extensions:Array<string>;
        inPlaceReplacementPaths:Array<string>;
        locationsToIgnore:Array<string>;
        options:{
            cache:boolean;
            compileDebug:boolean;
            debug:boolean;
        };
        renderAfterConfigurationUpdates:boolean;
        reloadEntryFiles:boolean;
        reloadSourceContent:boolean;
        scope:{
            evaluation:Mapping;
            execution:Mapping;
            plain:Mapping;
        };
    };
}
export type Services = BaseServices & {template:{
    getEntryFiles:Template['getEntryFiles'];
    render:Template['render'];
    renderFactory:Template['renderFactory'];
}}
export interface PluginHandler extends BasePluginHandler {
    /**
     * @param entryFiles - Mapping from template file path to compiled function
     * or null.
     * @param scope - Scope to render again templates.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     * @returns Given entry files.
     */
    preTemplateRender?(
        entryFiles:TemplateFiles,
        scope:object,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<TemplateFiles>
    /**
     * @param scope - Scope to render again templates.
     * @param entryFiles - Mapping from template file path to compiled function
     * or null.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     * @returns Given scope.
     */
    postTemplateRender?(
        scope:object,
        entryFiles:TemplateFiles,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<object>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
