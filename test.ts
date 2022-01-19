// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
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
import Tools from 'clientnode'
import {RecursivePartial} from 'clientnode/type'
import {promises as fileSystem} from 'fs'
import path from 'path'
import {configuration as baseConfiguration, PluginAPI} from 'web-node'

import Template from './index'
import packageConfiguration from './package.json'
import {Configuration, RenderOptions, Scope, Services} from './type'
// endregion
describe('ejs', ():void => {
    // region mockup
    const targetFilePath = './dummyPlugin/dummy.txt'
    let configuration:Configuration

    beforeAll(async ():Promise<void> => {
        configuration = Tools.extend<Configuration>(
            true,
            Tools.copy<Configuration>(
                (await PluginAPI.loadAll(baseConfiguration)).configuration as
                    Configuration
            ),
            {
                context: {path: './dummyPlugin'},
                ejs:
                    packageConfiguration.webNode.ejs as
                        unknown as
                        Configuration['ejs'],
                plugin: {directories: {test: {
                    nameRegularExpressionPattern: '.+',
                    path: './dummyPlugin'
                }}}
            } as RecursivePartial<Configuration>,
            {
                ejs: {
                    options: {compileDebug: false, debug: false},
                    scope: {plain: {}}
                }
            } as RecursivePartial<Configuration>
        )
    })
    // endregion
    // region tests
    // / region api
    test('postConfigurationLoaded', async ():Promise<void> => {
        if (await Tools.isFile(targetFilePath))
            await fileSystem.unlink(targetFilePath)
        configuration.ejs.renderAfterConfigurationUpdates = false
        try {
            await Template.postConfigurationLoaded(
                configuration, [], configuration, [], PluginAPI
            )
        } catch (error) {
            console.error(error)
        }
        expect(await Tools.isFile(targetFilePath)).toStrictEqual(false)
    })
    test('preLoadService', ():void =>
        expect(Template.preLoadService({} as Services).ejs)
            .toHaveProperty('render')
    )
    test('shouldExit', async ():Promise<void> => {
        await (await fileSystem.open(targetFilePath, 'w')).close()
        Template.entryFiles = {[`${targetFilePath}.ejs`]: null}
        Template.templates = Tools.copy(Template.entryFiles)
        void expect(Tools.isFile(targetFilePath)).resolves.toStrictEqual(true)
        try {
            await Template.shouldExit({} as Services, configuration)
        } catch (error) {
            console.error(error)
        }
        void expect(Tools.isFile(targetFilePath)).resolves.toStrictEqual(false)
    })
    // / endregion
    // / region helper
    test('getEntryFiles', async ():Promise<void> => {
        try {
            expect(
                path.basename(Object.keys(await Template.getEntryFiles(
                    configuration, [], PluginAPI
                ))[0])
            ).toStrictEqual('dummy.txt.ejs')
        } catch (error) {
            console.error(error)
        }
    })
    test('render', async ():Promise<void> => {
        if (await Tools.isFile(targetFilePath))
            await fileSystem.unlink(targetFilePath)

        configuration.ejs.scope.plain.mockupData = {
            a: 2,
            b: [1, 2, {a: 'test'}],
            c: {
                d: {a: 2},
                e: [null, 2, 3]
            }
        }

        let result:any
        try {
            result = await Template.render(null, configuration, [], PluginAPI)
        } catch (error) {
            console.error(error)
        }
        expect(result.mockupData)
            .toStrictEqual(configuration.ejs.scope.plain.mockupData)
        expect(await Tools.isFile(targetFilePath)).toStrictEqual(true)
        /*
            NOTE: Uncomment following line to see resulting rendered dummy
            template.
        */
        /*
        console.info(await fileSystem.readFile(
            targetFilePath, {encoding: configuration.encoding}
        ))
        */
        await fileSystem.unlink(targetFilePath)
    })
    test('renderFactory', ():void => {
        const renderFunction:Function = Template.renderFactory(
            Tools.extend(
                true,
                Tools.copy(configuration),
                {context: {path: './'}} as Configuration
            ),
            {b: 2} as unknown as Scope,
            {c: 3} as unknown as RenderOptions
        )
        expect(typeof renderFunction).toStrictEqual('function')
        expect(():Function => renderFunction('a')).toThrow()
        renderFunction('dummyPlugin/dummy.txt', {configuration, Tools})
    })
    // / endregion
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
