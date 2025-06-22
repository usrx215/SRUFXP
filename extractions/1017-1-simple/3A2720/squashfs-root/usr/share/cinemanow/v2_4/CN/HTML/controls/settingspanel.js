//-----------------------------------------------------------------------------
// settingspanel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var SettingsPanelControlProperties = {
		id: 'settingspanel',
		persist: {},
	    controls:{},
	    layoutIsDirty: true,
	    contentId: "SettingsPanel",
	    tpl: null,
	    secretKey: '',
        secretSequence : '',
	    secretDebugKey: '492836',
	    secretDirectionSequence : 'udruudruuudr', //Means key sequence: up,down,right,up,up,down,right,up,up,up,down,right
	    currentWheelItem: '',
	    isInitialized: false,
	    initialize: function(){
	    	$('settingspanel').hide();
	    	this.loadView('Activate');
			log.write('settingspanel.init()');		
		    //application.events.subscribe(this, 'wheelitemchanged', this.handleSettingWheelChange.bind(this));
		    application.events.subscribe(this, 'wheelvaluechanged', this.handleSettingWheelChange.bind(this));
		    application.events.subscribe(this, 'navigate', this.onNavigate.bind(this));
		    
		    this.tpl = new ui.template(this.contentId, application.ui.loadTpl(this.id + ".tpl"));
			this.tpl.compile();
	    },
	    loadView: function(tplid) {
	    	

	    },
	    loadActivatePanel: function(payload){
	    	var self = this;
	    	
	    if(application.authSupported) {
	    		//Validate auth token. If it is invalid then reset it
	    		this.isProcessing = true;
	    		this.verificationInProcess = true;
	    		
		    	$cn.methods.verifyAuthToken(function(result){
		    		
		    		if(this.currentWheelItem == "Activate") {
			    		if(!result) {
			    			application.clearAuthToken();
			    			self.updateAuthStatus();
			    		}
			    
			    		self.handleSettingWheelChange(payload, true);
		    			this.isProcessing = false;
		    			
		    		}
		    	}.bind(this));
	    	}
	    	else {
	    		self.handleSettingWheelChange(payload, true);
	    	}
	    },
	    loadAboutPanel: function(payload){
	    	var self = this;
	    	
	        if(application.authSupported) {
	    		//Validate auth token. If it is invalid then reset it
	    		this.isProcessing = true;
	    		
	    		log.write("Current Panel ID: " + this.activePanelId);
		    		
		    		
		    	$cn.methods.verifyAuthToken(function(result){
		    		//The code hasn't fired the wheelsettings changed event. So if the activepanelid is set that means that the wheel items is not longer activate
		    		if(this.currentWheelItem == "About") {
			    		if(result) {
			    			$cn.methods.loadToken(function(callback){
			    				
			    				if(this.currentWheelItem == "About") {
				    				$('settingsdeviceid').innerHTML = ($cn.data.DeviceName != '') ? $cn.utilities.forceWrap($cn.data.DeviceName, 30, 50) : 'Not Activated';	    					
				    				self.handleSettingWheelChange(payload, true);
						    		this.isProcessing = false;
								    if(!("WebSocketManager" in window))
								    	$$('#settingspanel .settingssdkversion').hide();
						    	}
						    	
			    			}.bind(this));		    		
			    		}
			    		else {
			    			application.clearAuthToken();
			    			self.updateAuthStatus();
			    			self.handleSettingWheelChange(payload, true);
				    		this.isProcessing = false;
			    		}
		    		}
		    	}.bind(this));
	    	}
	    	else {
	    		self.handleSettingWheelChange(payload, true);
	    	}
	    },
        loadUVPanel:function (payload) {
            var self = this;

            self.UV = new $cn.utilities.UserUVManager("settingsPanel");

            log.write("GETTING UV INFO");
            self.UV.checkUVAccount(function () {
                if ('UV' === self.currentWheelItem) {
                    self.UVInfoLoaded = true;
                    self.handleSettingWheelChange(payload);
                }
            });
        },
	    handleSettingWheelChange: function(payload, isAuthed) {
	    	var data = payload.args[0],
                self= this;

            log.write("changing wheel...");
	    	
	    	if(data.wheelinstance == 'SettingsWheelControl') {
	    		this.currentWheelItem = data.slavevalue;
	    		log.write("Current Wheel Value: " + this.currentWheelItem);

                // If the UV page is navigated away from, hide its timer
                if ('UV' !== data.slavevalue) {
                    if (this.UV && this.UV.timer) {
                        $cn.utilities.clearLoadingSpinner(this.UV.timer);
                    }
                }

	    		//this.loadView(data.selectedvalue);
	    		$$("#settingspanel .panel").each(function(item) { item.hide(); });
	    		this.activePanelId = null;

	    		// If the current view is on the activate panel and there is an auth token then validate the authtoken. Else proceed as usual.
	    		if((data.slavevalue == "General" || data.slavevalue == "Activate") && $cn.data.AuthToken != '' && !isAuthed) {
	    			this.loadActivatePanel(payload);
	    		}
	    		else if(data.slavevalue == "About" && $cn.data.AuthToken != '' && !isAuthed) {
	    			this.loadAboutPanel(payload);
	    		}
                else if(data.slavevalue == "UV" && !this.UVInfoLoaded){
                        this.loadUVPanel(payload);
                }
	    		else {
                    log.write("handling wheel change, last branch");
	    			this.isProcessing = true;
		    		if(!this.isInitialized) {
		    			this.tpl.empty();
		    			// The following variables are passed to <div id="About" class="panel">...<div> in template.xml
		    			this.tpl.append({
		    				version: configuration.readValue("version"),
		    				build: configuration.readValue("build"),
			    			Major: configuration.readValue("SDKVersion_Major"),
			    			Minor: configuration.readValue("SDKVersion_Minor"),
			    			Revision: configuration.readValue("SDKVersion_Revision"),
			    			Branch: configuration.readValue("SDKVersion_Branch"),
			    			Build: configuration.readValue("SDKVersion_Build"),
		    				deviceid: webservices.uniqueId, 		    				
		    				devicename: ($cn.data.DeviceName != '') ? $cn.utilities.forceWrap($cn.data.DeviceName, 30, 50) : 'Not Activated', 
		    				accountlinkurl: $cn.data.AccountLinkUrl,
		    				firmwareversion: $cn.data.FirmwareVersion,
		    				affid: $cn.data.AffId,
		    				devicetype: webservices.destType,
		    				debugmode: ($cn.config.SyncLogsExternally) ? "Yes" : "No",
		    				onscreendebug: ($cn.config.OnScreenDebugLog) ? "Yes" : "No",
							env: application.CurrentEnvironment,
							modelnumber: device.realmodelid,
							countryid: $cn.data.CountryID,
							useragent: webservices.userAgent,
							logging: ($cn.config.Debug) ? "Yes" : "No",
							baseline: ($cn.data.baselineEnable) ? "Yes" : "No",
							jinni: ($cn.data.jinniEnable) ? "Yes" : "No",
							flixster: ($cn.data.flixsterEnable) ? "Yes" : "No",
							email: ($cn.data.UserEmailAddress != '') ? $cn.data.UserEmailAddress : 'Not Activated'
                        });
                        if (this.UVInfoLoaded) {
                            this.tpl.empty();
                            this.tpl.append({
                                uvName:(self.UV.linkingAccount.user) ? self.UV.linkingAccount.user.userName : '',
                                uvEmail:(self.UV.linkingAccount.user) ? self.UV.linkingAccount.user.email : '',
                                uvStatus:self.getUVStatusMessage(),
                                uvMessage:self.getUVMessage()
                            });
                            if (self.UV.linkingAccount.user) {
                                $("uvInfoUsername").removeClass('hidden');
                                $("uvInfoEmail").removeClass('hidden');
                            }
                            if (self.UV.currentStatus) {
                                $("uvInfoStatus").removeClass('hidden');
                            }
                            this.UVInfoLoaded = false; // set it to empy so it will call everything again if we go back to the page
                        }
		        	}
                    this.tpl.apply();
		    		
		    		if(!$(data.slavevalue)) {
			    		if(BrowseView.SettingsWheelControl._slaveSource[data.slavevalue][0]){
			    			$(BrowseView.SettingsWheelControl._slaveSource[data.slavevalue][0].iD).show();
			    		}
		    		}
		    		else {
		    			log.write('Settings Panel (wheel changed): ' + data.slavevalue);
		    			this.activePanelId = data.slavevalue;
		    			$(data.slavevalue).show();
		    			if(data.slavevalue == 'Format')
			    			this.selectAudioText($cn.data.PreferredAudioType);
		    			log.write("$(data.slavevalue).show();");
		    		}
					
					if(!("WebSocketManager" in window))
						$$('#settingspanel .settingssdkversion').hide();
				    
		    		application.currentView.layoutIsDirty = true;
		    		
		    		setTimeout(function(){
		    			this.isProcessing = false;
		    		}.bind(this),400);
		    		
	    		}
	    	}
	    },
        getUVStatusMessage : function(){
            var msg ='',
                expiration ='';

            // No status messaging if deactivated
            if ('UVDeviceInactive' === this.UV.currentState) {
                return "";
            }

            if(this.UV.linkingAccount.linkingExpires){
                expiration = $cn.utilities.formatDate(this.UV.linkingAccount.linkingExpires, $cn.config.DateFormat);
            }
            if(this.UV.currentStatus){
                //if the link state is Pending or Active we show the status
                log.write("--- current status: status message: " + this.UV.currentStatus + " : ----");
                msg = application.resource.uv_messages.settingsPanel.Status[this.UV.currentStatus].replace("##expiration##", expiration);
            } else if(this.UV.currentState){
                // else if the link state is unlinking or AcctnotAvailable then we didn't get the status so we show state.
                msg = application.resource.uv_messages.settingsPanel.Status[this.UV.currentState].replace("##expiration##", expiration);
            }
            return msg;
        },
        getUVMessage:function () {
            var msg = '',
                messagePath = application.resource.uv_messages.settingsPanel,
                status = (this.UV.currentStatus) ? this.UV.currentStatus : this.UV.currentState;

            log.write("--- current status: uv message: " + status +  " : ----");
            if (status == "AcctNotAvailable") {
                msg = messagePath.UVNotSupported.replace("##UvLink##", $cn.config.UVAccountLinkUrl);
            } else if ('UVDeviceInactive' === status) {
                msg = application.resource.uv_messages.settingsPanel.UVDeviceInactive.replace("##Activate##", $cn.data.ActivationURL);
            } else if (status) {
                msg = messagePath[status];
            }
            return msg;
        },
	    requiresPurchasePin: function(){
	    	return ($cn.data.PurchasePinEnabled);
	    },
	    requiresParentalControls: function(){
	    	return ($cn.data.ParentPinEnabled);
	    },
	    requiresParentalControlsOnStartUp: function(){
	    	return ($cn.data.ParentPinEnabledOnStartup);
	    },
	    selectedAudioFormat: function(type){
	    	var bChecked = false;
	    	
	    	switch(type){
		    	case 'Stereo':
		    		if($cn.data.PreferredAudioType == 'Stereo_Standard')
		    			bChecked = true;
	                break;
		    	case 'DTS':
		    		if($cn.data.PreferredAudioType == 'DTS_Express_51' ||$cn.data.PreferredAudioType == 'DTS_Express_Stereo')
		    			bChecked = true;
	                break;
		    	case 'Dolby':
		    		if($cn.data.PreferredAudioType == 'Dolby_Digital_Plus_51' ||$cn.data.PreferredAudioType == 'Dolby_Digital_Plus_Stereo')
		    			bChecked = true;
	                break;
	    		default:
	                break;
	    	}
	    	
	    	return bChecked;
	    },
	    showAudioType: function(format){
	    	var val = 'hidden';
	    	
	    	switch(format){
		    	case 'DTS_Express_Stereo':
		    		if($cn.data.DTSStereoEnable )
	                	val = '';
	                break;
		    	case 'DTS_Express_51':
		    		if($cn.data.DTS51Enable)
	                	val = ''; 		
	                break;
		    	case 'Dolby_Digital_Plus_51':
	                if($cn.data.Dolby51Enable)
	                	val = '';          	
	                break;
	        	case 'Dolby_Digital_Plus_Stereo':
	            	if($cn.data.DolbyStereoEnable)
	                	val = '';
	                break;
	    		default:
	                break;
	    	}
	    	
	    	return val;
	    },

	   	showAudioFormat: function(format){
	    	var val = 'hidden';
	    	
	    	switch(format){
		    	case 'Stereo':
	                if($cn.data.Dolby51Enable ||$cn.data.DolbyStereoEnable ||$cn.data.DTS51Enable ||$cn.data.DTSStereoEnable)
	                	val = '';          	
	                break;
	            case 'DTS':
		    		if($cn.data.DTS51Enable ||$cn.data.DTSStereoEnable)
	                	val = '';
	                break;
	            case 'Dolby':
		    		if($cn.data.Dolby51Enable ||$cn.data.DolbyStereoEnable)
	                	val = '';
	                break;
	    		default:
	                break;
	    	}
	    	
	    	return val;
	    },
	    toggleBaseline: function(){
	    	$cn.data.baselineEnable = !$cn.data.baselineEnable;
			
			$('cbaseline').innerHTML = ($cn.data.baselineEnable) ? "Yes" : "No"; 
	    },
	    toggleJinni: function(){
	    	$cn.data.jinniEnable = !$cn.data.jinniEnable;
			
			$('cjinni').innerHTML = ($cn.data.jinniEnable) ? "Yes" : "No";
	    },
	    toggleFlixster: function(){
	    	$cn.data.flixsterEnable = !$cn.data.flixsterEnable;
			
			$('cflixster').innerHTML = ($cn.data.flixsterEnable) ? "Yes" : "No";
	    },
	    toggleOnScreenDebug: function(){
	    	$cn.config.OnScreenDebugLog = !$cn.config.OnScreenDebugLog;
			
			$('osdebug').innerHTML = ($cn.config.OnScreenDebugLog) ? "Yes" : "No";
			
			if($cn.config.OnScreenDebugLog){
				$('debugger').show();
			}
			else {
				$('debugger').hide();
			}
	    },
	    toggleParentalControlsOnStartUp: function(){
	    	if ($cn.data.AuthToken == '') {
	    		BrowseView.showActivate();
			}
			else {
				log.write("Current ParentPinEnabledOnStartup status: " + $cn.data.ParentPinEnabledOnStartup);
			    var self = this,
			    	newSetting = !$cn.data.ParentPinEnabledOnStartup;
			    $cn.methods.loadToken(function(callback){
			    	if($cn.data.ParentalControlsConfigured) {		    	
				    	application.events.publish("authparent", {
							callback: function(){
								self._toggleParentalControlsOnStartup(newSetting);
							}
				    	});
			    	}
				    else {
				    	/* Show instructional message */
						BrowseView.showMessage("message_parentalcontrols", {
							Message: application.resource.switch_user_notsetup
						});
				    }
			    });
			}
	    },
	    toggleParentalControls: function(){
	    	if ($cn.data.AuthToken == '') {
	    		BrowseView.showActivate();
			}
			else {
				
	    		log.write("Current parental control status: " + $cn.data.ParentPinEnabled);
	    		var self = this,
			        newSetting = !$cn.data.ParentPinEnabled;
    			$cn.methods.loadToken(function(callback){
			    	if($cn.data.ParentalControlsConfigured) {
				    	application.events.publish("authparent", {
							callback: function(){
								self._toggleParentalControls(newSetting);
							}
				    	});
			    	}
				    else {
				    	/* Show instructional message */
						BrowseView.showMessage("message_parentalcontrols", {
							Message: application.resource.switch_user_notsetup
						});
				    }
    			});	
		}
	    },
	    _toggleParentalControlsOnStartup: function(newSetting){
	    	$cn.data.ParentPinEnabledOnStartup = newSetting;
	    	log.write("New ParentPinEnabledOnStartup status: " + $cn.data.ParentPinEnabledOnStartup);
	    	
	    	document.getElementById("parentcheckonstartup").className = "checkbox_" + $cn.data.ParentPinEnabledOnStartup;
	    		
	    	application.saveAuthToken();
	    },
	    _toggleParentalControls: function(newSetting){
            $cn.data.ParentPinEnabled = newSetting;
            $cn.data.IsParent = !$cn.data.ParentPinEnabled;
            
            log.write("New parental control status: " + $cn.data.ParentPinEnabled);
            log.write("Parental status: " + $cn.data.IsParent);
            
			webservices.clearContentCache(function() {
				document.getElementById("parentcheck").className = "checkbox_" + $cn.data.ParentPinEnabled;
				BrowseView.reset();
				$('btnAccount').removeClass("locked");
				
				application.saveAuthToken();
				
				if($cn.data.ParentPinEnabled) {
					$('btnAccount').addClass("locked");
				}
            });
	    },
	    togglePurchasePin: function(){
	    	if ($cn.data.AuthToken == '') {
				BrowseView.showActivate();
			}
			else {
				log.write("Current PurchasePinEnabled status: " + $cn.data.PurchasePinEnabled);
						
				var self = this,
				    newSetting = !$cn.data.PurchasePinEnabled;
			    $cn.methods.loadToken(function(callback){
					if($cn.data.ParentalControlsConfigured) {
						
						application.events.publish("authparent", {
							callback: function(){
								self._togglePurchasePin(newSetting);
							}
						});    
					}
					else {
						/* Show instructional message */
						BrowseView.showMessage("message_parentalcontrols", {
							Message: application.resource.switch_user_notsetup
						});
					}
				});	
			}
	    },
	    _togglePurchasePin: function(newSetting){
            $cn.data.PurchasePinEnabled = newSetting;
            log.write("New PurchasePinEnabled control status: " + $cn.data.PurchasePinEnabled);
            document.getElementById("purchasepincheck").className = "checkbox_" + $cn.data.PurchasePinEnabled;
            application.saveAuthToken();
	    },
	    show: function() {
	    	$('settingspanel').show();
	    	this.secretKey = '';
            this.secretSequence = '';
	    	this.isProcessing = false;
	    	
	    	if(!this.isInitialized) {
	    		this.tpl.append({
	    			version: configuration.readValue("version"),
	    			build: configuration.readValue("build"),
	    			Major: configuration.readValue("SDKVersion_Major"),
	    			Minor: configuration.readValue("SDKVersion_Minor"),
	    			Revision: configuration.readValue("SDKVersion_Revision"),
	    			Branch: configuration.readValue("SDKVersion_Branch"),
	    			Build: configuration.readValue("SDKVersion_Build"),
	    			deviceid: webservices.uniqueId, 
	    			devicename: ($cn.data.DeviceName != '') ? $cn.data.DeviceName : 'Not Activated', 
	    			accountlinkurl: $cn.data.AccountLinkUrl,
	    			firmwareversion: $cn.data.FirmwareVersion,
					affid: $cn.data.AffId,
					devicetype: webservices.destType,
					debugmode: ($cn.config.SyncLogsExternally) ? "Yes" : "No",
					env: application.CurrentEnvironment,
					modelnumber: device.realmodelid,
					countryid: $cn.data.CountryID,
					logging: ($cn.config.Debug) ? "Yes" : "No",
					baseline: ($cn.data.baselineEnable) ? "Yes" : "No",
					jinni: ($cn.data.jinniEnable) ? "Yes" : "No",
					flixster: ($cn.data.flixsterEnable) ? "Yes" : "No",
					email: ($cn.data.UserEmailAddress != '') ? $cn.data.UserEmailAddress : 'Not Activated'
	    		});
	    	}
	    	
			var tplStatus = this.tpl.apply();
			application.events.subscribe(this, "activated", this.updateActivationStatus.bind(this));
			application.events.subscribe(this, "badauthtoken", this.updateAuthStatus.bind(this));
			application.events.subscribe(this, "keydown", this.handleKeyDown.bind(this));
			application.events.subscribe(this, "activatecancelled", this.onActivateCancelled.bind(this));
	    },
	    hide: function(){
	    	application.events.unsubscribe(this, "activated");
	    	application.events.unsubscribe(this, "keydown");
	    	application.events.unsubscribe(this, "badauthtoken");
	    	application.events.unsubscribe(this, "activatecancelled");
	    	$('settingspanel').hide();
	    },
	    showAudioText: function(id){
	    	$('settingsaacselected').addClass('hidden');
	    	$('settingsdtsselected').addClass('hidden');
	    	$('settingsdolbyselected').addClass('hidden');
	    	
	    	switch(id){
				case "btnsettingsaudiostereo":
				case "audio_stereo":				
					$('settingsaacselected').removeClass('hidden');
					break;
				case "btnsettingsaudiodts":
				case "audio_dts":
					$('settingsdtsselected').removeClass('hidden');
					break;
				case "btnsettingsaudiodolby":
				case "audio_digital":
					$('settingsdolbyselected').removeClass('hidden');
					break;
				default:
					break;
			}
	    },
	    onBlur: function(payload){	
	    	log.write("onBlur called.");    		
	    	if(document.getElementById('Activate')) {
	    		
	    	}
	    },
	    onNavigate: function(payload){
	    	log.write("Navigate getting called.");
	    	
	    	//If the format panel is selected then we want to handle the focus for a dynamic number of elements
			if(document.getElementById('Activate') && document.getElementById('Format').style.display == "block") {
				var elem = payload.args[0].current;
			
				//If the item being navigated is an audioanchor then do something custom. Else ignore it.
				if($(elem).rel == "audioanchor") {
					
					//Only handle custom navigation if clicking up/down on an element in the format panel
					if(payload.args[0].direction == "up" || payload.args[0].direction == "down"){
						payload.preventDefault();
						
						var controls = $$('a[rel=audioanchor]'),
							cleanControls = [],
							tmpIdx = 0,
							currentIdx = 0,
                            x;
					
						//Build a clean list of visible controls
						for(x = 0; x < controls.length; x++){
							if(elem == controls[x].id){
								currentIdx = tmpIdx;
							}

							if(document.getElementById(controls[x].id).offsetWidth > 0){
								cleanControls[cleanControls.length] = controls[x];
								tmpIdx++;
							}
						}
					
						//Correctly set focus if the user clicks up/down
						if(payload.args[0].direction == "up") {
							if(currentIdx > 0) {
								navigation.setFocus(cleanControls[currentIdx - 1].id);
							}
							else {
								navigation.setFocus(cleanControls[cleanControls.length - 1].id);
							}
						}
						else if(payload.args[0].direction == "down") {
							if(currentIdx < cleanControls.length - 1) {
								navigation.setFocus(cleanControls[currentIdx + 1].id);
							}
							else {
								navigation.setFocus(cleanControls[0].id);
							}
						}	
					}
				}
			}
	    },
	    onActivateCancelled: function(payload){
	    	if(document.getElementById('Activate')) {
	    		if(document.getElementById('GiftCards').style.display == "block"){
	    			navigation.setFocus('btnsettingsgc');
	    		}
	    	}
	    },
	    updateActivationStatus: function(payload){
	    	log.write("SettingsPanel::updateActivationStatus called");
			$cn.methods.loadToken(function(callback){
				if(document.getElementById('Activate')) {
					document.getElementById('activate_devicenotactive').className = "notactive_false";
					document.getElementById('activate_deviceactive').className = "active_true";
					document.getElementById('settingsdeviceid').innerHTML = $cn.data.DeviceName;
					
					$('activate_devicenotactive').hide();
					$('activate_deviceactive').show();

					if($cn.data.ParentPinEnabled) {
						document.getElementById('parentcheck').className = 'checkbox_true';
						
						if($cn.data.PurchasePinEnabled) {
							document.getElementById('purchasepincheck').className = 'checkbox_true';
						}
						else {
							document.getElementById('purchasepincheck').className = 'checkbox_false';
						}
					}
					else {
						document.getElementById('parentcheck').className = 'checkbox_false';
					}

					application.currentView.layoutIsDirty = true;
					application.navigator.setFocus('selectedslave');
		    	}
			});
	    },
	    updateAuthStatus: function(payload){
	    	//This gets called when a bad auth token comes back on this page. The view should update
	    	log.write('updateAuthStatus callded: badauthtoken');
	    	if(document.getElementById('Activate')) {
	    		document.getElementById('activate_devicenotactive').className = "notactive_true";
	    		document.getElementById('activate_deviceactive').className = "active_false";
	    		document.getElementById('settingsdeviceid').innerHTML = "Not Activated";
	    		document.getElementById('purchasepincheck').className = 'checkbox_false';	    		
			    document.getElementById('parentcheck').className = 'checkbox_false';	    		
			    document.getElementById("parentcheckonstartup").className = "checkbox_false";
		    	
			    $('btnAccount').removeClass("locked");
	    		$('activate_devicenotactive').show();
		    	$('activate_deviceactive').hide();
	    	}
	    },
	    selectAudioFormat: function(id, format, callback){
	    	switch(format){
		    	case 'Stereo':
		    		$cn.data.PreferredAudioType = 'Stereo_Standard';
	                break;
		    	case 'DTS':
		    		if($cn.data.DTS51Enable)
		    			$cn.data.PreferredAudioType = 'DTS_Express_51';
		    		else
		    			$cn.data.PreferredAudioType = 'DTS_Express_Stereo';
	                break;
		    	case 'Dolby':
		    		if($cn.data.Dolby51Enable)
		    			$cn.data.PreferredAudioType = 'Dolby_Digital_Plus_51';
		    		else
		    			$cn.data.PreferredAudioType = 'Dolby_Digital_Plus_Stereo';
	                break;
	    		default:
	                break;
	    	}
	    		
	    	configuration.writeValue(configuration.getPrefixedSettingKey('PreferredAudioType'), $cn.data.PreferredAudioType);
	    	
	    	this.selectAudioText($cn.data.PreferredAudioType);
    		$$('div.chk').removeClass('checkbox_true');
    		$$('div.chk').addClass('checkbox_false');
    		$(id).addClass("checkbox_true");
	    },
	    selectAudioText: function(format){
	    	switch(format){
		    	case 'Stereo_Standard':
                    this.showAudioText('btnsettingsaudiostereo');
                    break;
		    	case 'DTS_Express_51':
		    	case 'DTS_Express_Stereo':
                    this.showAudioText('btnsettingsaudiodts');
                    break;
		    	case 'Dolby_Digital_Plus_51':
		    	case 'Dolby_Digital_Plus_Stereo':
                    this.showAudioText('btnsettingsaudiodolby');
                    break;
	    		default:
                    break;
	    	}
	    },
	    toggleDebug: function(){
	    	
	    	$cn.config.Debug = !$cn.config.Debug;
	    	
	    	$("cdebug").innerHTML = ($cn.config.Debug) ? "Yes" : "No";
	    },
	    toggleRemoteLogging: function(){
	    	$cn.config.SyncLogsExternally = !$cn.config.SyncLogsExternally;
	    	
	    	$("cremote").innerHTML = ($cn.config.SyncLogsExternally) ? "Yes" : "No";
	    },
	    handleKeyDown: function(payload) {
	    	switch(payload.args[0].event.keyCode){
		    	case application.keys.KEY_UP:
                    this.secretSequence += 'u';
		    		break;
		    	case application.keys.KEY_DOWN:
                    this.secretSequence += 'd';
		    		break;
		    	case application.keys.KEY_RIGHT:
                    this.secretSequence += 'r';
		    		break;
		    	case application.keys.KEY_RED:
                    this.secretKey += 'a';
		    		break;
	    		case application.keys.KEY_1:
                    this.secretKey += '1';
					break;
				case application.keys.KEY_2:
                    this.secretKey += '2';
					break;
				case application.keys.KEY_3:
                    this.secretKey += '3';
					break;
				case application.keys.KEY_4:
                    this.secretKey += '4';
					break;
				case application.keys.KEY_5:
                    this.secretKey += '5'
					break;
				case application.keys.KEY_6:
                    this.secretKey += '6';
					break;
				case application.keys.KEY_7:
                    this.secretKey += '7';
					break;
				case application.keys.KEY_8:
                    this.secretKey += '8';
					break;
				case application.keys.KEY_9:
                    this.secretKey += '9';
					break;
				case application.keys.KEY_0:
                    this.secretKey += '0';
					break;
				default:
					break;
			}

	    	log.write("Secret Key: " + this.secretKey + ", Secret Sequence: " + this.secretSequence);
	    	if(this.secretKey == "a0852"){
	    		BrowseView.showChangeEnv();
	    	}
	    	else if(this.secretKey == this.secretDebugKey || this.secretSequence == this.secretDirectionSequence){
	    		application.debugMode = true;
	    		BrowseView.goSettings(0);
	    	}
            else {
                if (this.secretKey.length >= this.secretDebugKey.length) {
                    this.secretKey = '';
                }	
                if (this.secretSequence.length >= this.secretDirectionSequence.length) {
                    this.secretSequence = '';
                }
            }
        },
	    isActivated: function(){
	    	return ($cn.data.AuthToken != '') ? "true" : "false";
	    }
	},
	SettingsPanelControl = new Class(SettingsPanelControlProperties);
