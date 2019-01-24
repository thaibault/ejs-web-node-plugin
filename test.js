// @flow
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
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {PlainObject} from 'clientnode'
import Tools from 'clientnode'
import fileSystem from 'fs'
import path from 'path'
import registerTest from 'clientnode/test'
import baseConfiguration from 'web-node/configurator'
import type {Configuration} from 'web-node/type'

import Index from './index'
// endregion
registerTest(async function():Promise<void> {
    // region mockup
    const configuration:Configuration = Tools.extend(
        true,
        {},
        baseConfiguration,
        {plugin: {directories: {test: {path: './dummyPlugin'}}}}
    )
    // endregion
    // region tests
    // / region api
    this.test('postConfigurationLoaded', async (
        assert:Object
    ):Promise<void> => {
        const done:Function = assert.async()
        configuration.template.renderAfterConfigurationUpdates = false
        try {
            await Index.postConfigurationLoaded(
                configuration, [], configuration, [])
        } catch (error) {
            console.error(error)
        }
        assert.notOk(await Tools.isFile('./dummyPlugin/dummy.txt'))
        done()
    })
    this.test('preLoadService', (assert:Object):void => assert.ok(
        Index.preLoadService({}).template.hasOwnProperty('render')))
    this.test('shouldExit', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        const targetFilePath:string = './dummyPlugin/dummy.txt'
        fileSystem.closeSync(fileSystem.openSync(targetFilePath, 'w'))
        Index.entryFiles = {[`${targetFilePath}.tpl`]: null}
        Index.files = Tools.copy(Index.entryFiles)
        try {
            assert.ok(await Tools.isFile(targetFilePath))
            await Index.shouldExit({}, configuration)
        } catch (error) {
            console.error(error)
        }
        assert.notOk(await Tools.isFile(targetFilePath))
        done()
    })
    // / endregion
    // / region helper
    this.test('getEntryFiles', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        try {
            assert.strictEqual(path.basename(Object.keys(
                await Index.getEntryFiles(configuration, [])
            )[0]), 'dummy.txt.ejs')
        } catch (error) {
            console.error(error)
        }
        done()
    })
    this.test('render', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
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
            result = await Index.render(null, configuration, [])
        } catch (error) {
            console.error(error)
        }
        assert.deepEqual(
            // IgnoreTypeCheck
            result.mockupData, configuration.template.scope.plain.mockupData)
        assert.ok(await Tools.isFile(targetFilePath))
        /*
            NOTE: Uncomment following line to see resulting rendered dummy
            template.
        */
        /*
        console.info(fileSystem.readFileSync(targetFilePath, {
            encoding: configuration.encoding}))
        */
        fileSystem.unlinkSync(targetFilePath)
        done()
    })
    this.test('renderFactory', async (assert:Object):Promise<void> => {
        const configuration:PlainObject = {
            context: {path: './'}, template: {extensions: ['.ejs']}}
        const renderFunction:Function = Index.renderFactory(
            configuration, {b: 2}, {c: 3})
        assert.strictEqual(typeof renderFunction, 'function')
        try {
            renderFunction('a')
        } catch (error) {
            assert.ok(true)
        }
        renderFunction('dummyPlugin/dummy.txt', {configuration, Tools})
    })
    // / endregion
    // endregion
}, 'plain')
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
