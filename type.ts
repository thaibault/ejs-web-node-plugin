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
    Encoding, Mapping, PlainObject, Primitive, RecursivePartial, UTILITY_SCOPE
} from 'clientnode'
import {
    Options as EJSOptions, TemplateFunction as EJSTemplateFunction
} from 'ejs'
import {PluginAPI} from 'web-node'
import {
    Configuration as BaseConfiguration,
    Plugin,
    PluginHandler as BasePluginHandler,
    ServicePromises,
    ServicePromisesState as BaseServicePromisesState,
    Services as BaseServices,
    ServicesState as BaseServicesState
} from 'web-node/type'
// endregion
// region exports
export type RenderOptions = EJSOptions & {
    encoding?:Encoding
    preCompiledTemplateFileExtensions?:Array<string>
}
export type Configuration<ConfigurationType = Mapping<unknown>> =
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

export type EvaluateScopeValueScope =
    typeof UTILITY_SCOPE &
    {
        configuration:Configuration
        currentPath:string
        fileSystem:typeof import('fs/promises')
        now:Date
        nowUTCTimestamp:number
        parser:typeof import('ejs')
        path:typeof import('path')
        PluginAPI:typeof PluginAPI
        plugins:Array<Plugin>
        scope:Partial<Scope>
        synchronousFileSystem:typeof import('fs')
        template:BasePluginHandler
        webNodePath:string
    }

export type RenderFunction =
    (filePath:string, nestedLocals?:Mapping<unknown>) => string

export type Scope =
    Mapping<unknown> &
    {
        basePath:string
        include:RenderFunction
        options:RenderOptions
        scope:Scope
    }
export type GivenScope = RecursivePartial<Scope>

export type RuntimeScope = Scope & {plugins:Array<Plugin>}

export type Services<ServiceType = Mapping<unknown>> =
    BaseServices<{
        ejs:{
            entryFiles:null|TemplateFiles
            templates:Templates

            getEntryFiles:(state:State) => Promise<TemplateFiles>
            render:(state:State) => Promise<Scope>
            renderFactory:(
                services:Services,
                configuration:Configuration,
                scope:GivenScope,
                options:RenderOptions
            ) => RenderFunction
        }
    }> &
    ServiceType

export interface Data {
    entryFiles:TemplateFiles
    scope:Partial<Scope>
}
export type ServicesState = BaseServicesState<
    undefined, Configuration, Services
>
export type State = BaseServicePromisesState<
    Partial<Data>|undefined,
    Configuration,
    Services,
    ServicePromises
>

export type TemplateFiles = Set<string>
export type TemplateFunction = EJSTemplateFunction
export type Templates = Mapping<null|TemplateFunction>

export interface PluginHandler extends BasePluginHandler {
    /**
     * Hook before evaluating a templates. Corresponding files can be modified.
     * @param state - Application state.
     * @returns Promise resolving to entry files to use.
     */
    preEjsRender?(state:State):Promise<Data>
    /**
     * Hook after rendering templates.
     * @param state - Application state.
     * @returns Promise resolving to scope to use for evaluation.
     */
    postEjsRender?(state:State):Promise<void>
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
