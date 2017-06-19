// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module templateWebNodePlugin */
'use strict'
/* !
    region header
    [Project page](http://torben.website/templateWebNodePlugin)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools from 'clientnode'
import type {File, PlainObject} from 'clientnode'
import ejs from 'ejs'
import fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import PluginAPI from 'web-node/pluginAPI'
import type {Configuration, Plugin, Services} from 'web-node/type'
// endregion
/**
 * Renders all templates again configuration object and rerenders them after
 * configurations changes.
 */
export default class Template {
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
    oldConfiguration:Configuration, plugins:Array<Plugin>
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
        render: Template.render.bind(Template),
        renderFactory: Template.renderFactory.bind(Template)
    }
    return services
}
/**
 * Triggers when application will be closed soon and removes created files.
 * @param services - An object with stored service instances.
 * @param configuration - Updated configuration object.
 * @param plugins - List of all loaded plugins.
 * @returns Given object of services.
 */
static async shouldExit(
    services:Services, configuration:Configuration, plugins:Array<Plugin>
):Promise<Services> {
    const templateOutputRemoveingPromises:Array<Promise<string>> = []
    for (const file:File of await Template.getFiles(
        configuration, plugins
    ))
        templateOutputRemoveingPromises.push(new Promise(async (
            resolve:Function, reject:Function
        ):Promise<void> => {
            const newFilePath:string = file.path.substring(
                0, file.path.length - path.extname(file.path).length)
            let newFileExists:boolean = false
            try {
                newFileExists = await Tools.isFile(newFilePath)
            } catch (error) {
                reject(error)
            }
            if (newFileExists)
                fileSystem.unlink(newFilePath, (error:?Error):void => (
                    error
                ) ? reject(error) : resolve(newFilePath))
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
    static async getFiles(
        configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Array<File>> {
        const pluginPaths:Array<string> = plugins.map((plugin:Plugin):string =>
            plugin.path)
        return (await Tools.walkDirectoryRecursively(
            configuration.context.path, (file:File):?false => {
                if (file.name.startsWith('.'))
                    return false
                /*
                    NOTE: We want to ignore all known plugin locations which
                    aren't loaded.
                */
                for (const type:string in configuration.plugin.directories)
                    if (configuration.plugin.directories.hasOwnProperty(
                        type
                    ) && path.dirname(file.path) === path.resolve(
                        configuration.plugin.directories[type].path
                    ) && !pluginPaths.includes(file.path))
                        return false
                /*
                    NOTE: We ignore absolute defined locations and relative
                    defined in each loaded plugin location.
                */
                for (
                    const locationToIgnore:string of
                    configuration.template.locationsToIgnore
                )
                    if (locationToIgnore.startsWith('/')) {
                        if (file.path.startsWith(path.join(
                            configuration.context.path, locationToIgnore
                        )))
                            return false
                    } else
                        for (const pluginPath:string of pluginPaths)
                            if (file.path.startsWith(path.resolve(
                                pluginPath, locationToIgnore
                            )))
                                return false
            })
        ).filter((file:File):boolean => file.stat.isFile(
        ) && configuration.template.extensions.filter((
            extension:string
        /*
            NOTE: We can't use "path.extname()" here since double
            extensions like ".html.js" should be supported.
        */
        ):boolean => file.name.endsWith(extension)).length > 0)
    }
    /**
     * Triggers template rendering.
     * @param givenScope - Scope to use for rendering templates.
     * @param configuration - Configuration object.
     * @param plugins - List of all loaded plugins.
     * @returns A promise resolving to scope used for template rendering.
     */
    static async render(
        givenScope:?Object, configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Object> {
        const scope:Object = Tools.extendObject(true, {
            basePath: configuration.context.path
        }, configuration.template.scope.plain, givenScope || {})
        for (const type:string of ['evaluation', 'execution'])
            for (const name:string in configuration.template.scope[type])
                if (configuration.template.scope[type].hasOwnProperty(name))
                    // IgnoreTypeCheck
                    scope[name] = (new Function(
                        'configuration', 'currentPath', 'fileSystem', 'parser',
                        'path', 'PluginAPI', 'plugins', 'require', 'scope',
                        'template', 'Tools', 'webNodePath',
                        type === 'evaluation' ?
                        `return ${configuration.template.scope[type][name]}` :
                        configuration.template.scope[type][name]
                    ))(
                        Tools.copyLimitedRecursively(configuration, -1, true),
                        process.cwd(), fileSystem, ejs, path, PluginAPI,
                        plugins, eval('require'), scope, Template, Tools,
                        __dirname)
        const options:PlainObject = Tools.copyLimitedRecursively(
            configuration.template.options)
        scope.include = Template.renderFactory(configuration, scope, options)
        const templateFiles:Array<File> = await PluginAPI.callStack(
            'preTemplateRender', plugins, configuration,
            await Template.getFiles(configuration, plugins), scope)
        const templateRenderingPromises:Array<Promise<string>> = []
        for (const file:File of templateFiles)
            templateRenderingPromises.push(new Promise((
                resolve:Function, reject:Function
            ):void => {
                const currentScope:Object = Tools.extendObject({}, scope)
                const newFilePath:string = file.path.substring(
                    0, file.path.length - path.extname(file.path).length)
                const currentOptions:PlainObject = Tools.extendObject({
                }, options, {filename: path.relative(
                    currentScope.basePath, file.path)})
                if (!('options' in currentScope))
                    currentScope.options = currentOptions
                if (!('plugins' in currentScope))
                    currentScope.plugins = plugins
                const result:string = Template.renderFactory(
                    configuration, currentScope, currentOptions
                )(file.path)
                if (result)
                    try {
                        fileSystem.writeFile(newFilePath, result, {
                            encoding: configuration.encoding,
                            flag: 'w', mode: 0o666
                        }, (error:?Error):void => (error) ? reject(
                            error
                        ) : resolve(newFilePath))
                    } catch (error) {
                        reject(error)
                    }
            }))
        await Promise.all(templateRenderingPromises)
        return await PluginAPI.callStack(
            'postTemplateRender', plugins, configuration, scope, templateFiles)
    }
    /**
     * Generates a render function with given base scope to resolve includes.
     * @param configuration - Configuration object.
     * @param scope - Base scope to extend from.
     * @param options - Render options to use.
     * @returns Render function.
     */
    static renderFactory(
        configuration:Configuration, scope:Object = {}, options:Object = {}
    ):Function {
        if (!scope.basePath)
            scope.basePath = configuration.context.path
        return (filePath:string, nestedLocals:Object = {}):string => {
            let nestedOptions:Object = Tools.copyLimitedRecursively(options)
            delete nestedOptions.client
            nestedOptions = Tools.extendObject(
                true, {encoding: 'utf-8'}, nestedOptions,
                nestedLocals.options || {})
            const nestedScope:Object = Tools.extendObject({}, scope)
            filePath = path.resolve(scope.basePath, filePath)
            nestedOptions.filename = path.relative(scope.basePath, filePath)
            nestedScope.basePath = path.dirname(filePath)
            nestedScope.include = Template.renderFactory(
                configuration, nestedScope, nestedOptions)
            nestedScope.scope = nestedScope
            Tools.extendObject(nestedScope, nestedLocals)
            let currentFilePath:?string = null
            for (const extension:string of [''].concat(
                configuration.template.extensions
            ))
                if (Tools.isFileSync(filePath + extension)) {
                    currentFilePath = filePath + extension
                    break
                }
            if (currentFilePath) {
                let templateFunction:Function
                if (path.extname(currentFilePath) === '.js')
                    try {
                        templateFunction = eval('require')(currentFilePath)
                    } catch (error) {
                        throw new Error(
                            'Error occurred during loading script module: "' +
                            `${currentFilePath}": ` + Tools.representObject(
                                error))
                    }
                else {
                    let template:string
                    try {
                        // IgnoreTypeCheck
                        template = fileSystem.readFileSync(currentFilePath, {
                            encoding: nestedOptions.encoding})
                    } catch (error) {
                        throw new Error(
                            'Error occurred during loading template file "' +
                            `${currentFilePath}" from file system: ` +
                            Tools.representObject(error))
                    }
                    try {
                        templateFunction = ejs.compile(template, nestedOptions)
                    } catch (error) {
                        throw new Error(
                            'Error occurred during compiling template file "' +
                            `${currentFilePath}" with base path "` +
                            `${nestedScope.basePath}": ` +
                            Tools.representObject(error))
                    }
                }
                try {
                    return templateFunction(nestedScope)
                } catch (error) {
                    let scopeDescription:string = ''
                    try {
                        scopeDescription = 'scope ' + Tools.representObject(
                            nestedScope
                        ) + ' against'
                    } catch (error) {}
                    throw new Error(
                        'Error occurred during running template ' +
                        `${scopeDescription}file "${currentFilePath}": ` +
                        Tools.representObject(error))
                }
            }
            throw new Error(
                `Given template file "${nestedOptions.filename}" couldn't be` +
                ' resolved (with known extensions: "' +
                `${configuration.template.extensions.join('", "')}") in "` +
                `${scope.basePath}".`)
        }
    }
    // endregion
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
