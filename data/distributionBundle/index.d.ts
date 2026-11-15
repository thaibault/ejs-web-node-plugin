import type { ChangedConfigurationState } from 'web-node/type';
import type { Configuration, GivenScope, PluginHandler, RenderFunction, RenderOptions, Scope, Services, ServicesState, State, TemplateFiles, UtilityScope } from './type';
import { Logger } from 'clientnode';
export declare const UTILITY_SCOPE: UtilityScope;
export declare const log: Logger;
/**
 * Renders all templates again configuration object and re-renders them after
 * configurations changes.
 */
/**
 * Triggered hook when at least one plugin has a new configuration file and
 * configuration object has been changed. Asynchronous tasks are allowed and a
 * returning promise will be respected.
 * @param state - Application state.
 * @returns Promise resolving to nothing.
 */
export declare const postConfigurationHotLoaded: (state: ChangedConfigurationState) => Promise<void>;
/**
 * Appends a template renderer to the web node services.
 * @param state - Application state.
 * @returns Promise resolving to nothing.
 */
export declare const preLoadService: (state: ServicesState) => Promise<void>;
/**
 * Triggers when application will be closed soon and removes created files.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.configuration.ejs - Plugins configuration.
 * @param state.configuration.ejs.locations - Plugins template locations.
 * @param state.services - Applications services.
 * @returns Promise resolving to nothing.
 */
export declare const shouldExit: ({ configuration: { ejs: { locations } }, services }: State) => Promise<void>;
/**
 * Retrieves all files to process.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.plugins - Applications plugins.
 * @param state.pluginAPI - Applications plugin api.
 * @param state.services - Applications services.
 * @param state.services.ejs - Plugins services.
 * @returns A promise holding all resolved files.
 */
export declare const getEntryFiles: ({ configuration, plugins, pluginAPI, services: { ejs } }: State) => Promise<TemplateFiles>;
/**
 * Triggers template rendering.
 * @param state - Application state.
 * @returns A promise resolving to nothing.
 */
export declare const render: (state: State) => Promise<Scope>;
/**
 * Generates a render function with given base scope to resolve includes.
 * @param services - An object with stored service instances.
 * @param configuration - Configuration object.
 * @param givenScope - Base scope to extend from.
 * @param givenOptions - Render options to use.
 * @returns Render function.
 */
export declare const renderFactory: (services: Services, configuration: Configuration, givenScope?: GivenScope, givenOptions?: RenderOptions) => RenderFunction;
export declare const template: PluginHandler;
export default template;
