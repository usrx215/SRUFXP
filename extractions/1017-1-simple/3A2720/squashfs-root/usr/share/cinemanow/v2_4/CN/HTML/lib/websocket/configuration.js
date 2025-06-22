//-----------------------------------------------------------------------------
// configuration.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * Websocket based configuration API implementation
 * @author spowers
 */
var configuration = {
	DEBUG: false,
	inited: false,
	settings: {},
	configrwfile: null,
	//configrofile: null,
	callback: null,
	initialize: function(callback) {
		if(!this.inited) {
			this.inited = true;
			
			// To process init values from the SDK, we want to do this:
			//   ReadSettings(CNWS_CREDENTIALS_FILE, CNWS_PREFERENCE_FILE) 
			//   SetStores passing those CNWS_ values
			//   ReadAllSettings.
			// At this time we are not doing the ReadSettings in step one
			// but doing a ReadAllSettings(:environment:). 
			
            var init_loadcredentials = function() {
                this.loadCredentialsFile();
                
                if(this.DEBUG) {
                    log.write("Configuration: websocket: Properties of configuration object: ");
                    for(prop in this) {
                        if($type(this[prop]) != "function"){
                            log.write("        [" + prop + "](" + $type(this[prop]) + "): " + this[prop]);
                        }
                    }
                    log.write("Configuration: wesbsocket: Properties of credentials object: ");
                    for(prop in this.credentials_values) {
                        if($type(this.credentials_values[prop]) != "function"){
                            log.write("        [" + prop + "](" + $type(this.credentials_values[prop]) + "): " + this.credentials_values[prop]);
                        }
                    }
                    log.write("Configuration: websocket: Properties of settings object: ");
                    for(prop in this.settings) {
                        if($type(this.settings[prop]) != "function"){
                            log.write("        [" + prop + "](" + $type(this.settings[prop]) + "): " + this.settings[prop]);
                        }
                    }
                }
                
                var destinationUniqueID = this.readValue('DestinationUniqueID');
                if (destinationUniqueID) {
                    // If we have a saved deviceId, copy it into application settings.
                    if (this.DEBUG) log.write("Configuration websocket: Skipping callGetDestinationUniqueID");
                    webservices.uniqueId = destinationUniqueID;
                    $cn.data.DeviceID = destinationUniqueID;
                    callback.call();
                } 
                else {  
                    var devID = this.readValue("DeviceID");
                    if(devID == null || devID == "" || devID == "auto") {
                        if (this.DEBUG) log.write("Configuration websocket: Invoking callGetDestinationUniqueID");
                        this.callGetDestinationUniqueID(callback);
                    }
                    else {
                        if (this.DEBUG) log.write("Configuration websocket: Using DeviceID = uniqueId = " + devID);
                        webservices.uniqueId = $cn.data.DeviceID = devID;
                        callback.call();
                    }
                } 
            };
            
			if (this.DEBUG) log.write("Configuration websocket: About to call ws.ReadAllSettings using :environment: store key.");
			this.callReadAllSettings(
			   	":environment:",
				function () {
					// Parse out the received_msg and set each value into this.settings.xxxx.
					if (this.DEBUG) log.write("Configuration websocket: Callback from :environment ReadAllSettings received");								
					
					// Set the config file(s) base on settings just retrieved. Note
					// if these two settings did not exist our configrxfile(s) should
					// be set to undefined.
			   		this.configrwfile = this.settings.CNWS_PREFERENCE_FILE;
			   		//this.configrofile = this.settings.CNWS_CREDENTIALS_FILE;

			   		if (this.DEBUG) log.write("Configuration websocket: Set configrwfile based on CNWS_PREFERENCE_FILE to " + this.configrwfile);
                    //if (this.DEBUG) log.write("Configuration websocket: Set configrofile based on CNWS_PREFERENCE_FILE to " + this.configrofile);
			   		
					// We are done with the Read the environment vars, now we want to SetStores based on
			   		// the rwfile and the rpfile, and then do a ReadAllSettings.
					if (this.configrwfile != undefined && this.configrwfile != null && this.configrwfile != "") {
                        if (this.DEBUG) log.write("Configuration websocket: Setting store");
						this.callSetStores(this.configrwfile, null, 
							function () {
								if (this.DEBUG) log.write("Configuration websocket: Invoking callReadAllSettings w/o store value");
								this.callReadAllSettings(null, init_loadcredentials.bind(this));
							}.bind(this)
                        );
					}
					else {
						// IF we do not have a rwfile or rofile set, just call ReadAllSettings
						// to pick up default store.
						this.callReadAllSettings(null, init_loadcredentials.bind(this));
					}
				}.bind(this)
            );
		}
	},
	
	readValue: function(key) {
		var result = null;
		if(this.settings[key] != undefined && this.settings[key] != "") { 
            if (this.DEBUG) log.write("Configuration: websocket: readValue: r/w: key=" + key + ", value=" + this.settings[key]);
			try {
				result = JSON.parse(this.settings[key]);
			} catch (e) {
				result = this.settings[key];				
			}
		}
        else if(this.credentials_values[key] != undefined && this.credentials_values[key] != "") {
            if (this.DEBUG) log.write("Configuration: websocket: readValue: creds: key=" + key + ", value=" + this.credentials_values[key]);
            result = this.credentials_values[key];
        }
		else if(this[key] != undefined && this[key] != "") {
            if (this.DEBUG) log.write("Configuration: websocket: readValue: r/o: key=" + key + ", value=" + this[key]);
            result = this[key];
        }
        else if($cn.config[key] != undefined && $cn.config[key] != "") {
            if (this.DEBUG) log.write("Configuration: websocket: readValue: $cn.config: key=" + key + ", value=" + $cn.config[key]);
            result = $cn.config[key];
        }
        else {
			if (this.DEBUG) log.write("Configuration: websocket: readValue: key " + key + " not found");
		}
		return result;
	},
	
	writeValue: function(key, value) {
		if (this.DEBUG) log.write("Configuration: websocket: writeValue: key=" + key + ", value=" + value);
		this.settings[key] = value;
		if (value == undefined || value == null) {
			WebSocketManager.send('<RNOConfigurationCall>$$REQUESTID$$<DeleteSetting key="' + key + '"/></RNOConfigurationCall>', 
				this,
				function (message) {
					if (this.DEBUG) log.write("Configuration websocket: writeValue.DeleteSetting: Message is received: \n" + message);
				});
		}
		else {
			WebSocketManager.send('<RNOConfigurationCall>$$REQUESTID$$<WriteSetting key="' + key + '">' + value + '</WriteSetting></RNOConfigurationCall>', 
				this,
				function (message) {
					if (this.DEBUG) log.write("Configuration websocket: writeValue.WriteSetting: Message is received: \n" + message);
				});
		}
	},
	
	clearValue: function(key) {
		if (this.DEBUG) log.write("Configuration: websocket: clearValue: " + key);
		this.writeValue(key, null);
	},
	
	callSetStores: function(rwfile, rofile, callback) {
		var self = this;
		var roStore = "";
		var rwStore = "";
		if (rwfile != undefined && rwfile != null && rwfile != "") {
			rwStore = '<Store>' + rwfile + '</Store>';
		}
		if (rofile != undefined && rofile != null && rofile != "") {
			roStore = '<Store readonly="true">' + rofile + '</Store>';
		}
		
		if (roStore != "" || rwStore != "") {
			var stores = rwStore + roStore;
			log.write("Configuration.callSetStores: About to call WS.SetStores with " + stores);
			WebSocketManager.send(
				'<RNOConfigurationCall>$$REQUESTID$$<SetStores>' + stores + '</SetStores></RNOConfigurationCall>',
				this,
				function (message) {
					if (self.DEBUG) log.write("Configuration.callSetStores: Message is received: \n" + message);								
					callback.call(); // TODO Should we pass errorCode here.
				});
		}
		else {
			callback.call(); // TODO Should we pass errorCode here.
		}
	},

	/**
	 * Calls WS ReadAllSettings method, loading results into this.settings.xxx. 
	 */
	callReadAllSettings: function(store, callback, settings) {
		if (this.DEBUG) log.write("Configuration websocket: About to call ws.ReadAllSettings.");
		var self = this;
		var storeKey = "";
		if (store != undefined && store != null && store != "") {
			storeKey = ' store="' + store + '"';
		}
		if (settings == undefined || settings == null) {
		    settings = this.settings;
		}
		WebSocketManager.send(
			'<RNOConfigurationCall' + storeKey + '>$$REQUESTID$$<ReadAllSettings></ReadAllSettings></RNOConfigurationCall>',
			this,
			function (message) {
				if (self.DEBUG) log.write("Configuration websocket: Message is received: \n" + message);								
				var errorCode = self.processConfigurationCallSettingsResponse(message, settings);
				
				if (errorCode != 0) {
					log.write("Configuration websocket: Warning: processConfigurationCallSettingsResponse for ReadAllSettings returned non-zero " + errorCode); 									
				}
				callback.call(); // TODO: Should we pass errorCode?
			});
	},
	
	/**
	 * Loads passed SettingsResponse contents into settings.xxxx fields.
	 * @param message Settings Response XML, e.g.
	 * <RNOConfigurationCall_Response>
	 *	<ReadAllSettings_Response error="0">
	 *  	  <Setting key="UserName">John Doe</Setting>
	 *		<Setting key="Password" encrypted="true">fizzbinn</Setting>
	 *	</ReadAllSettings_Response>
	 * </RNOConfigurationCall_Response>
	 * @returns errorCode from response or -1 if parse fails. 0 is good. 
	 */
	processConfigurationCallSettingsResponse: function(message, settings) {
		var rc = 0;
		if (this.DEBUG) log.write("Configuration.processConfigurationCallSettingsResponse: Message is received: \n" + message);
		
		// Parse out the received_msg and set each value into this.xxxx.
		try {
			var xml = XML.rootFromString(message);				
			//if (this.DEBUG) log.write("Configuration.processConfigurationCallSettingsResponse: After rootFromString firstChild.nodeName is " + xml.firstChild.nodeName);
			
			if (xml.firstChild.nodeName == 'RNOConfigurationCall_Response') {							
				var responseNodes = xml.firstChild.childNodes;
				for (var i = 0; i < responseNodes.length; i++) {
			   		if (responseNodes[i].nodeName == 'ReadAllSettings_Response') {
			   			//if (this.DEBUG) log.write("Configuration.processConfigurationCallSettingsResponse: Processing ReadAllSettings_Response");
						var attributes = responseNodes[i].attributes;
						if (attributes[0].name == 'error' ) {
							var errorCode = attributes[0].value;		
							if (errorCode == 0) {							
								//if (this.DEBUG) log.write('Configuration.processConfigurationCallSettingsResponse: ReadAllSettings succeeded.');
								// Set values into settings[key].
								var nodes = responseNodes[i].childNodes;
								for (var j = 0; j < nodes.length; j++) {
									//if (this.DEBUG) log.write("Configuration.processConfigurationCallSettingsResponse: In Settings result loop, nodes[" + j + "].nodeName is " + nodes[j].nodeName);
									if (nodes[j].nodeName == "Setting") {
										//if (this.DEBUG) log.write("Configuration.processConfigurationCallSettingsResponse: In store based settings result loop, nodes[" + j + "].nodeValue is " + nodes[j].nodeValue);
										if (nodes[j].attributes && nodes[j].attributes.length > 0) {
											for (var k = 0; k < nodes[j].attributes.length; k += 1) {
												if (nodes[j].attributes[k] && nodes[j].attributes[k].name == "key") {
													var key = nodes[j].attributes[k].value;
													settings[key] = $cn.utilities.getNodeText(nodes[j]);
													if (this.DEBUG) log.write("Configuration.processConfigurationCallSettingsResponse: Key:(" + key + "), Value(" + settings[key] + ")");
												}
											}
										}
									}
								}
							}
							else {
								// Deal with error.
								log.write("Configuration.processConfigurationCallSettingsResponse: Warning: ReadAllSettings returned errorCpde " + errorCode);
								rc = errorCode;
							}
						}
						break;
			   		}
				}
			}
			else {
				log.write("Configuration.processConfigurationCallSettingsResponse: Warning: received unexpected message.");
				rc = -1;
			}
		} 
		catch (e) {				
			log.write("Configuration.processConfigurationCallSettingsResponse: Warning: exception parsing and processing response: " + e);
			rc = -1;
		}
		return rc;
	},
	
	/** 
	 * Calls WS GetDestinationUniqueID method. 
	 */
	callGetDestinationUniqueID: function(callback) {
		if (this.DEBUG) log.write("Configuration.callGetDestinationUniqueID: About to call ws.GetDestinationUniqueID.");
		var self = this;
		WebSocketManager.send(
			"<RNOWebServiceCall>$$REQUESTID$$<GetDestinationUniqueID></GetDestinationUniqueID></RNOWebServiceCall>",
			this,
			function (response) {
				if (self.DEBUG) log.write("Configuration.callGetDestinationUniqueID: Response is received: \n" + response);								
				var errorCode = self.processGetDestinationUniqueIDResponse(response);
				
				if (errorCode != 0) {
					log.write("Configuration.callGetDestinationUniqueID: Warning: processGetDestinationUniqueIDResponse for GetDestinationUniqueID returned non-zero " + errorCode); 									
				}
				callback.call(); // TODO: Should we pass errorCode?
			});
	},
	
	/**
	 * Read GetDestinationUniqueIDResponse contents into config settings.
	 * @param message Settings Response XML, e.g.
	 * <RNOWebServiceCall_Response>
	 * <UserData ID="0"/>
	 * <GetDestinationUniqueID_Response error="0">00-FF-10-70-2C-06</GetDestinationUniqueID_Response>
	 * </RNOWebServiceCall_Response>
	 * @returns errorCode from response or -1 if parse fails. 0 is good. 
	 */
	processGetDestinationUniqueIDResponse: function(response) {
		var rc = 0;
		if (this.DEBUG) log.write("Configuration.processGetDestinationUniqueIDResponse: response passed is: \n" + response);
		
		// Parse out the UniqueID/MACAddress from the response
		try {
			var xml = XML.rootFromString(response);				
			//if (this.DEBUG) log.write("Configuration.processGetDestinationUniqueIDResponse: After rootFromString firstChild.nodeName is " + xml.firstChild.nodeName);
			
			if (xml.firstChild.nodeName == 'RNOWebServiceCall_Response') {							
				var responseNodes = xml.firstChild.childNodes;
				for (var i = 0; i < responseNodes.length; i++) {
			   		if (responseNodes[i].nodeName == 'GetDestinationUniqueID_Response') {
			   			//if (this.DEBUG) log.write("Configuration.processGetDestinationUniqueIDResponse: Processing GetDestinationUniqueID_Response");
						var attributes = responseNodes[i].attributes;
						if (attributes[0].name == 'error' ) {
							var errorCode = attributes[0].value;		
							if (errorCode == 0) {							
								// MACAddress is in $cn.utilities.getNodeText(responseNodes[i])
								var uniqueId = $cn.utilities.getNodeText(responseNodes[i]);
								//if (this.DEBUG) log.write("Configuration.processGetDestinationUniqueIDResponse: GetDestinationUniqueID succeeded, uniqueId in response is " + uniqueId);
								if(uniqueId && uniqueId != '')
								{
									// Should we call a device method instead?
									if (this.DEBUG) log.write("Configuration.processGetDestinationUniqueIDResponse: Setting webservices.uniqueId and $cn.data.DeviceID "); 
									webservices.uniqueId = uniqueId;
									$cn.data.DeviceID = uniqueId;
									this.writeValue("DestinationUniqueID", uniqueId);
								}
							}
							else {
								// Deal with error. We do not reset existing uniqueId/DeviceID values.
								log.write("Configuration.processGetDestinationUniqueIDResponse: Warning: GetDestinationUniqueID returned errorCpde " + errorCode);
								rc = errorCode;
							}
						}
						break;
			   		}
				}
			}
			else {
				log.write("Configuration.processGetDestinationUniqueIDResponse: Warning: received unexpected response.");
				rc = -1;
			}
		} 
		catch (e) {				
			log.write("Configuration.processGetDestinationUniqueIDResponse: Warning: exception parsing and processing response: " + e);
			rc = -1;
		}
		return rc;
	}	
};
