// -*- coding: utf-8 -*-
/** @module type */
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
import {
    Encoding, Mapping, PlainObject, Primitive, RecursivePartial
} from 'clientnode/type'
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
    encoding?:Encoding
    preCompiledTemplateFileExtensions?:Array<string>
}
export type Configuration<ConfigurationType = {}> =
    BaseConfiguration<{
        ejs:{
            cache:boolean
            cacheInPlaceReplacements:boolean
            extensions:Array<string>|string
            locations:{
                exclude:Array<string>|string
                include:Array<string>|string
                inPlaceReplacements:Array<string>|string
            }
            options:RenderOptions
            renderAfterConfigurationUpdates:boolean
            reloadEntryFiles:boolean
            reloadSourceContent:boolean
            scope:{
                evaluation:Mapping
                execution:Mapping
                plain:PlainObject<object|Primitive>
            }
        }
    }> &
    ConfigurationType

export type Scope =
    Mapping<any> &
    {
        basePath:string
        include:Function
        options:RenderOptions
        scope:Scope
    }
export type GivenScope = RecursivePartial<Scope>

export type RuntimeScope = Scope & {plugins:Array<Plugin>}

export type RenderFunction =
    (_filePath:string, _nestedLocals?:object) => string

export type Services<ServiceType = {}> =
    BaseServices<{
        ejs:{
            getEntryFiles:(
                _configuration:Configuration, _plugins:Array<Plugin>
            ) => Promise<TemplateFiles>
            render:(
                _givenScope:null|GivenScope,
                _configuration:Configuration,
                _plugins:Array<Plugin>
            ) => Promise<Scope>
            renderFactory:(
                _configuration:Configuration,
                _scope:GivenScope,
                _options:RenderOptions
            ) => RenderFunction
        }
    }> &
    ServiceType

export type TemplateFiles = Mapping<null>
export type TemplateFunction = EJSTemplateFunction
export type Templates = Mapping<null|TemplateFunction>

export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook before evaluating a templates. Corresponding files can be modified.
     * @param entryFiles - Mapping from template file path to compiled function
     * or null.
     * @param scope - Scope to render again templates.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given entry files.
     */
    preEjsRender?(
        _entryFiles:TemplateFiles,
        _scope:Scope,
        _configuration:Configuration,
        _plugins:Array<Plugin>
    ):Promise<TemplateFiles>
    /**
     * Hook after rendering templates.
     * @param scope - Scope to render again templates.
     * @param entryFiles - Mapping from template file path to compiled function
     * or null.
     * @param configuration - Configuration object extended by each plugin
     * specific configuration.
     * @param plugins - Topological sorted list of plugins.
     *
     * @returns Given scope.
     */
    postEjsRender?(
        _scope:Scope,
        _entryFiles:TemplateFiles,
        _configuration:Configuration,
        _plugins:Array<Plugin>
    ):Promise<Scope>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
