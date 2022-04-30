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
import Tools, {currentRequire} from 'clientnode'
import {
    AnyFunction,
    Encoding,
    EvaluationResult,
    File,
    Mapping
} from 'clientnode/type'
import ejs, {Data as EJSScope} from 'ejs'
import fileSystem from 'fs/promises'
import synchronousFileSystem from 'fs'
import path from 'path'
import {PluginAPI} from 'web-node'
import {Plugin, PluginHandler} from 'web-node/type'

import {
    Configuration,
    EvaluateScopeValueScope,
    GivenScope,
    RenderFunction,
    RenderOptions,
    RuntimeScope,
    Scope,
    TemplateFiles,
    TemplateFunction,
    Templates,
    Services
} from './type'
// endregion
/**
 * Renders all templates again configuration object and re-renders them after
 * configurations changes.
 * @property static:entryFiles - Mapping from auto determined file paths to
 * there compiled template function.
 * @property static:files - Mapping from determined file paths to there
 * compiled template function.
 */
export class Template implements PluginHandler {
    static entryFiles:TemplateFiles
    static templates:Templates = {}
    // region api
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @param oldConfiguration - Old configuration object.
     * @param plugins - List of all loaded plugins.
     * @param pluginAPI - Plugin api reference.
     *
     * @returns New configuration object to use.
     */
    static async postConfigurationLoaded(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>,
        oldConfiguration:Configuration,
        plugins:Array<Plugin>,
        pluginAPI:typeof PluginAPI
    ):Promise<Configuration> {
        if (configuration.ejs.renderAfterConfigurationUpdates)
            await Template.render(null, configuration, plugins, pluginAPI)

        return configuration
    }
    /**
     * Appends an template renderer to the web node services.
     * @param services - An object with stored service instances.
     *
     * @returns Given and extended object of services.
     */
    static preLoadService(services:Omit<Services, 'ejs'>):Services {
        services.ejs = {
            getEntryFiles: Template.getEntryFiles.bind(Template),
            render: Template.render.bind(Template),
            renderFactory: Template.renderFactory.bind(Template)
        }

        return services as Services
    }
    /**
     * Triggers when application will be closed soon and removes created files.
     * @param services - An object with stored service instances.
     * @param configuration - Updated configuration object.
     *
     * @returns Given object of services.
     */
    static async shouldExit(
        services:Services, configuration:Configuration
    ):Promise<Services> {
        const inPlaceReplacementPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        const templateOutputRemoveingPromises:Array<Promise<boolean>> = []
        for (const filePath of Object.keys(Template.templates))
            if (!inPlaceReplacementPaths.includes(filePath))
                templateOutputRemoveingPromises.push(new Promise<boolean>((
                    resolve:(_removed:boolean) => void,
                    reject:(_reason:Error) => void
                ):void => {
                    const newFilePath:string = filePath.substring(
                        0, filePath.length - path.extname(filePath).length
                    )
                    let newFileExists = false

                    void (async ():Promise<void> => {
                        try {
                            newFileExists = await Tools.isFile(newFilePath)
                        } catch (error) {
                            /* eslint-disable prefer-promise-reject-errors */
                            reject(error as Error)
                            /* eslint-enable prefer-promise-reject-errors */
                        }

                        if (newFileExists)
                            try {
                                await fileSystem.unlink(newFilePath)
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

        return services
    }
    // endregion
    // region helper
    /**
     * Retrieves all files to process.
     * @param configuration - Updated configuration object.
     * @param plugins - List of all loaded plugins.
     * @param pluginAPI - Plugin api reference.
     *
     * @returns A promise holding all resolved files.
     */
    static async getEntryFiles(
        configuration:Configuration,
        plugins:Array<Plugin>,
        pluginAPI:typeof PluginAPI
    ):Promise<TemplateFiles> {
        if (Template.entryFiles && !configuration.ejs.reloadEntryFiles)
            return Template.entryFiles

        const extensions:Array<string> =
            ([] as Array<string>).concat(configuration.ejs.extensions)

        Template.entryFiles = new Set<string>()
        for (const location of pluginAPI.determineLocations(
            configuration, configuration.ejs.locations.include
        ))
            await Tools.walkDirectoryRecursively(
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
                        Template.entryFiles.add(file.path)
                }
            )

        for (const filePath of ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        )
            Template.entryFiles.add(filePath)

        for (const filePath of Template.entryFiles)
            Template.templates[filePath] = null

        return Template.entryFiles
    }
    /**
     * Triggers template rendering.
     * @param givenScope - Scope to use for rendering templates.
     * @param configuration - Configuration object.
     * @param plugins - List of all loaded plugins.
     * @param pluginAPI - Plugin api reference.
     *
     * @returns A promise resolving to scope used for template rendering.
     */
    static async render(
        givenScope:null|GivenScope,
        configuration:Configuration,
        plugins:Array<Plugin>,
        pluginAPI:typeof PluginAPI
    ):Promise<Scope> {
        const scope:Scope = Tools.extend(
            true,
            {basePath: configuration.core.context.path},
            configuration.ejs.scope.plain,
            givenScope || {}
        )

        const now = new Date()
        for (const type of ['evaluation', 'execution'] as const) {
            const evaluations:Mapping = configuration.ejs.scope[type]
            for (const [name, expression] of Object.entries(evaluations)) {
                const currentScope:EvaluateScopeValueScope = {
                    configuration: Tools.copy(configuration, -1, true),
                    currentPath: process.cwd(),
                    fileSystem,
                    now,
                    nowUTCTimestamp: Tools.numberGetUTCTimestamp(now),
                    parser: ejs,
                    path,
                    PluginAPI: pluginAPI,
                    plugins,
                    require: currentRequire!,
                    scope,
                    synchronousFileSystem,
                    template: Template as unknown as PluginHandler,
                    Tools,
                    webNodePath: __dirname
                }
                const evaluated:EvaluationResult<AnyFunction> =
                    Tools.stringEvaluate<AnyFunction>(
                        expression,
                        currentScope as unknown as Mapping<unknown>,
                        type === 'execution'
                    )
                if (evaluated.error)
                    console.warn(
                        'Error occurred during processing given ' +
                        `template scope configuration for "${name}": ` +
                        evaluated.error
                    )
                else
                    (scope as Mapping<AnyFunction>)[name] =
                        evaluated.result
            }
        }

        Template.entryFiles = await pluginAPI.callStack(
            'preEjsRender',
            plugins,
            configuration,
            await Template.getEntryFiles(configuration, plugins, pluginAPI),
            scope
        )

        const inPlaceReplacemetPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        const templateRenderingPromises:Array<Promise<string>> = []

        for (const filePath of Template.entryFiles)
            templateRenderingPromises.push(new Promise<string>((
                resolve:(_value:string) => void,
                reject:(_reason:Error) => void
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
                        await Tools.isFile(newFilePath)
                    ) {
                        console.info(
                            `Template: Use cached file ("${newFilePath}") ` +
                            `for "${filePath}".`
                        )

                        resolve(newFilePath)
                    } else {
                        const currentOptions:RenderOptions = {
                            ...Tools.copy(configuration.ejs.options),

                            filename: path.relative(
                                currentScope.basePath, filePath
                            )
                        }
                        if (!currentScope.options)
                            currentScope.options = currentOptions
                        if (!currentScope.plugins)
                            currentScope.plugins = plugins

                        const render:RenderFunction =
                            Template.renderFactory(
                                configuration, currentScope, currentOptions
                            )

                        let result = ''
                        try {
                            result = render(filePath)
                        } catch (error) {
                            if (inPlace) {
                                console.warn(
                                    'Error during running in-place ' +
                                    `replacement template file "${filePath}"` +
                                    `: ${Tools.represent(error)}`
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

        return await pluginAPI.callStack(
            'postEjsRender',
            plugins,
            configuration,
            scope,
            Template.entryFiles
        )
    }
    /**
     * Generates a render function with given base scope to resolve includes.
     * @param configuration - Configuration object.
     * @param givenScope - Base scope to extend from.
     * @param givenOptions - Render options to use.
     *
     * @returns Render function.
     */
    static renderFactory(
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

            let options:NestedOptions = Tools.copy(givenOptions) as
                NestedOptions
            delete options.client
            options = Tools.extend<NestedOptions>(
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
            Tools.extend(scope, nestedLocals)

            scope.include =
                Template.renderFactory(configuration, scope, options)

            const originalScopeNames:Array<string> = Object.keys(scope)
            const scopeNames:Array<string> = originalScopeNames.map(
                (name:string):string =>
                    Tools.stringConvertToValidVariableName(name)
            )

            let currentFilePath:null|string = null
            for (const extension of [''].concat(configuration.ejs.extensions))
                if (Tools.isFileSync(filePath + extension)) {
                    currentFilePath = filePath + extension
                    break
                }

            if (currentFilePath) {
                if (
                    configuration.ejs.reloadSourceContent &&
                    !inPlaceReplacemetPaths.includes(filePath) ||
                    !(
                        Object.prototype.hasOwnProperty.call(
                            Template.templates, currentFilePath
                        ) &&
                        Template.templates[currentFilePath]
                    )
                )
                    if (
                        options.preCompiledTemplateFileExtensions!
                            .includes(path.extname(currentFilePath))
                    )
                        try {
                            Template.templates[currentFilePath] =
                                currentRequire!(currentFilePath) as
                                    TemplateFunction
                        } catch (error) {
                            throw new Error(
                                'Error occurred during loading script module' +
                                `: "${currentFilePath}": ` +
                                Tools.represent(error)
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
                                Tools.represent(error)
                            )
                        }

                        if (options.strict || !options._with)
                            // NOTE: Needed to manipulate code after compiling.
                            options.client = true

                        try {
                            Template.templates[currentFilePath] =
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
                                Template.templates[currentFilePath] =
                                    /*
                                        eslint-disable
                                        @typescript-eslint/no-implied-eval
                                    */
                                    new Function(
                                        ...scopeNames,
                                        localsName,
                                        'return ' +
                                        Template.templates[currentFilePath]!
                                            .toString() +
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
                                `${scope.basePath}": ` +
                                Tools.represent(error)
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
                        (Template.templates[currentFilePath] as
                            (
                                _scope:Scope,
                                _escape:Scope['escapeFn'],
                                _include:Scope['include']
                            ) => string
                        )(scope, scope.escapeFn, scope.include) :
                        Template.templates[currentFilePath]!(
                            ...originalScopeNames
                                .map((name:string):unknown => scope[name])
                                .concat(options._with ? [] : scope) as
                                    [EJSScope]
                        )
                } catch (error) {
                    let scopeDescription = ''

                    try {
                        scopeDescription =
                            `scope ${Tools.represent(scope)} against`
                    } catch (error) {
                        // Ignore error.
                    }

                    throw new Error(
                        'Error occurred during running template ' +
                        `${scopeDescription}file "${currentFilePath}": ` +
                        Tools.represent(error)
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
