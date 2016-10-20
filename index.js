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
import fileSystem from 'fs'
import handlebars from 'handlebars'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import type {Configuration, Plugin} from 'web-node/type'
import WebOptimizerHelper from 'weboptimizer/helper'
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
     * @returns New configuration object to use.
     */
    static async postConfigurationLoaded(
        configuration:Configuration,
        pluginsWithChangedConfiguration:Array<Plugin>
    ):Promise<Array<string>> {
        const templateRenderingPromises:Array<Promise<string>> = []
        WebOptimizerHelper.walkDirectoryRecursivelySync(
            configuration.context.path, (filePath:string):?false => {
                // TODO return "false" if in plugin location and corresponding
                // regexp doesn't match to stop deeper iterations.
                if (filePath.endsWith('node_modules'))
                    return false
                //
                const fileExtension:string = path.extname(filePath)
                if (configuration.template.extensions.includes(fileExtension))
                    templateRenderingPromises.push(new Promise((
                        resolve:Function, reject:Function
                    ):void => fileSystem.readFile(filePath, {
                        encoding: configuration.encoding
                    }, (error:?Error, content:string):void => {
                        if (error)
                            reject(error)
                        else {
                            const newFilePath:string = filePath.substring(
                                0, filePath.length - fileExtension.length)
                            try {
                                fileSystem.writeFile(
                                    newFilePath, handlebars.compile(
                                        content, configuration.template.options
                                    )(configuration), {
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
            })
        return await Promise.all(templateRenderingPromises)
    }
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
