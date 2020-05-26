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
import {
    Configuration as BaseConfiguration,
    PluginHandler as BasePluginHandler,
    Service as BaseService,
    Services as BaseServices,
    ServicePromises as BaseServicePromises
} from 'web-node/type'
// endregion
// region exports
export type Configuration = BaseConfiguration & {
    template:{
        application:{
            rootPath:string;
            port:number;
            hostName:string;
        };
        authentication:{
            login:string;
            password:string;
            salt:string;
            staticAssets:boolean;
        };
        dynamicPathPrefix:string;
        hostNamePrefix:string;
        hostNamePattern:string;
        httpBasicAuthenticationCancelRedirectHTMLContent:string;
        options:SecureServerOptions;
    }
}
export type Service = BaseService & {
    name:'template';
    promise:Promise<>;
}
export type Services = BaseServices & {template:{
}}
export type ServicePromises = BaseServicePromises & {
    template:Promise<>;
}
export interface PluginHandler extends BasePluginHandler {
    
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
