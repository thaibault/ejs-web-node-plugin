// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module templateWebNodePlugin */
'use strict'
/* !
    region header
    [Project page](https://torben.website/templateWebNodePlugin)

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
import {Encoding, File, Mapping, PlainObject} from 'clientnode/type'
import ejs from 'ejs'
import {promises as fileSystem} from 'fs'
import synchronousFileSystem from 'fs'
import path from 'path'
import {PluginAPI} from 'web-node'
import {Plugin, PluginHandler} from 'web-node/type'

import {
    Configuration,
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
        if (configuration.template.renderAfterConfigurationUpdates)
            Template.render(null, configuration, plugins)
        return configuration
    }
    /**
     * Appends an template renderer to the web node services.
     * @param services - An object with stored service instances.
     * @returns Given and extended object of services.
     */
    static preLoadService(services:Services):Services {
        services.template = {
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
        const templateOutputRemoveingPromises:Array<Promise<string>> = []
        for (const filePath in Template.templates)
            if (
                Template.templates.hasOwnProperty(filePath) &&
                !configuration.template.inPlaceReplacementPaths.includes(
                    filePath
                )
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
        if (Template.entryFiles && !configuration.template.reloadEntryFiles)
            return Template.entryFiles
        const pluginPaths:Array<string> = plugins.map((plugin:Plugin):string =>
            plugin.path
        )
        Template.entryFiles = {}
        for (const file of (await Tools.walkDirectoryRecursively(
            configuration.context.path, (file:File):false|void => {
                if (file.name.startsWith('.'))
                    return false
                /*
                    NOTE: We want to ignore all known plugin locations which
                    aren't loaded.
                */
                for (const directory of Object.values(configuration.plugin.directories))
                    if (
                        path.dirname(file.path) ===
                            path.resolve(directory.path) &&
                        !pluginPaths.includes(file.path)
                    )
                        return false
                /*
                    NOTE: We ignore absolute defined locations and relative
                    defined in each loaded plugin location.
                */
                for (
                    const locationToIgnore of
                    configuration.template.locationsToIgnore
                )
                    if (locationToIgnore.startsWith('/')) {
                        if (file.path.startsWith(path.join(
                            configuration.context.path, locationToIgnore
                        )))
                            return false
                    } else
                        for (const pluginPath of pluginPaths)
                            if (file.path.startsWith(path.resolve(
                                pluginPath, locationToIgnore
                            )))
                                return false
            })
        ).filter((file:File):boolean|null =>
            file.stats &&
            file.stats.isFile() &&
            /*
                NOTE: We can't use "path.extname()" here since double
                extensions like ".html.js" should be supported.
            */
            configuration.template.extensions
                .filter((extension:string):boolean =>
                    file.name.endsWith(extension)
                ).length > 0
        ))
            Template.entryFiles[file.path] = null
        for (const filePath of configuration.template.inPlaceReplacementPaths)
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
        givenScope:null|object,
        configuration:Configuration,
        plugins:Array<Plugin>
    ):Promise<Scope> {
        const scope:Scope = Tools.extend(
            true,
            {basePath: configuration.context.path},
            configuration.template.scope.plain,
            givenScope || {}
        )
        const now:Date = new Date()
        for (const type of ['evaluation', 'execution']) {
            const evaluation:Mapping = configuration.template.scope[
                type as 'evaluation'|'execution'
            ]
            for (const name in evaluation)
                if (evaluation.hasOwnProperty(name)) {
                    const currentScope:object = {
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
                    };
                    (scope as Mapping<Function>)[name] = (new Function(
                        ...Object.keys(currentScope),
                        type === 'evaluation' ?
                            `return ${evaluation[name]}` :
                            evaluation[name]
                    ))(...Object.values(currentScope))
                }
        }
        const options:RenderOptions =
            Tools.copy(configuration.template.options);
        (scope as Mapping<Function>).include =
            Template.renderFactory(configuration, scope, options)
        Template.entryFiles = await PluginAPI.callStack(
            'preTemplateRender',
            plugins,
            configuration,
            await Template.getEntryFiles(configuration, plugins),
            scope
        )
        const templateRenderingPromises:Array<Promise<string>> = []
        for (const filePath in Template.entryFiles)
            if (Template.entryFiles.hasOwnProperty(filePath))
                templateRenderingPromises.push(new Promise(async (
                    resolve:Function, reject:Function
                ):Promise<void> => {
                    const currentScope:RuntimeScope = Tools.extend({}, scope)
                    const inPlace:boolean =
                        configuration.template.inPlaceReplacementPaths
                            .includes(filePath)
                    const newFilePath:string = inPlace ?
                        filePath :
                        filePath.substring(
                            0, filePath.length - path.extname(filePath).length
                        )
                    if (
                        inPlace &&
                        configuration.template.cacheInPlaceReplacements &&
                        Template.entryFiles[filePath] ||
                        !inPlace &&
                        configuration.template.cache &&
                        await Tools.isFile(newFilePath)
                    ) {
                        console.info(
                            `Template: Use cached file ("${newFilePath}") ` +
                            `for "${filePath}".`
                        )
                        resolve(newFilePath)
                    } else {
                        const currentOptions:RenderOptions = Tools.extend(
                            {},
                            options,
                            {
                                filename: path.relative(
                                    currentScope.basePath, filePath)
                            }
                        )
                        if (!('options' in currentScope))
                            currentScope.options = currentOptions
                        if (!('plugins' in currentScope))
                            currentScope.plugins = plugins
                        const factory:Function = Template.renderFactory(
                            configuration, currentScope, currentOptions)
                        let result:string = ''
                        try {
                            result = factory(filePath)
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
            'postTemplateRender',
            plugins,
            configuration,
            scope,
            Template.entryFiles
        )
    }
    /**
     * Generates a render function with given base scope to resolve includes.
     * @param configuration - Configuration object.
     * @param scope - Base scope to extend from.
     * @param options - Render options to use.
     * @returns Render function.
     */
    static renderFactory(
        configuration:Configuration,
        scope:Scope = {} as Scope,
        options:RenderOptions = {} as RenderOptions
    ):RenderFunction {
        if (!('basePath' in scope))
            scope.basePath = configuration.context.path
        if (!('preCompiledTemplateFileExtensions' in options))
            options.preCompiledTemplateFileExtensions = ['.js']
        return (filePath:string, nestedLocals:object = {}):string => {
            type NestedOptions = RenderOptions & {encoding:Encoding}
            let nestedOptions:NestedOptions =
                Tools.copy(options) as NestedOptions
            delete nestedOptions.client
            nestedOptions = Tools.extend(
                true,
                {encoding: 'utf-8'},
                nestedOptions,
                (nestedLocals as {options:RenderOptions}).options || {}
            )
            const nestedScope:Scope = Tools.extend({}, scope)
            filePath = path.resolve(scope.basePath, filePath)
            nestedOptions.filename = path.relative(scope.basePath, filePath)
            nestedScope.basePath = path.dirname(filePath)
            nestedScope.include = Template.renderFactory(
                configuration, nestedScope, nestedOptions
            )
            nestedScope.options = nestedOptions
            nestedScope.scope = nestedScope
            Tools.extend(nestedScope, nestedLocals)
            let currentFilePath:null|string = null
            for (const extension of [''].concat(
                configuration.template.extensions
            ))
                if (Tools.isFileSync(filePath + extension)) {
                    currentFilePath = filePath + extension
                    break
                }
            if (currentFilePath) {
                if (
                    configuration.template.reloadSourceContent &&
                    !configuration.template.inPlaceReplacementPaths.includes(
                        filePath
                    ) ||
                    !(
                        Template.templates.hasOwnProperty(currentFilePath) &&
                        Template.templates[currentFilePath]
                    )
                )
                    if (
                        nestedOptions.preCompiledTemplateFileExtensions
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
                                {encoding: nestedOptions.encoding}
                            )
                        } catch (error) {
                            throw new Error(
                                'Error occurred during loading template ' +
                                `file "${currentFilePath}" from file system:` +
                                ` ${Tools.represent(error)}`
                            )
                        }
                        try {
                            Template.templates[currentFilePath] = ejs.compile(
                                template, nestedOptions
                            ) as TemplateFunction
                        } catch (error) {
                            throw new Error(
                                'Error occurred during compiling template ' +
                                `file "${currentFilePath}" with base path "` +
                                `${nestedScope.basePath}": ` +
                                Tools.represent(error)
                            )
                        }
                    }
                let result:string = ''
                try {
                    result = (
                        Template.templates[currentFilePath] as TemplateFunction
                    )(nestedScope)
                } catch (error) {
                    let scopeDescription:string = ''
                    try {
                        scopeDescription =
                            `scope ${Tools.represent(nestedScope)} against`
                    } catch (error) {}
                    throw new Error(
                        'Error occurred during running template ' +
                        `${scopeDescription}file "${currentFilePath}": ` +
                        Tools.represent(error)
                    )
                }
                return result
                    .replace(new RegExp(
                        '<script +processing-workaround *' +
                        `(?:= *(?:" *"|' *') *)?>([\\s\\S]*?)</ *script *>`,
                        'ig'
                    ), '$1')
                    .replace(new RegExp(
                        '<script +processing(-+)-workaround *' +
                        `(?:= *(?:" *"|' *') *)?>([\\s\\S]*?)</ *script *>`,
                        'ig'
                    ), '<script processing$1workaround>$2</script>')
            }
            throw new Error(
                `Given template file "${nestedOptions.filename}" couldn't be` +
                ' resolved (with known extensions: "' +
                `${configuration.template.extensions.join('", "')}") in "` +
                `${scope.basePath}".`
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
