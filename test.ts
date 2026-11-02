// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {Mapping, RecursivePartial} from 'clientnode'

import type {Configuration, RenderFunction, Services} from './type'

import {copy, extend, identity, isFile} from 'clientnode'
import {
    mkdir, mkdtemp, open, readFile, rm, unlink, writeFile
} from 'fs/promises'
import {tmpdir} from 'os'
import {basename, join} from 'path'
import {configuration as baseConfiguration, loadAll, pluginAPI} from 'web-node'

import {afterAll, beforeAll, expect, jest, test} from '@jest/globals'

import {
    getEntryFiles,
    log,
    postConfigurationHotLoaded,
    preLoadService,
    render,
    renderFactory,
    shouldExit,
    UTILITY_SCOPE
} from './index'
import packageConfiguration from './package.json'
// endregion
// region mockup
const targetFilePath = './dummyPlugin/dummy.txt'
let configuration: Configuration
let fixturePath: string

const createServices = (): Services => ({ejs: {
    entryFiles: new Set<string>(),
    templates: {},

    getEntryFiles,
    render,
    renderFactory
}})
const writeFixtures = async (
    location: string, files: Mapping
): Promise<void> => {
    await mkdir(location, {recursive: true})

    for (const [name, content] of Object.entries(files))
        await writeFile(join(location, name), content)
}
const getFixtureConfiguration = (
    location: string, ejsConfiguration: RecursivePartial<Configuration['ejs']>
): Configuration => extend(
    true,
    copy(configuration),
    {
        core: {context: {path: location}},
        ejs: {locations: {include: [location]}, ...ejsConfiguration}
    } as RecursivePartial<Configuration>
)

beforeAll(async (): Promise<void> => {
    configuration = extend(
        true,
        (await loadAll(copy(baseConfiguration))).configuration as
            Configuration,
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
                options: {async: true, compileDebug: false, debug: false},
                scope: {plain: {}}
            }
        } as unknown as RecursivePartial<Configuration>
    )

    fixturePath = await mkdtemp(join(tmpdir(), 'ejs-test-'))
})
afterAll(async (): Promise<void> => {
    await rm(fixturePath, {force: true, recursive: true})
})
// endregion
// region tests
/// region api
test('postConfigurationHotLoaded', async (): Promise<void> => {
    if (await isFile(targetFilePath))
        await unlink(targetFilePath)

    configuration.ejs.renderAfterConfigurationUpdates = false

    try {
        await postConfigurationHotLoaded({
            configuration,
            data: undefined,
            hook: 'postConfigurationHotLoaded',
            pluginAPI,
            plugins: [],
            pluginsWithChangedConfiguration: []
        })
    } catch (error) {
        console.error(error)
    }

    await expect(isFile(targetFilePath))
        .resolves.toStrictEqual(false)
})
test('preLoadService', async (): Promise<void> => {
    const services: Services = {} as unknown as Services

    await expect(preLoadService({
        configuration,
        data: undefined,
        hook: 'preLoadService',
        pluginAPI,
        plugins: [],
        services
    })).resolves.toBeUndefined()

    expect(services).toHaveProperty('ejs.render')
})
test('shouldExit', async (): Promise<void> => {
    await (await open(targetFilePath, 'w')).close()

    const filePath = `${targetFilePath}.ejs`

    const services: Services = {ejs: {
        entryFiles: new Set([filePath]),
        templates: {[filePath]: null}
    }} as unknown as Services

    await expect(isFile(targetFilePath)).resolves.toStrictEqual(true)

    try {
        await shouldExit({
            configuration,
            data: undefined,
            hook: 'shouldExit',
            pluginAPI,
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
test('postConfigurationHotLoaded renders', async (): Promise<void> => {
    let rendered = false

    await expect(postConfigurationHotLoaded({
        configuration: extend(
            true,
            copy(configuration),
            {ejs: {renderAfterConfigurationUpdates: true}} as
                RecursivePartial<Configuration>
        ),
        data: undefined,
        hook: 'postConfigurationHotLoaded',
        pluginAPI,
        plugins: [],
        pluginsWithChangedConfiguration: [],
        services: {ejs: {render: () => {
            rendered = true

            return Promise.resolve()
        }}}
    })).resolves.toBeUndefined()

    expect(rendered).toStrictEqual(true)
})
test('preLoadService renders', async (): Promise<void> => {
    const location = join(fixturePath, 'preLoad')
    await writeFixtures(location, {'index.txt.ejs': '<%- 1 + 1 %>'})

    const services: Services = {} as unknown as Services

    await expect(preLoadService({
        configuration: getFixtureConfiguration(
            location, {renderAfterConfigurationUpdates: true}
        ),
        data: undefined,
        hook: 'preLoadService',
        pluginAPI,
        plugins: [],
        services
    })).resolves.toBeUndefined()

    await expect(readFile(join(location, 'index.txt'), 'utf8'))
        .resolves.toStrictEqual('2')
})
test('shouldExit without templates', async (): Promise<void> => {
    await expect(shouldExit({
        configuration,
        data: undefined,
        hook: 'shouldExit',
        pluginAPI,
        plugins: [],
        servicePromises: {},
        services: {ejs: {}} as unknown as Services
    })).resolves.toBeUndefined()
})
test('shouldExit keeps in-place and missing files', async (): Promise<
    void
> => {
    const location = join(fixturePath, 'shouldExit')
    const inPlacePath = join(location, 'inPlace.txt')
    await writeFixtures(location, {'inPlace.txt': 'in place'})

    await expect(shouldExit({
        configuration: getFixtureConfiguration(
            location, {locations: {inPlaceReplacements: [inPlacePath]}}
        ),
        data: undefined,
        hook: 'shouldExit',
        pluginAPI,
        plugins: [],
        servicePromises: {},
        services: {ejs: {
            entryFiles: new Set<string>(),
            templates: {
                [inPlacePath]: null,
                [join(location, 'missing.txt.ejs')]: null
            }
        }} as unknown as Services
    })).resolves.toBeUndefined()

    await expect(isFile(inPlacePath)).resolves.toStrictEqual(true)
})
/// endregion
/// region helper
test('getEntryFiles uses cached entry files', async (): Promise<void> => {
    const entryFiles = new Set<string>(['cached.ejs'])

    await expect(getEntryFiles({
        configuration: extend(
            true,
            copy(configuration),
            {ejs: {reloadEntryFiles: false}} as RecursivePartial<Configuration>
        ),
        data: undefined,
        hook: '',
        pluginAPI,
        plugins: [],
        services: {ejs: {entryFiles, templates: {}}} as unknown as Services,
        servicePromises: {}
    })).resolves.toBe(entryFiles)
})
test('getEntryFiles', async (): Promise<void> => {
    try {
        expect(
            basename(Array.from(await getEntryFiles({
                configuration,
                data: undefined,
                hook: '',
                pluginAPI,
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
test('render', async (): Promise<void> => {
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

    await expect(render({
        configuration,
        data: undefined,
        hook: '',
        pluginAPI,
        plugins: [],
        servicePromises: {},
        services: {ejs: {
            entryFiles: new Set<string>(),
            templates: {},

            getEntryFiles,
            render,
            renderFactory
        }}
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
test('renderFactory', async (): Promise<void> => {
    const renderFunction: RenderFunction = renderFactory(
        {ejs: {
            entryFiles: new Set<string>(),
            templates: {},

            getEntryFiles,
            render,
            renderFactory
        }},
        extend(
            true,
            copy(configuration),
            {core: {context: {path: './'}}} as Configuration
        ),
        {a: 2},
        {
            async: true,
            cache: false,
            compileDebug: false,
            debug: false,
            localsName: '_',
            strict: true,
            _with: false
        }
    )
    expect(typeof renderFunction).toStrictEqual('function')
    await expect(async (): Promise<string> => renderFunction('a'))
        .rejects.toThrow()
    await renderFunction(
        'dummyPlugin/dummy.txt', {...UTILITY_SCOPE, configuration}
    )
})
test('render scope, cache, in-place and empty results', async (): Promise<
    void
> => {
    const location = join(fixturePath, 'render')
    const inPlacePath = join(location, 'inPlace.txt')
    await writeFixtures(location, {
        '.hidden.txt.ejs': 'hidden',
        'cached.txt': 'cached',
        'cached.txt.ejs': 'not cached',
        'empty.txt.ejs': '',
        'inPlace.txt': '<% throw new Error("in place") %>',
        'scope.txt.ejs':
            '<%- [_.asyncValue, _.executed, _.given, _.plugins.length]' +
            '.join("-") %>'
    })

    const warn = jest.spyOn(log, 'warn')
        .mockImplementation(() => Promise.resolve())

    const scope = await render({
        configuration: getFixtureConfiguration(location, {
            cache: true,
            locations: {inPlaceReplacements: [inPlacePath]},
            scope: {
                // eslint-disable-next-line camelcase
                async_evaluation: {asyncValue: 'Promise.resolve(2)'},
                evaluation: {broken: 'notExistingVariable.property'},
                execution: {executed: 'return 3'}
            }
        }),
        data: {scope: {given: 1}},
        hook: '',
        pluginAPI,
        plugins: [],
        servicePromises: {},
        services: createServices()
    })

    const warnings = warn.mock.calls.map(
        ([message]: Array<unknown>): unknown => message
    )
    warn.mockRestore()

    expect(warnings).toHaveLength(3)
    expect(warnings).toEqual(expect.arrayContaining([
        'Error occurred during processing given template scope',
        'Error during running in-place',
        'An empty template processing result detected'
    ]))

    expect(scope).toHaveProperty('asyncValue', 2)
    expect(scope).toHaveProperty('executed', 3)
    expect(scope).not.toHaveProperty('broken')
    await expect(readFile(join(location, 'scope.txt'), 'utf8'))
        .resolves.toStrictEqual('2-3-1-0')
    await expect(readFile(join(location, 'cached.txt'), 'utf8'))
        .resolves.toStrictEqual('cached')
    await expect(readFile(inPlacePath, 'utf8'))
        .resolves.toStrictEqual('<% throw new Error("in place") %>')
    await expect(isFile(join(location, 'empty.txt')))
        .resolves.toStrictEqual(false)
    await expect(isFile(join(location, '.hidden.txt')))
        .resolves.toStrictEqual(false)
})
test('render rejects on template errors', async (): Promise<void> => {
    const location = join(fixturePath, 'renderError')
    const filePath = join(location, 'throwing.txt.ejs')
    await writeFixtures(
        location, {'throwing.txt.ejs': '<% throw new Error("boom") %>'}
    )

    await expect(render({
        configuration: getFixtureConfiguration(location, {}),
        data: {entryFiles: new Set([filePath])},
        hook: '',
        pluginAPI,
        plugins: [],
        servicePromises: {},
        services: createServices()
    })).rejects.toThrow('boom')
})
test('renderFactory handles templates of all kinds', async (): Promise<
    void
> => {
    const location = join(fixturePath, 'renderFactory')
    await writeFixtures(location, {
        'broken.ejs': '<% if ( %>',
        'invalid.js': 'export default (',
        'preCompiled.js':
            'export default (scope) => Promise.resolve(`compiled ${scope.a}`)',
        'source.ejs': 'first',
        'throwing.ejs': '<% throw new Error("boom") %>',
        'workaround.ejs':
            '<script processing-workaround>plain</script>' +
            '<script processing--workaround>nested</script>'
    })

    const services = createServices()
    const renderFunction: RenderFunction = renderFactory(
        services,
        getFixtureConfiguration(location, {reloadSourceContent: false}),
        {a: 2},
        {...configuration.ejs.options}
    )

    await expect(renderFunction('workaround')).resolves.toStrictEqual(
        'plain<script processing-workaround>nested</script>'
    )
    await expect(renderFunction('preCompiled.js'))
        .resolves.toStrictEqual('compiled 2')

    await expect(renderFunction('source')).resolves.toStrictEqual('first')
    await writeFile(join(location, 'source.ejs'), 'second')
    // NOTE: Compiled template will be reused.
    await expect(renderFunction('source')).resolves.toStrictEqual('first')

    await expect(renderFunction('broken'))
        .rejects.toThrow('Error occurred during compiling template file')
    await expect(renderFunction('throwing'))
        .rejects.toThrow('Error occurred during running template scope')
    await expect(renderFunction('invalid.js'))
        .rejects.toThrow('Error occurred during loading script module')
    await expect(renderFunction('missing')).rejects.toThrow(
        'Given template file "missing" couldn\'t be resolved (with known ' +
        'extensions: "", ".html.js", ".ejs")'
    )
})
/// endregion
// endregion
