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
import WebNodePluginAPI from 'web-node/pluginAPI'
import type {Configuration, Plugin, Services} from 'web-node/type'

import PluginAPI from 'web-node/pluginAPI'
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
     * Appends an application server to the web node services.
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
     * Application will be closed soon.
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
                if (path.basename(file.path).startsWith('.'))
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
            })).filter((file:File):boolean => file.stat.isFile(
            ) && configuration.template.extensions.includes(path.extname(
                file.path)))
    }
    /**
     * Triggers template rendering.
     * @param scope - Scope to use for rendering templates.
     * @param configuration - Configuration object.
     * @param plugins - List of all loaded plugins.
     * @returns Scope uses for template rendering.
     */
    static async render(
        givenScope:?Object, configuration:Configuration, plugins:Array<Plugin>
    ):Promise<Object> {
        // TODO
        const scope:Object = Tools.extendObject(
            true, {include: Template.renderFactory(configuration)},
            configuration.template.scope.plain, givenScope || {})
        for (const type:string of ['evaluation', 'execution'])
            for (const name:string in configuration.template.scope[type])
                if (configuration.template.scope[type].hasOwnProperty(name))
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
        const templateFiles:Array<File> = await WebNodePluginAPI.callStack(
            'preTemplateRender', plugins, configuration,
            await Template.getFiles(configuration, plugins), scope)
        const templateRenderingPromises:Array<Promise<string>> = []
        for (const file:File of templateFiles)
            templateRenderingPromises.push(new Promise((
                resolve:Function, reject:Function
            ):void => fileSystem.readFile(file.path, {
                encoding: configuration.encoding
            }, (error:?Error, content:string):void => {
                if (error)
                    reject(error)
                else {
                    const currentScope:Object = Tools.extendObject({
                        include: Template.renderFactory(
                            configuration, path.dirname(file.path))
                    }, scope)
                    const newFilePath:string = file.path.substring(
                        0, file.path.length - path.extname(file.path).length)
                    const options:PlainObject = Tools.copyLimitedRecursively(
                        configuration.template.options)
                    options.filename = path.resolve(
                        path.dirname(file.path), file.path)
                    if (!('options' in currentScope))
                        currentScope.options = options
                    if (!('plugins' in currentScope))
                        currentScope.plugins = plugins
                    let template:?Function = null
                    if (path.extname(file.path) === '.js')
                        template = eval('require')(file.path)
                    else
                        try {
                            template = ejs.compile(content, options)
                        } catch (error) {
                            console.error(
                                `Error occurred during compiling template "` +
                                `${options.filename}": ` +
                                Tools.representObject(error))
                            reject(error)
                        }
                    if (template) {
                        let result:?string = null
                        try {
                            result = template(currentScope)
                        } catch (error) {
                            let scopeDescription:string = ''
                            try {
                                scopeDescription = Tools.representObject(
                                    currentScope)
                                scopeDescription =
                                    `scope ${scopeDescription} against `
                            } catch (error) {}
                            console.error(
                                'Error occurred during running ' +
                                `${scopeDescription}template "${file.path}":` +
                                ` ${Tools.representObject(error)}`)
                            reject(error)
                        }
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
                    }
                }
            })))
        await Promise.all(templateRenderingPromises)
        return await WebNodePluginAPI.callStack(
            'postTemplateRender', plugins, configuration, scope, templateFiles)
    }
    /**
     * Generates a render function with given base path to resolve includes.
     * @param configuration - Configuration object.
     * @param basPath - Base location to resolve includes relative to.
     * @returns Render function.
     */
    static renderFactory(
        configuration:Configuration, basePath:string = ''
    ):Function {
        if (!basePath)
            basePath = configuration.context.path
        return (
            filePath:string, nestedLocals:Object = {}
        ):string => {
            let nestedOptions:Object = Tools.copyLimitedRecursively(
                configuration.template.options)
            delete nestedOptions.client
            nestedOptions = Tools.extendObject(
                true, {encoding: 'utf-8'}, nestedOptions,
                nestedLocals.options || {})
            filePath = path.resolve(basePath, filePath)
            nestedLocals.include = Template.renderFactory(
                configuration, path.dirname(filePath))
            let currentFilePath:?string = null
            for (const extension:string of [''].concat(
                configuration.template.extensions
            ))
                if (Tools.isFileSync(filePath + extension)) {
                    currentFilePath = filePath + extension
                    break
                }
            if (currentFilePath) {
                if (path.extname(currentFilePath) === '.js')
                    return eval('require')(currentFilePath)(nestedLocals)
                // IgnoreTypeCheck
                return ejs.compile(fileSystem.readFileSync(
                    currentFilePath, nestedOptions
                ), nestedOptions)(nestedLocals)
            }
            throw new Error(
                `Given template file "${filePath}" couldn't be resolved ` +
                '(with known extensions: "' +
                `${configuration.template.extensions.join('", "')}").`)
        }
    }
    // endregion
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
