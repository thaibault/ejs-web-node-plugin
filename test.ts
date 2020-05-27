// #!/usr/bin/env node
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
import {PlainObject} from 'clientnode/type'
import fileSystem from 'fs'
import path from 'path'
import {configuration as baseConfiguration, PluginAPI} from 'web-node'

import {Configuration, Services} from './type'
import Template from './index'
// endregion
describe('template', ():void => {
    // region mockup
    let configuration:Configuration
    beforeAll(async ():Promise<void> => {
        configuration = Tools.extend(
            (await PluginAPI.loadAll(baseConfiguration)) as
                unknown as
                Configuration,
            {server: {proxy: {ports: []}}}
        )
    })
    // endregion
    // region tests
    // / region api
    test('postConfigurationLoaded', async ():Promise<void> => {
        configuration.template.renderAfterConfigurationUpdates = false
        try {
            await Template.postConfigurationLoaded(
                configuration, [], configuration, []
            )
        } catch (error) {
            console.error(error)
        }
        expect(await Tools.isFile('./dummyPlugin/dummy.txt'))
            .toStrictEqual(false)
    })
    test('preLoadService', ():void =>
        expect(Template.preLoadService({} as Services).template)
            .toHaveProperty('render')
    )
    test('shouldExit', async ():Promise<void> => {
        const targetFilePath:string = './dummyPlugin/dummy.txt'
        fileSystem.closeSync(fileSystem.openSync(targetFilePath, 'w'))
        Template.entryFiles = {[`${targetFilePath}.tpl`]: null}
        Template.templates = Tools.copy(Template.entryFiles)
        try {
            expect(await Tools.isFile(targetFilePath)).toStrictEqual(true)
            await Template.shouldExit({}, configuration)
        } catch (error) {
            console.error(error)
        }
        expect(await Tools.isFile(targetFilePath)).toStrictEqual(false)
    })
    // / endregion
    // / region helper
    test('getEntryFiles', async ():Promise<void> => {
        try {
            expect(
                path.basename(Object.keys(await Template.getEntryFiles(
                    configuration, []
                ))[0])
            ).toStrictEqual('dummy.txt.ejs')
        } catch (error) {
            console.error(error)
        }
    })
    test('render', async ():Promise<void> => {
        const targetFilePath:string = './dummyPlugin/dummy.txt'
        if (await Tools.isFile(targetFilePath))
            fileSystem.unlinkSync(targetFilePath)
        configuration.template.scope.plain.mockupData = {
            a: 2,
            b: [1, 2, {a: 'test'}],
            c: {
                d: {a: 2},
                e: [null, 2, 3]
            }
        }
        let result:any
        try {
            result = await Template.render(null, configuration, [])
        } catch (error) {
            console.error(error)
        }
        expect(result.mockupData)
            .toStrictEqual(configuration.template.scope.plain.mockupData)
        expect(await Tools.isFile(targetFilePath)).toStrictEqual(true)
        /*
            NOTE: Uncomment following line to see resulting rendered dummy
            template.
        */
        /*
        console.info(fileSystem.readFileSync(targetFilePath, {
            encoding: configuration.encoding}))
        */
        fileSystem.unlinkSync(targetFilePath)
    })
    test('renderFactory', ():void => {
        const configuration:PlainObject = {
            context: {path: './'}, template: {extensions: ['.ejs']}
        }
        const renderFunction:Function = Template.renderFactory(
            configuration, {b: 2}, {c: 3}
        )
        expect(typeof renderFunction).toStrictEqual('function')
        try {
            renderFunction('a')
        } catch (error) {
            expect(true).toBeTruthy()
        }
        renderFunction('dummyPlugin/dummy.txt', {configuration, Tools})
    })
    // / endregion
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
