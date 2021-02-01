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
import Tools from 'clientnode'
import {
    Encoding, EvaluationResult, File, Mapping, PlainObject
} from 'clientnode/type'
import ejs from 'ejs'
import {promises as fileSystem} from 'fs'
import synchronousFileSystem from 'fs'
import path from 'path'
import {PluginAPI} from 'web-node'
import {Plugin, PluginHandler} from 'web-node/type'

import {
    Configuration,
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
     * @returns New configuration object to use.
     */
    static async postConfigurationLoaded(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>,
        oldConfiguration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Configuration> {
        if (configuration.ejs.renderAfterConfigurationUpdates)
            Template.render(null, configuration, plugins)
        return configuration
    }
    /**
     * Appends an template renderer to the web node services.
     * @param services - An object with stored service instances.
     * @returns Given and extended object of services.
     */
    static preLoadService(services:Services):Services {
        services.ejs = {
            getEntryFiles: Template.getEntryFiles.bind(Template),
            render: Template.render.bind(Template),
            renderFactory: Template.renderFactory.bind(Template)
        }
        return services
    }
    /**
     * Triggers when application will be closed soon and removes created files.
     * @param services - An object with stored service instances.
     * @param configuration - Updated configuration object.
     * @returns Given object of services.
     */
    static async shouldExit(
        services:Services, configuration:Configuration
    ):Promise<Services> {
        const inPlaceReplacementPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        const templateOutputRemoveingPromises:Array<Promise<string>> = []
        for (const filePath in Template.templates)
            if (
                Template.templates.hasOwnProperty(filePath) &&
                !inPlaceReplacementPaths.includes(filePath)
            )
                templateOutputRemoveingPromises.push(new Promise(async (
                    resolve:Function, reject:Function
                ):Promise<void> => {
                    const newFilePath:string = filePath.substring(
                        0, filePath.length - path.extname(filePath).length
                    )
                    let newFileExists:boolean = false
                    try {
                        newFileExists = await Tools.isFile(newFilePath)
                    } catch (error) {
                        reject(error)
                    }
                    if (newFileExists)
                        try {
                            resolve(await fileSystem.unlink(newFilePath))
                        } catch (error) {
                            reject(error)
                        }
                    else
                        resolve(newFileExists)
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
     * @returns A promise holding all resolved files.
     */
    static async getEntryFiles(
        configuration:Configuration, plugins:Array<Plugin>
    ):Promise<TemplateFiles> {
        if (Template.entryFiles && !configuration.ejs.reloadEntryFiles)
            return Template.entryFiles
        const extensions:Array<string> =
            ([] as Array<string>).concat(configuration.ejs.extensions)
        const pluginPaths:Array<string> = plugins.map((plugin:Plugin):string =>
            plugin.path
        )
        Template.entryFiles = {}
        for (const location of PluginAPI.determineLocations(
            configuration, configuration.ejs.locations.include
        ))
            await Tools.walkDirectoryRecursively(
                location,
                (file:File):false|void => {
                    if (
                        file.name.startsWith('.') ||
                        PluginAPI.isInLocations(
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
                        Template.entryFiles[file.path] = null
                }
            )
        for (const filePath of ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        )
            Template.entryFiles[filePath] = null
        for (const filePath in Template.entryFiles)
            if (Template.entryFiles.hasOwnProperty(filePath))
                Template.templates[filePath] = Template.entryFiles[filePath]
        return Template.entryFiles
    }
    /**
     * Triggers template rendering.
     * @param givenScope - Scope to use for rendering templates.
     * @param configuration - Configuration object.
     * @param plugins - List of all loaded plugins.
     * @returns A promise resolving to scope used for template rendering.
     */
    static async render(
        givenScope:null|GivenScope,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Scope> {
        const scope:Scope = Tools.extend(
            true,
            {basePath: configuration.context.path},
            configuration.ejs.scope.plain,
            givenScope || {}
        )

        const now:Date = new Date()
        for (const type of ['evaluation', 'execution'] as const) {
            const evaluation:Mapping = configuration.ejs.scope[type]
            for (const name in evaluation)
                if (evaluation.hasOwnProperty(name)) {
                    const currentScope:Mapping<any> = {
                        configuration: Tools.copy(configuration, -1, true),
                        currentPath: process.cwd(),
                        fileSystem,
                        now,
                        nowUTCTimestamp: Tools.numberGetUTCTimestamp(now),
                        parser: ejs,
                        path,
                        PluginAPI,
                        plugins,
                        require: eval('require'),
                        scope,
                        synchronousFileSystem,
                        template: Template,
                        Tools,
                        webNodePath: __dirname
                    }
                    const evaluated:EvaluationResult = Tools.stringEvaluate(
                        evaluation[name], currentScope, type === 'execution'
                    )
                    if (evaluated.error)
                        console.warn(
                            'Error occurred during processing given ' +
                            `template scope configuration for "${name}": ` +
                            evaluated.error
                        )
                    else
                        (scope as Mapping<Function>)[name] = evaluated.result
                }
        }
        const options:RenderOptions = Tools.copy(configuration.ejs.options)
        Template.entryFiles = await PluginAPI.callStack(
            'preEjsRender',
            plugins,
            configuration,
            await Template.getEntryFiles(configuration, plugins),
            scope
        )
        const inPlaceReplacemetPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)
        const templateRenderingPromises:Array<Promise<string>> = []
        for (const filePath in Template.entryFiles)
            if (Template.entryFiles.hasOwnProperty(filePath))
                templateRenderingPromises.push(new Promise(async (
                    resolve:Function, reject:Function
                ):Promise<void> => {
                    const currentScope:RuntimeScope =
                        {...scope} as RuntimeScope
                    const inPlace:boolean =
                        inPlaceReplacemetPaths.includes(filePath)
                    const newFilePath:string = inPlace ?
                        filePath :
                        filePath.substring(
                            0, filePath.length - path.extname(filePath).length
                        )
                    if (
                        inPlace &&
                        configuration.ejs.cacheInPlaceReplacements &&
                        Template.entryFiles[filePath] ||
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
                            ...Tools.copy(options),
                            filename: path.relative(
                                currentScope.basePath, filePath
                            )
                        }
                        if (!currentScope.options)
                            currentScope.options = currentOptions
                        if (!currentScope.plugins)
                            currentScope.plugins = plugins
                        const render:RenderFunction = Template.renderFactory(
                            configuration, currentScope, currentOptions
                        )
                        let result:string = ''
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
                                        encoding: configuration.encoding,
                                        flag: 'w',
                                        mode: 0o666
                                    }
                                )
                                resolve(newFilePath)
                            } catch (error) {
                                reject(error)
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
                }))
        await Promise.all(templateRenderingPromises)
        return await PluginAPI.callStack(
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
     * @returns Render function.
     */
    static renderFactory(
        configuration:Configuration,
        givenScope:GivenScope = {},
        givenOptions:RenderOptions = {}
    ):RenderFunction {
        if (!givenScope.basePath)
            givenScope.basePath = configuration.context.path
        if (!givenOptions.preCompiledTemplateFileExtensions)
            givenOptions.preCompiledTemplateFileExtensions = ['.js']
        const inPlaceReplacemetPaths:Array<string> = ([] as Array<string>)
            .concat(configuration.ejs.locations.inPlaceReplacements)

        return (filePath:string, nestedLocals:GivenScope = {}):string => {
            type NestedOptions = RenderOptions & {encoding:Encoding}
            givenOptions.encoding = givenOptions.encoding || 'utf-8'
            let options:NestedOptions =
                Tools.copy(givenOptions) as NestedOptions
            delete options.client
            options = Tools.extend(
                true,
                options,
                nestedLocals.options || {}
            )
            filePath = path.resolve((givenScope as Scope).basePath, filePath)
            options.filename =
                path.relative((givenScope as Scope).basePath, filePath)

            const scope:Scope = {...givenScope} as Scope
            scope.basePath = path.dirname(filePath)
            scope.include =
                Template.renderFactory(configuration, scope, options)
            scope.options = options
            scope.scope = scope
            Tools.extend(scope, nestedLocals)

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
                        Template.templates.hasOwnProperty(currentFilePath) &&
                        Template.templates[currentFilePath]
                    )
                )
                    if (
                        options.preCompiledTemplateFileExtensions!
                            .includes(path.extname(currentFilePath))
                    )
                        try {
                            Template.templates[currentFilePath] =
                                eval('require')(currentFilePath)
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
                                {encoding: givenOptions.encoding}
                            )
                        } catch (error) {
                            throw new Error(
                                'Error occurred during loading template ' +
                                `file "${currentFilePath}" from file system:` +
                                ` ${Tools.represent(error)}`
                            )
                        }
                        if (!givenOptions._with)
                            // NOTE: Needed to manipulate code after compiling.
                            givenOptions.client = true
                        try {
                            Template.templates[currentFilePath] =
                                ejs.compile(template, givenOptions) as
                                    TemplateFunction
                            /*
                                Provide all scope names when "_with" options
                                isn't enabled
                            */
                            if (!givenOptions._with) {
                                const localsName:string =
                                    givenOptions.localsName || 'locals'
                                Template.templates[currentFilePath] =
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
                let result:string = ''
                try {
                    /*
                        NOTE: We want to be ensure to have same ordering as we
                        have for the scope names and to call internal
                        registered getter by retrieving values. So simple using
                        "...Object.values(scope)" is not appreciate here.
                    */
                    result = Template.templates[currentFilePath]!(
                        ...originalScopeNames
                            .map((name:string):any => scope[name])
                            .concat(options._with ? [] : scope)
                    )
                } catch (error) {
                    let scopeDescription:string = ''
                    try {
                        scopeDescription =
                            `scope ${Tools.represent(scope)} against`
                    } catch (error) {}
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
                `}") in "${givenScope.basePath}".`
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
