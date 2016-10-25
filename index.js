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
/* eslint-disable no-duplicate-imports */
import type {File, PlainObject} from 'clientnode'
/* eslint-enable no-duplicate-imports */
import fileSystem from 'fs'
import ejs from 'ejs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import type {Configuration, Plugin} from 'web-node/type'
// endregion
/**
 * Renders all templates again configuration object and rerenders them an
 * configurations changes.
 */
export default class Template {
    /**
     * Triggered hook when at least one plugin has a new configuration file and
     * configuration object has been changed.
     * @param configuration - Updated configuration object.
     * @param pluginsWithChangedConfiguration - List of plugins which have a
     * changed plugin configuration.
     * @param plugins - List of all loaded plugins.
     * @returns New configuration object to use.
     */
    static async postConfigurationLoaded(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>, plugins:Array<Plugin>
    ):Promise<Array<string>> {
        const templateRenderingPromises:Array<Promise<string>> = []
        for (const file:File of await Tools.walkDirectoryRecursively(
            configuration.context.path, (file:File):?false => {
                if (file.path.startsWith('.'))
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
        )) {
            const fileExtension:string = path.extname(file.path)
            if (configuration.template.extensions.includes(fileExtension))
                templateRenderingPromises.push(new Promise((
                    resolve:Function, reject:Function
                ):void => fileSystem.readFile(file.path, {
                    encoding: configuration.encoding
                }, (error:?Error, content:string):void => {
                    if (error)
                        reject(error)
                    else {
                        const newFilePath:string = file.path.substring(
                            0, file.path.length - fileExtension.length)
                        const options:PlainObject =
                            Tools.copyLimitedRecursively(
                                configuration.template.options)
                        options.filename = path.resolve(
                            path.dirname(file.path), file.path)
                        try {
                            fileSystem.writeFile(
                                newFilePath, ejs.render(
                                    content, configuration, options
                                ), {
                                    encoding: configuration.encoding
                                }, (error:?Error):void => {
                                    if (error)
                                        reject(error)
                                    else
                                        resolve(newFilePath)
                                })
                        } catch (error) {
                            reject(error)
                        }
                    }
                })))
        }
        return await Promise.all(templateRenderingPromises)
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
