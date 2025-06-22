//-----------------------------------------------------------------------------
// WebSocketManager.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// WebSocketManager.js
//
// Initialize, maintain and shutdown the websocket connection to native code.
// Provide base send/recieve methods for use by js code (for instance wsrequest.js)
//

var WebSocketManager = {
    socket: null,
    requestsSent: null,
    requestId: 0,
    connecting: false,
    reconnecting: false,
    reconnectcount: 0,
    retrytimeout: null,
    connected: false,
    shuttingDown: false,
    handlers: {},
    url: "",
    openSuccess: null,
    openError: null,
    onOpen: function() {
        log.write("WebSocketManager.onopen: connected!");
        var self = this;
        
        this.connecting = false;
        this.connected = true;
        
        var cacheLimitMetadata = application.appSetting("CacheLimitMetadata");
        if (cacheLimitMetadata == -1) {
            cacheLimitMetadata = 2097152;       // default to same as typical Flash value.
        }
        var cacheLimitClosedcaption = application.appSetting("CacheLimitClosedcaption");
        if (cacheLimitClosedcaption == -1) {
            cacheLimitClosedcaption = 2097152; 
        }
        var settings = {CNO_CACHE_LOCAL_PATH: "cache"};     // default
        configuration.callReadAllSettings(null, function() {
            this.send("<RNOWebServiceCall>$$REQUESTID$$<NetworkSettings>" +
        		    "<ConnectTimeout>" + application.appSetting("NetworkConnectTimeout") + "</ConnectTimeout>" +
        		    "<SendTimeout>" + application.appSetting("NetworkSendTimeout") + "</SendTimeout>" + 
        		    "<ReceiveTimeout>" + application.appSetting("NetworkReceiveTimeout") + "</ReceiveTimeout>" + 
        		    "</NetworkSettings></RNOWebServiceCall>",
                self, function(response) {
                    if(!self.reconnecting) {
                        var cachePath = settings["CNO_CACHE_LOCAL_PATH"];
                        // Make the cache call.
                        this.send(  '<RNOCacheCall>' +
                                        '$$REQUESTID$$' +
                                        '<CacheSettings>' +
			                                '<CachePath>' + cachePath + '</CachePath>' +
                                                        '<CacheLimit type="closedcaptions">' + cacheLimitClosedcaption + '</CacheLimit>'+
			                                '<CacheLimit type="Metadata">' + cacheLimitMetadata + '</CacheLimit>' +
	                                    '</CacheSettings>' +
                                    '</RNOCacheCall>',
                            self, function(response) {
                                    if (!self.reconnecting) {
                                        log.write("WebSocketManager.onopen: NetworkSettings response: " + response);
                                        this.openSuccess.call(this);
                                        
                                        //log.write("Test notification send");
                                        //Notifications.sendNotification("<testusercallback/>");
                                        //log.write("Test notification send done");
                                    }
                                    self.reconnecting = false;
                                    self.reconnectcount = 0;
                            }.bind(self)
                        );
                    }
                }.bind(self)
            );
        }.bind(self), settings);
    },
    onError: function() {
        if(this.connecting) {
            log.write("WebSocketManager.onerror: error while connecting");
            this.connecting = false;
            
            if(!this.reconnecting) {
                this.connecting = false;
                // no auto retry on first connection attempt for the moment
                this.openError.call(this);
            }
            else {
                var self = this;
                this.reconnectcount++;
                this.retrytimeout = setTimeout(function(){
                    log.write("WebSocketManager.onError: Retry number " + this.reconnectcount);
                    this.reconnecting = true;
                    this.connect();
                }.bind(self), 500);
            }
        }
        else if(this.connected && !this.shuttingDown) {
            log.write("WebSocketManager.onerror: error on send/response or out of the blue");
            // onClose will be called and will handle retry
        }
        else if(this.connected && this.shuttingDown) {
            log.write("WebSocketManager.onerror: error on close");
            // no retry will be done for this.
        }
    },
    onClose: function() {
        log.write("WebSocketManager.onclose: shuttingdown: " + this.shuttingDown);
        var reconnect = false;

        if((this.connected || this.connecting) && !this.shuttingDown) {
            // close from SDK side or send/recv/connect error, reconnect
            reconnect = true;
        }

        // Send errors to all outstanding requests, the responses are not coming.
        for(var index=this.requestsSent.getOldestIndex(); index<this.requestsSent.getTotalSize(); index++) {
            var request = this.requestsSent.getElementAt(index);
            if(!request.responded) {
                request.responded = true;
                this.respondSocketError(request);
            }
        }
        this.requestsSent.clear();
        
        this.connected = false;
        this.connecting = this.reconnecting;
        this.shuttingDown = false;
        
        if(reconnect) {
            this.reconnectcount++;
            this.reconnecting = true;
            log.write("WebSocketManager.onClose: reconnect attempt number " + this.reconnectcount);
            this.connect();
        }            
    },
    onMessage: function(event) {
        var responseId = -1;
        var reponseData = "";
        var request = null;

        //log.write("WebSocketManager: onmessage: event.data: " + event.data);
        
        responseId = this.getRequestId(event.data);
        if(responseId > -1) {
            //log.write("WebSocketManager.onmessage: responseId " + responseId);
            
            // Search out matching queued sent request
            for(var index=this.requestsSent.getOldestIndex(); index<this.requestsSent.getTotalSize(); index++) {
                request = this.requestsSent.getElementAt(index);
                //log.write("WebSocketManager.onmessage: index " + index + " of " + this.requestsSent.getTotalSize() + ", id " + request.id);

                if(request.id == responseId) {
                    //log.write("WebSocketManager.onmessage: matched id: " + responseId);
                    
                    request.responded = true;
                    
                    if(index == this.requestsSent.getOldestIndex()){
                        // cleanup, traverse into queue and dequeue as we find responded flags true
                        //log.write("WebSocketManager.onmessage: cleanup: oldest is " + this.requestsSent.getOldestElement().id + ", responded " + this.requestsSent.getOldestElement().responded);
                        
                        while(this.requestsSent.getOldestElement() && this.requestsSent.getOldestElement().responded) {
                            this.requestsSent.dequeue();
                        }
                    }
                    
                    //log.write("WebSocketManager.onmessage: calling request callback");
                    request.callback.call(request.callback.context, event.data);
                    
                    break;
                }
            }
        }
        else {
            //log.write("WebSocketManager.onmessage: RequestId not specified, checking for handler");

            var dom;
            try {
                dom = XML.rootFromString(event.data);
            }
            catch(e) {
                log.write("WebSocketManager.onmessage: Error parsing XML from event data");
                dom = null;
            }

            if(dom !== null){
                //XML.dumpDOM(dom);
                var node = dom.firstChild;
                if(node.nodeName in this.handlers) {
                    //log.write("WebSocketManager.onmessage: handler [" + node.nodeName + "] found, calling callback handler function");
                    this.handlers[node.nodeName].callback.call(this.handlers[node.nodeName].context, node);
                }
                else {
                    log.write("WebSocketManager.onmessage: nodeName " + node.nodeName + " not in handlers :: " + XML.toString(dom));
                }
            }
            else {
                log.write("WebSocketManager.onmessage: null dom");
            }
        }
    },
    initialize: function(url, success, error) {
        this.openSuccess = success;
        this.openError = error;
        this.url = (url && url.length > 0) ? url : "ws://localhost:31415/res";

        if(!this.requestsSent) {
            this.requestsSent = new Queue();
        }
        
        this.connect();
    },
    connect: function() {
        log.write("WebSocketManager.connect: Connecting!");
        var self = this;
        this.connecting = true;
        
        this.socket = new WebSocket(this.url);
        this.socket.onopen = this.onOpen.bind(self);
        this.socket.onerror = this.onError.bind(self);
        this.socket.onclose = this.onClose.bind(self);
        this.socket.onmessage = this.onMessage.bind(self);
    },
    shutdown: function() {
        if(this.connected && !this.shuttingDown) {
            this.socket.close();
			this.shuttingDown = true;			
        }
    },
    send: function(requestData, context, callback) {
        //log.write("WebSocketsManager.send: connected " + this.connected + ", shuttingDown " + this.shuttingDown + ", requestsSent " + this.requestsSent + ", requestId " + this.requestId);
        var request = {id: this.requestId++, responded: false, requestData: requestData, context: context, callback: callback};
        
        if(this.connected && !this.shuttingDown && this.requestsSent !== null) {
            var requestParts = requestData.split("$$REQUESTID$$");
            if(requestParts.length == 2) {
                //log.write("WebSocketManager.send: $$REQUESTID$$ found and replaced");
                requestData = requestParts[0];
                requestData += '<UserData ID="' + request.id + '"></UserData>';
                requestData += requestParts[1];
                //log.write("WebSocketManager.send: new requestData: " + requestData);
            }
            else {
                log.write("WebSocketManager.send: $$REQUESTID$$ not found");
            }
            
            this.requestsSent.enqueue(request);
            this.socket.send(requestData);
        }
        else {
            this.respondSocketError(request);
        }
    },
    getRequestId: function(response) {
        var responseDOM = XML.rootFromString(response);
        var nodes = responseDOM.getElementsByTagName("UserData");
        if(nodes && nodes.length && nodes[0].attributes && nodes[0].attributes.length) {
            var attrs = nodes[0].attributes;
            for(var index=0; index < attrs.length; index++) {
                if(attrs[index].nodeName == "ID") {
                    return new Number(attrs[index].nodeValue);
                }
            }
        }
        return -1;
    },
    addHandler: function(parseKey, context, callback) {
        this.handlers[parseKey] = {callback: callback, context: context};
    },
    respondSocketError: function(request) {
        // Generate response to be interpreted as an special error in WSRequest and webservices.js layers
        var response = '<Response>';
        if(request.requestData.split("$$REQUESTID$$").length == 2) {
            response += '<UserData ID="' + request.id + '"></UserData>';
        }
        response += '<SocketError>There was a socket connection error.</SocketError></Response>';
        
        request.callback.call(request.context, response);
    },
    clearContentCache: function(callback) {
        // Make the request down to the Cache handler in the SDK.
        var self = this;
        this.send(  '<RNOCacheCall>' +
                        '$$REQUESTID$$' +
                    	'<PurgeData tableType="metadata" cacheType="Metadata"/>' +
                    '</RNOCacheCall>',
                    self, function(response) {
                            callback.call();
                          }.bind(self)
        );
    }
};
