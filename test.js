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
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import baseConfiguration from 'web-node/configurator.compiled'
import type {Configuration} from 'web-node/type'

import Index from './index'
// endregion
QUnit.load()
// region tests
/* TODO
QUnit.test('exit', (assert:Object):Promise<void> => {
})
*/
QUnit.test('postConfigurationLoaded', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    const targetFilePath:string = './dummyPlugin/dummy.txt'
    if (await Tools.isFile(targetFilePath))
        fileSystem.unlinkSync(targetFilePath)
    const configuration:Configuration = Tools.extendObject(
        true, {}, baseConfiguration, {plugin: {directories: {external: {
            path: './dummyPlugin'
        }}}})
    let result:any
    try {
        result = await Index.postConfigurationLoaded(configuration, [], {}, [])
    } catch (error) {
        console.error(error)
    }
    assert.deepEqual(result, configuration)
    assert.ok(await Tools.isFile(targetFilePath))
    fileSystem.unlinkSync(targetFilePath)
    done()
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
