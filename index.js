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
import fileSystem from 'fs'
import ejs from 'ejs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
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
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     * @param configuration - Updated configuration object.
     * @param plugins - List of all loaded plugins.
     * @returns Given object of services.
     */
    static async exit(
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
                let newFileExists:?boolean
                try {
                    newFileExists = await Tools.isFile(newFilePath)
                } catch (error) {
                    reject(error)
                }
                if (newFileExists)
                    fileSystem.unlink(newFilePath, (error:?Error):void => (
                        error
                    ) ? reject(error) : resolve(newFilePath))
            }))
        await Promise.all(templateOutputRemoveingPromises)
        return services
    }
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
        const scope:Object = Tools.copyLimitedRecursively(
            configuration.template.scope.plain)
        for (const type:string of ['evaluation', 'execution'])
            for (const name:string in configuration.template.scope[type])
                if (configuration.template.scope[type].hasOwnProperty(name))
                    scope[name] = (new Function(
                        'configuration', 'currentPath', 'fileSystem', 'parser',
                        'path', 'pluginAPI', 'require', 'scope', 'template',
                        'tools', 'webNodePath', type === 'evaluation' ?
                        `return ${configuration.template.scope[type][name]}` :
                        configuration.template.scope[type][name]
                    ))(
                        configuration, process.cwd(), fileSystem, ejs, path,
                        PluginAPI, eval('require'), scope, Template, Tools,
                        __dirname)
        const templateRenderingPromises:Array<Promise<string>> = []
        for (const file:File of await Template.getFiles(
            configuration, plugins
        ))
            templateRenderingPromises.push(new Promise((
                resolve:Function, reject:Function
            ):void => fileSystem.readFile(file.path, {
                encoding: configuration.encoding,
                flag: 'r'
            }, (error:?Error, content:string):void => {
                if (error)
                    reject(error)
                else {
                    const newFilePath:string = file.path.substring(
                        0, file.path.length - path.extname(file.path).length)
                    const options:PlainObject = Tools.copyLimitedRecursively(
                        configuration.template.options)
                    options.filename = path.resolve(
                        path.dirname(file.path), file.path)
                    if (!('options' in scope))
                        scope.options = options
                    try {
                        fileSystem.writeFile(newFilePath, ejs.render(
                            content, scope, options
                        ), {encoding: configuration.encoding}, (
                            error:?Error
                        ):void => (error) ? reject(error) : resolve(
                            newFilePath))
                    } catch (error) {
                        reject(error)
                    }
                }
            })))
        await Promise.all(templateRenderingPromises)
        return configuration
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
        return (await Tools.walkDirectoryRecursively(
            configuration.context.path, (file:File):?false => {
                if (path.basename(file.path).startsWith('.'))
                    return false
                for (const type:string in configuration.plugin.directories)
                    if (configuration.plugin.directories.hasOwnProperty(
                        type
                    ) && path.dirname(file.path) === path.resolve(
                        configuration.plugin.directories[type].path
                    ) && !plugins.map((
                        plugin:Plugin
                    ):string => plugin.path).includes(file.path))
                        return false
            }
        )).filter((file:File):boolean =>
            configuration.template.extensions.includes(path.extname(file.path))
        )
    }
    // endregion
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
