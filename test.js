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
import Tools from 'clientnode'
import fileSystem from 'fs'
import path from 'path'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import baseConfiguration from 'web-node/configurator'
import type {Configuration} from 'web-node/type'

import Index from './index'
// endregion
QUnit.load()
const configuration:Configuration = Tools.extendObject(
    true, {}, baseConfiguration, {plugin: {directories: {test: {
        path: './dummyPlugin'
    }}}})
// region tests
// / region api
QUnit.test('exit', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    const targetFilePath:string = './dummyPlugin/dummy.txt'
    fileSystem.closeSync(fileSystem.openSync(targetFilePath, 'w'))
    try {
        assert.ok(await Tools.isFile(targetFilePath))
        await Index.exit({}, configuration, [])
    } catch (error) {
        console.error(error)
    }
    assert.notOk(await Tools.isFile(targetFilePath))
    done()
})
QUnit.test('postConfigurationLoaded', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    const targetFilePath:string = './dummyPlugin/dummy.txt'
    if (await Tools.isFile(targetFilePath))
        fileSystem.unlinkSync(targetFilePath)
    let result:any
    try {
        result = await Index.postConfigurationLoaded(
            configuration, [], configuration, [])
    } catch (error) {
        console.error(error)
    }
    assert.deepEqual(result, configuration)
    assert.ok(await Tools.isFile(targetFilePath))
    fileSystem.unlinkSync(targetFilePath)
    done()
})
// / endregion
// / region helper
QUnit.test('getFiles', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    try {
        assert.strictEqual(
            path.basename((await Index.getFiles(configuration, []))[0].path),
            'dummy.txt.tpl')
    } catch (error) {
        console.error(error)
    }
    done()
})
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
