'use strict';
(function(a,b){'object'==typeof exports&&'object'==typeof module?module.exports=b(require('babel-runtime/helpers/asyncToGenerator'),require('babel-runtime/core-js/object/values'),require('babel-runtime/core-js/object/keys'),require('babel-runtime/core-js/get-iterator'),require('babel-runtime/core-js/promise'),require('babel-runtime/regenerator'),require('babel-runtime/helpers/classCallCheck'),require('clientnode'),require('ejs'),require('fs'),require('path'),require('web-node/pluginAPI.compiled'),function(){try{return require('source-map-support/register')}catch(a){}}()):'function'==typeof define&&define.amd?define('templatewebnodeplugin',['babel-runtime/helpers/asyncToGenerator','babel-runtime/core-js/object/values','babel-runtime/core-js/object/keys','babel-runtime/core-js/get-iterator','babel-runtime/core-js/promise','babel-runtime/regenerator','babel-runtime/helpers/classCallCheck','clientnode','ejs','fs','path','web-node/pluginAPI.compiled','source-map-support/register'],b):'object'==typeof exports?exports.templatewebnodeplugin=b(require('babel-runtime/helpers/asyncToGenerator'),require('babel-runtime/core-js/object/values'),require('babel-runtime/core-js/object/keys'),require('babel-runtime/core-js/get-iterator'),require('babel-runtime/core-js/promise'),require('babel-runtime/regenerator'),require('babel-runtime/helpers/classCallCheck'),require('clientnode'),require('ejs'),require('fs'),require('path'),require('web-node/pluginAPI.compiled'),function(){try{return require('source-map-support/register')}catch(a){}}()):a.templatewebnodeplugin=b(a['babel-runtime/helpers/asyncToGenerator'],a['babel-runtime/core-js/object/values'],a['babel-runtime/core-js/object/keys'],a['babel-runtime/core-js/get-iterator'],a['babel-runtime/core-js/promise'],a['babel-runtime/regenerator'],a['babel-runtime/helpers/classCallCheck'],a.clientnode,a.ejs,a.fs,a.path,a['web-node/pluginAPI.compiled'],a['source-map-support/register'])})('undefined'==typeof self?this:self,function(__WEBPACK_EXTERNAL_MODULE_8__,__WEBPACK_EXTERNAL_MODULE_3__,__WEBPACK_EXTERNAL_MODULE_4__,__WEBPACK_EXTERNAL_MODULE_5__,__WEBPACK_EXTERNAL_MODULE_6__,__WEBPACK_EXTERNAL_MODULE_7__,__WEBPACK_EXTERNAL_MODULE_9__,__WEBPACK_EXTERNAL_MODULE_10__,__WEBPACK_EXTERNAL_MODULE_11__,__WEBPACK_EXTERNAL_MODULE_12__,__WEBPACK_EXTERNAL_MODULE_13__,__WEBPACK_EXTERNAL_MODULE_14__,__WEBPACK_EXTERNAL_MODULE_15__){return function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={i:d,l:!1,exports:{}};return a[d].call(e.exports,e,e.exports,b),e.l=!0,e.exports}var c={};return b.m=a,b.c=c,b.d=function(a,c,d){b.o(a,c)||Object.defineProperty(a,c,{configurable:!1,enumerable:!0,get:d})},b.n=function(a){var c=a&&a.__esModule?function(){return a['default']}:function(){return a};return b.d(c,'a',c),c},b.o=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)},b.p='',b(b.s=0)}([function(a,b,c){a.exports=c(1)},function(module,exports,__webpack_require__){'use strict';(function(process,__dirname){function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var _values=__webpack_require__(3),_values2=_interopRequireDefault(_values),_keys=__webpack_require__(4),_keys2=_interopRequireDefault(_keys),_getIterator2=__webpack_require__(5),_getIterator3=_interopRequireDefault(_getIterator2),_promise=__webpack_require__(6),_promise2=_interopRequireDefault(_promise),_regenerator=__webpack_require__(7),_regenerator2=_interopRequireDefault(_regenerator),_asyncToGenerator2=__webpack_require__(8),_asyncToGenerator3=_interopRequireDefault(_asyncToGenerator2),_classCallCheck2=__webpack_require__(9),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_clientnode=__webpack_require__(10),_clientnode2=_interopRequireDefault(_clientnode),_ejs=__webpack_require__(11),_ejs2=_interopRequireDefault(_ejs),_fs=__webpack_require__(12),_fs2=_interopRequireDefault(_fs),_path=__webpack_require__(13),_path2=_interopRequireDefault(_path),_pluginAPI=__webpack_require__(14),_pluginAPI2=_interopRequireDefault(_pluginAPI);exports.__esModule=!0,exports.Template=void 0;try{__webpack_require__(15)}catch(a){}var Template=exports.Template=function(){function Template(){(0,_classCallCheck3.default)(this,Template)}return Template.postConfigurationLoaded=function(){var a=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(b,c,d,e){return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return b.template.renderAfterConfigurationUpdates&&Template.render(null,b,e),a.abrupt('return',b);case 2:case'end':return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}(),Template.preLoadService=function(a){return a.template={getEntryFiles:Template.getEntryFiles.bind(Template),render:Template.render.bind(Template),renderFactory:Template.renderFactory.bind(Template)},a},Template.shouldExit=function(){var a=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(b,c){var d,e,f,g=this;return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:for(f in d=[],e=function(a){Template.files.hasOwnProperty(a)&&!c.template.inPlaceReplacementPaths.includes(a)&&d.push(new _promise2.default(function(){var b=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function b(c,d){var e,f;return _regenerator2.default.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:return e=a.substring(0,a.length-_path2.default.extname(a).length),f=!1,b.prev=2,b.next=5,_clientnode2.default.isFile(e);case 5:f=b.sent,b.next=11;break;case 8:b.prev=8,b.t0=b['catch'](2),d(b.t0);case 11:f?_fs2.default.unlink(e,function(a){return a?d(a):c(e)}):c(f);case 12:case'end':return b.stop();}},b,g,[[2,8]])}));return function(){return b.apply(this,arguments)}}()))},Template.files)e(f);return a.next=5,_promise2.default.all(d);case 5:return a.abrupt('return',b);case 6:case'end':return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}(),Template.getEntryFiles=function(){var a=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(b,c){var d,e,f,g,h,i,j,k,l,m,n,o;return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(!Template.entryFiles||b.template.reloadEntryFiles){a.next=2;break}return a.abrupt('return',Template.entryFiles);case 2:return d=c.map(function(a){return a.path}),Template.entryFiles={},a.next=6,_clientnode2.default.walkDirectoryRecursively(b.context.path,function(a){if(a.name.startsWith('.'))return!1;for(var c in b.plugin.directories)if(b.plugin.directories.hasOwnProperty(c)&&_path2.default.dirname(a.path)===_path2.default.resolve(b.plugin.directories[c].path)&&!d.includes(a.path))return!1;for(var e=b.template.locationsToIgnore,f=Array.isArray(e),g=0,e=f?e:(0,_getIterator3.default)(e);;){var h;if(f){if(g>=e.length)break;h=e[g++]}else{if(g=e.next(),g.done)break;h=g.value}var i=h;if(!i.startsWith('/'))for(var j=d,k=Array.isArray(j),l=0,j=k?j:(0,_getIterator3.default)(j);;){var m;if(k){if(l>=j.length)break;m=j[l++]}else{if(l=j.next(),l.done)break;m=l.value}var n=m;if(a.path.startsWith(_path2.default.resolve(n,i)))return!1}else if(a.path.startsWith(_path2.default.join(b.context.path,i)))return!1}});case 6:a.t0=function(a){return a.stats&&a.stats.isFile()&&0<b.template.extensions.filter(function(b){return a.name.endsWith(b)}).length},e=a.sent.filter(a.t0),f=Array.isArray(e),g=0,e=f?e:(0,_getIterator3.default)(e);case 11:if(!f){a.next=17;break}if(!(g>=e.length)){a.next=14;break}return a.abrupt('break',25);case 14:h=e[g++],a.next=21;break;case 17:if(g=e.next(),!g.done){a.next=20;break}return a.abrupt('break',25);case 20:h=g.value;case 21:i=h,Template.entryFiles[i.path]=null;case 23:a.next=11;break;case 25:j=b.template.inPlaceReplacementPaths,k=Array.isArray(j),l=0,j=k?j:(0,_getIterator3.default)(j);case 26:if(!k){a.next=32;break}if(!(l>=j.length)){a.next=29;break}return a.abrupt('break',40);case 29:m=j[l++],a.next=36;break;case 32:if(l=j.next(),!l.done){a.next=35;break}return a.abrupt('break',40);case 35:m=l.value;case 36:n=m,Template.entryFiles[n]=null;case 38:a.next=26;break;case 40:for(o in Template.entryFiles)Template.entryFiles.hasOwnProperty(o)&&(Template.files[o]=Template.entryFiles[o]);return a.abrupt('return',Template.entryFiles);case 42:case'end':return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}(),Template.render=function(){function render(){return _ref9.apply(this,arguments)}var _ref9=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(givenScope,configuration,plugins){var scope,_arr,_i5,type,name,currentScope,options,templateRenderingPromises,_loop2,filePath,_this2=this;return _regenerator2.default.wrap(function(_context6){for(;;)switch(_context6.prev=_context6.next){case 0:for(scope=_clientnode2.default.extendObject(!0,{basePath:configuration.context.path},configuration.template.scope.plain,givenScope||{}),_arr=['evaluation','execution'],_i5=0;_i5<_arr.length;_i5++)for(name in type=_arr[_i5],configuration.template.scope[type])configuration.template.scope[type].hasOwnProperty(name)&&(currentScope={configuration:_clientnode2.default.copy(configuration,-1,!0),currentPath:process.cwd(),fileSystem:_fs2.default,parser:_ejs2.default,path:_path2.default,PluginAPI:_pluginAPI2.default,plugins:plugins,require:eval('require'),scope:scope,template:Template,Tools:_clientnode2.default,webNodePath:__dirname},scope[name]=new(Function.prototype.bind.apply(Function,[null].concat((0,_keys2.default)(currentScope),['evaluation'===type?'return '+configuration.template.scope[type][name]:configuration.template.scope[type][name]])))().apply(void 0,(0,_values2.default)(currentScope)));return options=_clientnode2.default.copy(configuration.template.options),scope.include=Template.renderFactory(configuration,scope,options),_context6.t0=_pluginAPI2.default,_context6.t1=plugins,_context6.t2=configuration,_context6.next=10,Template.getEntryFiles(configuration,plugins);case 10:return _context6.t3=_context6.sent,_context6.t4=scope,_context6.next=14,_context6.t0.callStack.call(_context6.t0,'preTemplateRender',_context6.t1,_context6.t2,_context6.t3,_context6.t4);case 14:for(filePath in Template.entryFiles=_context6.sent,templateRenderingPromises=[],_loop2=function(a){Template.entryFiles.hasOwnProperty(a)&&templateRenderingPromises.push(new _promise2.default(function(){var b=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function b(c,d){var e,f,g,h,i,j;return _regenerator2.default.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:if(e=_clientnode2.default.extendObject({},scope),f=configuration.template.inPlaceReplacementPaths.includes(a),g=f?a:a.substring(0,a.length-_path2.default.extname(a).length),b.t0=f&&configuration.template.cacheInPlaceReplacements&&Template.entryFiles[a],b.t0){b.next=11;break}if(b.t1=!f&&configuration.template.cache,!b.t1){b.next=10;break}return b.next=9,_clientnode2.default.isFile(g);case 9:b.t1=b.sent;case 10:b.t0=b.t1;case 11:if(!b.t0){b.next=16;break}console.info('Template: Use cached file ("'+g+'") '+('for "'+a+'".')),c(g),b.next=32;break;case 16:h=_clientnode2.default.extendObject({},options,{filename:_path2.default.relative(e.basePath,a)}),'options'in e||(e.options=h),'plugins'in e||(e.plugins=plugins),i=Template.renderFactory(configuration,e,h),j='',b.prev=21,j=i(a),b.next=31;break;case 25:if(b.prev=25,b.t2=b['catch'](21),!f){b.next=30;break}return console.warn('Error during running in-place replacement template file "'+a+'"'+(': '+_clientnode2.default.representObject(b.t2))),b.abrupt('return',c(g));case 30:throw b.t2;case 31:if(j)try{_fs2.default.writeFile(g,j,{encoding:configuration.encoding,flag:'w',mode:438},function(a){return a?d(a):c(g)})}catch(a){d(a)}else console.warn('An empty template processing result detected for file "'+g+'" with '+('input file "'+a+'".')),c(g);case 32:case'end':return b.stop();}},b,_this2,[[21,25]])}));return function(){return b.apply(this,arguments)}}()))},Template.entryFiles)_loop2(filePath);return _context6.next=20,_promise2.default.all(templateRenderingPromises);case 20:return _context6.next=22,_pluginAPI2.default.callStack('postTemplateRender',plugins,configuration,scope,Template.entryFiles);case 22:return _context6.abrupt('return',_context6.sent);case 23:case'end':return _context6.stop();}},_callee6,this)}));return render}(),Template.renderFactory=function(configuration){var scope=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},options=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};return scope.basePath||(scope.basePath=configuration.context.path),options.preCompiledTemplateFileExtensions||(options.preCompiledTemplateFileExtensions=['.js']),function(filePath){var nestedLocals=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},nestedOptions=_clientnode2.default.copy(options);delete nestedOptions.client,nestedOptions=_clientnode2.default.extendObject(!0,{encoding:'utf-8'},nestedOptions,nestedLocals.options||{});var nestedScope=_clientnode2.default.extendObject({},scope);filePath=_path2.default.resolve(scope.basePath,filePath),nestedOptions.filename=_path2.default.relative(scope.basePath,filePath),nestedScope.basePath=_path2.default.dirname(filePath),nestedScope.include=Template.renderFactory(configuration,nestedScope,nestedOptions),nestedScope.options=nestedOptions,nestedScope.scope=nestedScope,_clientnode2.default.extendObject(nestedScope,nestedLocals);for(var currentFilePath=null,_iterator5=[''].concat(configuration.template.extensions),_isArray5=Array.isArray(_iterator5),_i6=0,_iterator5=_isArray5?_iterator5:(0,_getIterator3.default)(_iterator5);;){var _ref11;if(_isArray5){if(_i6>=_iterator5.length)break;_ref11=_iterator5[_i6++]}else{if(_i6=_iterator5.next(),_i6.done)break;_ref11=_i6.value}var extension=_ref11;if(_clientnode2.default.isFileSync(filePath+extension)){currentFilePath=filePath+extension;break}}if(currentFilePath){if(configuration.template.reloadSourceContent&&!configuration.template.inPlaceReplacementPaths.includes(filePath)||!(Template.files.hasOwnProperty(currentFilePath)&&Template.files[currentFilePath]))if(nestedOptions.preCompiledTemplateFileExtensions.includes(_path2.default.extname(currentFilePath)))try{Template.files[currentFilePath]=eval('require')(currentFilePath)}catch(a){throw new Error('Error occurred during loading script module: "'+currentFilePath+'": '+_clientnode2.default.representObject(a))}else{var template;try{template=_fs2.default.readFileSync(currentFilePath,{encoding:nestedOptions.encoding})}catch(a){throw new Error('Error occurred during loading template file "'+currentFilePath+'" from file system:'+(' '+_clientnode2.default.representObject(a)))}try{Template.files[currentFilePath]=_ejs2.default.compile(template,nestedOptions)}catch(a){throw new Error('Error occurred during compiling template file "'+currentFilePath+'" with base path "'+(nestedScope.basePath+'": ')+_clientnode2.default.representObject(a))}}var result='';try{result=Template.files[currentFilePath](nestedScope)}catch(a){var scopeDescription='';try{scopeDescription='scope '+_clientnode2.default.representObject(nestedScope)+' against'}catch(a){}throw new Error('Error occurred during running template '+(scopeDescription+'file "'+currentFilePath+'": ')+_clientnode2.default.representObject(a))}return result.replace(/<script +processing-workaround *(?:= *(?:" *"|' *') *)?>([\s\S]*?)<\/ *script *>/ig,'$1').replace(/<script +processing(-+)-workaround *(?:= *(?:" *"|' *') *)?>([\s\S]*?)<\/ *script *>/ig,'<script processing$1workaround>$2</script>')}throw new Error('Given template file "'+nestedOptions.filename+'" couldn\'t be resolved (with known extensions: "'+(configuration.template.extensions.join('", "')+'") in "')+(scope.basePath+'".'))}},Template}();Template.files={},exports.default=Template}).call(exports,__webpack_require__(2),'/')},function(a){function b(){throw new Error('setTimeout has not been defined')}function c(){throw new Error('clearTimeout has not been defined')}function d(a){if(j===setTimeout)return setTimeout(a,0);if((j===b||!j)&&setTimeout)return j=setTimeout,setTimeout(a,0);try{return j(a,0)}catch(b){try{return j.call(null,a,0)}catch(b){return j.call(this,a,0)}}}function e(a){if(k===clearTimeout)return clearTimeout(a);if((k===c||!k)&&clearTimeout)return k=clearTimeout,clearTimeout(a);try{return k(a)}catch(b){try{return k.call(null,a)}catch(b){return k.call(this,a)}}}function f(){o&&m&&(o=!1,m.length?n=m.concat(n):p=-1,n.length&&g())}function g(){if(!o){var a=d(f);o=!0;for(var b=n.length;b;){for(m=n,n=[];++p<b;)m&&m[p].run();p=-1,b=n.length}m=null,o=!1,e(a)}}function h(a,b){this.fun=a,this.array=b}function i(){}var j,k,l=a.exports={};(function(){try{j='function'==typeof setTimeout?setTimeout:b}catch(a){j=b}try{k='function'==typeof clearTimeout?clearTimeout:c}catch(a){k=c}})();var m,n=[],o=!1,p=-1;l.nextTick=function(a){var b=Array(arguments.length-1);if(1<arguments.length)for(var c=1;c<arguments.length;c++)b[c-1]=arguments[c];n.push(new h(a,b)),1!==n.length||o||d(g)},h.prototype.run=function(){this.fun.apply(null,this.array)},l.title='browser',l.browser=!0,l.env={},l.argv=[],l.version='',l.versions={},l.on=i,l.addListener=i,l.once=i,l.off=i,l.removeListener=i,l.removeAllListeners=i,l.emit=i,l.prependListener=i,l.prependOnceListener=i,l.listeners=function(){return[]},l.binding=function(){throw new Error('process.binding is not supported')},l.cwd=function(){return'/'},l.chdir=function(){throw new Error('process.chdir is not supported')},l.umask=function(){return 0}},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_3__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_4__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_5__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_6__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_7__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_8__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_9__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_10__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_11__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_12__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_13__},function(a){a.exports=__WEBPACK_EXTERNAL_MODULE_14__},function(a){if('undefined'==typeof __WEBPACK_EXTERNAL_MODULE_15__){var b=new Error('Cannot find module "source-map-support/register"');throw b.code='MODULE_NOT_FOUND',b}a.exports=__WEBPACK_EXTERNAL_MODULE_15__}])});