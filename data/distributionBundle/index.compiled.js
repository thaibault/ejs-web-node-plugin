'use strict';
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("babel-runtime/core-js/promise"), require("babel-runtime/helpers/asyncToGenerator"), require("clientnode"), require("ejs"), require("fs"), require("path"), (function webpackLoadOptionalExternalModule() { try { return require("source-map-support/register"); } catch(e) {} }()), require("web-node/pluginAPI.compiled"));
	else if(typeof define === 'function' && define.amd)
		define("templatewebnodeplugin", ["babel-runtime/core-js/promise", "babel-runtime/helpers/asyncToGenerator", "clientnode", "ejs", "fs", "path", "source-map-support/register", "web-node/pluginAPI.compiled"], factory);
	else if(typeof exports === 'object')
		exports["templatewebnodeplugin"] = factory(require("babel-runtime/core-js/promise"), require("babel-runtime/helpers/asyncToGenerator"), require("clientnode"), require("ejs"), require("fs"), require("path"), (function webpackLoadOptionalExternalModule() { try { return require("source-map-support/register"); } catch(e) {} }()), require("web-node/pluginAPI.compiled"));
	else
		root['templatewebnodeplugin'] = factory(root["babel-runtime/core-js/promise"], root["babel-runtime/helpers/asyncToGenerator"], root["clientnode"], root["ejs"], root["fs"], root["path"], root["source-map-support/register"], root["web-node/pluginAPI.compiled"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_9__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, __dirname) {var _promise=__webpack_require__(2),_promise2=_interopRequireDefault(_promise),_asyncToGenerator2=__webpack_require__(3),_asyncToGenerator3=_interopRequireDefault(_asyncToGenerator2),_clientnode=__webpack_require__(4),_clientnode2=_interopRequireDefault(_clientnode),_fs=__webpack_require__(6),_fs2=_interopRequireDefault(_fs),_ejs=__webpack_require__(5),_ejs2=_interopRequireDefault(_ejs),_path=__webpack_require__(7),_path2=_interopRequireDefault(_path),_pluginAPI=__webpack_require__(9),_pluginAPI2=_interopRequireDefault(_pluginAPI);exports.__esModule=!0;function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}try{__webpack_require__(8)}catch(a){}class Template{static shouldExit(a,b,c){return(0,_asyncToGenerator3.default)(function*(){const d=[];for(const e of yield Template.getFiles(b,c))d.push(new _promise2.default(function(){var f=(0,_asyncToGenerator3.default)(function*(g,h){const i=e.path.substring(0,e.path.length-_path2.default.extname(e.path).length);let j=!1;try{j=yield _clientnode2.default.isFile(i)}catch(k){h(k)}j?_fs2.default.unlink(i,function(k){return k?h(k):g(i)}):g(j)});return function(){return f.apply(this,arguments)}}()));return yield _promise2.default.all(d),a})()}static postConfigurationLoaded(configuration,pluginsWithChangedConfiguration,oldConfiguration,plugins){return(0,_asyncToGenerator3.default)(function*(){const scope=_clientnode2.default.copyLimitedRecursively(configuration.template.scope.plain);for(const type of['evaluation','execution'])for(const name in configuration.template.scope[type])configuration.template.scope[type].hasOwnProperty(name)&&(scope[name]=new Function('configuration','currentPath','fileSystem','parser','path','pluginAPI','plugins','require','scope','template','tools','webNodePath','evaluation'===type?`return ${configuration.template.scope[type][name]}`:configuration.template.scope[type][name])(_clientnode2.default.copyLimitedRecursively(configuration,-1,!0),process.cwd(),_fs2.default,_ejs2.default,_path2.default,_pluginAPI2.default,plugins,eval('require'),scope,Template,_clientnode2.default,__dirname));const templateRenderingPromises=[];for(const a of yield Template.getFiles(configuration,plugins))templateRenderingPromises.push(new _promise2.default(function(b,c){return _fs2.default.readFile(a.path,{encoding:configuration.encoding,flag:'r'},function(d,e){if(d)c(d);else{const f=a.path.substring(0,a.path.length-_path2.default.extname(a.path).length),g=_clientnode2.default.copyLimitedRecursively(configuration.template.options);g.filename=_path2.default.resolve(_path2.default.dirname(a.path),a.path),'options'in scope||(scope.options=g),'plugins'in scope||(scope.plugins=plugins);let h=null;try{h=_ejs2.default.compile(e,g)}catch(i){console.error(`Error during compiling template "`+`${g.filename}": `+_clientnode2.default.representObject(i)),c(i)}if(h){let i=null;try{i=h(scope)}catch(j){console.error(`Error during running template "`+`${g.filename}": `+_clientnode2.default.representObject(j)),c(j)}if(i)try{_fs2.default.writeFile(f,i,{encoding:configuration.encoding,flag:'w',mode:438},function(j){return j?c(j):b(f)})}catch(j){c(j)}}}})}));return yield _promise2.default.all(templateRenderingPromises),configuration})()}static getFiles(a,b){return(0,_asyncToGenerator3.default)(function*(){return(yield _clientnode2.default.walkDirectoryRecursively(a.context.path,function(c){if(_path2.default.basename(c.path).startsWith('.'))return!1;for(const d in a.plugin.directories)if(a.plugin.directories.hasOwnProperty(d)&&_path2.default.dirname(c.path)===_path2.default.resolve(a.plugin.directories[d].path)&&!b.map(function(e){return e.path}).includes(c.path))return!1})).filter(function(c){return c.stat.isFile()&&a.template.extensions.includes(_path2.default.extname(c.path))})})()}}exports.default=Template;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), "/"))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

if(typeof __WEBPACK_EXTERNAL_MODULE_8__ === 'undefined') {var e = new Error("Cannot find module \"source-map-support/register\""); e.code = 'MODULE_NOT_FOUND';; throw e;}
module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});