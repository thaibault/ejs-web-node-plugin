// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module ejs-web-node-plugin */
'use strict'
/* !
    region header
    [Project page](https://torben.website/ejs-web-node-plugin)

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
    AnyFunction,
    convertToValidVariableName,
    copy,
    currentRequire,
    Encoding,
    evaluate,
    EvaluationResult,
    extend,
    File,
    getUTCTimestamp,
    isFile,
    isFileSync,
    Mapping,
    represent,
    UTILITY_SCOPE,
    walkDirectoryRecursively
} from 'clientnode'
import ejs, {Data as EJSScope} from 'ejs'
import fileSystem, {unlink} from 'fs/promises'
import synchronousFileSystem from 'fs'
import path from 'path'
import {ChangedConfigurationState, PluginHandler} from 'web-node/type'

import {
    Configuration,
    Data,
    EvaluateScopeValueScope,
    GivenScope,
    RenderFunction,
    RenderOptions,
    RuntimeScope,
    Scope,
    Services,
    ServicesState,
    State,
    TemplateFiles,
    TemplateFunction
} from './type'
// endregion
/**
 * Renders all templates again configuration object and re-renders them after
 * configurations changes.
 */
export class Template implements PluginHandler {
    // region api
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed. Asynchronous tasks are allowed
     * and a returning promise will be respected.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    static async postConfigurationHotLoaded(
        state:ChangedConfigurationState
    ):Promise<void> {
        if (
            (state as unknown as State)
                .configuration.ejs?.renderAfterConfigurationUpdates &&
            ((state as unknown as State).services as Partial<Services>)
                .ejs?.render
        )
            await (state as unknown as State).services.ejs.render(
                state as unknown as State
            )
    }
    /**
     * Appends an template renderer to the web node services.
     * @param state - Application state.
     * @returns Promise resolving to nothing.
     */
    static async preLoadService(state:ServicesState):Promise<void> {
        const {configuration: {ejs: configuration}, services} = state

        services.ejs = {
            entryFiles: null,
            templates: {},

            getEntryFiles: Template.getEntryFiles.bind(Template),
            render: Template.render.bind(Template),
            renderFactory: Template.renderFactory.bind(Template)
        }

        if (configuration.renderAfterConfigurationUpdates)
            await services.ejs.render(state as unknown as State)
    }
    /**
     * Triggers when application will be closed soon and removes created files.
     * @param state - Application state.
     * @param state.configuration - Applications configuration.
     * @param state.configuration.ejs - Plugins configuration.
     * @param state.configuration.ejs.locations - Plugins template locations.
     * @param state.services - Applications services.
     * @returns Promise resolving to nothing.
     */
    static async shouldExit(
        {configuration: {ejs: {locations}}, services}:State
    ):Promise<void> {
        if (!services.ejs?.templates)
            return

        const inPlaceReplacementPaths:Array<string> = ([] as Array<string>)
            .concat(locations.inPlaceReplacements)

        const templateOutputRemoveingPromises:Array<Promise<boolean>> = []
        for (const filePath of Object.keys(services.ejs.templates))
            if (!inPlaceReplacementPaths.includes(filePath))
                templateOutputRemoveingPromises.push(new Promise<boolean>((
                    resolve:(removed:boolean) => void,
                    reject:(reason:Error) => void
                ):void => {
                    const newFilePath:string = filePath.substring(
                        0, filePath.length - path.extname(filePath).length
                    )
                    let newFileExists = false

                    void (async ():Promise<void> => {
                        try {
                            newFileExists = await isFile(newFilePath)
                        } catch (error) {
                            /* eslint-disable prefer-promise-reject-errors */
                            reject(error as Error)
                            /* eslint-enable prefer-promise-reject-errors */
                        }

                        if (newFileExists)
                            try {
                                await unlink(newFilePath)

                                resolve(true)
                            } catch (error) {
                                /*
                                    eslint-disable prefer-promise-reject-errors
                                */
                                reject(error as Error)
                                /*
                                    eslint-enable prefer-promise-reject-errors
                                */
                            }
                        else
                            resolve(false)
                    })()
                }))

        await Promise.all(templateOutputRemoveingPromises)
    }
    // endregion
    // region helper
    /**
     * Retrieves all files to process.
     * @param state - Application state.
     * @param state.configuration - Applications configuration.
     * @param state.plugins - Applications plugins.
     * @param state.pluginAPI - Applications plugin api.
     * @param state.services - Applications services.
     * @param state.services.ejs - Plugins services.
     * @returns A promise holding all resolved files.
     */
    static async getEntryFiles({
        configuration, plugins, pluginAPI, services: {ejs}
    }:State):Promise<TemplateFiles> {
        if (ejs.entryFiles && !configuration.ejs.reloadEntryFiles)
            return ejs.entryFiles

        const extensions:Array<string> =
            ([] as Array<string>).concat(configuration.ejs.extensions)

        ejs.entryFiles = new Set<string>()
        for (const location of pluginAPI.determineLocations(
            configuration, configuration.ejs.locations.include
        ))
            await walkDirectoryRecursively(
                location,
                (file:File):false|void => {
                    if (
                        file.name.startsWith('.') ||
                        pluginAPI.isInLocations(
                            configuration,
                            plugins,
                            file.path,
                            configuration.ejs.locations.exclude
                        )
                    )
                        return false

                    if (
                        file.stats?.isFile() &&
                        /*
                            NOTE: We can't use "path.extname()" here since
                            double extensions like ".html.js" should be
                            supported.
                        */
                        extensions.some((extension:string):boolean =>
                            file.name.endsWith(extension)
                        )
                    )
                        ejs.entryFiles!.add(file.path)
                }
            )

        for (const filePath of ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        )
            ejs.entryFiles.add(filePath)

        for (const filePath of ejs.entryFiles)
            ejs.templates[filePath] = null

        return ejs.entryFiles
    }
    /**
     * Triggers template rendering.
     * @param state - Application state.
     * @returns A promise resolving to nothing.
     */
    static async render(state:State):Promise<Scope> {
        const {configuration, data, pluginAPI, plugins, services} =
            state

        let scope:Partial<Scope> = extend(
            true,
            {basePath: configuration.core.context.path},
            configuration.ejs.scope.plain,
            data?.scope || {} as Partial<Scope>
        )

        const currentPath:string = process.cwd()
        const now = new Date()
        const nowUTCTimestamp:number = getUTCTimestamp(now)
        for (const type of ['evaluation', 'execution'] as const) {
            const evaluations:Mapping = configuration.ejs.scope[type]
            for (const [name, expression] of Object.entries(evaluations)) {
                const currentScope:EvaluateScopeValueScope = {
                    ...UTILITY_SCOPE,
                    configuration,
                    currentPath,
                    fileSystem,
                    now,
                    nowUTCTimestamp,
                    parser: ejs,
                    path,
                    PluginAPI: pluginAPI,
                    plugins,
                    scope,
                    synchronousFileSystem,
                    template: Template as unknown as PluginHandler,
                    webNodePath: __dirname
                }

                const evaluated:EvaluationResult<AnyFunction> =
                    evaluate<AnyFunction>(
                        expression,
                        currentScope as unknown as Mapping<unknown>,
                        type === 'execution'
                    )

                if (evaluated.error)
                    console.warn(
                        'Error occurred during processing given template ' +
                        `scope configuration for "${name}": ${evaluated.error}`
                    )
                else
                    (scope as Mapping<AnyFunction>)[name] = evaluated.result
            }
        }

        state = {
            ...state,
            data: {
                entryFiles:
                    data?.entryFiles ||
                    await services.ejs.getEntryFiles(state),
                scope
            },
            hook: 'preEjsRender'
        }


        const givenData:Data = await pluginAPI.callStack<State, Data>(state)
        scope = givenData.scope
        services.ejs.entryFiles = givenData.entryFiles

        const inPlaceReplacemetPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        const templateRenderingPromises:Array<Promise<string>> = []

        for (const filePath of services.ejs.entryFiles)
            templateRenderingPromises.push(new Promise<string>((
                resolve:(value:string) => void, reject:(reason:Error) => void
            ):void => {
                const currentScope:RuntimeScope = {...scope} as RuntimeScope
                const inPlace:boolean =
                    inPlaceReplacemetPaths.includes(filePath)
                const newFilePath:string = inPlace ?
                    filePath :
                    filePath.substring(
                        0, filePath.length - path.extname(filePath).length
                    )

                void (async ():Promise<void> => {
                    if (
                        inPlace &&
                        configuration.ejs.cacheInPlaceReplacements ||
                        !inPlace &&
                        configuration.ejs.cache &&
                        await isFile(newFilePath)
                    ) {
                        console.info(
                            `Template: Use cached file ("${newFilePath}") ` +
                            `for "${filePath}".`
                        )

                        resolve(newFilePath)
                    } else {
                        const currentOptions:RenderOptions = {
                            ...copy(configuration.ejs.options),

                            filename: path.relative(
                                currentScope.basePath, filePath
                            )
                        }
                        if (!currentScope.options)
                            currentScope.options = currentOptions
                        if (!currentScope.plugins)
                            currentScope.plugins = plugins

                        const render:RenderFunction =
                            services.ejs.renderFactory(
                                services,
                                configuration,
                                currentScope,
                                currentOptions
                            )

                        let result = ''
                        try {
                            result = render(filePath)
                        } catch (error) {
                            if (inPlace) {
                                console.warn(
                                    'Error during running in-place ' +
                                    `replacement template file "${filePath}"` +
                                    `: ${represent(error)}`
                                )

                                return resolve(newFilePath)
                            }

                            throw error
                        }

                        if (result)
                            try {
                                await fileSystem.writeFile(
                                    newFilePath,
                                    result,
                                    {
                                        encoding: configuration.core.encoding,
                                        flag: 'w',
                                        mode: 0o666
                                    }
                                )

                                resolve(newFilePath)
                            } catch (error) {
                                /*
                                    eslint-disable prefer-promise-reject-errors
                                */
                                reject(error as Error)
                                /*
                                    eslint-enable prefer-promise-reject-errors
                                */
                            }
                        else {
                            console.warn(
                                'An empty template processing result ' +
                                `detected for file "${newFilePath}" with ` +
                                `input file "${filePath}".`
                            )

                            resolve(newFilePath)
                        }
                    }
                })()
            }))

        await Promise.all(templateRenderingPromises)

        await pluginAPI.callStack<State>({...state, hook: 'postEjsRender'})

        return scope as Scope
    }
    /**
     * Generates a render function with given base scope to resolve includes.
     * @param services - An object with stored service instances.
     * @param configuration - Configuration object.
     * @param givenScope - Base scope to extend from.
     * @param givenOptions - Render options to use.
     * @returns Render function.
     */
    static renderFactory(
        services:Services,
        configuration:Configuration,
        givenScope:GivenScope = {},
        givenOptions:RenderOptions = {}
    ):RenderFunction {
        if (!givenScope.basePath)
            givenScope.basePath = configuration.core.context.path
        if (!givenOptions.preCompiledTemplateFileExtensions)
            givenOptions.preCompiledTemplateFileExtensions = ['.js']
        if (!givenOptions.encoding)
            givenOptions.encoding = 'utf-8'

        const inPlaceReplacemetPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)

        return (filePath:string, nestedLocals:GivenScope = {}):string => {
            type NestedOptions = RenderOptions & {encoding:Encoding}

            let options:NestedOptions = copy(givenOptions) as NestedOptions
            delete options.client
            options = extend<NestedOptions>(
                true,
                options,
                nestedLocals.options || {}
            )

            filePath = path.resolve((givenScope as Scope).basePath, filePath)
            options.filename =
                path.relative((givenScope as Scope).basePath, filePath)

            const scope:Scope = {...givenScope} as Scope
            scope.basePath = path.dirname(filePath)
            scope.options = options
            scope.scope = scope
            extend(scope, nestedLocals)

            scope.include = services.ejs.renderFactory(
                services, configuration, scope, options
            )

            const originalScopeNames:Array<string> = Object.keys(scope)
            const scopeNames:Array<string> = originalScopeNames.map(
                (name:string):string => convertToValidVariableName(name)
            )

            let currentFilePath:null|string = null
            for (const extension of [''].concat(configuration.ejs.extensions))
                if (isFileSync(filePath + extension)) {
                    currentFilePath = filePath + extension
                    break
                }

            if (currentFilePath) {
                if (
                    configuration.ejs.reloadSourceContent &&
                    !inPlaceReplacemetPaths.includes(filePath) ||
                    !(
                        Object.prototype.hasOwnProperty.call(
                            services.ejs.templates, currentFilePath
                        ) &&
                        services.ejs.templates[currentFilePath]
                    )
                )
                    if (
                        options.preCompiledTemplateFileExtensions!
                            .includes(path.extname(currentFilePath))
                    )
                        try {
                            services.ejs.templates[currentFilePath] =
                                currentRequire!(currentFilePath) as
                                    TemplateFunction
                        } catch (error) {
                            throw new Error(
                                'Error occurred during loading script module' +
                                `: "${currentFilePath}": ${represent(error)}`
                            )
                        }
                    else {
                        let template:string
                        try {
                            template = synchronousFileSystem.readFileSync(
                                currentFilePath,
                                {encoding: options.encoding}
                            )
                        } catch (error) {
                            throw new Error(
                                'Error occurred during loading template file' +
                                ` "${currentFilePath}" from file system: ` +
                                represent(error)
                            )
                        }

                        if (options.strict || !options._with)
                            // NOTE: Needed to manipulate code after compiling.
                            options.client = true

                        try {
                            services.ejs.templates[currentFilePath] =
                                ejs.compile(template, options) as
                                    TemplateFunction
                            /*
                                Provide all scope names when "_with" options
                                isn't enabled
                            */
                            if (options.strict || !options._with) {
                                let localsName:string =
                                    options.localsName || 'locals'
                                while (scopeNames.includes(localsName))
                                    localsName = `_${localsName}`
                                services.ejs.templates[currentFilePath] =
                                    /*
                                        eslint-disable
                                        @typescript-eslint/no-implied-eval
                                    */
                                    new Function(
                                        ...scopeNames,
                                        localsName,
                                        'return ' +
                                        services.ejs.templates[
                                            currentFilePath
                                        ]!.toString() +
                                        `(${localsName},` +
                                        `${localsName}.escapeFn,include,` +
                                        `${localsName}.rethrow)`
                                    ) as TemplateFunction
                                    /*
                                        eslint-enable
                                        @typescript-eslint/no-implied-eval
                                    */
                            }
                        } catch (error) {
                            throw new Error(
                                'Error occurred during compiling template ' +
                                `file "${currentFilePath}" with base path "` +
                                `${scope.basePath}": ${represent(error)}`
                            )
                        }
                    }

                let result = ''
                try {
                    /*
                        NOTE: We want to be ensure to have same ordering as we
                        have for the scope names and to call internal
                        registered getter by retrieving values. So simple using
                        "...Object.values(scope)" is not appreciate here.
                    */
                    result = !options.strict && options._with ?
                        (services.ejs.templates[currentFilePath] as
                            (
                                _scope:Scope,
                                _escape:Scope['escapeFn'],
                                _include:Scope['include']
                            ) => string
                        )(scope, scope.escapeFn, scope.include) :
                        services.ejs.templates[currentFilePath]!(
                            ...originalScopeNames
                                .map((name:string):unknown => scope[name])
                                .concat(options._with ? [] : scope) as
                                    [EJSScope]
                        )
                } catch (error) {
                    let scopeDescription = ''

                    try {
                        scopeDescription = represent(scope)
                        if (scopeDescription.length > 1000)
                            scopeDescription =
                                scopeDescription.substring(0, 997) + '...'
                        scopeDescription = ` scope ${scopeDescription} against`
                    } catch (error) {
                        // Ignore error.
                    }

                    throw new Error(
                        'Error occurred during running template' +
                        `${scopeDescription} file "${currentFilePath}": ` +
                        represent(error)
                    )
                }

                return result
                    .replace(
                        new RegExp(
                            '<script +processing-workaround *' +
                            `(?:= *(?:" *"|' *') *)?>([\\s\\S]*?)` +
                            '</ *script *>',
                            'ig'
                        ),
                        '$1'
                    )
                    .replace(
                        new RegExp(
                            '<script +processing(-+)-workaround *' +
                            `(?:= *(?:" *"|' *') *)?>([\\s\\S]*?)` +
                            '</ *script *>',
                            'ig'
                        ),
                        '<script processing$1workaround>$2</script>'
                    )
            }

            throw new Error(
                `Given template file "${options.filename}" couldn't be ` +
                'resolved (with known extensions: "' +
                [''].concat(configuration.ejs.extensions).join('", "') +
                `}") in "${givenScope.basePath!}".`
            )
        }
    }
    // endregion
}
export default Template
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
