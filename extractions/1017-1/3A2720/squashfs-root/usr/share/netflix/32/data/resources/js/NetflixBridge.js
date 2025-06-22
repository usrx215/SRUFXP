/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp = {
    _init: false,
    _syncComplete: false,
    _isError: false,
    _timeOffset: 0,
    _backchannels: [],

    get isReady() { return this._init && this._syncComplete && !this._isError; },
    get debug() { return this._syncData.debug; },
    get options() { return this._syncData.options; },
    get bootURL() { return this.system.bootURL; },
    get nccpURL() { return this._syncData.nccpUrl; },
    get started() { return this._syncData.started; },

    get READY() { return "READY"; },

    get COMPLETE() { return "COMPLETE"; },
    get NETWORK_ERROR() { return "NETWORK_ERROR"; },
    get ACTION_ID() { return "ACTION_ID"; },
    get ERROR() { return "ERROR"; },

    _tryBackchannel: function _tryBackchannel(chan) {
        if (chan.init()) {
            //nrdp.log.trace(" using backchannel " + chan.name);
            nrdp._backchannel = chan;
            return true;
        } else {
            return false;
        }
    },

    setupBackchannel: function setupBackchannel() {
        var i;
        if (nrdp._backchannel) {
            return;
        }
        //nrdp.log.trace("nrdp.setupBackchannel called" + (typeof window !== "undefined" ? (", window.location = " + window.location) : ""));
        for (i = 0; i < nrdp._backchannels.length; i++) {
            if (typeof nrdp._backchannels[i] !== "object")
                continue;
            if (nrdp._tryBackchannel(nrdp._backchannels[i]))
                return;
        }
    },

    shutdownBackchannel: function shutdownBackchannel() {
        if (!nrdp._backchannel) {
            return;
        }
        //nrdp.log.trace("nrdp.shutdownBackchannel called");
        this._sendSyncdEvent(function() { this._callEventListeners(this, { type: "shutdown" } ); }, this);
        if(nrdp._backchannel.shutdown)
            nrdp._backchannel.shutdown();
    },

    _sendSyncdEvent: function _sendSyncdEvent(fn, that, arguments) { //for gibbon to hook
        fn.apply(that, arguments);
    },

    _sendInitEvent: function _sendInitEvent() {
        this._sendSyncdEvent(function() { this._callEventListeners(nrdp, { type: "init", status: this.READY } ); }, this);
    },

    init: function init() {
        if (nrdp._init) {
            return;
        }
        nrdp._init = true;
        //nrdp.log.trace("nrdp.init called");
        nrdp.setupBackchannel();
        if (nrdp._syncComplete) {
            nrdp._sendInitEvent();
        }
    },

    now: function now() {
        return Date.now() + nrdp._timeOffset;
    },

    exit: function exit() {
        nrdp._invoke(null, "quit");
    },

    mono: function mono() {
        if (nrdp._backchannel && nrdp._backchannel.mono)
            return nrdp._backchannel.mono();
    },

    getConfigList: function getConfigList() {
        nrdp._invoke(null, "getConfigList");
    },

    setConfigData: function setConfigData(file, data) {
        var str = nrdp._urlEncode(data);
        if (str)
            nrdp._invoke(null, "setConfigData", {name: file, data: str});
    },

    _path: "nrdp",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    _findObject: function _findObject(name) {
        var obj = nrdp;
        if (name != "nrdp") {
            var bits = name.split('.');
            for(var i = 1; obj && i < bits.length; ++i) {  // skip beginning "nrdp"
                obj = obj[bits[i]];
            }
        }
        return obj;
    },

    _setProperty: function _setProperty(subobj, prop, val) {
        if (!nrdp._backchannel) {
            nrdp.log.info("unhandled _setProperty " + subobj + " " + prop);
        }
        var objName = subobj ? "nrdp." + subobj : "nrdp";
        var obj = nrdp._findObject(objName);
        if (!obj) {
            nrdp.log.error("could not find object " + objName + " to set property " + prop + " on");
            return;
        }
        if (!obj._setProperty_current)
            obj._setProperty_current = {};
        if (obj._setProperty_current[prop]) {
            if (!obj._setProperty_pending)
                obj._setProperty_pending = {};
            obj._setProperty_pending[prop] = {
                object: subobj,
                property: prop,
                value: val
            };
            return;
        } else {
            obj._setProperty_current[prop] = true;
        }
        nrdp._backchannel.setProperty(subobj, prop, val);
    },

    _setServerTime: function _setServerTime(time) {
        this._timeOffset = (time * 1000) - Date.now();
    },

    _construct: function _construct(subobj, method, args) {
        if (!nrdp._backchannel) {
            nrdp.log.info("unhandled _construct " + subobj + " " + method);
        }
        var obj = nrdp._backchannel.construct(subobj, method, args);
        if (obj)
            nrdp._sendSyncdEvent(nrdp._gotEvent, nrdp, [obj]);
        return obj;
    },

    _invoke: function _invoke(subobj, method, args) {
        if (!nrdp._backchannel) {
            nrdp.log.info("unhandled _invoke " + subobj + " " + method);
        }
        nrdp._backchannel.invoke(subobj, method, args);
    },

    _addEventListener: function _addEventListener(object, eventType, listener) {
        if (!listener)
            return;
        var listeners, path;
        if (typeof object === "string") {
            if (!nrdp._oldStyleListeners)
                nrdp._oldStyleListeners = {};
            listeners = nrdp._oldStyleListeners;
            eventType = object + "." + eventType;
            path = eventType;
        } else {
            if (!object._eventListeners)
                object._eventListeners = {};
            listeners = object._eventListeners;
            path = object._path + "." + eventType;
        }
        //nrdp.log.trace("add listener for " + path);
        if (!listeners[eventType])
            listeners[eventType] = [];
        listeners[eventType].push(listener);
    },

    _removeEventListener: function _removeEventListener(object, eventType, listener) {
        if (!listener)
            return;

        var myListeners, parent, path;
        if (typeof object === "string") {
            eventType = object + "." + eventType;
            parent = nrdp._oldStyleListeners;
            path = eventType;
        } else if (typeof object === "object") {
            parent = object._eventListeners;
            path = object._path + "." + eventType;
        }

        if (!parent)
            return;
        myListeners = parent[eventType];
        if (!myListeners)
            return;
        var index = myListeners.indexOf(listener);

        if (index >= 0) {
            if (myListeners.length == 1)
                delete parent[eventType];
            else
                myListeners.splice(index, 1);
        }

        var len = parent[eventType] ? parent[eventType].length : 0;
        //nrdp.log.trace("remove listener for " + path + ", length is " + len);
    },

    _hasEventListener: function _hasEventListener(object, eventType) {
        if (typeof object === "string") {
            eventType = object + "." + eventType;
            return (nrdp._oldStyleListeners && nrdp._oldStyleListeners[eventType] && nrdp._oldStyleListeners[eventType].length);
        } else {
            return (object._eventListeners &&
                    object._eventListeners[eventType] &&
                    object._eventListeners[eventType].length);
        }
    },

    _callEventListeners: function _callEventListeners(object, event) {
        if (!this.isReady && event.type != "fatalerror") {
            return;
        }
        var myListeners;
        var path;
        if (typeof object === "string") {
            var eventType = object + "." + event.type;
            if (!nrdp._oldStyleListeners || !nrdp._oldStyleListeners[eventType])
                return;
            myListeners = nrdp._oldStyleListeners[eventType].slice(0);
            path = object;
        } else {
            if (!object._eventListeners || !object._eventListeners[event.type])
                return;
            myListeners = object._eventListeners[event.type].slice(0);
            path = object._path;
        }
        for (var i = 0; i < myListeners.length; i++) {
            var listener = myListeners[i];
            if (listener) {
                //nrdp.log.trace("call listener for " + path + "." + event.type);
                listener(event);
            }
        }
    },

    _urlEncode: function _urlEncode(obj) {
        var str = "";
        for (var p in obj) {
            if (str) str += "&";
            str += p + "=" + encodeURIComponent(obj[p]);
        }
        return str;
    },

    _gotEvent: function _gotEvent(event) {
        var obj;
        var evt;
        try {
            if (event.type == "Event") {
                if (!event.object) {
                    if (event.name == "serverTimeChanged") {
                        this._setServerTime(event.data);
                    } else if (event.name == "ObjectSyncStart") {
                        this._setServerTime(event.value);
                    } else if (event.name == "ObjectSyncComplete") {
                        //nrdp.log.trace("object sync is complete");
                        this._syncComplete = true;
                        if (this._init) {
                            this._sendInitEvent();
                        }
                    } else if (event.name == "factoryReset") {
                        evt = {
                            type: event.name
                        };
                        this._callEventListeners(this, evt);
                    }
                } else {
                    obj = this._findObject(event.object);
                    if (!obj || typeof obj["_handleEvent"] !== "function" || !obj["_handleEvent"](event))
                        nrdp.log.warn("unhandled event " + event.object + " " + event.name);
                }
            } else if (event.type == "PropertyUpdate" || event.type == "Construct") {
                obj = this._findObject(event.object);
                if (!obj) {
                    nrdp.log.error("Could not find object " + event.object + " for sync data");
                    return;
                }
                var fn;
                if (typeof obj["_updateProperty"] === "function")
                    fn = obj["_updateProperty"];
                else if (!obj._syncData)
                    obj._syncData = {};
                for (var property in event.properties) {
                    if (typeof event.properties[property] !== "function") {
                        if (fn)
                            fn.call(obj, property, event.properties[property]);
                        else
                            obj._syncData[property] = event.properties[property];
                    }
                }
            } else if (event.type == "SetProperty") {
                obj = this._findObject(event.object);
                if (obj) {
                    if(obj._setProperty_current)
                        delete obj._setProperty_current[event.property];
                    if (obj._setProperty_pending && obj._setProperty_pending[event.property]) {
                        var newset = obj._setProperty_pending[event.property];
                        delete obj._setProperty_pending[event.property];
                        nrdp._setProperty(newset.object, newset.property, newset.value);
                    }
                }
            } else if (event.type == "Method") {
                // this only happens for an invalid argument error
                evt = {
                    type: "invalidargument",
                    object: event.object,
                    method: event.method,
                    argument: event.returnValue
                };
                this._callEventListeners(this, evt);
            } else if (event.type == "EventSourceError") {
                nrdp._isError = true;
                nrdp.log.info("EventSource went away, sending fatalerror");
                evt = {
                    type: "fatalerror"
                };
                this._callEventListeners(this, evt);
            } else {
                nrdp.log.error("unhandled eventsource type " + event.type);
            }
        } catch (e) {
            var tags = {};
            if (typeof e !== "string") {
                for (var n in e) {
                    if (e.hasOwnProperty(n)) {
                        tags[n] = e[n];
                    }
                }
            }
            // chrome defines this
            if (e.stack) tags.stack = e.stack;
            nrdp.log.error("JAVASCRIPT EXCEPTION: " + e.toString(), undefined, undefined, tags);
        }
    },

    _nextIdx: 1,
    _cbs: {},
    _fn: function _fn(name, args, cb) {
        if (!args) args = {};
        args.id = this._nextIdx++;
        this._cbs[args.id] = cb;
        nrdp._invoke(null, name, args);
    },

    parseXml: function parseXml(xml, cb) {
        nrdp._fn("parseXml", {xml: xml}, cb);
    },

    parseJson: function parseXml(json, cb) {
        nrdp._fn("parseJson", {json: json}, cb);
    },

    _fixXml: function _fixXml(obj) {
        var children = obj["$children"];
        if (!children || !children.length)
            return;
        for (var i = 0; i < children.length; i++) {
            children[i]["$parent"] = obj;
            children[i]["$sibling"] = children[i + 1];
            var name = children[i]["$name"];
            if (typeof name !== "undefined" && typeof obj[name] === "undefined")
                obj[name] = children[i];
            this._fixXml(children[i]);
        }
    },

    _handleEvent: function _handleEvent(event) {
        var cb;
        if (event.name == "background") {
            return this._handleNccpEvent(this, event);
        } else if (event.name == "commandReceived") {
            this._callEventListeners(this, { type: "command", parameters: event.data });
            return true;
        } else if (event.name == "config") {
            var evt = {
                type: "config",
                list: event.data
            };
            this._callEventListeners(this, evt);
            return true;
        } else if (event.name == "parsedXml") {
            cb = this._cbs[event.data.id];
            if (typeof cb === "function") {
                if (event.data.success) {
                    this._fixXml(event.data.object);
                }
                cb(event.data);
            }
            delete this._cbs[event.data.id];
            return true;
        } else if (event.name == "parsedJson") {
            cb = this._cbs[event.data.id];
            if (typeof cb === "function") {
                cb(event.data.object);
            }
            delete this._cbs[event.data.id];
            return true;
        }
        return false;
    },

    _handleNccpEvent: function _handleNccpEvent(object, event) {
        if (event.data.origin == "complete") {
            return true;
        }
        this._callEventListeners(object, event.data);
        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.audio = {
    get codecs() { return this._syncData.codecs; },
    get urls() { return this._syncData.urls; },

    load: function load(URL, cb) {
        nrdp.audio._fn("load", { URL: URL }, cb);
    },

    unload: function unload(URL, cb) {
        nrdp.audio._fn("unload", { URL: URL }, cb);
    },

    unloadAll: function unloadAll(cb) {
        nrdp.audio._fn("unloadAll", undefined, cb);
    },

    play: function play(URL, volume, cb) {
        nrdp.audio._fn("play", { URL: URL, volume: volume }, cb);
    },

    stop: function stop(URL, cb) {
        nrdp.audio._fn("stop", { URL: URL }, cb);
    },

    _nextIdx: 1,
    _cbs: {},
    _fn: function _fn(name, args, cb) {
        if (!args) args = {};
        args.id = this._nextIdx++;
        if (cb)
            this._cbs[args.id] = cb;
        nrdp._invoke("audio", name, args);
    },

    _handleEvent: function _handleEvent(event) {
        if (event.data && event.data.id) {
            if (typeof this._cbs[event.data.id] == "function") {
                var args = [event.data.success, event.data.size];
                if (event.data.hasOwnProperty("URL"))
                    args.unshift(event.data.URL);
                this._cbs[event.data.id].apply(undefined, args);
                delete this._cbs[event.data.id];
            }
        } else {
            return false;
        }
        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.device = {
    _path: "device",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get VOLUME_NONE() { return 0; },
    get VOLUME_SPEAKER() { return 1; },
    get VOLUME_STREAM() { return 2; },

    get currentViewMode() { return this._syncData.currentViewMode; },
    get availableViewModes() { return this._syncData.availableViewModes; },
    get softwareVersion() { return this._syncData.softwareVersion; },
    get certificationVersion() { return this._syncData.certificationVersion; },
    get deviceModel() { return this._syncData.deviceModel; },
    get ESNPrefix() { return this._syncData.ESNPrefix; },
    get SDKVersion() { return this._syncData.SDKVersion; },
    get ESN() { return this._syncData.ESN; },
    get language() { return this._syncData.language; },
    get friendlyName() { return this._syncData.friendlyName; },
    get volume() { return this._syncData.volume; },
    set volume(v) { nrdp._setProperty("device", "volume", v); },
    get volumeControlType() { return this._syncData.volumeControlType; },
    get volumeStep() { return this._syncData.volumeStep; },
    get mute() { return this._syncData.mute; },
    set mute(m) { nrdp._setProperty("device", "mute", m); },

    get capability() { return this._syncData.capability; },
    get videoOutput() { return this._syncData.videoOutput; },
    get localContent() { return this._syncData.localContent; },
    get dnslist() { return this._syncData.dnslist; },
    get iflist() { return this._syncData.iflist; },

    get UIVersion() { return this._syncData.UIVersion; },
    set UIVersion(version) { nrdp._setProperty("device", "UIVersion", version); },
    setUIVersion: function setUIVersion(version) { nrdp._setProperty("device", "UIVersion", version); },

    get UILanguages() {
        return this._syncData.UILanguages;
    },
    set UILanguages(langs) {
        langs = Array.isArray(langs) ? langs : [];
        var val = langs.join(",");
        nrdp._setProperty("device", "UILanguages", val);
    },

    isScreensaverOn: function isScreensaverOn() { return this._syncData.screensaverOn; },

    factoryReset: function factoryReset(cb) {
        nrdp.storage._clearAll();
        nrdp.device._fn("factoryReset", null, cb);
    },
    setViewMode: function setViewMode(viewMode) {
        nrdp._invoke("device", "setViewMode", {viewMode : viewMode});
    },

    _nextIdx: 1,
    _cbs: {},
    _fn: function _fn(name, args, cb) {
        if (!args) args = {};
        args.idx = this._nextIdx++;
        if (cb)
            this._cbs[args.idx] = cb;
        nrdp._invoke("device", name, args);
    },
    clearErrorCache: function clearErrorCache() {
        nrdp._invoke("device", "clearErrorCache", null);
    },
    _handleEvent: function _handleEvent(event) {
        if (event.data && event.data.idx) {
            if (typeof this._cbs[event.data.idx] == "function") {
                this._cbs[event.data.idx](event.data.data);
                delete this._cbs[event.data.idx];
            }
        } else {
            return false;
        }
        return true;
    },

    _syncData: {},
    _updateProperty: function _updateProperty(property, value) {
        var evt;
        if (nrdp.isReady) {
            if (property == "screensaverOn") {
                evt = {
                    type: "screensaverchange"
                };
            } else if (property == "capability") {
                evt = {
                    type: "capabilitychange",
                    old: this.capability
                };
            } else if (property == "videoOutput") {
                evt = {
                    type: "videooutputchange",
                    old: this.videoOutput
                };
            } else if (property == "localContent") {
                evt = {
                    type: "localcontentchange",
                    old: this.localContent
                };
            } else if (property == "language") {
                evt = {
                    type: "languagechange",
                    old: this.language
                };
            } else if (property == "currentViewMode") {
                evt = {
                    type: "viewmodechange"
                };
            } else if (property.match(/^volume/) || property == "mute") {
                evt = {
                    type: "volumechange",
                    oldvolume: this.volume,
                    oldmute: this.mute
                };
            }
        }

        this._syncData[property] = value;

        if (evt) {
            nrdp._callEventListeners(this, evt);
        }
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.instrumentation =
{
    _path:              "instrumentation",
    addEventListener:   function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener:function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get ON              (){ return 0; },
    get SWITCHED        (){ return 1; },
    get TEST            (){ return 2; },
    get DEBUG           (){ return 3; },

    get verbose         (){ return this._syncData.verbose; },
    
    generateEvent:      function generateEvent( category , name , value ){nrdp._invoke("instrumentation","event",{"category":category,"name":name,"value":value});},
    startInterval:      function startInterval( category , name , value , reset ){nrdp._invoke("instrumentation","intervalStart",{"category":category,"name":name,"value":value,"reset":reset});},
    incIntervalCounter: function incIntervalCounter( category , name , counter , increment ){nrdp._invoke("instrumentation","intervalCount",{"category":category,"name":name,"counter":counter,"increment":increment});},
    tagInterval:        function tagInterval( category , name , value ){nrdp._invoke("instrumentation","intervalTag",{"category":category,"name":name,"value":value});},
    endInterval:        function endInterval( category , name , value ){nrdp._invoke("instrumentation","intervalEnd",{"category":category,"name":name,"value":value});},
    cancelInterval:     function cancelInterval( category , name ){nrdp._invoke("instrumentation","intervalCancel",{"category":category,"name":name});},
    stashOn:            function stashOn(){nrdp._invoke("instrumentation","stash",{"on":true});},
    stashOff:           function stashOff(){nrdp._invoke("instrumentation","stash",{"on":false});},
    popStash:           function popStash(cb)
                        {
                            var idx = this._nextIdx++;
                            this._cbs[idx] = cb;
                            nrdp._invoke("instrumentation","popStash",{"idx":idx});
                        },

    _nextIdx:           1,
    _cbs:               {},
    _handleEvent:       function _handleEvent(event)
                        {
                            if (event.data && event.data.idx) 
                            {
                                if (typeof this._cbs[event.data.idx] == "function") 
                                {
                                    this._cbs[event.data.idx](event.data.events);
                                }
                                delete this._cbs[event.data.idx];
                            } 
                            else if ( event.name == "verboseChanged" )
                            {
                                nrdp._callEventListeners(this,{type:event.name});
                            }
                            else 
                            {
                                return false;
                            }
                            return true;
                        }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.log = {
    _path: "log",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get areas() { return this._syncData.areas; },
    get levels() { return this._syncData.levels; },

    get level() { return this._syncData.level; },
    set level(e) { nrdp._setProperty("log", "level", e); },

    get traceAreas() { return this._syncData.traceAreas; },
    set traceAreas(e) { nrdp._setProperty("log", "traceAreas", e); },

    get sendLogBlobsToJS() { return this._syncData.sendLogBlobsToJS; },
    set sendLogBlobsToJS(e) { nrdp._setProperty("log", "sendLogBlobsToJS", e); },

    get UIContext() { return this._syncData.UIContext; },
    set UIContext(s) { nrdp._setProperty("log","UIContext",s); },

    get errorCodes() { return this._syncData.errorCodes; },

    _log: function _log(level, args) {
        if (nrdp._syncComplete && !nrdp._isError) {
            var area = args[1];
            if(typeof area === "undefined")
                area = "UI_SCRIPT";
            if (this.areas.indexOf(area) == -1)
                area = undefined;
            var stack = [];
            if (level != "trace") {
                try {
                    var getArguments = function(args) {
                        var result = [];
                        var slice = Array.prototype.slice;
                        for (var i = 0; i < args.length; ++i) {
                            var arg = args[i];
                            if (arg === undefined) {
                                result[i] = 'undefined';
                            } else if (arg === null) {
                                result[i] = 'null';
                            } else if (arg.constructor) {
                                if (arg.constructor === Array) {
                                    if (arg.length < 3) {
                                        result[i] = '[' + getArguments(arg) + ']';
                                    } else {
                                        result[i] = '[' + getArguments(slice.call(arg, 0, 1)) + '...' + stringifyArguments(slice.call(arg, -1)) + ']';
                                    }
                                } else if (arg.constructor === Object) {
                                    result[i] = '#object';
                                } else if (arg.constructor === Function) {
                                    result[i] = '#function';
                                } else if (arg.constructor === String) {
                                    result[i] = '"' + arg + '"';
                                } else if (arg.constructor === Number) {
                                    result[i] = arg;
                                }
                            }
                        }
                        return result;
                    };
                    var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, maxStackSize = 10;
                    for(var current_frame = arguments.callee.caller.caller; current_frame && current_frame['arguments'] && stack.length < maxStackSize;
                        current_frame = current_frame.caller)
                        stack.push({name: fnRE.test(current_frame.toString()) ? RegExp.$1 || ANON : ANON,
                                    arguments: getArguments(Array.prototype.slice.call(current_frame['arguments'] || []))});
                } catch (x) {
                }
            }
            nrdp._invoke("log", "log", {logLevel: this.levels[level],
                                        msg: args[0],
                                        stack: stack,
                                        traceArea: area,
                                        type: args[2],
                                        tags: args[3]});
        } else {
            var msg;
            if (args.length == 1)
                msg = args[0];
            else
                msg = args[1] + ": " + args[0];
            this.console(msg);
        }
    },

    console: function console(msg) {
        if(nrdp._backchannel && nrdp._backchannel.console)
            nrdp._backchannel.console(msg);
        else if(typeof nrdp_platform !== "undefined" && nrdp_platform.console) //nrdp
            nrdp_platform.console(msg);
        else if(typeof window !== "undefined" && window.console.log) //browser
            window.console.log(msg);
    },
    debug: function debug() { nrdp.log._log("debug", arguments); },
    info: function info() { nrdp.log._log("info", arguments); },
    warn: function warn() { nrdp.log._log("warn", arguments); },
    error: function error() { nrdp.log._log("error", arguments); },
    fatal: function fatal() { nrdp.log._log("fatal", arguments); },
    trace: function trace() { nrdp.log._log("trace", arguments); },

    get xid() { return this._syncData.xid; },
    get appid() { return this._syncData.appid; },
    get sessionid() { return this._syncData.sessionid; },

    resetSessionID : function resetSessionID() { nrdp._invoke("log","resetSessionID"); },

    flush: function flush() { nrdp._invoke("log", "flush"); },

    getLogBlobs: function getLogBlobs() { nrdp._invoke("log", "getLogBlobs"); },

    _handleEvent: function _handleEvent(event) {
        if (event.name == "logBlobMessageReceived" || event.name == "logBlobReady") {
            var evt = event.data;
            evt.type = event.name;
            nrdp._callEventListeners(this, evt);
        } else if ( event.name == "sessionIDChanged" ) {
            var evt = { data : event.data };
            evt.type = event.name;
            nrdp._callEventListeners(this, evt);
        } else {
            return false;
        }

        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.mdxnccp = {
    pair: function pair(cticket_c, uuid_c, hmac_c, nonce, uuid_t, cb) {
        nrdp.mdxnccp._datas[uuid_c] = {cb: cb, results: []};
        nrdp._invoke("mdxnccp", "pair",
                     {controllerUuid: uuid_c, pairDataHmac: hmac_c, nonce: nonce, targetUuid: uuid_t, cticket: cticket_c});
    },
    abort: function abort(uuid_c, cb) {
        if (nrdp.mdxnccp._datas[uuid_c]) {
            delete nrdp.mdxnccp._datas[uuid_c];
            nrdp._invoke("mdxnccp", "abort", {controllerUuid: uuid_c});
        }
    },
    finish: function finish(uuid_c) {
        delete nrdp.mdxnccp._datas[uuid_c];
    },

    _datas: {},

    _handleEvent: function _handleEvent(event) {
        if (event.data && (event.data.controlleruuid || (event.data.data && event.data.data.controlleruuid))) {
            var uuid_c = event.data.data ? event.data.data.controlleruuid : event.data.controlleruuid;
            var data = nrdp.mdxnccp._datas[uuid_c];
            if (data === undefined)
                return true;
            data.results.push(event.data);
            if (event.data.origin === "complete") {
                data.cb(data.results);
            }
        } else {
            return false;
        }
        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.media = {
    _path: "media",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get audioTrackList() { return this._syncData.audioTrackList; },

    get bufferPoolSize() { return this._syncData.bufferPoolSize; },

    get currentAudioTrack() { return this._syncData.currentAudioTrack; },
    set currentAudioTrack(currentAudioTrack) {
        nrdp._setProperty("media", "currentAudioTrack", currentAudioTrack);
    },

    get currentSubtitleTrack() { return this._syncData.currentSubtitleTrack; },
    set currentSubtitleTrack(currentSubtitleTrack) {
        nrdp._setProperty("media", "currentSubtitleTrack", currentSubtitleTrack);
    },

    /*
    get currentTrickplayTrack() { return this._syncData.currentTrickplayTrack; },
    set currentTrickplayTrack(currentTrickplayTrack) {
        nrdp._setProperty("media", "currentTrickplayTrack", currentTrickplayTrack);
    },
     */

    get defaultTrackOrderList() { return this._syncData.defaultTrackOrderList; },

    get displayAspectRatio() { return this._syncData.displayAspectRatio; },

    get duration() { return this._syncData.duration; },

    get movieID() { return this._syncData.movieID; },

    get networkProfile() { return this._syncData.networkProfile; },
    set networkProfile(t) { nrdp._setProperty("media", "networkProfile", t); },

    get state() { return this._syncData.state; },

    get subtitleOutputMode() { return this._syncData.subtitleOutputMode; },
    set subtitleOutputMode(m) { nrdp._setProperty("media", "subtitleOutputMode", m); },

    get subtitleProfile() { return this._syncData.subtitleProfile; },
    set subtitleProfile(p) { nrdp._setProperty("media", "subtitleProfile", p); },

    get subtitleTrackList() { return this._syncData.subtitleTrackList; },

    /*
    get trickplayList() { return this._syncData.trickplayList; },
     */

    get throttled() { return this._syncData.throttled; },
    set throttled(e) { nrdp._setProperty("media", "throttled", e); },

    get xid() { return nrdp.log.xid; },

    // stream types
    get UNKNOWN_STREAM() { return -1; },
    get AUDIO_STREAM() { return 0; },
    get VIDEO_STREAM() { return 1; },
    get TIMEDTEXT_STREAM() { return 2; },

    // IMediaControl state
    get OPENING() { return 0; },
    get PLAYING() { return 1; },
    get PAUSED() { return 2; },
    get STOPPED() { return 3; },
    get CLOSED() { return 4; },

    // NetworkProfile
    get WIRED() { return 0; },
    get WIFI() { return 1; },
    get MOBILE() { return 2; },

    // playback types
    get STANDARD_PLAYBACK() { return 1; },
    get BROWSE_PLAYBACK() { return 2; },

    // subtitle output modes
    get EVENTS() { return 0; },
    get DATA_XML() { return 1; },
    get DATA_JSON() { return 2; },

	// subtitle profiles
    get SIMPLE() { return 0; },
    get ENHANCED() { return 1; },

    open: function open(movieId, trackerId, params, playbackType, videoType) {
        var args = {movieId: movieId, trackerId: trackerId};
        if (playbackType != undefined && playbackType != null)
            args.playbackType = playbackType;
        if (videoType != undefined && videoType != null)
            args.videoType = videoType;
        if (params)
            args.params = params;
        nrdp._invoke("media", "open", args);
    },

    openAndPlay: function openAndPlay(args) {
        if (!args.pts) args.pts = 0;
        nrdp._invoke("media", "open", args);
    },

    close: function close() {
        nrdp._invoke("media", "close");
    },

    play: function play(ms) {
        var args = {};
        if (ms !== undefined && ms !== null)
            args.ms = ms;
        nrdp._invoke("media", "play", args);
    },

    stop: function stop() { nrdp._invoke("media", "stop"); },
    pause: function pause() { nrdp._invoke("media", "pause"); },
    unpause: function unpause() { nrdp._invoke("media", "unpause"); },

    getBufferRange: function getBufferRange() { nrdp._invoke("media", "getBufferRange"); },

    skip: function skip(ms) { nrdp._invoke("media", "skip", {pts:ms}); },

    setVideoWindow: function setVideoWindow(x, y, width, height, transitionDuration) {
        var args = {
            x: x,
            y: y,
            width: width,
            height: height,
            transitionDuration: transitionDuration
        };
        nrdp._invoke("media", "setVideoWindow", args);
    },

    setVideoOutputMode: function setVideoOutputMode(mode) { nrdp._invoke("media", "setVideoOutputMode", {mode: mode}); },

    bringToFront: function bringToFront() { nrdp._invoke("media", "bringToFront"); },
    sendToBack: function sendToBack() { nrdp._invoke("media", "sendToBack"); },

    transitionPlaybackType: function transitionPlaybackType() { nrdp._invoke("media", "transitionPlaybackType"); },

    setVideoBitrateRanges: function setVideoBitrateRanges(ranges) {
        nrdp._invoke("media", "setVideoBitrateRanges", {ranges: ranges});
    },

    setAudioBitrateRange: function setAudioBitrateRange(min, max) {
        nrdp._invoke("media", "setAudioBitrateRange", {minBitrate: min, maxBitrate: max});
    },

    setVideoResolutionRange: function setVideoResolutionRange(minWidth, maxWidth, minHeight, maxHeight) {
        nrdp._invoke("media", "setVideoResolutionRange",
                     {minWidth: minWidth, maxWidth: maxWidth, minHeight: minHeight, maxHeight: maxHeight});
    },

    setStreamingBuffer: function setStreamingBuffer(powerSaving, maxBufferLen, minBufferLen) {
        nrdp._invoke("media", "setStreamingBuffer",
                     {powerSaving: powerSaving,
                      maxBufferLen: maxBufferLen,
                      minBufferLen: minBufferLen});
    },

    swim: function swim(pts, absolute, fuzz, allowRebuffer) {
        var args = { pts: pts };
        if (typeof absolute == "boolean")
            args.absolute = absolute;
        if (typeof fuzz == "number" && !isNaN(fuzz))
            args.fuzz = fuzz;
        if (typeof allowRebuffer == "boolean")
            args.allowRebuffer = allowRebuffer;
        nrdp._invoke("media", "swim", args);
    },

    selectTracks: function selectTracks(audio, subtitle) {
        nrdp._invoke("media", "selectTracks", {audio: audio, subtitle: subtitle});
    },

    obtainStreamingStat: function obtainStreamingStat() {
        nrdp._invoke("media", "obtainStreamingStat");
    },
    obtainPlaybackStat: function obtainPlaybackStat() {
        nrdp._invoke("media", "obtainPlaybackStat");
    },

    cache: {
        _path: "media.cache",
        addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
        removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

        get FULL_MANIFEST() { return 0; },
        get DRM_MANIFEST() { return 1; },
        get NONDRM_MANIFEST() { return 2; },

        setMaxSize: function setMaxSize(count) { nrdp._invoke("media", "setMaxCacheSize", {size: count}); },
        setMaxByteSize: function setMaxByteSize(bytes) { nrdp._invoke("media", "setMaxCacheByteSize", {size: bytes}); },
        setManifestType: function setManifestType(type) { nrdp._invoke("media", "setCacheManifestType", {type: type}); },

        // IManifestCache defines setAudioBitrateRange and
        // setVideoResolutionRange, but for backwards compatibility,
        // just use the same function on nrdp.media instead of
        // nrdp.media.cache.

        schedule: function schedule(ids) { nrdp._invoke("media", "cacheSchedule", {ids: ids}); },
        pause: function pause() { nrdp._invoke("media", "cachePause"); },
        resume: function resume() { nrdp._invoke("media", "cacheResume"); },
        flush: function flush() { nrdp._invoke("media", "cacheFlush"); }
    },

    _handleEvent: function _handleEvent(event) {
        if (event.name == "Nccp") {
            if (event.data.origin != "complete")
                event.data.type = "nccperror";
            else
                event.data.type = "nccpcomplete";
        } else if (event.name == "cache.nccp") {
            if (event.data.origin != "complete") {
                event.data.type = "nccp";
                nrdp._callEventListeners(this.cache, event.data);
            }
            return true;
        } else if (event.name != "IMediaControl") {
            return false;
        }

        if (event.data.type == "subtitledata" && event.data.success) {
            nrdp._fixXml(event.data.object);
        }

        nrdp._callEventListeners(this, event.data);
        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.ntba = {
    _nextIdx: 1,
    _cbs: {},

    get contexts() { return this._syncData.contexts; },
    get provisionType() { return this._syncData.provisionType; },

    _fn: function _fn(name, params, cb) {
        if (!params) params = {};
        if (typeof params.context === "undefined") delete params["context"];
        params.idx = this._nextIdx++;
        this._cbs[params.idx] = cb;
        nrdp._invoke("ntba", name, params);
        return params.idx;
    },

    _handleEvent: function _handleEvent(event) {
        if (event.name != "returnValue" ||
            !event.data || !event.data.idx) {
            return false;
        }

        if (typeof this._cbs[event.data.idx] == "function") {
            this._cbs[event.data.idx](event.data.data, event.data.idx);
            delete this._cbs[event.data.idx];
        }

        return true;
    },

    beginTransaction: function beginTransaction(context, type, cb) {
        return nrdp.ntba._fn("beginTransaction", {context: context}, cb);
    },

    endTransaction: function endTransaction(context, cb) {
        return nrdp.ntba._fn("endTransaction", {context: context}, cb);
    },

    getDHPublicKey: function getDHPublicKey(context, cb) {
        return nrdp.ntba._fn("getDHPublicKey", {context: context}, cb);
    },

    getNpTicket: function getNpTicket(cb) {
        return nrdp.ntba._fn("getNpTicket", null, cb);
    },

    resetNpTicket: function resetNpTicket(cb) {
        return nrdp.ntba._fn("resetNpTicket", null, cb);
    },

    provision: function provision(context, serverkey, cb) {
        return nrdp.ntba._fn("provision", {context: context, serverkey: serverkey}, cb);
    },

    createCticket: function createCticket(context, cticket, serverkey, expiration, cb) {
        return nrdp.ntba._fn("createCticket", {context: context,
                                               cticket: cticket,
                                               serverkey: serverkey,
                                               expiration: expiration}, cb);
    },

    getCticket: function getCticket(cb) {
        return nrdp.ntba._fn("getCticket", {}, cb);
    },

    clearCticket: function clearCticket(context, cb) {
        return nrdp.ntba._fn("clearCticket", {context: context}, cb);
    },

    setRegistered: function setRegistered(reg, cb) {
        return nrdp.ntba._fn("setRegistered", {reg: reg}, cb);
    },

    setUnregistered: function setUnregistered(context, cb) {
        return nrdp.ntba._fn("setUnregistered", {context: context}, cb);
    },

    encrypt: function encrypt(context, data, cb) {
        return nrdp.ntba._fn("encrypt", {context: context, data: data}, cb);
    },

    compressAndEncrypt: function compressAndEncrypt(context, data, cb) {
        return nrdp.ntba._fn("encrypt", {context: context, data: data, compressed: true}, cb);
    },

    decrypt: function decrypt(context, data, cb) {
        return nrdp.ntba._fn("decrypt", {context: context, data: data}, cb);
    },

    decryptAndDecompress: function decryptAndDecompress(context, data, cb) {
        return nrdp.ntba._fn("decrypt", {context: context, data: data, compressed: true}, cb);
    },

    sign: function sign(context, data, cb) {
        return nrdp.ntba._fn("sign", {context: context, data: data}, cb);
    },

    verify: function verify(context, data, headers, cb) {
        return nrdp.ntba._fn("verify", {context: context, data: data, headers: headers}, cb);
    },

    hmac: function hmac(context, data, cb) {
        return nrdp.ntba._fn("hmac", {context: context, data: data}, cb);
    },

    hash: function hash(algo, data, cb) {
        return nrdp.ntba._fn("hash", {algo: algo, data: data}, cb);
    }

};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.player = {
    _path: "player",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get algorithms() { return this._syncData.algorithms; },

    get bufferPoolSize() { return this._syncData.bufferPoolSize; },

    get currentTracks() { return this._syncData.currentTracks; },
    set currentTracks(tracks) { nrdp._setProperty("player", "currentTracks", tracks.join(",")); },

    get duration() { return this._syncData.duration; },

    get force2D() { return this._syncData.force2D; },
    set force2D(t) { nrdp._setProperty("player", "force2D", t); },

    get maxStreamingBuffer() { return this._syncData.maxStreamingBuffer; },
    set maxStreamingBuffer(t) { nrdp._setProperty("player", "maxStreamingBuffer", t); },

    get networkProfile() { return this._syncData.networkProfile; },
    set networkProfile(t) { nrdp._setProperty("player", "networkProfile", t); },

    get state() { return this._syncData.state; },

    get throttled() { return this._syncData.throttled; },
    set throttled(t) { nrdp._setProperty("player", "throttled", t); },

    // IAdaptiveStreamingPlayer state
    get OPENING() { return 0; },
    get PLAYING() { return 1; },
    get PAUSED() { return 2; },
    get STOPPED() { return 3; },
    get CLOSED() { return 4; },

    // NetworkProfile
    get WIRED() { return 0; },
    get WIFI() { return 1; },
    get MOBILE() { return 2; },

    // MediaType
    get MEDIA_UNKNOWN() { return -1; },
    get MEDIA_AUDIO() { return 0; },
    get MEDIA_VIDEO() { return 1; },
    get MEDIA_TEXT() { return 2; },

    // AudioTrackType
    get UNKNOWN_AUDIO() { return -1; },
    get PRIMARY_AUDIO() { return 0; },
    get COMMENTARY_AUDIO() { return 1; },
    get ASSISTIVE_AUDIO() { return 2; },

    setAlgorithm: function setAlgorithm(algorithm, config) {
        nrdp._invoke("player", "setAlgorithm", {algorithm: algorithm});
        /* XXX config */
    },

    fail: function fail(movieId, nferr, nccpErr, msg) {
        nrdp._invoke("player", "fail",
                     {movieId: movieId, nferr: nferr, nccpErr: nccpErr, msg: msg});
    },

    open: function open(movieId, cdninfo, manifest, authtime, videoType) {
        nrdp._invoke("player", "open",
                     {movieId: movieId, cdninfo: cdninfo, manifest: manifest, authtime: authtime, videoType: videoType});
    },

    close: function close() { nrdp._invoke("player", "close"); },

    play: function play(pts) {
        var args = {};
        if (pts != undefined && pts != null)
            args.pts = pts;
        /* XXX audio track */
        nrdp._invoke("player", "play", args);
    },

    skip: function skip(ms) { nrdp._invoke("player", "skip", {pts:ms}); },

    getBufferRange: function getBufferRange() { nrdp._invoke("player", "getBufferRange"); },

    setVideoBitrateRanges: function setVideoBitrateRanges(ranges) {
        nrdp._invoke("player", "setVideoBitrateRange", {ranges: ranges});
    },

    selectManifestStreams: function selectManifestStreams(streams, track) {
        streams = Array.isArray(streams) ? streams : [];
        var val = streams.join(",");
        nrdp._invoke("player", "selectManifestStreams", {streamIndices: val, trackIndex: track});
    },

    provideLicense: function provideLicense(license) { nrdp._invoke("player", "provideLicense", {license: license}); },

    stop: function stop() { nrdp._invoke("player", "stop"); },

    pause: function pause() { nrdp._invoke("player", "pause"); },

    unpause: function unpause() { nrdp._invoke("player", "unpause"); },

    setVideoWindow: function setVideoWindow(x, y, width, height, transitionDuration) {
        var args = {
            x: x,
            y: y,
            width: width,
            height: height,
            transitionDuration: transitionDuration
        };
        nrdp._invoke("player", "setVideoWindow", args);
    },

    bringVideoToFront: function bringVideoToFront() { nrdp._invoke("player", "bringVideoToFront"); },
    sendVideoToBack: function sendVideoToBack() { nrdp._invoke("player", "sendVideoToBack"); },

    _nextIdx: 1,
    _cbs: {},
    getSecureStops: function getSecureStops(cb) {
        nrdp.player._cbs[nrdp.player._nextIdx] = cb;
        nrdp._invoke("player", "getSecureStops", {idx: nrdp.player._nextIdx++});
    },
    commitSecureStop: function commitSecureStop(sessionID) {
        nrdp._invoke("player", "commitSecureStop", {sessionID: sessionID});
    },

    _handleEvent: function _handleEvent(event) {
        if (event.name == "getSecureStops") {
            var idx = event.data.idx;
            var cbs = nrdp.player._cbs;
            if (cbs[idx]) {
                cbs[idx](event.data.stops);
                delete cbs[idx];
            }
        } else if (event.name == "IASPlayer") {
            nrdp._callEventListeners(this, event.data);
        } else {
            return false;
        }

        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.registration = {
    _path: "registration",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get deviceAccounts() { return this._syncData.deviceAccounts; },
    get currentDeviceAccount() { return this._syncData.currentDeviceAccount; },

    get registered() { return this._syncData.registered; },
    get appResetRequired() { return this._syncData.appResetRequired; },
    get activationTokens() {
        var accounts = this.deviceAccounts;
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].accountKey === this.currentDeviceAccount) {
                return accounts[i].tokens;
            }
        }
        return {};
    },
    set activationTokens(tokens) {
        if (this.currentDeviceAccount === null) return;
        nrdp._invoke("registration", "setActivationTokens", tokens);
    },

    get UILanguages() {
        for (var i = 0; i < this.deviceAccounts.length; i++) {
            if (this.deviceAccounts[i].accountKey === this.currentDeviceAccount) {
                return this.deviceAccounts[i].UILanguages;
            }
        }
        // fall back to "no device account" UI langauges"
        return nrdp.device.UILanguages;
    },
    set UILanguages(langs) {
        if (this.currentDeviceAccount === null) return;
        langs = Array.isArray(langs) ? langs : [];
        var val = langs.join(',');
        nrdp._invoke("registration", "setUILanguages", {languages: val});
    },

    createDeviceAccount: function createDeviceAccount(cb) {
        nrdp.registration._fn("createDeviceAccount", null, cb);
    },
    selectDeviceAccount: function selectDeviceAccount(dak, cb) {
        nrdp.registration._fn("selectDeviceAccount", {key: dak}, cb);
    },
    unselectDeviceAccount: function unselectDeviceAccount(cb) {
        nrdp.registration._fn("unselectDeviceAccount", null, cb);
    },

    ping: function ping() {
        nrdp._invoke("registration", "ping");
    },
    validateCticket: function validateCticket(dak) {
        nrdp._invoke("registration", "validateCticket", {key: dak});
    },
    getDeviceTokens: function getDeviceTokens() {
        nrdp._invoke("registration", "getDeviceTokens");
    },

    tokenActivate: function tokenActivate(tokens) {
        if (nrdp.registration.currentDeviceAccount === null) return;
        nrdp._invoke("registration", "tokenActivate", tokens);
    },
    emailActivate: function emailActivate(email, passwd) {
        if (nrdp.registration.currentDeviceAccount === null) return;
        nrdp._invoke("registration", "emailActivate", {email: email, passwd: passwd});
    },
    esnMigration: function esnMigration() {
        if (nrdp.registration.currentDeviceAccount === null) return;
        nrdp._invoke("registration", "esnMigration");
    },
    mdxActivate: function mdxActivate(targetUuid,
                          cticket,
                          nonce,
                          controllerPin,
                          pin,
                          controllerUuid,
                          registerDataHmac,
                          cb) {
        if (nrdp.registration.currentDeviceAccount === null) return;
        this._datas[controllerUuid] = {cb: cb, results: []};
        var args = { targetUuid      : targetUuid,
                     cticket         : cticket,
                     nonce           : nonce,
                     controllerPin   : controllerPin,
                     pin             : pin,
                     controllerUuid  : controllerUuid,
                     registerDataHmac: registerDataHmac
                   };
        nrdp._invoke("registration", "mdxActivate", args);
    },
    mdxActivateFinish: function mdxActivateFinish(controllerUuid) {
        delete this._datas[controllerUuid];
    },

    massDeactivationCheck: function massDeactivationCheck() {
        nrdp._invoke("registration", "massDeactivationCheck");
    },

    deactivate: function deactivate(dak, cb) {
        nrdp.storage.clear(dak);
        nrdp.registration._fn("deactivate", {key: dak}, cb);
    },
    deactivateAll: function deactivateAll(cb) {
        nrdp.device.factoryReset(cb);
    },

    _nextIdx: 1,
    _cbs: {},
    _datas: {},
    _fn: function _fn(name, args, cb) {
        if (!args) args = {};
        args.idx = this._nextIdx++;
        this._cbs[args.idx] = cb;
        nrdp._invoke("registration", name, args);
    },

    _handleEvent: function _handleEvent(event) {
        if (event.data && event.data.idx) {
            if (typeof this._cbs[event.data.idx] == "function") {
                this._cbs[event.data.idx](event.data);
                delete this._cbs[event.data.idx];
            }
        } else if (event.name == "bind" || event.name == "activate") {
            return nrdp._handleNccpEvent(this, event);
        } else if (event.name == "mdxActivateComplete" || event.name == "mdxActivate") {
            if (event.data && (event.data.controlleruuid || (event.data.data && event.data.data.controlleruuid))) {
                var uuid_c = event.data.data ? event.data.data.controlleruuid : event.data.controlleruuid;
                var storedData = this._datas[uuid_c];
                if (storedData) {
                    storedData.results.push(event.data);
                    if(event.data.origin === "complete") {
                        storedData.cb(storedData.results);
                    }
                }
            }
        } else if (event.name == "bindComplete" ||
                   event.name == "activateComplete" ||
                   event.name == "cticketValidity" ||
                   event.name == "deactivated") {
            nrdp._callEventListeners(this, event.data);
        } else {
            return false;
        }
        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.storage = {
    _path: "storage",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get NO_DEVICE_ACCOUNT() { return "NDAKADN"; },

    get size() { return this._syncData.data ? JSON.stringify(this._syncData.data).length : 0; },

    get transientData() { return this._syncData.transientData; },
    set transientData(d) {
        this._syncData.transientData = d;
        nrdp._setProperty("storage", "transientData", d);
    },

    length: function length(dak) {
        var data = nrdp.storage._getData(dak);
        var count = 0;
        for (var key in data) {
            if (data[key] != undefined)
                count++;
        }
        return count;
    },

    key: function key(dak, n) {
        var data = nrdp.storage._getData(dak);
        for (var key in data) {
            if (data[key] == undefined)
                continue;
            if (n == 0)
                return key;
            n--;
        }
        return undefined;
    },

    _normalizeKey: function _normalizeKey(key) {
        if (key === undefined)
            return "undefined";
        else if (key === null)
            return "null";
        else
            return key.toString();
    },

    getItem: function getItem(dak, key) {
        var stor = nrdp.storage;
        var data = stor._getData(dak);
        return data[stor._normalizeKey(key)];
    },

    setItem: function setItem(dak, key, value) {
        var stor = nrdp.storage;
        var data = stor._getData(dak);
        key = stor._normalizeKey(key);
        data[key] = value;
        nrdp._invoke("storage", "setItem", {dak: dak, key: key, value: value});
    },

    removeItem: function removeItem(dak, key) {
        var stor = nrdp.storage;
        var data = stor._getData(dak);
        key = stor._normalizeKey(key);
        if (data.hasOwnProperty(key))
            delete data[key];
        nrdp._invoke("storage", "removeItem", {dak: dak, key: key});
    },

    clear: function clear(dak) {
        if (nrdp.storage._syncData.data)
            delete nrdp.storage._syncData.data[dak];
        nrdp._invoke("storage", "clear", {dak: dak});
    },

    _clearAll: function _clearAll() {
        nrdp.storage._syncData = {
            data: {}
        };
        nrdp._invoke("storage", "clearAll");
    },

    disk: {
        get size() { return nrdp.storage._syncData.diskStoreSize; },
        getSize: function getSize(cb) {
            nrdp.storage._fn("diskStoreGetSize", {}, cb);
        },
        create: function create(dak, key, value, cb) {
            nrdp.storage._fn("diskStoreCreate", {dak:dak, key:key, value:value}, cb);
        },
        append: function append(dak, key, value, cb) {
            nrdp.storage._fn("diskStoreAppend", {dak:dak, key:key, value:value}, cb);
        },
        remove: function remove(dak, key, cb) {
            nrdp.storage._fn("diskStoreRemove", {dak:dak, key:key}, cb);
        },
        read: function read(dak, key, begin, end, cb) {
            nrdp.storage._fn("diskStoreRead", {dak:dak, key:key, begin:begin, end:end}, cb);
        }
    },

    _getData: function _getData(dak) {
        if (!this._syncData)
            this._syncData = { data: {} };
        else if (!this._syncData.data)
            this._syncData.data = {};
        if (!this._syncData.data[dak])
            this._syncData.data[dak] = {};
        return this._syncData.data[dak];
    },

    setPersistentData: function setPersistentData(dak, key, data, deflate, cb) {
        nrdp.storage._fn("setPersistentData",
                         {dak:dak, key:key, data:data, deflate:deflate}, cb);
    },
    unsetPersistentData: function unsetPersistentData(dak, key, cb) {
        nrdp.storage._fn("unsetPersistentData",
                         {dak:dak, key:key}, cb);
    },
    getPersistentData: function getPersistentData(dak, key, inflate, cb) {
        nrdp.storage._fn("getPersistentData",
                         {dak:dak, key:key, inflate:inflate}, cb);
    },

    _nextIdx: 1,
    _cbs: {},
    _fn: function _fn(name, args, cb) {
        if (!args) args = {};
        args.idx = this._nextIdx++;
        this._cbs[args.idx] = cb;
        nrdp._invoke("storage", name, args);
    },

    _handleEvent: function _handleEvent(event) {
        if (event.data && event.data.idx) {
            if (typeof this._cbs[event.data.idx] == "function") {
                this._cbs[event.data.idx](event.data);
            }
            delete this._cbs[event.data.idx];
        } else if (event.name == "overbudget") {
            event.data.type = event.name;
            nrdp._callEventListeners(this, event.data);
        } else {
            return false;
        }
        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.system = {
    get bootURL() { return this._syncData.bootUrl; },
    get bootURLTime() { return this._syncData.bootUrlTime; },

    setLocation: function(url) { nrdp._invoke("system", "setLocation", {location: url}); },

    updateTrustStore: function() { nrdp._invoke("system", "updateTrustStore"); },
    clearErrorCache: function() { nrdp._invoke("system", "clearErrorCache"); },

    _handleEvent: function(event) {
        if (event.name == "keypress") {
            var keyCode = -1;
            for (key in nrdpPartner.Keys) {
                if (nrdpPartner.Keys[key] == event.data) {
                    keyCode = key;
                    break;
                }
            }

            if (keyCode == -1) {
                nrdp.log.warn("Unknown key: " + event.data);
                return false;
            } else {
                //nrdp.log.trace("Dispatching key " + event.data + ", keycode " + keyCode);
                if (window.nrdp_platform != null && window.nrdp_platform.sendKey != null) {
                    nrdp_platform.sendKey(keyCode);
                } else {
                    var downEvent = document.createEvent("Event");
                    downEvent.initEvent("keydown", true, true);
                    downEvent.which = keyCode;
                    document.dispatchEvent(downEvent);
                    var upEvent = document.createEvent("Event");
                    upEvent.initEvent("keyup", true, true);
                    upEvent.which = keyCode;
                    document.dispatchEvent(upEvent);
                }
            }
            return true;
        } else {
            return false;
        }
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.network = {
    _path: "network",
    addEventListener: function(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    _urlIndex:0,
    _dnsIndex:0,
    _urlList: [],
    _datas: {},
    _errorStack: [],
    _googleDNS: "8.8.8.8",
    _netflixDomain : "netflix.com",
    _isDiagnoseRunning: false,
    _abortDiagnosis: false,
    _abortDiagnosisCb:0,

    CONNTIMEOUT: 6000,
    DATATIMEOUT: 4000,

    CONNECTIONSTATE : {
        CONNECTED : 0,
        DISCONNECTED : 1,
        UNKNOWN : 2
    },

    ERRORGROUP : {
        SUCCESS : 0,
        NO_IP_ADDRESS : 1,
        CONNECTIVITY_ERROR  : 2,
        DNS_ERROR  : 3,
        SSL_ERROR  : 4,
        CRL_OCSP_ERROR  : 5,
        HTTP_ERROR : 6,
        DNS_CHECK : 7,
        UNKNOWN_ERROR: 1000
    },
    ERRORCODE : {
        SUCCESS : 0,
        NOT_SECURE_ERROR  : 1,
        FILE_ACCESS_ERROR  : 2,
        DATA_URI_ERROR : 3,
        CONNECT_ERROR : 4,
        TIMEOUT : 5,
        DNS_ERROR : 6,
        SSL__HANDSHAKE_ERROR  : 7,
        SSL_CA_CERT_ERROR : 8,
        SSL_CA_CERT_FILE_ERROR : 9,
        CERT_STATUS_SSL_ERROR  : 10,
        CERT_STATUS_REVOKED  : 11,
        CERT_STATUS_PEW_REVOKED  : 12,
        SEND_ERROR : 13,
        RECEIVE_ERROR : 14,
        NO_DNS_SERVER :16,
        UNKNOWN_ERROR: 1000
    },
    RECOMMENDEDACTION : {
        RETRY : 0,
        RESTART  : 1,
        REACTIVATE  : 2,
        MODIFY_DNS : 3,
        REDIRECT_SETTINGS : 4,
        REINSTALL : 5,
        RUNDIAGTOOL : 6,
        LOG_ERROR  : 7
    },
    DNSERRORS : {
        SUCCESS : 0,
        NODATA  : 1,
        EFORMERR  : 2,
        SERVFAIL  : 3,
        NOTFOUND : 4,
        NOTIMP : 5,
        REFUSED : 6,
        BADQUERY : 7,
        BADNAME  : 8,
        BADFAMILY : 9,
        BADRESP : 10,
        CONNREFUSED : 11,
        TIMEOUT : 12,
        EOF : 13,
        EFILE : 14,
        NOMEM : 15,
        NODNSSERVER : 16,
        OTHER : 17
    },

    _sendCompletedEvent: function(ra) {
        this._urlIndex = 0;
        this._dnsIndex = 0;
        this._urlList = [];
        var endEvent = {
            type: "diagnosisResult",
            resultArray: this._errorStack,
            recommendedAction: ra
        };
        this._errorStack = [];
        this._isDiagnoseRunning = false;
        nrdp._callEventListeners(this, endEvent);
    },

    _sendAbortCb: function() {
        this._urlIndex = 0;
        this._dnsIndex = 0;
        this._urlList = [];
        this._errorStack = [];
        this._isDiagnoseRunning = false;
        this._abortDiagnosis = false;
        if (nrdp.network._abortDiagnosisCb) {
            nrdp.network._abortDiagnosisCb(true);
        }
    },
    _getDomain: function(url) {
        return url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];
    },
    _dnsCallback: function (data, dns) {
        if (this._abortDiagnosis) {
            this._sendAbortCb();
            return;
       }
        var event = {
            URL: data.url,
            errorgroup: this.ERRORGROUP.DNS_CHECK,
            errorcode: (data.result > this.DNSERRORS.NOMEM) ?
                 this.DNSERRORS.OTHER :    
                data.result,
            // recommendedAction: data.result,
            dnsip: dns,
            type: "diagnosisStatus",
            success: !data.result
        };
        nrdp._callEventListeners(this, event);
        this._errorStack.push(event);

        if ((dns == this._googleDNS) && (nrdp.device.dnslist.length < this._dnsIndex)) {
            var myurl;
            if (nrdp.nccpURL.indexOf(data.url) != -1) {
                myurl = nrdp.nccpURL;
            } else {
                myurl = nrdp.bootURL;
            }
            this._dnsIndex = 0;
            this._continueDiag(myurl);
            return;
        }
        if (nrdp.device.dnslist.length > this._dnsIndex) {
            var nextdns = nrdp.device.dnslist[this._dnsIndex++];
            this.checkDNS(nextdns, event.URL, function(evt) {
                nrdp.network._dnsCallback(evt, nextdns);
            });
        } else {
            // now check google DNS
            this._dnsIndex++;
            this.checkDNS(this._googleDNS, event.URL, function(evt) {
                nrdp.network._dnsCallback(evt, nrdp.network._googleDNS);
            });
        }
    },
    _continueDiag: function(url) {
       if (this._abortDiagnosis) {
            this._sendAbortCb();
            return;
       }
       if (url == nrdp.nccpURL) {
            this.getOperation(nrdp.bootURL,
                              this.CONNTIMEOUT,
                              this.DATATIMEOUT,
                              function(evt) {
                                  nrdp.network._nflxUrlCallback(evt, nrdp.bootURL);
                              });
        } else {
            if (this._urlList.length > this._urlIndex) {
                this.getOperation(this._urlList[this._urlIndex++],
                                  this.CONNTIMEOUT,
                                  this.DATATIMEOUT,
                                  function(evt) {
                                      nrdp.network._getCallback(evt);
                                  });
            } else {
                // completed. send complete event
                var reco = this.RECOMMENDEDACTION.RETRY;
                for (var index in this._errorStack) {
                    if ( (this._errorStack[index].errorcode == this.ERRORCODE.DNS_ERROR) &&  (reco == this.RECOMMENDEDACTION.RETRY) ){
                        reco = this.RECOMMENDEDACTION.REDIRECT_SETTINGS;
                    }else if ( (this._errorStack[index].errorcode == this.ERRORCODE.CERT_STATUS_PEW_REVOKED) &&  (reco == this.RECOMMENDEDACTION.RETRY) ){
                        reco = this.RECOMMENDEDACTION.REACTIVATE;
                    }
                }
                this._sendCompletedEvent(reco);
            }
        }    
    },
    _nflxUrlCallback: function(data, url) {
        if (!this._isDiagnoseRunning) {
            return;
        }
        if (this._abortDiagnosis) {
            this._sendAbortCb();
            return;
        }
        var event = {
            URL: data.url,
            errorgroup: data.errorgroup,
            errorcode: data.errorcode,
            // recommendedAction: data.result,
            type: "diagnosisStatus",
            success: !data.result
        };
        if (event.errorcode == this.ERRORCODE.DNS_ERROR) {
            //do dnscheck;
            if (nrdp.device.dnslist.length <= 0) {
                event.errorcode = this.ERRORCODE.NO_DNS_SERVER;
                nrdp._callEventListeners(this, event);
                this._errorStack.push(event);
                this._sendCompletedEvent(this.RECOMMENDEDACTION.REDIRECT_SETTINGS);
            } else {
                nrdp._callEventListeners(this, event);
                this._errorStack.push(event);
                var dns = nrdp.device.dnslist[this._dnsIndex++];
                // XXX any reason not to check using all DNS servers at same time?
                this.checkDNS(dns,
                              nrdp.network._getDomain(event.URL),
                              function(evt) {
                                  nrdp.network._dnsCallback(evt, dns);
                              });
            }
            return;
        } else if (event.errorcode == this.ERRORCODE.CERT_STATUS_PEW_REVOKED) {
            nrdp._callEventListeners(this, event);
            this._errorStack.push(event);
            if (nrdp.gibbon) {
                // clear app error Cache
                nrdp.log.error("Received CERT_STATUS_PEW_REVOKED - Clearing App error cache", undefined,"networkerror");
                nrdp.system.clearErrorCache();
                // clear lib error Cache
                nrdp.log.error("Received CERT_STATUS_PEW_REVOKED - Clearing Lib error cache", undefined,"networkerror");
                nrdp.device.clearErrorCache();
            }
            this._sendCompletedEvent(this.RECOMMENDEDACTION.RETRY);
            return;
            
        } 
        
        nrdp._callEventListeners(this, event);
        this._errorStack.push(event);
        this._continueDiag(url);

    },

    _getCallback: function(data) {
        if (!this._isDiagnoseRunning) {
            return;
        }
        if (this._abortDiagnosis) {
            this._sendAbortCb();
            return;
        }
        var event = {
            URL: data.url,
            errorgroup: data.errorgroup,
            errorcode: data.errorcode,
            // recommendedAction: data.result;
            type: "diagnosisStatus",
            success: !data.result
        };

        // XXX take same action if !event.success as _nflxUrlCallback?
        // recommendation to REACTIVATE if PEW revoked and recommendation to REDIRECT  for DNS error
        nrdp._callEventListeners(this, event);
        this._errorStack.push(event);
        if (this._urlList.length > this._urlIndex) {
            this.getOperation(this._urlList[this._urlIndex++],
                              this.CONNTIMEOUT,
                              this.DATATIMEOUT,
                              function(evt) {
                                  nrdp.network._getCallback(evt);
                              });
        } else {
            var reco = this.RECOMMENDEDACTION.RETRY;
            for (var index in this._errorStack) {
                if ( (this._errorStack[index].errorcode == this.ERRORCODE.DNS_ERROR) &&  (reco == this.RECOMMENDEDACTION.RETRY) ){
                    reco = this.RECOMMENDEDACTION.REDIRECT_SETTINGS;
                }else if ( (this._errorStack[index].errorcode == this.ERRORCODE.CERT_STATUS_PEW_REVOKED) &&  (reco == this.RECOMMENDEDACTION.RETRY) ){
                    reco = this.RECOMMENDEDACTION.REACTIVATE;
                }
            }
            this._sendCompletedEvent(reco);
        }
    },

    _isValidIpAvailable: function() {
        var ifList = nrdp.device.iflist;
        var found = false;
        for (var index in ifList) {
            if ( (ifList[index].ipAddress) &&
                 // XXX this list won't work for ipv6
                 // XXX localdomain subnet is class A, should check that it starts with 127
                 (ifList[index].ipAddress.indexOf("127", 0) != 0) && 
                 (ifList[index].ipAddress != "0.0.0.0") &&
                 (ifList[index].ipAddress != "") &&
                 // XXX broken if the IP is 192.168.0.169
                 (ifList[index].ipAddress.indexOf("169", 0) != 0) ) {
                found = true;
                //nrdp.log.trace("IP address is " + ifList[index].ipAddress);
                break;
            }
        }
        return found;
    },

    diagnose: function(urls) {
        nrdp.network._datas = {};
        if (!nrdp.network._isValidIpAvailable()) {
            var event = {
                URL: "",
                errorgroup: nrdp.network.ERRORGROUP.NO_IP_ADDRESS,
                errorcode: nrdp.network.ERRORCODE.UNKNOWN_ERROR,
                type: "diagnosisStatus",
                success: false
            };
            nrdp._callEventListeners(nrdp.network, event);
            nrdp.network._errorStack.push(event);
            nrdp.network._sendCompletedEvent(nrdp.network.RECOMMENDEDACTION.REDIRECT_SETTINGS); 
            return;
        }
        if (!nrdp.network._abortDiagnosis) {
            nrdp.network._isDiagnoseRunning = true;
            // XXX need to handle multiple calls to diagnose in parallel?
            nrdp.network._urlList = urls;
            // XXX any reason not to check all urls at the same time?
            nrdp.network.getOperation(nrdp.nccpURL,
                                      nrdp.network.CONNTIMEOUT,
                                      nrdp.network.DATATIMEOUT,
                                      function(evt) {
                                          nrdp.network._nflxUrlCallback(evt, nrdp.nccpURL);
                                      });
        } else {
            nrdp.network._abortDiagnosis = false;
            nrdp.network._abortDiagnosisCb(true); 
        }
    },

    abortDiagnosis: function(abortCb) {
        if (nrdp.network._isDiagnoseRunning) {
            nrdp.network._abortDiagnosis = true;
            nrdp.network._abortDiagnosisCb = abortCb;
        }
    },

    getOperation: function(url, connectiontimeout, datatimeout, callback) {
        // XXX what if there's two get operations for the same url at the same time?
        nrdp.network._datas[url] = {cb: callback, results: {}};
        nrdp._invoke("network", "get",
                     {url: url, connectiontimeout: connectiontimeout, datatimeout: datatimeout});
    },

    checkDNS: function(dnsip, url, callback) {
        // XXX what if there's two checks for the same url at the same time?
        nrdp.network._datas[url] = {cb: callback, results: {}};
        nrdp._invoke("network", "checkdns", {dnsip: dnsip, url: url});
    },

    _handleEvent: function(event) {
        if (event.name != "INetwork") {
            return false;
        }
        if ( (event.data.type !== "dnsresult") && (event.data.type !== "getresult") ){
            return false;
        }

        var url = event.data.url;
        var data = this._datas[url];
        if (data) {
            data.results = event.data;
            data.cb(data.results);
            // XXX how does nrdp.network._datas get cleaned up?
        }

        return true;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.gibbon = {
    _callback: 1,
    _callbacks: {},

    _nextWidgetId: 1,

    INT_MAX: 0x7fffffff,

    get PENDING() { return 0; },
    get SUCCESS() { return 1; },
    get NOT_SECURE_ERROR() { return 2; },
    get FILE_ACCESS_ERROR() { return 3; },
    get DATA_URI_ERROR() { return 4; },
    get DNS_ERROR() { return 5; },
    get CONNECT_ERROR() { return 6; },
    get TIMEOUT_ERROR() { return 7; },
    get SSL_HANDSHAKE_ERROR() { return 8; },
    get SSL_CA_CERT_ERROR() { return 9; },
    get SSL_CA_CERT_FILE_ERROR() { return 10; },
    get CERT_STATUS_ERROR() { return 11; },
    get SEND_ERROR() { return 12; },
    get RECV_ERROR() { return 13; },
    get CURL_INIT_ERROR() { return 14; },
    get NETWORK_ERROR() { return 15; },

    fonts: {
        get entries() { return nrdp.gibbon._syncData.fonts; },
        set entries(f) { nrdp._setProperty("gibbon", "fonts", f); },

        attributes: {
            get NONE() { return 0x00000000; },
            get EMBOLDEN() { return 0x00000001; },
            get SLANT() { return 0x00000002; },
            get MONOSPACE() { return 0x00000004; },
            get SYNTHESIZE() { return 0x00000008; },
            get HINTING() { return 0x00000100; },
            get AUTOHINTER() { return 0x00000200; },
            get HINTNORMAL() { return 0x00000400; },
            get HINTLIGHT() { return 0x00000800; },
            get HINTMONO() { return 0x00001000; },
            get HINTLCD() { return 0x00002000; },
            get HINTLCDV() { return 0x00004000; }
        },
        weight: {
            get NORMAL() { return 0; },
            get BOLD() { return 1; }
        },
        style: {
            get NORMAL() { return 0; },
            get ITALIC() { return 1; }
        }
    },

    get email() {
        return this._syncData.email;
    },
    diskCache: {
        get capacity() {
            if (nrdp.gibbon._syncData.diskCacheConfiguration)
                return nrdp.gibbon._syncData.diskCacheConfiguration.capacity;
            return undefined;
        },
        get maxPending() {
            if (nrdp.gibbon._syncData.diskCacheConfiguration)
                return nrdp.gibbon._syncData.diskCacheConfiguration.maxPending;
            return undefined;
        },
        get maxWrites() {
            if (nrdp.gibbon._syncData.diskCacheConfiguration)
                return nrdp.gibbon._syncData.diskCacheConfiguration.maxWrites;
            return undefined;
        },
        get catalogTimer() {
            if (nrdp.gibbon._syncData.diskCacheConfiguration)
                return nrdp.gibbon._syncData.diskCacheConfiguration.catalogTimer;
            return undefined;
        },
        clear: function() {
            nrdp._invoke("gibbon", "clearDiskCache");
        }
    },
    surfaceCache: {
        get capacity() {
            return nrdp.gibbon._syncData.surfaceCacheCapacity.browse;
        },
        get playbackCapacity() {
            return nrdp.gibbon._syncData.surfaceCacheCapacity.playback;
        }
    },
    textSurfaceCache: {
        get capacity() {
            return nrdp.gibbon._syncData.textSurfaceCacheCapacity.browse;
        },
        get playbackCapacity() {
            return nrdp.gibbon._syncData.textSurfaceCacheCapacity.playback;
        }
    },
    get password() {
        return this._syncData.password;
    },

    get imageFormats() {
        return this._syncData.imageFormats;
    },

    get defaultLocale() {
        return this._syncData.defaultLocale;
    },

    set defaultLocale(l) {
        nrdp._setProperty("gibbon", "defaultLocale", l);
    },

    get garbageCollectTimeout() {
        return this._syncData.garbageCollectTimeout;
    },

    set garbageCollectTimeout(t) {
        nrdp._setProperty("gibbon", "garbageCollectTimeout", t);
    },

    _path: "gibbon",
    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get cookie() { return (this._syncData) ? this._syncData.cookie: ""; },
    set cookie(c) { nrdp._invoke("gibbon", "setCookie", {cookie: c}); },

    setCookie: function setCookie(cookie, callback) {
        var id = nrdp.gibbon._setValue(callback);
        nrdp._invoke("gibbon", "setCookie", {cookie: cookie, id: id});
    },

    get location() {
        var result = this._baseUrl;
        if(!result) {
            // there is a race condition in c++ when the location is the
            // result of a redirect; the updated location may not come
            // until after nrdp isReady. but nrdp_platform can always be
            // right.
            if (typeof nrdp_platform !== "undefined" && typeof nrdp_platform.location === "function")
                result = nrdp_platform.location();
            else
                result = this._syncData.location;
        }
        return result;
    },
    set location(l) {
        this._baseUrl = undefined;
        nrdp._setProperty("gibbon", "location", this._resolveUrl(l));
    },

    loaded: function loaded() {
        nrdp._invoke("gibbon", "uiLoaded");
    },

    addSample: function addSample(name, sample) {
        nrdp._invoke("gibbon", "addSample", {name: name, sample: sample});
    },

    setTimeout: function setTimeout(cb, interval, singleShot) {
        var id;

        if (singleShot === undefined) {
            // default singleShot to true
            singleShot = true;
        }

        id = nrdp.gibbon._setValue({ callback: cb, singleShot: singleShot, interval: interval });
        nrdp._invoke("gibbon", "startTimer", { id: id, singleShot: singleShot, interval: interval });
        return id;
    },
    clearTimeout: function clearTimeout(id) {
        if (nrdp.gibbon._getValue(id) !== undefined) {
            nrdp.gibbon._deleteValue(id);
            nrdp._invoke("gibbon", "stopTimer", { id: id });
        }
    },

    collectGarbage: function(callback) { nrdp.gibbon.garbageCollect(callback); },
    garbageCollect: function garbageCollect(callback) {
        var id = callback ? nrdp.gibbon._setValue(callback) : 0;
        nrdp._invoke("gibbon", "garbageCollect", { id: id });
    },
    eval: function eval(script, file) {
        if(typeof nrdp_platform !== "undefined" && nrdp_platform.eval)
            nrdp_platform.eval(script, file);
        else
            nrdp._invoke("gibbon", "eval", { script: script, file: file });
    },

    _load: function _load(request, callback) {
        request.id = nrdp.gibbon._setValue(callback);
        request.url = this._resolveUrl(request.url);
        nrdp._invoke("gibbon", "startRequest", request);
        return request.id;
    },
    load: function load(request, callback) {
        if (typeof request !== "object") {
            if (typeof callback === "function")
                callback({});
            return -1;
        }
        request.eval = false;
        if(request.async === undefined)
            request.async = true;
        return nrdp.gibbon._load(request, callback);
    },
    loadScript: function loadScript(request, callback) {
        if (typeof request !== "object") {
            if (typeof callback === "function")
                callback({});
            return -1;
        }
        request.eval = true;
        if(request.async === undefined)
            request.async = false;
        return nrdp.gibbon._load(request, callback);
    },
    stopLoad: function stopLoad(id) {
        nrdp.gibbon._deleteValue(id);
        nrdp._invoke("gibbon", "stopRequest", {id: id });
        return id;
    },

    sync: function sync() {
        if(nrdp.gibbon._pendingSync) {
            var syncData;
            for(var id in nrdp.gibbon._pendingSync.widgets) {
                if(nrdp.gibbon._pendingSync.widgets[id]._created) {
                    var data = nrdp.gibbon._pendingSync.widgets[id]._pushData();
                    if(data) {
                        if(syncData)
                            syncData.push(data);
                        else
                            syncData = [data];
                    }
                }
            }
            nrdp.gibbon._pendingSync.widgets = {};
            if(syncData) {
                //nrdp.log.console("Sync: " + JSON.stringify(syncData));
                nrdp._invoke("gibbon", "updateWidget", {data: syncData});
            }
        }
    },
    beginPendingSync: function beginPendingSync() {
        if(!nrdp.gibbon._pendingSync)
            nrdp.gibbon._pendingSync = { widgets: {}, count: 1 };
        else
            ++nrdp.gibbon._pendingSync.count;
    },
    endPendingSync: function endPendingSync() {
        if(nrdp.gibbon._pendingSync) {
            --nrdp.gibbon._pendingSync.count;
            if(!nrdp.gibbon._pendingSync.count) {
                this.sync();
                nrdp.gibbon._pendingSync = undefined;
            }
        }
    },
    _addPendingSync: function _addPendingSync(widget) {
        nrdp.gibbon._pendingSync.widgets[widget._id] = widget;
    },
    _needPendingSync: function _needPendingSync() {
        return nrdp.gibbon._pendingSync;
    },
    _debugObject: function _debugObject(obj, objname) {
        if (typeof obj === "object") {
            var arr = false;
            if (obj instanceof Array) {
                arr = true;
            }
            var list = [];
            var tp, stp, isobj, num, name;
            for (var i in obj) {
                tp = typeof obj[i];
                stp = undefined;
                num = 1;
                if (tp === "object") {
                    if (obj[i] instanceof Array) {
                        stp = "array";
                        num = obj[i].length;
                    } else if (obj[i] instanceof Date)
                        stp = "date";
                    else if (obj[i] instanceof RegExp)
                        stp = "regexp";
                    isobj = true;
                } else {
                    isobj = false;
                }
                if (arr)
                    name = objname + "[" + i + "]";
                else
                    name = objname + "." + i;
                list.push({ name: i, value: { objectId: (isobj ? (name + ":" + num) : undefined),
                                              type: tp, subtype: stp,
                                              description: (function(o) {
                                                                if (typeof o === "object") {
                                                                    if (o instanceof Array)
                                                                        return "Array[" + o.length + "]";
                                                                    else if (o instanceof Date)
                                                                        return "Date";
                                                                    else if (o instanceof RegExp)
                                                                        return "RegExp";
                                                                    else
                                                                        return "Object";
                                                                } else {
                                                                    return o + "";
                                                                }
                                                            })(obj[i])
                                            }
                          });
            }
            return list;
        } else {
            //return [{ value: { type: typeof obj, description: obj + "" }}];
        }
    },
    findWidget: function findWidget(id) {
        if(typeof id === "number")
            return nrdp.gibbon.widgets ? nrdp.gibbon.widgets[nrdp.gibbon.Widget._createName(id)] : undefined;
        for(var widget in nrdp.gibbon.widgets) {
            if(nrdp.gibbon.widgets[widget].name == id)
                return nrdp.gibbon.widgets[widget];
        }
        return undefined;
    },
    makeWidget: function makeWidget(obj) {
        var widgetid = nrdp.gibbon._nextWidgetId++;
        if (widgetid > nrdp.gibbon.INT_MAX)
            widgetid = 1;
        var widget = new nrdp.gibbon.Widget(widgetid);
        if(obj) {
            for(var property in obj) {
                if(property == "children") {
                    for(var childobj in obj.children) {
                        var childwidget = nrdp.gibbon.makeWidget(obj.children[childobj]);
                        childwidget.parent = widget;
                    }
                } else if(property == "backgroundColor") {
                    widget.color = obj[property];
                } else if(property == "animations") {
                    for(var iproperty in obj.animations)
                        widget.animate(obj.animations[iproperty].property, obj.animations[iproperty].duration,
                                       obj.animations[iproperty].ease);
                } else if(property == "parent") { //eat it, its done above
                } else if(property == "image" || property == "backgroundImage") {
                    for(var iproperty in obj[property]) {
                            if(iproperty == "src") {
                                 widget[property].url = obj[property][iproperty];
                            } else if(iproperty == "horizontalAlignment") {
                                 widget[property].halign = obj[property][iproperty];
                            } else if(iproperty == "verticalAlignment") {
                                 widget[property].valign = obj[property][iproperty];
                            } else {
                                 widget[property][iproperty] = obj[property][iproperty];
                            }
                       }
                } else {
                    widget[property] = obj[property];
                }
            }
        }
        return widget;
     },
    dump: function dump(cb) { nrdp.gibbon.scene.dump(cb); },

    startFpsTimer: function startFpsTimer() { nrdp._invoke("gibbon", "startFpsTimer"); },
    stopFpsTimer: function stopFpsTimer() { nrdp._invoke("gibbon", "stopFpsTimer"); },
    getRenderedFps: function getRenderedFps(callback) {
        var id = nrdp.gibbon._setValue(callback);
        nrdp._invoke("gibbon", "getRenderedFps", {id: id});
    },

    reloadFonts: function reloadFonts() {
        nrdp._invoke("gibbon", "reloadFonts");
    },

    get _baseUrl() {
        if(this._baseUrlVar)
            return this._baseUrlVar.url;
        return undefined;
    },
    set _baseUrl(u) {
        if(u) {
            var dir = u;
            var q = dir.indexOf("?");
            if (q != -1)
                dir = dir.substr(0, q);
            var s = dir.lastIndexOf("/");
            if(s != -1)
                dir = dir.substr(0, s + 1);
            this._baseUrlVar = { dir: dir, url: u };
        } else {
            this._baseUrlVar = undefined;
        }
    },
    _resolveUrl: function _resolveUrl(url) {
        if (this._baseUrlVar && url && url.indexOf("://") == -1 && url.indexOf("data:") != 0) {
            var baseUrl = this._baseUrlVar.dir;
            if(url[0] == "/") {
                var s = baseUrl.indexOf("/", 8);
                if(s != -1)
                    baseUrl = baseUrl.substr(0, s);
            }
            return baseUrl + url;
        }
        return url;
    },

    _syncData: {},
    _updateProperty: function _updateProperty(property, value) {
        var evt;
        if (nrdp.isReady && property == "cookie" && nrdp.gibbon.cookie != value) {
            evt = {
                type: "cookiechange",
                old: nrdp.gibbon.cookie
            };
        }

        this._syncData[property] = value;

        if (evt)
            nrdp._callEventListeners(this, evt);
    },

    _handleEvent: function _handleEvent(event) {
        var handled = true;
        if (event.name == "inputEvent") {
            var type = event.data.type;
            if(type == "click" || type == "press" || type == "release") {
                var evt = { type: "key", time: event.time , data: event.data };
                if(nrdpPartner && nrdpPartner.Keys)
                    evt.data.uiEvent = nrdpPartner.Keys[evt.data.code];
                for(var i = 0; i < event.data.count; ++i) {
                    if(type == "click") {
                        evt.data.type = "press";
                        nrdp._callEventListeners(this, evt);
                        if(!event.data.repeat)
                            evt.data.type = "release";
                        else
                            evt = 0;
                    }
                    if(evt) {
                        nrdp._callEventListeners(this, evt);
                    }
                    break; //do just one?
                }
           } else if(type == "mouseMove" || type == "mousePress" || type == "mouseRelease") {
               if(event.data.widgets) {
                   for(var i = 0; i < event.data.widgets.length; ++i)
                       event.data.widgets[i].widget = nrdp.gibbon.findWidget(event.data.widgets[i].id);
               }
               nrdp._callEventListeners(this, { type: "mouse", time: event.time, data: event.data });
           } else if(type == "touchMove" || type == "touchPress" || type == "touchRelease") {
               if(event.data.widgets) {
                   for(var i = 0; i < event.data.widgets.length; ++i)
                       event.data.widgets[i].widget = nrdp.gibbon.findWidget(event.data.widgets[i].id);
               }
               nrdp._callEventListeners(this, { type: "touch", time: event.time, data: event.data });
           } else {
               nrdp.log.error("unhandled gibbonInputEvent " + type);
           }
        } else if (event.name == "requestFinished") {
            var cb = this._getValue(event.data.id);
            if (!event.data.refresh || event.data.state == "refresh")
                this._deleteValue(event.data.id);
            if(typeof cb == "function")
                cb(event.data);
        } else if (event.name == "timer") {
            var timer_id = event.data;
            var timer = this._getValue(timer_id);
            if (timer !== undefined) {
                if (timer.callback !== undefined)
                    timer.callback();
                if (timer.singleShot)
                    this._deleteValue(timer_id);
            }
        } else if (event.name == "getRenderedFps") {
            var cb = this._getValue(event.data.id);
            if(cb !== undefined)
                cb(event.data.fps);
            this._deleteValue(event.data.id);
        } else if (event.name == "setCookie") {
            var cb = this._getValue(event.data.id);
            if (cb !== undefined)
                cb();
            this._deleteValue(event.data.id);
        } else if (event.name == "garbageCollected") {
            var cb = this._getValue(event.data.id);
            if (cb !== undefined)
                cb();
            this._deleteValue(event.data.id);
        } else {
            handled = false;
        }
        return handled;
    },

    _setValue: function _setValue(value) {
        do {
            ++nrdp.gibbon._callback;
            if (nrdp.gibbon._callbackId >= nrdp.gibbon.INT_MAX)
                nrdp.gibbon._callback = 1;
        } while(nrdp.gibbon._callbacks[nrdp.gibbon._callback] !== undefined)
        nrdp.gibbon._callbacks[nrdp.gibbon._callback] = value;
        return nrdp.gibbon._callback;
    },
    _getValue: function _getValue(id) {
        return nrdp.gibbon._callbacks[id];
    },
    _deleteValue: function _deleteValue(id) {
        delete nrdp.gibbon._callbacks[id];
    }
};

nrdp._sendSyncdEvent = function(fn, that, arguments) {
    try {
        nrdp.gibbon.beginPendingSync();
        fn.apply(that, arguments);
    } catch (x) {
        nrdp.gibbon.endPendingSync();
        throw x;
    }
    nrdp.gibbon.endPendingSync();
};

nrdp.gibbon.Sample = function(name) { // Internal
    this._name = name;
    this._samples = new Array();
    this._start = (new Date()).getMilliseconds();
};
nrdp.gibbon.Sample.prototype = {
    constructor: nrdp.gibbon.Sample,
    dump: function dump() {
        var total = (new Date()).getMilliseconds() - this._start;
        while(this._samples.length)
            this.pop();
        if(this._data) {
            this._data["total"] = total;
        } else {
            this._data = total;
        }
        nrdp.gibbon.addSample(this._name, this._data);
    },
    push: function push(name) {
        this._samples.unshift({ start: (new Date()).getMilliseconds(), name: name });
    },
    pop: function pop() {
        var sample = this._samples.shift();
        if(!this._data)
            this._data = { };
        this._data[sample.name] = (new Date()).getMilliseconds() - sample.start;
    }
};

if(typeof nrdpPartner === "undefined")
    nrdpPartner = {};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.gibbon.scene = {

    _callbacks: {},
    _nextCallbackId: 1,

    get widget() {
        var wid = this._syncData.widget;
        return (typeof wid === "object") ? wid : null;
    },
    set widget(_widget) {
        if(_widget && this.widget && _widget._id == this.widget._id)
            return;
        var oldWidget = this.widget;
        this._syncData.widget = _widget;
        if(oldWidget)
            oldWidget._destroyWidget();
        if(_widget)
            _widget._createWidget();
        nrdp._setProperty("gibbon.scene", "widget", _widget ? _widget._id : 0);
    },

    get width() { return this._syncData.width; },
    get height() { return this._syncData.height; },

    dump: function dump(cb) {
        this.widget.dump(cb);
    },
    grab: function grab(cb) {
        var id = this._registerCallback(cb);
        nrdp._invoke("gibbon.scene", "grab", { id: id });
    },
    update: function update(widget) {
        nrdp._invoke("gibbon.scene", "update", { id: widget ? widget._id : this.widget._id });
    },

    _handleEvent: function _handleEvent(event) {
        if (event.name == "grab") {
            this._callCallback(event);
            return true;
        }
        return false;
    },
    _registerCallback: function _registerCallback(cb) {
        var id = this._nextCallbackId++;
        this._callbacks[id] = cb;
        return id;
    },
    _callCallback: function _callCallback(event) {
        if (event.data.id === undefined)
            return;
        var cb = this._callbacks[event.data.id];
        delete this._callbacks[event.data.id];
        if (cb)
            cb(event.data.data);
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.gibbon.Image = function(widget, name) {
    this._widget = widget;
    this._pushed = { };
    this.__push = undefined;
    this._created = false;
    this._name = name;
    this._syncData = this._widget._syncData[name];
    this._path = this._widget._path + "." + name;
    if(!this._syncData)
        this._syncData = widget._syncData[name] = {};
    if(0) //Turn on/off lazy loading of the c++ image
        this._createImage();
};
nrdp.gibbon.Image.LAZY_DECODE = 0x01;
nrdp.gibbon.Image.LAZY_DOWNLOAD = 0x02;
nrdp.gibbon.Image.ALIGN_NORMAL = 0x00;
nrdp.gibbon.Image.ALIGN_LEFT = nrdp.gibbon.Image.ALIGN_NORMAL;
nrdp.gibbon.Image.ALIGN_TOP = nrdp.gibbon.Image.ALIGN_NORMAL;
nrdp.gibbon.Image.ALIGN_CENTER = 0x01;
nrdp.gibbon.Image.ALIGN_RIGHT = 0x02;
nrdp.gibbon.Image.ALIGN_BOTTOM = nrdp.gibbon.Image.ALIGN_RIGHT;
nrdp.gibbon.Image.ALIGN_TILE = 0x04;
nrdp.gibbon.Image.ALIGN_STRETCH = 0x08;
nrdp.gibbon.Image.ALIGN_ASPECT = 0x18;
nrdp.gibbon.Image._default = {
    src: "",
    sourceRect: { x: 0, y: 0, width: undefined, height: undefined },
    verticalAlignment: nrdp.gibbon.Image.ALIGN_NORMAL,
    horizontalAlignment: nrdp.gibbon.Image.ALIGN_NORMAL
};

nrdp.gibbon.Image.prototype = {
    constructor: nrdp.gibbon.Image,
    _pushData: function _pushData(all) {
        var pushData;
        if(all) {
            for(var property in this._pushed) {
                if(!pushData)
                    pushData = new Object();
                pushData[property] = this._pushed[property];
	        }
        }
        if(this.__push) {
            if(!pushData)
                pushData = new Object();
            for(var property in this.__push)
                this._pushed[property] = pushData[property] = this.__push[property];
            this.__push = undefined;
        }
        if(pushData) {
            this._created = true;
            if(pushData["src"] && pushData["src"] instanceof Object && pushData["src"].lazy === true) {
                if(this._name == "image" && (this._widget.width === undefined || this._widget.height === undefined)) {
                    pushData["src"].lazy = nrdp.gibbon.Image.LAZY_DECODE;
                } else {
                    pushData["src"].lazy = nrdp.gibbon.Image.LAZY_DOWNLOAD;
                }
            }
        }
        return pushData;
    },
    _pull: function _pull(property) {
        if(this._syncData.hasOwnProperty(property))
            return this._syncData[property];
        return nrdp.gibbon.Image._default[property];
    },
    _push: function _push(property, value) {
        this._syncData[property] = value;
        if(nrdp.gibbon._needPendingSync())
            nrdp.gibbon._addPendingSync(this._widget);
        if(!this.__push) {
            this.__push = {};
        }
        if(!this._created || nrdp.gibbon._needPendingSync()) {
            this.__push[property] = value;
            return false;
        }

        this._pushed[property] = value;
        nrdp._setProperty(this._path, property, value);
        return true;
    },

    get height() { return this._pull("height"); },
    get width() { return this._pull("width"); },

    _setRect: function _setRect(name, _inVal) {
        var _rect;
        var syncRect = this._pull(name);
        for(var d in syncRect) {
            if(_inVal[d] !== undefined && _inVal[d] != syncRect[d]) {
                if(!_rect)
                    _rect = new Object();
                _rect[d] = _inVal[d];
            }
        }
        if(!_rect)
            return;
        for(d in syncRect) {
            if (_rect[d] === undefined)
                _rect[d] = syncRect[d];
        }
        this._push(name, _rect);
    },

    get sourceRect() {
        var rect = this._pull("sourceRect");
        if(rect.width === undefined)
            rect.width = this.width;
        if(rect.height === undefined)
            rect.height = this.height;
        return rect;
    },
    set sourceRect(_sourceRect_in) {
        this._setRect("sourceRect", _sourceRect_in);
    },

    get halign() { return this._pull("horizontalAlignment"); },
    set halign(_halign) {
        if(_halign == this.halign)
            return;
        this._push("horizontalAlignment", _halign);
    },

    get valign() { return this._pull("verticalAlignment"); },
    set valign(_valign) {
        if(_valign == this.valign)
            return;
        this._push("verticalAlignment", _valign);
    },

    reload: function reload() {
        var url = this.url;
        if(url instanceof Object) {
            if(!url.url || !url.url.length)
                return;
            url.lazy = false;
        } else {
            if(!url || !url.length)
                return;
        }
        this._push("src", url);
    },

    get url() { return this._pull("src"); },
    set url(_url) {
        var url = this._pull("src");
        if(_url instanceof Object) {
            if(url == _url)
                return;
            _url.url = nrdp.gibbon._resolveUrl(_url.url);
            if(url instanceof Object && _url.url == url.url &&
               _url.lazy == url.lazy && _url.async == url.async) {
                if(_url.headers instanceof Object && url.headers instanceof Object) {
                    var same = true;
                    var prop;
                    for(prop in _url.headers) {
                        if(!_url.headers.hasOwnProperty(prop))
                            continue;
                        if(url.headers[prop] != _url.headers[prop]) {
                            same = false;
                            break;
                        }
                    }
                    if(same) {
                        for(prop in url.headers) {
                            if(!url.headers.hasOwnProperty(prop))
                                continue;
                            if(_url.headers[prop] != url.headers[prop]) {
                                same = false;
                                break;
                            }
                        }
                        if(same)
                            return;
                    }
                } else if(!_url.headers && !url.headers) {
                    return;
                }
            } else if(!url && (!_url.url || !_url.url.length) && !_url.lazy && _url.async) {
                return;
            }
            var tmp = _url;
            _url = { url: tmp.url, lazy: tmp.lazy, fast: tmp.fast };
            if(tmp.async === false)
                _url.async = false;
            if(tmp.headers) {
                var headers = {};
                var hasHeaders = false;
                for(var header in tmp.headers) {
                    if(!tmp.headers.hasOwnProperty(header))
                        continue;
                    var val = tmp.headers[header];
                    if(typeof val === "string") {
                        hasHeaders = true;
                        headers[header] = val;
                    }
                }
                if(hasHeaders) {
                    _url.headers = headers;
                }
            }
        } else {
            _url = nrdp.gibbon._resolveUrl(_url);
            if(_url == url)
                return;
        }
        this._push("src", _url);
        // temporarily delete width/height; when the image comes back it will be populated again
        delete this._syncData.width;
        delete this._syncData.height;
        if(!this._created && this._widget._created && !nrdp.gibbon._needPendingSync())
            this._createImage(); //realize it!
    },

    _destroyImage: function _destroyImage() {
        if(this._created)
            nrdp._invoke(this._path, "destroy");
        this._created = false;
    },
    _createImage: function _createImage() {
        if(!this._created) {
            var pushData = this._pushData();
            nrdp._construct(this._widget._path, this._name, { data: pushData });
            this._created = true;
        }
    },
    _handleEvent: function _handleEvent(event) {
        return false;
    }
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

nrdp.gibbon.Widget = function(id) {
    if(!nrdp.gibbon.widgets)
        nrdp.gibbon.widgets = {};

    this._id = id;
    this._created = false;
    this._name = nrdp.gibbon.Widget._createName(this._id);
    this._path = "gibbon.widgets." + this._name;
    this.__push = undefined;
    this._pushed = {};
    this._children = [];
    this._callbacks = {};
    this._nextCallbackId = 1;
    this._syncData = {};

    if(0) //Turn on/off lazy loading of the c++ widget
        this._createWidget();
};
nrdp.gibbon.Widget._createName = function(id) { return "widget" + id; };

nrdp.gibbon.Widget._default = {
    push_warnedPendingSync: false,
    animations: undefined,
    name: undefined,
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    padding: undefined,
    layout: undefined,
    parent: undefined,
    layoutStretch: 0,
    layoutSpacing: 0,
    opacity: 1.0,
    drawOrder: 0,
    scale: 1.0,
    clip: true,
    cache: undefined,
    opaque: false,
    erase: false,
    visible: true,
    smoothScale: false,
    text: undefined,
    textFirstLine: 0,
    renderTextFirstLine: 0,
    textLines: undefined,
    textCursorPosition: undefined,
    backgroundColor: { r: 0, g: 0, b: 0, a: 0 },
    transformOriginX: 0,
    transformOriginY: 0,
    textStyle: {
        size: 30,
        lineHeight: undefined,
        weight: "bold",
        variant: "normal",
        align: [ "left" ],
        color: { r: 0, g: 0, b: 0, a: 255 },
        shadow: {
            offsetX: 0,
            offsetY: 0,
            color: { r: 0, g: 0, b: 0, a: 255 }
        },
        truncation: {
            position: "none",
            ellipsis: "..."
        },
        edgeEffect: {
            type: "none",
            width: 0,
            lightColor: { r: 0, g: 0, b: 0, a: 255 },
            darkColor: { r: 0, g: 0, b: 0, a: 255 },
            outlineColor: { r: 0, g: 0, b: 0, a: 255 }
        },
        cursor: {
            visible: false,
            style: "line",
            color: {r: 0, g: 0, b: 0, a: 255 },
            interval: 500,
            width: 1
        },
        typography: {
            kerning: true,
            tracking: 0
        },
        wrap: false,
        underline: false,
        strikethrough: false,
        richText: false
    }
};


nrdp.gibbon.Widget.prototype = {
    constructor: nrdp.gibbon.Widget,

    _pushData: function _pushData(all) {
        var pushData;
        if(this._image) {
            var image_pushData = this._image._pushData(all);
            if(image_pushData) {
                if(!pushData)
                    pushData = {id: this._id};
                pushData["image"] = { data: image_pushData };
            }
        }
        if(this._backgroundImage) {
            var image_pushData = this._backgroundImage._pushData(all);
            if(image_pushData) {
                if(!pushData)
                    pushData = {id: this._id};
                pushData["backgroundImage"] = { data: image_pushData };
            }
        }
        if(all) {
            if(!pushData)
                pushData = {id: this._id};
            for(var push in this._pushed)
                pushData[push] = this._pushed[push];
        }
        if(this.__push) {
            if(!pushData)
                pushData = {id: this._id};
            for(var property in this.__push) {
                if(property == "parent")
                    pushData.parent = this.__push.parent._id;
                else
                    pushData[property] = this.__push[property];
                this._pushed[property] = pushData[property];
            }
            this.__push = undefined;
        }
        if(!this._created) {
            if(this._children.length) {
                pushData.children = new Array();
                for(var child = 0; child < this._children.length; ++child)
                    pushData.children.push(this._children[child]._pushData(all));
            }
            this._created = true;
            nrdp.gibbon.widgets[this._name] = this;
        }
        return pushData;
    },
    _pull: function _pull(property) {
        if(this._syncData.hasOwnProperty(property))
           return this._syncData[property];
        return nrdp.gibbon.Widget._default[property];
    },
    _push: function _push(property, value) {
        this._syncData[property] = value;
        if(!this._created || nrdp.gibbon._needPendingSync()) {
            if(!this.__push) {
                if(nrdp.gibbon._needPendingSync())
                    nrdp.gibbon._addPendingSync(this);
                this.__push = {};
            }
            this.__push[property] = value;
            return false;
        }

        this._pushed[property] = value;
        if (property == "parent")
            value = value._id;
        if(!nrdp.gibbon.Widget.push_warnedPendingSync) {
            nrdp.gibbon.Widget.push_warnedPendingSync = true;
            nrdp.log.warn("gibbon widget property set without pending sync");
        }
        nrdp._setProperty(this._path, property, value);
        return true;
    },

    addEventListener: function addEventListener(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function removeEventListener(evt, listener) { nrdp._removeEventListener(this, evt, listener); },

    get color() { return this._pull("backgroundColor"); },
    set color(_color) {
        if(typeof _color === "string") {
            if (_color[0] == '#') {
                var r = parseInt(_color.substr(1, 2), 16); if (r == NaN) r = 0;
                var g = parseInt(_color.substr(3, 2), 16); if (g == NaN) g = 0;
                var b = parseInt(_color.substr(5, 2), 16); if (b == NaN) b = 0;
                var a = (_color.length == 9 ? parseInt(_color.substr(7, 2), 16) : 255); if (a == NaN) a = 255;
                _color = { r:r, g:g, b:b, a:a };
            } else {
                _color = undefined;
            }
        }
        if(!(_color instanceof Object))
            _color = { r:0, g:0, b:0, a:255 };
        if(_color.r == this.color.r && _color.g == this.color.g &&
           _color.b == this.color.b && _color.a == this.color.a)
            return;
        this._push("backgroundColor", { r: _color.r, g: _color.g, b: _color.b, a: _color.a });
    },

    get padding() { return this._pull("padding"); },
    set padding(_padding) {
        if(_padding instanceof Object) {
            if(this.padding instanceof Object && _padding.top == this.padding.top && _padding.left == this.padding.left &&
               _padding.bottom == this.padding.bottom && _padding.right == this.padding.right && _padding.wrap == this.padding.wrap)
                return;
            _padding = { top: _padding.top, left: _padding.left, bottom: _padding.bottom, right: _padding.right, wrap: _padding.wrap };
        } else if (typeof _padding == "number") {
            if(_padding == this.padding)
                return;
        } else {
            return;
        }
        this._push("padding", _padding);
    },

    get name() { return this._pull("name"); },
    set name(_name) {
        if(_name == this.name)
            return;
        this._push("name", _name);
    },

    get image() {
        if(this._image === undefined)
            this._image = new nrdp.gibbon.Image(this, "image");
        return this._image;
    },

    get backgroundImage() {
        if(this._backgroundImage === undefined)
            this._backgroundImage = new nrdp.gibbon.Image(this, "backgroundImage");
        return this._backgroundImage;
    },

    get renderX() { return this._pull("renderX"); },
    get renderY() { return this._pull("renderY"); },
    get renderWidth() { return this._pull("renderWidth"); },
    get renderHeight() { return this._pull("renderHeight"); },
    get renderTextLines() { return this._pull("renderTextLines"); },
    get renderTextFirstLine() { return this._pull("renderTextFirstLine"); },
    get renderTextCursorPosition() { return this._pull("renderTextCursorPosition"); },

    get drawOrder() { return this._pull("drawOrder"); },
    set drawOrder(_drawOrder) {
        if(_drawOrder == this.drawOrder)
            return;
        this._push("drawOrder", _drawOrder);
    },

    get minHeight() { return this._pull("minHeight"); },
    set minHeight(_minHeight) {
        if(_minHeight == this.minHeight)
            return;
        this._push("minHeight", _minHeight);
    },

    get minWidth() { return this._pull("minWidth"); },
    set minWidth(_minWidth) {
        if(_minWidth == this.minWidth)
            return;
        this._push("minWidth", _minWidth);
    },

    get maxHeight() { return this._pull("maxHeight"); },
    set maxHeight(_maxHeight) {
        if(_maxHeight == this.maxHeight)
            return;
        this._push("maxHeight", _maxHeight);
    },

    get maxWidth() { return this._pull("maxWidth"); },
    set maxWidth(_maxWidth) {
        if(_maxWidth == this.maxWidth)
            return;
        this._push("maxWidth", _maxWidth);
    },

    get visible() { return this._pull("visible"); },
    set visible(_visible) {
        if(_visible == this.visible)
            return;
        this._push("visible", _visible);
    },

    get smoothScale() { return this._pull("smoothScale"); },
    set smoothScale(_smoothScale) {
        if(_smoothScale == this.smoothScale)
            return;
        this._push("smoothScale", _smoothScale);
    },

    get hidden() { return !this.visible; },
    set hidden(_hidden) { this.visible = !_hidden; },

    get opacity() {
        var value = this._pull("opacity");
        if(value && value instanceof Object)
            return value.value;
        return value;
    },
    set opacity(_opacity) {
        if(_opacity == this.opacity)
            return;
	if(!(_opacity instanceof Object) && (!this.visible || (!this.parent && !this._isRoot)) && this._hasAnimation("opacity"))
            _opacity = { value: _opacity, animate: false };
        this._push("opacity", _opacity);
    },

    _addChild: function _addChild(child) {
        this._children.push(child);
    },
    _removeChild: function _removeChild(child) {
        for(var ch in this._children) {
            if(this._children[ch]._id == child._id) {
                this._children.splice(ch, 1);
                break;
            }
        }
    },
    get _isRoot() {
        if(!this.parent && nrdp.gibbon.scene.widget && nrdp.gibbon.scene.widget._id == this._id)
            return true;
        return false;
    },
    get parent() { return this._pull("parent"); },
    set parent(_parent) {
        if(!_parent && !this.parent)
            return;
        if(_parent && this.parent && _parent._id == this.parent._id)
            return;
        if(this.parent)
            this.parent._removeChild(this);
        if(_parent) {
            _parent._addChild(this);
            if(!this._push("parent", _parent) && this.parent._created)
                this._createWidget();
        } else {
            this._syncData.parent = undefined;
            if(this._created)  {
                nrdp._setProperty(this._path, "parent", 0);
                this._destroyWidget();
            }
        }
    },

    get scale() {
        var value = this._pull("scale");
        if(value && value instanceof Object)
            return value.value;
        return value;
    },
    set scale(_scale) {
        if(_scale == this.scale)
            return;
    if(!(_scale instanceof Object) && (!this.visible || (!this.parent && !this._isRoot)) && this._hasAnimation("scale"))
            _scale = { value: _scale, animate: false };
        this._push("scale", _scale);
    },

    get text() { return this._pull("text"); },
    set text(_text) {
        if(_text === null || typeof _text === "undefined")
            _text = "";
        if(_text == this.text)
            return;
        this._push("text", _text);
    },

    get clip() { return this._pull("clip"); },
    set clip(_clip) {
        if(_clip == this.clip)
            return;
        this._push("clip", _clip);
    },

    get cache() { return this._pull("cache"); },
    set cache(_cache) {
        if(_cache == this.cache)
            return;
        this._push("cache", _cache);
    },

    get textFirstLine() { return this._pull("textFirstLine"); },
    set textFirstLine(_textFirstLine) {
        if(_textFirstLine == this.textFirstLine)
            return;
        this._push("textFirstLine", _textFirstLine);
    },

    get textCursorPosition() { return this._pull("textCursorPosition"); },
    set textCursorPosition(_textCursorPosition) {
         if(_textCursorPosition == this.textCursorPosition)
             return;
         this._push("textCursorPosition", _textCursorPosition);
    },

    get textStyle() { return this._pull("textStyle"); },
    set textStyle(_textStyle_in) {
        var syncStyle = this._pull("textStyle");
        var _textStyle = {
            family: (_textStyle_in.family !== undefined) ? _textStyle_in.family : syncStyle.family,
            size: (_textStyle_in.size !== undefined) ? _textStyle_in.size : syncStyle.size,
            weight: (_textStyle_in.weight !== undefined) ? _textStyle_in.weight : syncStyle.weight,
            variant: (_textStyle_in.variant !== undefined) ? _textStyle_in.variant : syncStyle.variant,
            lineHeight: (_textStyle_in.lineHeight !== undefined) ? _textStyle_in.lineHeight : syncStyle.lineHeight,
            wrap: (_textStyle_in.wrap !== undefined) ? _textStyle_in.wrap : syncStyle.wrap,
            maxLines: (_textStyle_in.maxLines !== undefined) ? _textStyle_in.maxLines : syncStyle.maxLines,
            underline: (_textStyle_in.underline !== undefined) ? _textStyle_in.underline : syncStyle.underline,
            strikethrough: (_textStyle_in.strikethrough !== undefined) ? _textStyle_in.strikethrough : syncStyle.strikethrough,
            richText: (_textStyle_in.richText !== undefined) ? _textStyle_in.richText : syncStyle.richText,
            locale: (_textStyle_in.locale !== undefined) ? _textStyle_in.locale : syncStyle.locale
        },
        color_in = _textStyle_in.color || syncStyle.color,
        shadow_in = _textStyle_in.shadow || syncStyle.shadow,
        truncation_in = _textStyle_in.truncation || syncStyle.truncation,
        edgeEffect_in = _textStyle_in.edgeEffect || syncStyle.edgeEffect,
        cursor_in = _textStyle_in.cursor || syncStyle.cursor,
        typography_in = _textStyle_in.typography || syncStyle.typography;

        if (color_in) {
            _textStyle.color = { r: color_in.r, g: color_in.g, b: color_in.b, a: color_in.a };
        }
        if (shadow_in) {
            _textStyle.shadow = {
                offsetX: shadow_in.offsetX,
                offsetY: shadow_in.offsetY
            };
            if (shadow_in.color instanceof Object) {
                _textStyle.shadow.color = {
                    r: shadow_in.color.r,
                    g: shadow_in.color.g,
                    b: shadow_in.color.b,
                    a: shadow_in.color.a
                };
            } else {
                _textStyle.shadow.color = {
                    r: syncStyle.shadow.color.r,
                    g: syncStyle.shadow.color.g,
                    b: syncStyle.shadow.color.b,
                    a: syncStyle.shadow.color.a
                };
            }
        }
        if (truncation_in) {
            _textStyle.truncation = {
                position: truncation_in.position,
                ellipsis: truncation_in.ellipsis
            };
        }
        if (cursor_in) {
            var defaultCursor = nrdp.gibbon.Widget._default.textStyle.cursor;
            _textStyle.cursor = {
                visible: cursor_in.visible === undefined ? defaultCursor.visible : cursor_in.visible,
                interval: cursor_in.interval === undefined ? defaultCursor.interval : cursor_in.interval,
                style: cursor_in.style === undefined ? defaultCursor.style : cursor_in.style,
                color: cursor_in.color === undefined ? defaultCursor.color : cursor_in.color,
                width: cursor_in.width === undefined ? defaultCursor.width : cursor_in.width
            }
        }
        if (typography_in) {
            _textStyle.typography = {
                kerning: typography_in.kerning,
                tracking: typography_in.tracking
            }
        }
        if (edgeEffect_in) {
            _textStyle.edgeEffect = {
                type: edgeEffect_in.type,
                width: edgeEffect_in.width,
            };

            if (edgeEffect_in.type == "raised" || edgeEffect_in.type == "depressed") {
                if (edgeEffect_in.lightColor instanceof Object) {
                    _textStyle.edgeEffect.color1 = {
                        r: edgeEffect_in.lightColor.r,
                        g: edgeEffect_in.lightColor.g,
                        b: edgeEffect_in.lightColor.b,
                        a: edgeEffect_in.lightColor.a
                    };
                } else {
                    _textStyle.edgeEffect.color1 = {
                        r: syncStyle.edgeEffect.color1.r,
                        g: syncStyle.edgeEffect.color1.g,
                        b: syncStyle.edgeEffect.color1.b,
                        a: syncStyle.edgeEffect.color1.a
                    };
                }
                if (edgeEffect_in.darkColor instanceof Object) {
                    _textStyle.edgeEffect.color2 = {
                        r: edgeEffect_in.darkColor.r,
                        g: edgeEffect_in.darkColor.g,
                        b: edgeEffect_in.darkColor.b,
                        a: edgeEffect_in.darkColor.a
                    };
                } else {
                    _textStyle.edgeEffect.color2 = {
                        r: syncStyle.edgeEffect.color2.r,
                        g: syncStyle.edgeEffect.color2.g,
                        b: syncStyle.edgeEffect.color2.b,
                        a: syncStyle.edgeEffect.color2.a
                    };
                }
            }

            if (edgeEffect_in.type == "outline") { // Outline
                if (edgeEffect_in.outlineColor instanceof Object) {
                    _textStyle.edgeEffect.color1 = {
                        r: edgeEffect_in.outlineColor.r,
                        g: edgeEffect_in.outlineColor.g,
                        b: edgeEffect_in.outlineColor.b,
                        a: edgeEffect_in.outlineColor.a
                    };
                } else {
                    _textStyle.edgeEffect.color1 = {
                        r: syncStyle.edgeEffect.color1.r,
                        g: syncStyle.edgeEffect.color1.g,
                        b: syncStyle.edgeEffect.color1.b,
                        a: syncStyle.edgeEffect.color1.a
                    };
                }
            }

        }
        if(_textStyle_in.align instanceof Object)
            _textStyle.align = _textStyle_in.align;
        else if(_textStyle_in.align)
            _textStyle.align = _textStyle_in.align.split(' ');
        else if (syncStyle.align)
            _textStyle.align = syncStyle.align;
        for (var _s in _textStyle) {
            var s = _textStyle[_s];
            if(s !== undefined) {
                if(_s == "color") {
                    if(syncStyle[_s] &&
                       s.r == syncStyle[_s].r && s.g == syncStyle[_s].g &&
                       s.b == syncStyle[_s].b && s.a == syncStyle[_s].a)
                        s = 0;
                } else if(_s == "align") {
                    if(syncStyle[_s] && s.join(' ') == syncStyle[_s].join(' '))
                        s = 0;
                } else if(_s == "shadow") {
                    if(syncStyle[_s] && syncStyle[_s].color &&
                       s.color.r == syncStyle[_s].color.r && s.color.g == syncStyle[_s].color.g &&
                       s.color.b == syncStyle[_s].color.b && s.color.a == syncStyle[_s].color.a &&
                       s.offsetX == syncStyle[_s].offsetX && s.offsetY == syncStyle[_s].offsetY)
                        s = 0;
                } else if(_s == "truncation") {
                    if(syncStyle[_s] && s.position == syncStyle[_s].position && s.ellipsis == syncStyle[_s].ellipsis)
                        s = 0;
                } else if(_s == "cursor") {
                    if(syncStyle[_s] && s.interval == syncStyle[_s].interval &&
                       s.visible == syncStyle[_s].visible && s.style == syncStyle[_s].style && syncStyle[_s].color &&
                       s.width == syncStyle[_s].width &&
                       s.color.r == syncStyle[_s].color.r && s.color.g == syncStyle[_s].color.g &&
                       s.color.b == syncStyle[_s].color.b && s.color.a == syncStyle[_s].color.a)
                        s = 0;
                } else if(_s == "typography") {
                    if(syncStyle[_s] && s.kerning == syncStyle[_s].kerning && s.tracking == syncStyle[_s].tracking)
                        s = 0;
                } else if(_s == "edgeEffect") {
                    if(syncStyle[_s] && s.type == syncStyle[_s].type && s.width == syncStyle[_s].width &&
                       s.color1.r == syncStyle[_s].color1.r && s.color1.g == syncStyle[_s].color1.g &&
                       s.color1.b == syncStyle[_s].color1.b && s.color1.a == syncStyle[_s].color1.a &&
                       s.color2.r == syncStyle[_s].color2.r && s.color2.g == syncStyle[_s].color2.g &&
                       s.color2.b == syncStyle[_s].color2.b && s.color2.a == syncStyle[_s].color2.a)
                        s = 0;
                } else if(s == syncStyle[_s]) {
                    s = 0;
                }
            }
            if(s !== undefined) {
                this._push("textStyle", _textStyle);
                break;
            }
        }
    },

    get transformOriginX() { return this._pull("transformOriginX"); },
    set transformOriginX(_transformOriginX) {
        if(_transformOriginX == this.transformOriginX)
            return;
        this._push("transformOriginX", _transformOriginX);
    },

    get transformOriginY() { return this._pull("transformOriginY"); },
    set transformOriginY(_transformOriginY) {
        if(_transformOriginY == this.transformOriginY)
            return;
        this._push("transformOriginY", _transformOriginY);
    },

    get erase() { return this._pull("erase"); },
    set erase(_erase) {
        if(_erase == this.erase)
            return;
        this._push("erase", _erase);
    },

    get opaque() { return this._pull("opaque"); },
    set opaque(_opaque) {
        if(_opaque == this.opaque)
            return;
        this._push("opaque", _opaque);
    },

    get layout() { return this._pull("layout"); },
    set layout(_layout) {
        if(_layout instanceof Object) {
            if(this.layout instanceof Object &&
               _layout.align == this.layout.align &&
               _layout.layout == this.layout.layout)
                return;
            _layout = { layout: _layout.layout, align: _layout.align };
            if(_layout.align instanceof Array) //force a deep copy if its an array
                _layout.align = _layout.align.splice(0);
        } else if(_layout == this.layout) {
            return;
        }
        this._push("layout", _layout);
    },

    get layoutSpacing() { return this._pull("layoutSpacing"); },
    set layoutSpacing(_layoutSpacing) {
        if(_layoutSpacing == this.layoutSpacing)
            return;
        this._push("layoutSpacing", _layoutSpacing);
    },

    get layoutStretch() { return this._pull("layoutStretch"); },
    set layoutStretch(_layoutStretch) {
        if(_layoutStretch == this.layoutStretch)
            return;
        this._push("layoutStretch", _layoutStretch);
    },

    get rect() { return { x: this.x, y: this.y, width: this.width, height: this.height,
                          minWidth: this.minWidth, minHeight: this.minHeight, maxWidth: this.maxWidth, maxHeight: this.maxHeight  }; },
    set rect(_rect_in) {
        var _rect;
        var animate;
        if(_rect_in.hasOwnProperty("animate")) {
            animate = _rect_in.animate;
        } else if(!this.visible || (!this.parent && !this._isRoot)) {
            animate = false;
        }
        var rect_props = { x: 1, y: 1, width: 1, height: 1, minWidth: 0, minHeight: 0, maxWidth : 0, maxHeight: 0 };
        for(var d in rect_props) {
            if(d in _rect_in && _rect_in[d] != this[d]) {
                var value;
                if(animate !== undefined && rect_props[d] && this._hasAnimation(d))
                    value = { value: _rect_in[d], animate: animate };
                else if(rect_props[d] && _rect_in[d] === undefined)
                    value = { value: _rect_in[d], animate: false };
                else
                    value = _rect_in[d];
                this._push(d, value);
            }
        }
    },

    get x() {
        var value = this._pull("x");
        if(value && value instanceof Object)
            return value.value;
        return value;
    },
    set x(_x) {
        if(_x == this.x)
            return;
        if(!(_x instanceof Object) && (_x === undefined || !this.visible || (!this.parent && !this._isRoot)) && this._hasAnimation("x"))
            _x = { value: _x, animate: false };
        this._push("x", _x);
    },

    get y() {
        var value = this._pull("y");
        if(value && value instanceof Object)
            return value.value;
        return value;
    },
    set y(_y) {
        if(_y == this.y)
            return;
        if(!(_y instanceof Object) && (_y === undefined || !this.visible || (!this.parent && !this._isRoot)) && this._hasAnimation("y"))
            _y = { value: _y, animate: false };
        this._push("y", _y);
    },

    get width() {
        var value = this._pull("width");
        if(value && value instanceof Object)
            return value.value;
        return value;
    },
    set width(_width) {
        if(_width == this.width)
            return;
        if(!(_width instanceof Object) && (_width === undefined || !this.visible || (!this.parent && !this._isRoot)) && this._hasAnimation("width"))
            _width = { value: _width, animate: false };
        this._push("width", _width);
    },

    get height() {
        var value = this._pull("height");
        if(value && value instanceof Object)
            return value.value;
        return value;
    },
    set height(_height) {
        if(_height == this.height)
            return;
        if(!(_height instanceof Object) && (_height === undefined || !this.visible || (!this.parent && !this._isRoot)) && this._hasAnimation("height"))
            _height = { value: _height, animate: false };
        this._push("height", _height);
    },

    dump: function dump(cb) {
        if(this._created) {
            if (cb !== undefined) {
                var id = this._registerCallback(cb);
                nrdp._invoke(this._path, "dump", { id: id });
            } else {
                nrdp._invoke(this._path, "dump");
            }
        }
    },
    grab: function grab(cb) {
        if(this._created) {
            var id = this._registerCallback(cb);
            nrdp._invoke(this._path, "grab", { id: id });
        }
    },
    setDisplayFlags: function setDisplayFlags(_flags) { //compat
        var opaque = false;
        var erase = false;
        var alignment = nrdp.gibbon.Image.ALIGN_NORMAL;
        var flags = _flags.split(" ");
        for (var f in flags) {
            var flag = flags[f];
            if(flag == "opaque")
                opaque = true;
            else if(flag == "erase")
                erase = true;
            else if(flag == "scale")
                alignment = nrdp.gibbon.Image.ALIGN_STRETCH;
            else if(flag == "tile")
                alignment = nrdp.gibbon.Image.ALIGN_TILE;
            else if(flag == "center")
                alignment = nrdp.gibbon.Image.ALIGN_CENTER;
        }
        this.erase = erase;
        this.opaque = opaque;
        this.image.halign = alignment;
        this.image.valign = alignment;
    },
    _hasAnimation: function _hasAnimation(property) {
        var animations = this._pull("animations");
        if(animations && animations[property] && animations[property].duration)
            return true;
        return false;
    },
    stopAnimation: function stopAnimation(property, end) {
        if(this._created) {
            if(end === undefined)
                end = true;
            nrdp._invoke(this._path, "stopAnimation", { property: property, end: end });
        }
    },
    startAnimation: function startAnimation(property, start, end, duration, ease, append) {
        if(append === undefined)
            append = false;
        if(start instanceof Object && start.relative)
            start.relative = start.relative._id;
        var value = { value: end, animate: { start: start, end: end, duration: duration, ease: ease, append: append } };
        if(start === undefined)
            value.animate.previous = this[property];
        if(append && this.__push) {
            var oldValue = this.__push[property];
            if(oldValue && oldValue instanceof Object) {
                if(oldValue.animate instanceof Array) {
                    oldValue.value = end;
                    oldValue.animate.push(value.animate);
                    value = oldValue;
                } else if(oldValue.animate instanceof Object) {
                    var animate = [];
                    animate.push(oldValue.animate);
                    animate.push(value.animate);
                    value.animate = animate;
                }
            }
        }
        this._push(property, value);
    },
    animate: function animate(property, duration, ease) {
        var animations = this._pull("animations");
        if(animations) {
            if(!animations[property]) {
                if(!duration)
                    return;
            } else if(animations[property].duration == duration &&
                      animations[property].ease == ease) {
                return;
            }
        } else {
            animations = {};
        }
        animations[property] = { duration: duration, ease: ease };
        this._push("animations", animations);
    },
    _updateProperty: function _updateProperty(property, value) {
        //nrdp.log.console("Updated " + this._path + "::" + property);
        this._syncData[property] = value;

        var evt;
        if (property == "parent") {
            this._syncData[property] = nrdp.gibbon.widgets[nrdp.gibbon.Widget._createName(value)];
        } else if(property.lastIndexOf("render", 0) == 0 && nrdp._hasEventListener(this, "renderpropertychange")) {
            var renderProperty;
            if(property == "renderX")
                renderProperty = "x";
            else if(property == "renderY")
                renderProperty = "y";
            else if(property == "renderWidth")
                renderProperty = "width";
            else if(property == "renderHeight")
                renderProperty = "height";
            else if(property == "renderTextCursorPosition")
                renderProperty = "textCursorPosition";
            else if(property == "renderTextLines")
                renderProperty = "renderTextLines"
            else if(property == "renderTextFirstLine")
                renderProperty = "textFirstLine"
            if(renderProperty) {
                evt = {
                    type: "renderpropertychange",
                    property: property,
                    renderProperty: renderProperty,
                    value: value
                };
                //nrdp.log.error("EVENT: " + evt.type + " - p=" + evt.property + ", rP=" + evt.renderProperty + ", v=" + evt.value);
            } else {
                nrdp.log.error("Unhandled widget.renderProperty: " + property);
            }
        }
        if (evt)
            nrdp._callEventListeners(this, evt);
    },

    _destroyWidget: function _destroyWidget() {
        if(nrdp.gibbon.scene.widget && nrdp.gibbon.scene.widget._id == this._id)
            return;
        this.image._destroyImage();
        this.backgroundImage._destroyImage();
        if(this._created)
            nrdp._invoke(this._path, "destroy");
        //nrdp.log.console("Destroy(" + this._id + ")");
        this._created = false;
        for(var child in this._children)
            this._children[child]._destroyWidget();
        delete nrdp.gibbon.widgets[this._name];
    },
    _createWidget: function _createWidget() {
        if(!this._created) {
            var pushData = this._pushData(true);
            if(!pushData)
                pushData = { id: this._id };
            //nrdp.log.console("Create(" + this._id + "): " + JSON.stringify(pushData));
            nrdp._construct("gibbon", "Widget", { data: pushData });
            this._created = true;
            if(!pushData["children"] && this._children.length) {
                for(var child in this._children)
                    this._children[child]._createWidget();
            }
        }
    },
    _handleEvent: function _handleEvent(event) {
        var handled = true;
        if (event.name == "imageLoaded" || event.name == "backgroundImageLoaded") {
            if (event.data.success) {
                if (event.name == "imageLoaded") {
                    this._syncData.image.width = event.data.width;
                    this._syncData.image.height = event.data.height;
                } else {
                    this._syncData.backgroundImage.width = event.data.width;
                    this._syncData.backgroundImage.height = event.data.height;
                }
            }
            var evt = { type: event.name, data: event.data };
            nrdp._callEventListeners(this, evt);
        } else if (event.name == "animationFinished") {
            this._syncData[event.data.property] = event.data.value;
            var evt = { type: event.name, data: event.data };
            nrdp._callEventListeners(this, evt);
        } else if (event.name == "text") {
            //nrdp.log.console("text: " + JSON.stringify(event.data));
            var evt = { type: event.name, data: event.data };
            nrdp._callEventListeners(this, evt);
        } else if (event.name == "grab" || event.name == "dump") {
            this._callCallback(event);
        } else {
            handled = false;
        }
        return handled;
    },
    _registerCallback: function _registerCallback(cb) {
        var id = nrdp.gibbon._setValue(cb);
        return id;
    },
    _callCallback: function _callCallback(event) {
        if (event.data.id === undefined)
            return;
        var cb = nrdp.gibbon._getValue(event.data.id);
        nrdp.gibbon._deleteValue(event.data.id);
        if (cb)
            cb(event.data.data);
    }
};


/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

/*
 * all nrdp communication helpers are required to do four things:
 *
 * 1. add object to nrdp._backchannels for initialization
 * 2. provide nrdp._setProperty()
 * 3. provide nrdp._invoke()
 * 4. call nrdp._gotEvent() when an event comes in.
 */

if(typeof window !== "undefined") {
(function() {

var evtsrc;
var iframe;
var nbpdUrl;

nrdp._nbpdAsync = false;

function _gotJSON(json) {
    var event;
    try {
        event = JSON.parse(json);
    } catch (err) {
        console.log("unhandled exception in eventsource " + json);
        console.log(err.toString());
        return;
    }
    if (!event.object && event.name == "aboutToQuit") {
        if (evtsrc) {
            evtsrc.close();
        } else {
            iframe.contentWindow.postMessage("quit", '*');
        }
    }
    nrdp._sendSyncdEvent(nrdp._gotEvent, nrdp, [event]);
};

function _POST(params, async) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", nbpdUrl + "ipc", async);
    xhr.setRequestHeader("Content-type", "text/plain");
    xhr.onerror = function() { console.log("lost IPC connection for POST"); };
    xhr.onreadystatechange = function() {
        if(this.readyState == 4) {
            this.onreadystatechange = undefined;
            this.onerror = undefined;
        }
    };
    xhr.send(JSON.stringify(params));
    return async || xhr.responseText;
};

function _setProperty(obj, prop, val) {
    var args = {
        object: obj ? "nrdp." + obj : "nrdp",
        property: prop,
        value: (typeof val === "undefined" ? null : val)
    };
    _POST(args, nrdp._nbpdAsync);
};

function _invoke(obj, method, args) {
    if (!args) args = {};
    args.object = obj ? "nrdp." + obj : "nrdp";
    args.method = method;
    _POST(args, nrdp._nbpdAsync);
};

function _construct(obj, construct, args) {
    if (!args) args = {};
    args.object = obj ? "nrdp." + obj : "nrdp";
    args.construct = construct;
    var result = _POST(args, false);
    if (result)
        return JSON.parse(result);
    return undefined;
};

function _setupBackchannel() {
    /*
    var urlParams = location.search;
    var getParam = function(key) {
        var sIdx = urlParams.indexOf(key), sep, eIdx;
        if (sIdx !== -1) {
            sep = urlParams.charAt(sIdx - 1);
            if (!sep || sep === "?" || sep === "&") {
                eIdx = urlParams.indexOf("&", sIdx);
                return urlParams.substring(sIdx + (key.length + 1), eIdx !== -1 && eIdx || urlParams.length);
            }
        }
        return undefined;
    };
    var url = getParam("nbpdHost");
    if (url)
    {
        nbpdUrl = url;
    }
    else
    */
    {
        for (var i in document.scripts) {
            if (/^http.*js\/NetflixBridge.js$/.test(document.scripts[i].src)) {
                nbpdUrl = document.scripts[i].src.replace("js/NetflixBridge.js", "");
                break;
            }
        }
    }

    try {
        var evurl = nbpdUrl + "eventsource?objectFilter=-nrdp.gibbon.debugger&name=NBPDJS";
        evtsrc = new EventSource(evurl);
        evtsrc.onmessage = function(evt) { _gotJSON(evt.data); };
        evtsrc.onerror = function(evt) {
            evtsrc.close();
            nrdp._gotEvent({type: "EventSourceError"});
        };
        mongooseBackchannel.evtsrc = evtsrc;
    } catch (x) {
        //nrdp.log.trace("Direct EventSource connection failed, using iframe");
        window.addEventListener("message",
                                function(e) {
                                    if (e.origin + "/" === nbpdUrl)
                                        _gotJSON(e.data);
                                },
                                false);

        iframe = document.createElement('iframe');
        iframe.style.setProperty("opacity", 0);
        iframe.width = iframe.height = 0;
        iframe.src = nbpdUrl + "html/iframe.html";
        document.body.appendChild(iframe);
    }

    return true;
};

var mongooseBackchannel = {
    name: "http",
    isNative: false,
    init: _setupBackchannel,
    setProperty: _setProperty,
    construct: _construct,
    invoke: _invoke
};

nrdp._backchannels.push(mongooseBackchannel);

})();
}
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */


nrdp.mdx = {
    _path: "mdx",
    addEventListener: function(evt, listener) { nrdp._addEventListener(this, evt, listener); },
    removeEventListener: function(evt, listener) { nrdp._removeEventListener(this, evt, listener); },
    _encodedList: [ { list: ['body', 'url', 'USN', 'friendlyName', 'serviceType', 'location'],
                      decodeFn: decodeURIComponent },
                    { list: [ 'responseHeaders' ],
                      decodeFn: function(obj) {
                          var decodedObj = {},
                          member;
                          for(member in obj) {
                              decodedObj[member] = decodeURIComponent(obj[member]);
                          }
                          return decodedObj;
                      }
                    }
                  ],
    get NOT_INITIALIZED() { return 0; },
    get INITIALIZED() { return 1; },

    get NOT_ADVERTISING() { return 0; },
    get ADVERTISING() { return 1; },

    get NOT_DISCOVERING() { return 0; },
    get DISCOVERING() { return 1; },

    get interfaceName() { return this._syncData.interfaceName; },
    get localIPAddress() { return this._syncData.localIPAddress; },
    get nativeVersion() { return this._syncData.nativeVersion; },
    get state() { return this._syncData.state; },

    MdxConfigure: function(advertisingPeriod, 
                           advertisingTTL, 
                           advertisingPort, 
                           listeningPort, 
                           numSsdpReplies,
                           msgLimit) {
        nrdp._invoke("mdx", "MdxConfigure",
                     {advertisingPeriod: advertisingPeriod,
                      advertisingTTL: advertisingTTL,
                      advertisingPort: advertisingPort,
                      listeningPort: listeningPort,
                      numSsdpReplies: numSsdpReplies,
                      msgLimit: msgLimit});
    },

    MdxInit: function(host, port, serviceType, uuid, asyncHttpRequests) {
        nrdp._invoke("mdx", "MdxInit",
                     {host: encodeURIComponent(host),
                      port: port,
                      serviceType: encodeURIComponent(serviceType),
                      uuid: encodeURIComponent(uuid),
                      asyncHttpRequests: asyncHttpRequests});
    },

    MdxDeinit: function() {
        nrdp._invoke("mdx", "MdxDeinit");
    },


    MdxUpnpInit: function(host) {
        nrdp._invoke("mdx", "MdxUpnpInit",
                     {host: encodeURIComponent(host)});
    },

    MdxUpnpDeinit: function() {
        nrdp._invoke("mdx", "MdxUpnpDeinit");
    },

    AddInterfaceName: function(name) {
        nrdp._invoke("mdx", "AddInterfaceName", {name: encodeURIComponent(name)});
    },

    InterfaceChanged: function(newInterface, connected, ipaddress, ssid) {
        nrdp._invoke("mdx", "InterfaceChanged", {newInterface: encodeURIComponent(newInterface), connected: connected, ipaddress: ipaddress, ssid:ssid});
    },

    SearchForMdxDevices: function(serviceType, headerPatterns, mx, numSsdpSearches) {
        nrdp._invoke("mdx", "SearchForMdxDevices",
                     {serviceType: encodeURIComponent(serviceType),
                      headerPatterns: nrdp.mdx._encodeArray(headerPatterns),
                      mx: mx,
                      numSsdpSearches: numSsdpSearches});
    },

    StopMdxDiscovery: function() {
        nrdp._invoke("mdx", "StopMdxDiscovery");
    },

    RevealTargetPresence: function() {
        nrdp._invoke("mdx", "RevealTargetPresence");
    },

    SetDeviceReplyHeaders: function(deviceReplyHeaders) {
        nrdp._invoke("mdx", "SetDeviceReplyHeaders",
                     {deviceReplyHeaders: nrdp.mdx._encodeArray(deviceReplyHeaders)});
    },

    HideTargetPresence: function() {
        nrdp._invoke("mdx", "HideTargetPresence");
    },

    StartMdxAdvertising: function() {
        nrdp._invoke("mdx", "StartMdxAdvertising");
    },

    StopMdxAdvertising: function() {
        nrdp._invoke("mdx", "StopMdxAdvertising");
    },

    SendMdxHttpRequest: function(url, requestType, xid, curlTimeout, requestHeader, requestBody) {
        nrdp._invoke("mdx", "SendMdxHttpRequest",
                     {url: encodeURIComponent(url),
                      requestType: requestType,
                      xid: xid,
                      curltimeout: curlTimeout,
                      requestHeader: encodeURIComponent(requestHeader),
                      requestBody: encodeURIComponent(requestBody)});
    },

    SendSessionMessage: function(url, requestType, xid, curlTimeout, context, requestHeader, requestBody, message, plaintext) {
        nrdp._invoke("mdx", "SendSessionMessage",
                     {url: encodeURIComponent(url),
                      requestType: requestType,
                      xid: xid,
                      curltimeout: curlTimeout,
                      context: encodeURIComponent(context),
                      requestHeader: encodeURIComponent(requestHeader),
                      requestBody: encodeURIComponent(requestBody),
                      message: encodeURIComponent(message),
                      plaintext: encodeURIComponent(plaintext)});
    },

    SendWebSocketMessage: function(host, xid, body) {
        nrdp._invoke("mdx", "SendWebSocketMessage",
                     {host: encodeURIComponent(host),
                      xid : xid,
                      body: encodeURIComponent(body)});
    },

    ProcessSessionMessage: function(context, xid, message, messageHmac, ciphertext, cb) {
        nrdp.mdx._fn("ProcessSessionMessage",
                     { context: encodeURIComponent(context),
                       xid: xid,
                       message: encodeURIComponent(message),
                       messageHmac: encodeURIComponent(messageHmac),
                       ciphertext: encodeURIComponent(ciphertext)
                     },
                     cb);
    },

    SendMdxHttpResponse: function(url, requestType, xid, curlTimeout, requestHeader, requestBody) {
        nrdp._invoke("mdx", "SendMdxHttpResponse",
                     {url: encodeURIComponent(url),
                      requestType: requestType,
                      xid: xid,
                      curltimeout: curlTimeout,
                      requestHeader: encodeURIComponent(requestHeader),
                      requestBody: encodeURIComponent(requestBody)});
    },

    DialGetDeviceInfo: function(url, USN, serviceType, timeout) {
        nrdp._invoke("mdx", "DialGetDeviceInfo",
                     {url: encodeURIComponent(url),
                      USN: encodeURIComponent(USN),
                      serviceType: encodeURIComponent(serviceType),
                      timeout: timeout});
    },

    beginContext: function(sharedSecret, context, cb) {
        // Note: the parameter "context" is only included in order to make the
        // function signature for nrdp.mdx.beginContext identical to the function
        // signature for nrdp.ntba.beginCustomContext, it is unused (it is unused
        // in the ntba version as well, but we don't bother to even pass it here)
        nrdp.mdx._fn("beginContext",
                     {sharedSecret: sharedSecret},
                     cb);
    },

    endContext: function(context, cb) {
        nrdp.mdx._fn("endContext",
                     {context: context},
                     cb);
    },

    _nextIdx: 1,
    _cbs: [],
    _fn: function(name, params, cb) {
        if (!params) params = {};
        params.idx = this._nextIdx++;
        this._cbs[params.idx] = cb;
        nrdp._invoke("mdx", name, params);
        return params.idx;
    },

    _isEncodedString: function(eventkey) {
        for ( index in nrdp.mdx._encodedStringList) {
            if (eventkey == nrdp.mdx._encodedStringList[index])
                return true;
        }
        return false;
    },

    _decodeEventData: function(data, key) {
        var list, encodedList, item, compareKey, value;
        // set here, so if not found in any lists, the value is returned as-is
        value = data[key];
        if(typeof value != null) {
            for (list in nrdp.mdx._encodedList) {
                if(nrdp.mdx._encodedList.hasOwnProperty(list)) {
                    encodedList = nrdp.mdx._encodedList[list];
                    for (item in encodedList.list) {
                        if(encodedList.list.hasOwnProperty(item)) {
                            compareKey = encodedList.list[item];
                            if (compareKey === key) {
                                return encodedList.decodeFn(value);
                            }
                        }
                    }
                }
            }
        }
        return value;
    },

    _handleEvent: function(event) {
        var mydata = {};

        for (key in event.data) {
            mydata[key] = nrdp.mdx._decodeEventData(event.data, key);
        }

        if (event.name === "returnValue") {
            if(!event.data || !event.data.idx) {
                return false;
            }

            if (typeof this._cbs[event.data.idx] == "function") {
                this._cbs[event.data.idx](mydata.data, mydata.data.idx);
                delete this._cbs[event.data.idx];
            }

            return true;
        } else {
            nrdp._callEventListeners(this, mydata);
            return true;
        }
    },

    _encodeArray: function(arr) {
        var encodedArr = [],
        i;
        for(i in arr) {
            if(arr.hasOwnProperty(i)) {
                encodedArr.push(encodeURIComponent(arr[i]));
            }
        }
        return encodedArr;
    },
};
/*
 * (c) 1997-2013 Netflix, Inc.  All content herein is protected by
 * U.S. copyright and other applicable intellectual property laws and
 * may not be copied without the express permission of Netflix, Inc.,
 * which reserves all rights.  Reuse of any of this content for any
 * purpose without the permission of Netflix, Inc. is strictly
 * prohibited.
 */

/*
 * all nrdp communication helpers are required to do four things:
 *
 * 1. add object to nrdp._backchannels for initialization
 * 2. provide nrdp._setProperty()
 * 3. provide nrdp._invoke()
 * 4. call nrdp._gotEvent() when an event comes in.
 */

(function() {
function _gotEvents() {
    var len = arguments.length;
    for(var a = 0; a < len; ++a)
        nrdp._sendSyncdEvent(nrdp._gotEvent, nrdp, [arguments[a]]);
};

function _setupBackchannel() {
    if (typeof nrdp_platform === "undefined" || typeof this.platform.jscBridgeEnabled === "undefined" || !this.platform.jscBridgeEnabled() )
        return false;
    this.platform.jscBridgeInit(_gotEvents);
    return true;
};

function _setProperty(subobj, prop, val) {
    var obj = subobj ? "nrdp." + subobj : "nrdp";
    var events = this.platform.jscBridgeSetProperty(obj, prop, val);
    if(events)
        _gotEvents(events);
}

function _invoke(obj, method, args) {
    obj = obj ? "nrdp." + obj : "nrdp";
    var events = this.platform.jscBridgeInvoke(obj, method, args);
    if(events)
        _gotEvents(events);
}

function _construct(obj, method, args) {
    obj = obj ? "nrdp." + obj : "nrdp";
    return this.platform.jscBridgeConstruct(obj, method, args);
}

function _console(msg) {
    this.platform.console(msg);
}

function _mono() {
    return this.platform.mono();
}

var backchannel = {
    name: "GibbonJavaScriptCore",
    isNative: true,
    init: _setupBackchannel,
    console: _console,
    setProperty: _setProperty,
    construct: _construct,
    invoke: _invoke,
    mono: _mono,
    // I know this looks weird, but running in Chrome has a problem otherwise
    platform: typeof nrdp_platform === "undefined" ? undefined : nrdp_platform
};

nrdp._backchannels.unshift(backchannel);

})();
