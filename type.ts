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
import {Mapping, PlainObject, Primitive} from 'clientnode/type'
import {
    Options as EJSOptions, TemplateFunction as EJSTemplateFunction
} from 'ejs'
import {
    Configuration as BaseConfiguration,
    Plugin,
    PluginHandler as BasePluginHandler,
    Services as BaseServices
} from 'web-node/type'
// endregion
// region exports
export type RenderOptions = EJSOptions & {
    preCompiledTemplateFileExtensions:Array<string>;
}
export type Configuration = BaseConfiguration & {
    template:{
        cache:boolean;
        cacheInPlaceReplacements:boolean;
        extensions:Array<string>|string;
        locations:{
            exclude:Array<string>|string;
            include:Array<string>|string;
            inPlaceReplacements:Array<string>|string;
        };
        options:RenderOptions;
        renderAfterConfigurationUpdates:boolean;
        reloadEntryFiles:boolean;
        reloadSourceContent:boolean;
        scope:{
            evaluation:Mapping;
            execution:Mapping;
            plain:PlainObject<object|Primitive>;
        };
    };
}
export type Scope = object & {
    basePath:string;
    include:Function;
    options:RenderOptions;
    scope:Scope;
}
export type RenderFunction = (filePath:string, nestedLocals?:object) => string
export type RuntimeScope = Scope & {
    plugins:Array<Plugin>;
}
export type Services = BaseServices & {template:{
    getEntryFiles:(configuration:Configuration, plugins:Array<Plugin>) =>
        Promise<TemplateFiles>;
    render:(
        givenScope:null|object,
        configuration:Configuration,
        plugins:Array<Plugin>
    ) => Promise<Scope>;
    renderFactory:(
        configuration:Configuration, scope:Scope, options:RenderOptions
    ) => RenderFunction;
}}
export type TemplateFiles = Mapping<null>
export type TemplateFunction = EJSTemplateFunction
export type Templates = Mapping<TemplateFunction|null>
export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook before evaluating a templates. Corresponding files can be modified.
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
        scope:Scope,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<TemplateFiles>
    /**
     * Hook after rendering templates. Corresponding 
     * @param scope - Scope to render again templates.
     * @param entryFiles - Mapping from template file path to compiled function
     * or null.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     * @returns Given scope.
     */
    postTemplateRender?(
        scope:Scope,
        entryFiles:TemplateFiles,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Scope>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
