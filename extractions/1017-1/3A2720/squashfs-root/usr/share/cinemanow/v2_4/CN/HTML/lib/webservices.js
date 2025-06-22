//-----------------------------------------------------------------------------
// webservices.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// webservices.js
//

var webservices = {
	WSRObj: null, 
    apiKey: '',
    destType: '',
    uniqueId: '',
    userAgent: '',
	RequestQueue: null,
	RequestInProgress: false,
    makeAsyncRequest: function (a_end_point, a_method, a_params, cb_context, a_cb, a_cachekey, a_timeout) {
    	if(!this.RequestQueue) {
    		this.RequestQueue = new Queue();
    	}
		this.RequestQueue.enqueue({endPoint: a_end_point, 
		                            method: a_method, 
		                            params: a_params, 
		                            cb_context: cb_context, 
		                            callback: a_cb, 
		                            cacheKey: a_cachekey,
		                            timeout: a_timeout});
    	this.processAsyncQueueRequest();
	},
	killCurrentRequests: function () {
	    var x;
    	if(this.RequestQueue) {
		    for(x = 0; x < this.RequestQueue.getSize(); x++){
			    var queuedElement = this.RequestQueue.dequeue();
			    log.write("webservices.killCurrentRequests: Dequeuing requests...");
		    }

			this.killCurrentRequest();
    	}
	},
	processAsyncQueueRequest: function () {
		var self = this,
            url,
            request,
            reqText;
    	// [PROVEN FUNCTIONALITY] log.write("Current Queue Size: " + this.RequestQueue.getSize());
    	if(!this.RequestInProgress) {
    		this.RequestInProgress = true;
    		log.write("Item is 1st in line or called from the queue.");
			var queuedElement = this.RequestQueue.dequeue(),
			    a_end_point = queuedElement.endPoint,
			    a_method = queuedElement.method,
			    a_params = queuedElement.params,
			    cb_context = queuedElement.cb_context,
			    a_cb = queuedElement.callback,
			    a_timeout = queuedElement.timeout;
			//log.write(log.dumpObj(queuedElement));
	    		
			url = application.apiUrl + "/" + a_end_point;
	        
			request = {  id: ++nextRequestId + '_' + a_method, method: a_method, params: a_params, cb_context: cb_context, callback: a_cb};
			reqText = JSON.stringify(request);
	        
			this.killCurrentRequest();
	        
		    this.WSRObj = new WSRequest();
		    
	        // Create timeout timer - this isn't generally the one thrown
            //   the device has the ability to send back an API response if it detects that there is not connection
            //   so this is set for after the "offical" timeout time as a final fail safe.
            if (!a_timeout) {
                // default timeout value
                a_timeout = application.appSetting("WSRequestTimeout");
            }
            if (a_timeout >= 0) {
				this.WSRObj.setTimeout(function(){
					self.WSRObj.abort();
					self.RequestInProgress = false;
					log.write('webservices.makeAsyncRequest: Web Service Timeout Error.');
					
					if(application.isLoaded) {
						//If the current timeout occurred on doPurchase then publish a custom error
						application.events.publish("error", {type: "timeout_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
					}
					else {
						application.ui.init(function(){
							application.events.publish("error", {type: "timeout_error", recoverable: false, endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
						});
					}
				}, a_timeout*1000);
            }
			
			if(application.logSupported || application.appSetting('Debug')){
				log.write('\nwebservices.makeAsyncRequest\nAbout to send request: ' + reqText + " to " + url);
				//log.debug('*******************\n\nAbout to send request: ' + reqText + " to " + url);
				log.write('x-json-rpc: '+a_method+',APIKey: '+this.apiKey+',DestinationTypeID: '+this.destType+',DestinationUniqueID: '+this.uniqueId+',User_Agent: '+this.userAgent+',SessionID: '+$cn.data.SessionId+',AuthToken'+ $cn.data.AuthToken+',$cn.data.IsParent:' + $cn.data.IsParent);
			}
			
			this.WSRObj.setTarget('POST', url);
			this.WSRObj.setCacheKey(queuedElement.cacheKey);
			this.WSRObj.addHeader('Content-Type', 'text/plain; charset=utf-8');
			this.WSRObj.addHeader('Accept', "*/*");			
			this.WSRObj.addHeader('Accept-Language', "en-us");
			
			if(application.authSupported){
				this.WSRObj.addHeader('x-json-rpc', a_method);
				this.WSRObj.addHeader('Connection', "Keep-Alive");
				this.WSRObj.addHeader('Pragma', "no-cache");
				this.WSRObj.addHeader('AuthToken', $cn.data.AuthToken);
				this.WSRObj.addHeader('APIKey', this.apiKey);
				this.WSRObj.addHeader('DestinationTypeID', this.destType);
				this.WSRObj.addHeader('DestinationUniqueID', this.uniqueId);
				this.WSRObj.addHeader("User-Agent", this.userAgent);
				this.WSRObj.addHeader("FileFilter", "streamonly"); /* ( none / any / streamonly / downloadonly ) */
				this.WSRObj.addHeader("AccountType", ($cn.data.IsParent) ? "Parent" : "Child"); 
				this.WSRObj.addHeader("SessionID", $cn.data.SessionId); 
			}
				
			this.WSRObj.setOnComplete(function(){
				self.RequestInProgress = false;
				
				var result = { err: true, text: '', data: {} };
				application.isConnected = true;
					
				if (self.WSRObj.status && self.WSRObj.status != 200) {	                	   
					result.text = 'webservices.makeAsyncRequest: call failed\nStatus: ' + self.WSRObj.status;
					result.err = true;
					
					if(self.WSRObj.status == "502" || self.WSRObj.status == "1007" || self.WSRObj.status == "1013") {
						application.events.publish("error", {type: "no_internet", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
					}
					else if (self.WSRObj.status == "2013"){
						application.events.publish("error", {type: "socket_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb, "status": self.WSRObj.status});                   
					}          
					else {
						application.events.publish("error", {type: "system_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb, "status": self.WSRObj.status});                   
					}          
				}
				else {
					if(device.logSupported || application.appSetting('Debug')){
						log.write('webservices.makeAsyncRequest: status: ' + self.WSRObj.status + ' Request successful: ' + self.WSRObj.responseText);
					}
					
					try {
						//Check to make sure that there was a response text sent back. Else the response could have been aborted and should pop up the timeout/connection errors
						if(self.WSRObj.responseText && self.WSRObj.responseText.length > 0) {
							result.err = false;
							result.text = 'CinemaNOW request successful';
							//log.write(self.WSRObj.responseText);
							result.data = JSON.parse(self.WSRObj.responseText);
							
							if(application.authSupported && result.data && result.data.result && result.data.result.responseCode == 31 
									&& a_method != 'pollForToken' && a_method != 'lookupPurchaseDetailsForTitle' && a_method != 'calcOrderTax' && a_method != 'getBillingInfo') {
								application.events.publish("badauthtoken",{endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
							}
							else {
								a_cb.call(cb_context, result);

								if (result.data.result && result.data.result.responseCode && !result.data.result.errorHandled) {
									// UI will set result.errorHandled to true if it handles response error.
									// If it's not handled in UI, handle response error here.
									self.handleResponseError(result.data, {type:"", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
								}
							}
						}
						else {
							if((self.WSRObj.requestRunTime >= (application.appSetting("WSRequestTimeout") * 1000)) && !doNotTriggerTimeouts){
								application.events.publish("error", {type: "timeout_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });	
							}
						}
				    }
					catch (e){
						log.write("webservices.makeAsyncRequest EXCEPTION " + e);
						log.write("webservices.makeAsyncRequest Setting system_error!");
						log.write(log.dump(e, 8));
						application.events.publish("error", {type: "system_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
					}
				}
				   
				//After we make the callback we check if there is another request in the queue. If the answer is yes then we will make another request from the queue
				if(self.RequestQueue.getSize() > 0) {
					log.write("webservices.processAsyncQueueRequest: Another item is in the queue. Call it.");
					self.processAsyncQueueRequest();
				}
			});
			
			this.WSRObj.send(reqText);
    	}
	},
	makeXMLAsyncRequest: function (a_end_point, a_method, a_params, cb_context, a_cb, killprevious, inqueue, doNotTriggerTimeouts) {
		var x,
            self = this,
            url,
            reqText;
		
    	if(!this.RequestQueue) {
    		this.RequestQueue = new Queue();
    	}
    	
    	//If killprevious request flag is set then empty the previous queue so the current request will trump all
    	if(killprevious && !inqueue){
    		
    		for(x = 0; x < this.RequestQueue.getSize(); x++){
    			var queuedElement = this.RequestQueue.dequeue();
    			log.write("webservices.makeXMLAsyncRequest: Override passed in. Dequeuing requests...");
    		}
			
			this.killCurrentRequest();
    	}
    	//log.write("Queue size: " + this.RequestQueue.getSize());
    	
    	if(!inqueue){
    		this.RequestQueue.enqueue({endPoint: a_end_point, method: a_method, params: a_params, cb_context: cb_context, callback: a_cb});
    	}
    	
    	// [PROVEN FUNCTIONALITY] log.write("Current Queue Size: " + this.RequestQueue.getSize());
    	if(!this.RequestInProgress) {
    		this.RequestInProgress = true;
    		log.write("Item is 1st in line or called from the queue.");
			var queuedElement = this.RequestQueue.dequeue();
			a_end_point = queuedElement.endPoint;
			a_method = queuedElement.method;
			a_params = queuedElement.params;
			cb_context = queuedElement.cb_context;
			a_cb = queuedElement.callback;
			//log.write(log.dumpObj(queuedElement));
	    	
			url = application.apiUrl + "/" + a_end_point;
			reqText = "";
			if(typeof(a_params.TagStart) != "undefined"){
				reqText += a_params.TagStart;
			}
			
			if(application.authSupported){
				reqText += '<APIKey>' + this.apiKey  + '</APIKey>';
				reqText += '<DeviceUniqueID>' + this.uniqueId  + '</DeviceUniqueID>';
				reqText += '<DeviceTypeID>' + this.destType  + '</DeviceTypeID>';
				reqText += '<AuthToken>' + $cn.data.AuthToken  + '</AuthToken>';
			}
			for(var name in a_params){
				if (name != "TagStart" && name != "TagEnd")
					reqText += '<' + name + '>' + a_params[name].toString()  + '</' + name + '>';
			}
			if(typeof(a_params.TagEnd) != "undefined"){
				reqText += a_params.TagEnd;
			}
			reqText = reqText.split('&').join('&amp;').split('"').join('&quot;').split("'").join('&apos;').split('>').join('&gt;').split('<').join('&lt;');
			
			this.killCurrentRequest();
	        
		    this.WSRObj = new WSRequest();
		    
	        // Create timeout timer - this isn't generally the one thrown
            //   the device has the ability to send back an API response if it detects that there is not connection
            //   so this is set for after the "offical" timeout time as a final fail safe.
            if (! doNotTriggerTimeouts) {
				this.WSRObj.setTimeout(function(){
					self.WSRObj.abort();
					self.RequestInProgress = false;
					log.write('webservices.makeXMLAsyncRequest: Web Service Timeout Error.');
					
					if(application.isLoaded) {
						//If the current timeout occurred on doPurchase then publish a custom error
						application.events.publish("error", {type: "timeout_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
					}
					else {
						application.ui.init(function(){
							application.events.publish("error", {type: "timeout_error", recoverable: false, endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
						});
					}
				}, (application.appSetting("WSRequestTimeout") * 1000)); 
            }
			
			if(application.logSupported || application.appSetting('Debug')){
				log.write('\nwebservices.makeXMLAsyncRequest\n '+a_method +'About to send request: ' + reqText + " to " + url);
				log.write('APIKey: '+this.apiKey+',DestinationTypeID: '+this.destType+',DestinationUniqueID: '+this.uniqueId+',User_Agent: '+this.userAgent+',SessionID: '+$cn.data.SessionId+',AuthToken'+ $cn.data.AuthToken+',$cn.data.IsParent:' + $cn.data.IsParent);
			}
			
			this.WSRObj.setTarget('POST', url);
			this.WSRObj.addHeader('Content-Type', 'text/xml');
			
			this.WSRObj.setOnComplete(function(){
				self.RequestInProgress = false;
				
				var result = { err: true, text: '', data: {} };
				application.isConnected = true;
				
				if (self.WSRObj.status && self.WSRObj.status != 200) {	                	   
					result.text = 'webservices.makeXMLAsyncRequest: call failed\nStatus: ' + self.WSRObj.status;
					result.err = true;
					
					if(self.WSRObj.status == "502" || self.WSRObj.status == "1007" || self.WSRObj.status == "1013") {
						application.events.publish("error", {type: "no_internet", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
					}
					else if (self.WSRObj.status == "2013"){
						application.events.publish("error", {type: "socket_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb, "status": self.WSRObj.status});                   
					} 
					else {
						application.events.publish("error", {type: "system_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb, "status": self.WSRObj.status});                   
					}
				}
				else {
					if(device.logSupported || application.appSetting('Debug')){
						log.write('webservices.makeXMLAsyncRequest: status: ' + self.WSRObj.status + ' Request successful: ' + self.WSRObj.responseText);
					}
					
					try {
						//Check to make sure that there was a response text sent back. Else the response could have been aborted and should pop up the timeout/connection errors
						if(self.WSRObj.responseText && self.WSRObj.responseText.length > 0) {
							result.err = false;
							result.text = 'CinemaNOW request successful';
							//log.write(self.WSRObj.responseText);
							
							var resultNode = XML.rootFromString(self.WSRObj.responseText);
							result.data.id = a_method;
							result.data.result = XML.nodesToJSONString(resultNode.firstChild.childNodes);							
							result.data.result = JSON.parse(result.data.result);

							
							if(application.authSupported && result.data && result.data.result && result.data.result.responseCode == 31 
									&& a_method != 'pollForToken' && a_method != 'lookupPurchaseDetailsForTitle' && a_method != 'calcOrderTax' && a_method != 'getBillingInfo') {
								application.events.publish("badauthtoken",{endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
							}
							else {
								a_cb.call(cb_context, result);

								if (result.data.result && result.data.result.responseCode && !result.data.result.errorHandled) {
									// Handle response code error if it's not handled in UI.
									self.handleResponseError(result.data, {type:"", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
								}
							}
						}
						else {
							if((self.WSRObj.requestRunTime >= (application.appSetting("WSRequestTimeout") * 1000)) && !doNotTriggerTimeouts){
								application.events.publish("error", {type: "timeout_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });	
							}
						}
				    }
					catch (e){
						log.write("webservices.makeXMLAsyncRequest EXCEPTION " + e);
						log.write("webservices.makeXMLAsyncRequest Setting system_error!");
						log.write(log.dump(e, 8));
						application.events.publish("error", {type: "system_error", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb });
					}
				}
				   
				//After we make the callback we check if there is another request in the queue. If the answer is yes then we will make another request from the queue
				if(self.RequestQueue.getSize() > 0) {
					log.write("webservices.makeXMLAsyncRequest Another item is in the queue. Call it.");
					self.makeXMLAsyncRequest('', '', '', '', '', false, true, false);
				}
			});
			
			this.WSRObj.send(reqText);
    	}
	},
    makeAsyncRequestExt: function(a_host, a_end_point, a_method, a_params, a_publish_errors, cb_context, a_success_cb, a_error_cb, killprevious, inqueue) {
    	if(!this.RequestQueue) {
    		this.RequestQueue = new Queue();
    	}
    	
    	//If killprevious request flag is set then empy the previous queue so the current request will trump all
    	if(killprevious && !inqueue){
    		for(x = 0; x < this.RequestQueue.getSize(); x++){
    			var queuedElement = this.RequestQueue.dequeue();
    			log.write("webservices.makeAsyncRequestExt: Override passed in. Dequeuing requests...");
    		}
    	}
    	
    	if(!inqueue){
    		this.RequestQueue.enqueue({host: a_host, endPoint: a_end_point, method: a_method, params: a_params, cb_context: cb_context, callback: a_success_cb, errorcb: a_error_cb});
    	}
    	
    	if(!this.RequestInProgress) {
    		this.RequestInProgress = true;
			var queuedElement = this.RequestQueue.dequeue();
            
            a_host = queuedElement.host;
			a_end_point = queuedElement.endPoint;
			a_method = queuedElement.method;
			a_params = queuedElement.params;
			cb_context = queuedElement.cb_context;
			a_success_cb = queuedElement.callback;
            a_error_cb = queuedElement.errorcb;

            if(a_host == null)
                a_host = application.apiUrl;
            var url = a_host + '/' + a_end_point;
            var request = {id: ++nextRequestId + '_' + a_method, method: a_method, params: a_params};
            var reqText = JSON.stringify(request);
            
            var self = this;
            
			this.killCurrentRequest();
            
            this.WSRObj = new WSRequest();
            
            //Create 30 second timeout timer
			this.WSRObj.setTimeout(function() {
                log.write("webservices.makeAsyncRequestExt: timeout function");
                
                self.RequestInProgress = false;
                self.WSRObj.abort();
                if(a_publish_errors)
                    application.events.publish("error", {type: "timeout_error", endPoint: url, method: a_method, params: {}, callback: a_error_cb });
                else a_error_cb.call(cb_context);
            }, 
			(application.appSetting("WSRequestTimeout") * 1000));
            
            try {
                this.WSRObj.setTarget('POST', url);
                this.WSRObj.addHeader('Content-Type', 'text/plain; charset=utf-8');
                this.WSRObj.addHeader('Accept', "*/*");			
                this.WSRObj.addHeader('Accept-Language', "en-us");
                
                if(application.authSupported){
                    this.WSRObj.addHeader('x-json-rpc', a_method);
                    this.WSRObj.addHeader('Connection', "Keep-Alive");
                    this.WSRObj.addHeader('Pragma', "no-cache");
                    this.WSRObj.addHeader('AuthToken', $cn.data.AuthToken);
                    this.WSRObj.addHeader('APIKey', this.apiKey);
                    this.WSRObj.addHeader('DestinationTypeID', this.destType);
                    this.WSRObj.addHeader('DestinationUniqueID', this.uniqueId);
                    this.WSRObj.addHeader("User-Agent", this.userAgent);
                    this.WSRObj.addHeader("FileFilter", "streamonly"); /* ( none / any / streamonly / downloadonly ) */
                    this.WSRObj.addHeader("AccountType", ($cn.data.IsParent) ? "Parent" : "Child"); 
                    this.WSRObj.addHeader("SessionID", $cn.data.SessionId); 
                }
                
                this.WSRObj.setOnComplete(function(){
					self.RequestInProgress = false;
					var result = { err: true, text: '', data: {} };
			
					if (self.WSRObj.status != null && self.WSRObj.status != 200) {
						result.text = 'webservices.makeAsyncRequestExt: call failed\nStatus: ' + self.WSRObj.status;
						result.err = true;
						log.write(result.text);
						
						if(a_publish_errors) {
							if(self.WSRObj.status == "502" || self.WSRObj.status == "1007" || self.WSRObj.status == "1013") {
								application.events.publish("error", {type: "no_internet", endPoint: url, method: a_method, params: {}, callback: a_error_cb });
							}
							else if (self.WSRObj.status == "2013") {
								application.events.publish("error", {type: "socket_error", endPoint: url, method: a_method, params: {}, callback: a_error_cb });
							}
							else {
								application.events.publish("error", {type: "system_error", endPoint: url, method: a_method, params: {}, callback: a_error_cb });
							}
						}
						else a_error_cb.call(cb_context);
					}
					else {
						//log.write('webservices.makeAsyncRequestExt: call successful: ' + self.WSRObj.responseText);
			
						try {
							result.err = false;
							result.text = 'CinemaNOW request successful';
							result.data = JSON.parse(self.WSRObj.responseText);							
							
							if(application.authSupported && result.data && result.data.result && result.data.result.responseCode == 31 
									&& a_method != 'pollForToken' && a_method != 'lookupPurchaseDetailsForTitle' && a_method != 'calcOrderTax' && a_method != 'getBillingInfo') {
								application.events.publish("badauthtoken",{endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
							}
							else {
								a_success_cb.call(cb_context, result);

								if (result.data.result && result.data.result.responseCode && !result.data.result.errorHandled && a_publish_errors) {
									// Handle response code error if it's not handled in UI.
									self.handleResponseError(result.data, {type:"", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
								}
							}
						}
						catch (e){
							log.write('Callback exception!   '  + e);
							if(a_publish_errors)
								application.events.publish("error", {type: "system_error", endPoint: url, method: a_method, params: {}, callback: a_error_cb });
							else a_error_cb.call(cb_context);
						}
					}

					//After we make the callback we check if there is another request in the queue. If the answer is yes then we will make another request from the queue
					if(self.RequestQueue.getSize() > 0) {
						log.write("Another item is in the queue. Call it.");
						self.processAsyncQueueRequest();
					}
                });
                
                this.WSRObj.send(reqText);
            }
            catch(e){
                log.write(e);
                this.RequestInProgress = false;
				self.WSRObj.abort();
                if(a_publish_errors)
                    application.events.publish("error", {type: "system_error", endPoint: url, method: a_method, params: {}, callback: a_error_cb });
                else a_error_cb.call(cb_context);
            }
        }
		else {
			application.apiUrl = application.appSetting("ApiUrl");
			//log.write('Current API URL: ' + this.apiUrl);
            $cn.data.apiUrl  = application.apiUrl;
            
            a_success_cb.call(this, application.apiUrl);
		}
    },
	makeRestRequest: function (a_end_point, cb_context, a_cb) {
		var url = a_end_point;
        var self = this;
        
		this.killCurrentRequest();

	    this.WSRObj = new WSRequest();
	    
        /* Create 30 second timeout timer */
	    this.WSRObj.setTimeout(function(){
            self.WSRObj.abort();
            self.RequestInProgress = false;
            log.write('Web Service Timeout Error.');            
            
            if(application.isLoaded) {
            	application.events.publish("error", {type: "timeout_error", endPoint: url, method: a_method, params: a_params, callback: a_cb });
            }
            else {
            	application.ui.init(function(){
            		application.events.publish("error", {type: "timeout_error", recoverable: false, endPoint: url, method: a_method, params: a_params, callback: a_cb });
            	});
            }	
		}, 
		(application.appSetting("WSRequestTimeout") * 1000));
				
		
	    try {
            this.WSRObj.setTarget('GET', url);
            this.WSRObj.addHeader('Content-Type', 'text/plain; charset=utf-8');
			this.WSRObj.addHeader('Accept', "*/*");			
			this.WSRObj.addHeader('Accept-Language', "en-us");
			
			if(application.authSupported){
				this.WSRObj.addHeader('Connection', "Keep-Alive");
				this.WSRObj.addHeader('Pragma', "no-cache");
				this.WSRObj.addHeader('APIKey', this.apiKey);
				this.WSRObj.addHeader('DestinationTypeID', this.destType);
				this.WSRObj.addHeader('DestinationUniqueID', this.uniqueId);
				this.WSRObj.addHeader("User-Agent", this.userAgent);
				this.WSRObj.addHeader("FileFilter", "streamonly"); /* ( none / any / streamonly / downloadonly ) */
				this.WSRObj.addHeader("SessionID", $cn.data.SessionId); 
			}
            
			this.WSRObj.setOnComplete(function(){
				var result = { err: true, text: '', data: {} };
				
				if (self.WSRObj.status && self.WSRObj.status != 200) {
					result.text = 'WSRequest: call failed\nStatus: ' + self.WSRObj.status;
					result.err = true;
					log.write(result.text);
				   
					if(self.WSRObj.status == "502" || self.WSRObj.status == "1007" || self.WSRObj.status == "1013") {
						application.events.publish("error", {type: "no_internet", endPoint: url, method: a_method, params: a_params, callback: a_cb });
					}
					else if (self.WSRObj.status == "2013"){
						application.events.publish("error", {type: "socket_error", endPoint: url, method: a_method, params: a_params, callback: a_cb });               
					}          
					else {
						application.events.publish("error", {type: "system_error", endPoint: url, method: a_method, params: a_params, callback: a_cb });               
					}          
				}
				else {
					log.write('WSRequest: call successful to: ' + url);
					
					try {
						result.err = false;
						result.text = 'RES request successful';
						result.data = JSON.parse(self.WSRObj.responseText);
						
						if(application.authSupported && result.data && result.data.result && result.data.result.responseCode == 31 
								&& a_method != 'pollForToken' && a_method != 'lookupPurchaseDetailsForTitle' && a_method != 'calcOrderTax' && a_method != 'getBillingInfo') {
							application.events.publish("badauthtoken",{endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
						}
						else {
							a_cb.call(cb_context, result);

							if (result.data.result && result.data.result.responseCode && !result.data.result.errorHandled) {
								// Handle response code error if it's not handled in UI.
								self.handleResponseError(result.data, {type:"", endPoint: a_end_point, method: a_method, params: a_params, callback: a_cb});
							}
						}
					}
					catch (e) {
						log.write(log.dump(e, 8));
						// TODO: This publish call fails with ReferenceError a_method not found. 
						// TODO: Need to fix that somehow and then test by hacking up resources.en. 
						application.events.publish("error", {type: "system_error", endPoint: url, method: a_method, params: a_params, callback: a_cb });
					}
				}
            });
			
			this.WSRObj.send({});
	    }
	    catch(e){
	    	log.write(log.dump(e, 8));
	    	this.RequestInProgress = false;
			this.WSRObj.abort();
            application.events.publish("error", {type: "system_error", endPoint: url, method: a_method, params: a_params, callback: a_cb });
	    }
	},
    makeLogRequest: function(log, cb_context, callback){
    	
    	var url = "http://swelogs.stage1.outcoursing.com/capture.ashx";
        var d=new Date();
        var self = this;

		var request = {  id: ++nextRequestId + '_makeLogRequest', 
			deviceid: this.uniqueId, 
			devicename: $cn.data.DeviceName, 
			useragent: this.userAgent,
			devicetype: this.destType, 
			apikey: this.apiKey,
			platform: "v2", 
			version: $cn.data.SoftwareVersion,
			log: log 
		};
		
		var reqText = JSON.stringify(request);
        
		killCurrentRequest();
        
	    this.WSRObj = new WSRequest();
		
		log.write('*******************\n\nAbout to send logging request: ' + reqText + " to " + url);
		log.debug('*******************\n\nAbout to send logging request: ' + reqText + " to " + url);
		this.WSRObj.setTarget('POST', url);
		this.WSRObj.addHeader('Content-Type', 'text/plain; charset=utf-8');
		this.WSRObj.addHeader('Accept', "*/*");			
		this.WSRObj.addHeader('Accept-Language', "en-us");
		this.WSRObj.setOnComplete(function(){
			log.write("Logging Output to server: [status]: " + self.WSRObj.status + ", [Response]: " + self.WSRObj.responseText);
			callback.call(cb_context, "");
	    });
		
		this.WSRObj.send(reqText);
    	
    },
	killCurrentRequest: function() {
    	if(this.WSRObj != null) {
        	try {
                this.WSRObj.abort();
                if(this.WSRObj.destroy) {
                    this.WSRObj.destroy();
                }
                this.WSRObj = null;
        	} catch(e) {
        		log.write('Error thrown:');
        		log.write(e);
        	}
			
			this.RequestInProgress = false;
        }
	},
    killRequests: function(){
		killCurrentRequest();
    	
    	if(this.RequestQueue) {
    		this.RequestQueue.clear();
    	}
    },
    
    handleResponseError: function(wsresponse, payload){
    	if (!this.nonCheckMethods) {
    		// This is a common place to bypass check of some API calls.
    		this.nonCheckMethods = ['verifyCode', 'applyGiftCode', 'getGenesByWheelOptionPlural', 'pollForToken', 'doPurchase', 'addItemToWishList', 'getAccountLinkState', 'getLinkingAccount'];
    	}
    	// Bypass check for some API calls.
    	var length = this.nonCheckMethods.length;
    	for (var i = 0; i < length; i++) {
    		if (payload.method == this.nonCheckMethods[i]) {    			
    			return;
    		}
    	}

    	if (wsresponse && wsresponse.result && wsresponse.result.responseCode) {
    		var responseCode = wsresponse.result.responseCode,
    		    responseMessage = wsresponse.result.responseMessage,
				isUVError = false,
    			messagepath = null,
    			messagetype = "",
    			data = null,
    			callback = payload.callback,
    			method = payload.method;

    		log.write("webservices.handleResponseError: method(" + method + "), response code(" + responseCode + ")");		
    		if (responseCode == 550) {
    			application.events.publish("error", {type: "system_error", endPoint: payload.endPoint, method: method, params: payload.params, callback: callback});    			
    		}	
    		else if (responseCode == 2012) {
    			application.events.publish("error", {type: "timeout_error", endPoint: payload.endPoint, method: method,  params: payload.params, callback: callback});
    		}
    		else {
    			switch (responseCode) {
	    			case 1:
	    				messagepath = application.resource.checkout_messages.Title_ID_Not_Found;
	    				break;
	    			case 2:
	    				messagepath = application.resource.checkout_messages.Invalid_User_ID;
	    				break;
	    			case 3:
	    				messagepath = application.resource.checkout_messages.User_Address_Is_Invalid;
	    				break;
	    			case 4:
	    				messagepath = application.resource.checkout_messages.User_Credit_Card_Security_Code_Is_Invalid;
	    				break;
	    			case 5:
	    				messagepath = application.resource.checkout_messages.User_Credit_Card_Number_Is_Invalid;
	    				break;
	    			case 6:
	    				messagepath = application.resource.checkout_messages.User_Credit_Card_Is_Expired;
	    				break;
	    			case 7:
	    				messagepath = application.resource.checkout_messages.Credit_Card_Declined;
	    				break;
	    			case 8:
	    				messagepath = application.resource.checkout_messages.Daily_Spending_Limit_Reached;
	    				break;
	    			case 11:
	    				messagepath = application.resource.checkout_messages.User_Credit_Card_Not_On_File;
	    				break;
	    			case 12:
	    				messagepath = application.resource.checkout_messages.User_Credit_Card_Not_On_File_And_User_Does_Not_Have_Sufficient_Prepaid_Funds_For_This_Transaction;
	    				break;	    		
	    			case 551:
	    				messagepath = application.resource.uv_messages.account_Server_Error;
						messagepath.Message = responseMessage;
						break;	   		
	    			default:
		    			break;
		    	}

		    	if (responseCode >= 120 && responseCode <= 400) {
		    		isUVError = true,
					messagepath = application.resource.checkout_messages.uv_error;
					messagepath.Message = responseMessage;
		    	}

		    	if (messagepath) {
		    		if(!messagetype) {
						messagetype = messagepath.MessageType || 'message_okcancel';
					}

					if(!messagepath.OK && messagetype == 'message_okcancel') {
						messagetype = 'message_content';
					}

					data = { Message : messagepath.Message, 
						Content : messagepath.Content, 
						Footer : messagepath.Footer, 
						OK : messagepath.OK, 
						Close : messagepath.Cancel, 
						Path : messagepath, 
						callback : callback
					};

					if(data.Footer && !isUVError) {
						data.Footer = data.Footer.replace('{m}', BrowseView.resolveMethodCode(method));	
					}
			
					log.write("webservices.handleResponseError: method(" + method + "), response code("+ responseCode + ") popup.");
					BrowseView.errorCleanup();
					BrowseView.showMessage(messagetype, data);
		    	} else {
		    		log.write("webservices.handleResponseError: method(" + method + "), response code("+ responseCode + ") unknown, system error popup.");
					application.events.publish("error", {type: "system_error", endPoint: payload.endPoint, method: method, params: payload.params, callback: callback});
		    	}
	    	}
    	}
    },

    clearContentCache: function(callback){
        // We hook into the cache via a request.
	    var request = new WSRequest();
	    request.clearContentCache(callback);
    }
    
};
