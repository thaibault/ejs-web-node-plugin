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
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import {webNode as configuration} from './package'

import Index from './index'
// endregion
QUnit.load()
QUnit.test('postConfigurationLoaded', async (assert:Object):Promise<void> => {
    const done:Function = assert.async()
    configuration.context = {path: './'}
    configuration.plugin = {
        directories: {
            external: {
                path: './dummyPluginFolder'
            }
        }
    }
    let result:any
    try {
        result = await Index.postConfigurationLoaded(configuration, [], [])
    } catch (error) {
        console.error(error)
    }
    assert.deepEqual(result, configuration)
    done()
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
