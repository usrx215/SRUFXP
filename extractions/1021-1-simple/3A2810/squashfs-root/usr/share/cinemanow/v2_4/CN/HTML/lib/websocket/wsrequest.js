//-----------------------------------------------------------------------------
// wsrequest.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// wsrequest.js
//
// WebSockets version of wsrequest handler.
//

function WSRequest() {
	this.headers = {};
	this.action = "GET";
	this.url = "";
	this.timeoutTimer = null;
	this.startTime = -1;
	this.endTime = -1;
	this.requestRunTime = -1;
	this.cacheKey = "";         // can be empty during call if none needed
}

WSRequest.prototype.setTarget = function(a_action, a_url) {
	this.action = a_action;
	this.url = a_url;
};

WSRequest.prototype.addHeader = function(header, value) {
	this.headers[header] = value;
};

WSRequest.prototype.setTimeout = function(callback, period) {
	this.timeoutTimer = setTimeout(callback, period);
};

WSRequest.prototype.setOnComplete = function(callback) {
	this.onCompleteCallback = callback;
};

WSRequest.prototype.setCacheKey = function(cacheKey) {
    if (cacheKey) {
        this.cacheKey = cacheKey;
    }
}

WSRequest.prototype.abort = function() {
    log.write("WSRequest (WebSocket): abort");
    
	clearTimeout(this.timeoutTimer);
	this.timeoutTimer = null;
	this.onCompleteCallback = undefined;
};

WSRequest.prototype.send = function(requestText) {
	var self = this;
	
    var request = '<RNOWebServiceCall>$$REQUESTID$$<HTTPCall url="' + this.url + '" method="' + this.action + '" cacheKey="' + this.cacheKey + '">';
	for(header in this.headers) {
        request += '<Header field="' + header + '">' + this.headers[header] + '</Header>';
	}	
    request += '<Body>' + requestText + '</Body></HTTPCall></RNOWebServiceCall>';
    
    //log.write("WSRequest (WebSocket): " + request);
    
	this.startTime = new Date();
    
    WebSocketManager.send(request, this, function(response) {
        self.endTime = new Date();
        self.requestRunTime = $cn.utilities.DateDiff(self.endTime, self.startTime);

        log.write("WSRequest (WebSocket) response [" + self.startTime + " - " + self.endTime + "] [" + self.requestRunTime + "ms]");

        clearTimeout(self.timeoutTimer);
        self.timeoutTimer = null;

        var responseDOM;
        try {
            //log.write("WSRequest (WebSocket) response: " + response);
            responseDOM = XML.rootFromString(response).firstChild;
        }
        catch(e) {
            log.write("WSRequest (WebSocket): parsing error: " + e);
            throw(e);
        }
        
        //log.write("WSRequest (WebSocket) About to parse for HTTPCall_Response");
        var nodes = responseDOM.getElementsByTagName("HTTPCall_Response");
        if(nodes && nodes.length) {
            var attrs = nodes[0].attributes;
            for(var index=0; index<attrs.length; index++) {
                var attr = attrs[index];
                if(attr.nodeName == "error") {
                    self.error = new Number(attr.nodeValue);
                    if (self.error != 0) {
                        log.write("WSRequest (WebSocket) HTTPCall_Response self.error set to non-zero: " + self.error);
                    }
                    else {
                        //log.write("WSRequest (WebSocket) HTTPCall_Response self.error set to zero: 0");
                    }
                }
                else if(attr.nodeName == "statusCode") {
                    self.status = new Number(attr.nodeValue);
                    //log.write("WSRequest (WebSocket) self.status set from statusCode: " + self.status);
                }
                else if(attr.nodeName == "reasonPhrase") {
                    self.statusText = attr.nodeValue; 
                }
            }
            
            self.responseText = response.substring(response.indexOf("<Body>")+6, response.indexOf("</Body>"));
            self.responseText = self.responseText.split('&quot;').join('"').split('&apos;').join("'").split('&gt;').join('>').split('&lt;').join('<').split('&amp;').join('&');

            if(configuration.readValue("PreferredDRMProvider") != "DIVX" && (!self.responseText || !self.responseText.length || (self.responseText.indexOf('"responseCode":') < 0 && self.responseText.indexOf('"result":') < 0))) {
                log.write("WSRequest (WebSocket): no result or responseCode member in responseText, forcing to system error status");
                log.write("WSRequest (WebSocket) response: " + response);
                if (self.error && self.error == 80140001) {
                	self.status = 502;
                }
                else {
                	self.status = 500; // Should be 550 or 2012?
                }
            }
            
            // To force a bad return, uncomment and set the ws api name here
            //if(response.indexOf('setupDevice') > -1) {
            //    self.status = 500;
            //}
        }
        else {
            log.write("WSRequest (WebSocket): no HTTPCall_Response node?");
            XML.dumpDOM(responseDOM);
            var nodes = responseDOM.getElementsByTagName("SocketError")
            if(nodes && nodes.length) {
                log.write("WSRequest (WebSocket): SOCKET ERROR");
                self.status = 2013;
            }
            else {
                self.status = 500; // Should be 550 or 2012?
            }
        }
        
        if (self.onCompleteCallback) {
        	self.onCompleteCallback.call(self);
        }
	});
    
	//log.write("  Send at: " + this.startTime);
};

WSRequest.prototype.clearContentCache = function(callback) {
    // Make the request down to the web socket manager.
    WebSocketManager.clearContentCache(callback);
};
