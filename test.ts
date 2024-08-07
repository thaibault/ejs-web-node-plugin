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
import {beforeAll, describe, expect, test} from '@jest/globals'
import {
    copy, extend, identity, isFile, RecursivePartial, UTILITY_SCOPE
} from 'clientnode'
import {open, unlink} from 'fs/promises'
import {basename} from 'path'
import {configuration as baseConfiguration, PluginAPI} from 'web-node'

import Template from './index'
import packageConfiguration from './package.json'
import {
    Configuration, RenderFunction, RenderOptions, Scope, Services
} from './type'
// endregion
describe('ejs', ():void => {
    // region mockup
    const targetFilePath = './dummyPlugin/dummy.txt'
    let configuration:Configuration

    beforeAll(async ():Promise<void> => {
        configuration = extend<Configuration>(
            true,
            (await PluginAPI.loadAll(copy(baseConfiguration)))
                .configuration as Configuration
            ,
            {
                core: {
                    context: {path: './dummyPlugin', type: 'relative'},
                    plugin: {directories: {test: {
                        nameRegularExpressionPattern: '.+',
                        path: './dummyPlugin'
                    }}}
                },
                ejs: packageConfiguration.webNode.ejs as
                    unknown as
                    Configuration['ejs']
            } as unknown as RecursivePartial<Configuration>,
            {
                ejs: {
                    options: {compileDebug: false, debug: false},
                    scope: {plain: {}}
                }
            } as unknown as RecursivePartial<Configuration>
        )
    })
    // endregion
    // region tests
    /// region api
    test('postConfigurationHotLoaded', async ():Promise<void> => {
        if (await isFile(targetFilePath))
            await unlink(targetFilePath)

        configuration.ejs.renderAfterConfigurationUpdates = false

        try {
            await Template.postConfigurationHotLoaded({
                configuration,
                hook: 'postConfigurationHotLoaded',
                pluginAPI: PluginAPI,
                plugins: [],
                pluginsWithChangedConfiguration: []
            })
        } catch (error) {
            console.error(error)
        }

        await expect(isFile(targetFilePath))
            .resolves.toStrictEqual(false)
    })
    test('preLoadService', async ():Promise<void> => {
        const services:Services = {} as unknown as Services

        await expect(Template.preLoadService({
            configuration,
            hook: 'preLoadService',
            pluginAPI: PluginAPI,
            plugins: [],
            services
        })).resolves.toBeUndefined()

        expect(services).toHaveProperty('ejs.render')
    })
    test('shouldExit', async ():Promise<void> => {
        await (await open(targetFilePath, 'w')).close()

        const filePath = `${targetFilePath}.ejs`

        const services:Services = {ejs: {
            entryFiles: new Set([filePath]),
            templates: {[filePath]: null}
        }} as unknown as Services

        await expect(isFile(targetFilePath)).resolves.toStrictEqual(true)

        try {
            await Template.shouldExit({
                configuration,
                hook: 'shouldExit',
                pluginAPI: PluginAPI,
                plugins: [],
                servicePromises: {},
                services
            })
        } catch (error) {
            console.error(error)
        }

        await expect(isFile(targetFilePath))
            .resolves.toStrictEqual(false)
    })
    /// endregion
    /// region helper
    test('getEntryFiles', async ():Promise<void> => {
        try {
            expect(
                basename(Array.from(await Template.getEntryFiles({
                    configuration,
                    hook: '',
                    pluginAPI: PluginAPI,
                    plugins: [],
                    services: {ejs: {
                        entryFiles: new Set<string>(),
                        templates: {}
                    }} as unknown as Services,
                    servicePromises: {}
                }))[0])
            ).toStrictEqual('dummy.txt.ejs')
        } catch (error) {
            console.error(error)
        }
    })
    test('render', async ():Promise<void> => {
        if (await isFile(targetFilePath))
            await unlink(targetFilePath)

        configuration.ejs.scope.plain.mockupData = {
            a: 2,
            b: [1, 2, {a: 'test'}],
            c: {
                d: {a: 2},
                e: [null, 2, 3]
            }
        }

        await expect(Template.render({
            configuration,
            hook: '',
            pluginAPI: PluginAPI,
            plugins: [],
            servicePromises: {},
            services: {ejs: {
                entryFiles: new Set<string>(),
                templates: {},

                getEntryFiles: Template.getEntryFiles.bind(Template),
                render: Template.render.bind(Template),
                renderFactory: Template.renderFactory.bind(Template)
            }} as unknown as Services
        })).resolves.toHaveProperty('functions.identity', identity)

        await expect(isFile(targetFilePath)).resolves.toStrictEqual(true)
        /*
            NOTE: Uncomment following line to see resulting rendered dummy
            template.
        */
        /*
        console.info(await fileSystem.readFile(
            targetFilePath, {encoding: configuration.encoding}
        ))
        */
        await unlink(targetFilePath)
    })
    test('renderFactory', ():void => {
        const renderFunction:RenderFunction = Template.renderFactory(
            {ejs: {
                entryFiles: new Set<string>(),
                templates: {},

                getEntryFiles: Template.getEntryFiles.bind(Template),
                render: Template.render.bind(Template),
                renderFactory: Template.renderFactory.bind(Template)
            }},
            extend(
                true,
                copy(configuration),
                {core: {context: {path: './'}}} as Configuration
            ),
            {b: 2} as unknown as Scope,
            {c: 3} as unknown as RenderOptions
        )
        expect(typeof renderFunction).toStrictEqual('function')
        expect(():string => renderFunction('a')).toThrow()
        renderFunction(
            'dummyPlugin/dummy.txt', {...UTILITY_SCOPE, configuration}
        )
    })
    /// endregion
    // endregion
})
