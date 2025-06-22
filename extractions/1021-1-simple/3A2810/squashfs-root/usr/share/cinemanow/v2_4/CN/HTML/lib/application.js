//-----------------------------------------------------------------------------
// application.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var application = {
	DEBUG: false,
	_methodMap: {},
	_views: {},
	id: 'application',
	currentView: null,
	keys: null,
	navigator: navigation,
	utility: utility,
	ui: ui,
	playbackSupported: false,
	authSupported: false,
	element: element,
	apiUrl: '',  // pjv: to move to webservices.js?
	endPointServer: '',  // pjv: to move to webservices.js?
	isBusy: false,
	isLoaded: false,
	isConnected: true,
	DataDirectory: '',
	EndPoints: {},  // pjv: to move to webservices.js?
	Environments: [],  // pjv: to move to webservices.js?
	CurrentEnvironment: '',  // pjv: to move to webservices.js?
	LastKeyDown: new Date(),
	RepeatKeyBlock: false,
	RepeatKeyBlockDuration: 300,
	TempKeyBlock: false,
	TempKeyBlockDuration: 1000,
    TempKeyBlockEnter: false,
	firmwareIsValid: true,
	request: $get(),
	regionError: null,
	debugMode: false,
	doNotRestoreSettings: false,
	remotelog: '',
    blockWidgetAccess: false,
    cachedUserAgent: null,  // pjv: to move
	appSetting: function(key){
		var val = -1;
		
		if($cn.config) {
			if(key in $cn.config){
				val = $cn.config[key];
			}
		}
		
		return val;
	},	
	// pjv: should this go to webservices.js?
	// setupApiKeys :to select proper credential according to given cid,
	// If cid is empty or not exsited, it will use default credential instead.
	setupApiKeys: function(cid){

        log.write("setupApiKeys: called with cid of " + cid);
        if(!cid) {
            cid = $UrlQueryString['CountryID'] || $cn.config.DefaultSelectedCountry;
        }
        
        var cred_cid = configuration.getCredentialsCountryID();
        log.write("setupApiKeys: credentials country id: " + cred_cid);
        
        // No CredentialsFilePath specified, set application error
        if(cred_cid === -1) {
            application.ApplicationError = {
                type: application.resource["system_messages"].application_error.MessageType,
                Message:application.resource["system_messages"].application_error.Message,
                Close: application.resource["system_messages"].application_error.Close,
                callback: function(){
                    application.exit();
                }
            };
        }
        if(cred_cid != cid) {
            // Need to make configuration reload new credentials file
            log.write("setupApiKeys: attempt load of alternate credentials");
            var credentialExsited = configuration.changeCredentials(cid);
            if (!credentialExsited) {
            	configuration.changeCredentials($UrlQueryString['CountryID'] || $cn.config.DefaultSelectedCountry);
            }
        }
        log.write("setupApiKeys: CID " + cid + " credentials loaded.");
        
        webservices.apiKey = configuration.readValue("APIKey");
        webservices.destType = configuration.readValue("DestinationTypeID");
        log.write("setupApiKeys: APIKey: [" + webservices.apiKey + "]  DesinationTypeID: [" + webservices.destType + "]");
	},
	init: function(){
        var f,
            fileObj,
            isPathValid,
            jsFileClose,
            jsFile,
			self = this,
            d2dTitle;
		log.write("application.init: Enter");
		
        this.keys = new Common.API.TVKeyValue();
		
		//Setup exception categories. These are used to map to resource sections. The purpose is to allow messages to be targeted to the page you are currently on.
		this.exception.categories["browse-view"] = "store_messages";
		this.exception.categories["search-view"] = "system_messages";
		this.exception.categories["wishlist-view"] = "system_messages";
		this.exception.categories["library-view"] = "system_messages";
		this.exception.categories["settings-view"] = "system_messages";
		this.exception.categories["titleview"] = "system_messages";
		this.exception.categories["help-view"] = "system_messages";
		this.exception.categories["player-view"] = "player_messages";
		this.exception.categories["checkout-view"] = "checkout_messages";
		
        $cn.data.SoftwareVersion = configuration.readValue("version");
		
		//Setup initial API Keys
		// application.setDeviceYear(); // Now have device.getFirmwareYear()
		// application.setDeviceType(); // Now have device.getDeviceType()
		// application.setDeviceSoc(); // Now have device.setDeviceSoc() called in device initialization
	
		if($cn.config.OnScreenDebugLog){
			$('debugger').show();
		}
		
		/* See if an authentication file exists and set the default variables. */
		device.initPlayer();
		if(application.authSupported) {
            var s = null;
			
            //Only when RegionCheckEnabled's value is false, we disabled regioncheck funtion
            if (configuration.readValue('RegionCheckEnabled') == false) {
            	$cn.data.RegionCheckEnabled = false;
            }
            
            $cn.data.SelectedCountryID = configuration.readValue('SelectedCountryID');

    		// Have to call setupApiKeys after loading auth items from persisted storage, so we start with correct country and region ids.
    		application.setupApiKeys($cn.data.SelectedCountryID);
    		
    		if (!$cn.data.RegionCheckEnabled) { // RegionCheck is disabled use default country instead
    			application.setupApiKeys($UrlQueryString['CountryID'] || $cn.config.DefaultSelectedCountry);
    		}
    		
			s = configuration.readValue(configuration.getPrefixedSettingKey('auth'));

			$cn.data.ShowWelcomeScreen = configuration.readValue(configuration.getPrefixedSettingKey('welcome')) || false;
			$cn.data.DeviceID = webservices.uniqueId = (configuration.readValue('DestinationUniqueID') || $cn.config.DeviceID);
			
			//Preferred audio type is the currently saved audio type. prefferedaudiotypeset is whether or not the user has specifically 
			//chosen one. This is what we queue off of to show the audio setup message at playback.
			$cn.data.PreferredAudioType = configuration.readValue(configuration.getPrefixedSettingKey('PreferredAudioType')) || $cn.data.PreferredAudioType;				
			$cn.data.PreferredAudioTypeSet = $cn.utilities.isTrue(configuration.readValue(configuration.getPrefixedSettingKey('PreferredAudioTypeSet')));

			//Read authToken related information.
			if(s !== null)
            {
				$cn.data.AuthToken = s.authToken;
				$cn.data.DeviceName = s.deviceName;
				$cn.data.UserEmailAddress = s.emailAddress;
                $cn.data.AdultPinEnabled = $cn.utilities.isTrue(s.adultPinEnabled);
                $cn.data.ParentPinEnabled = $cn.utilities.isTrue(s.parentPinEnabled);
                $cn.data.PurchasePinEnabled = $cn.utilities.isTrue(s.purchasePinEnabled);
                $cn.data.ParentalControlsConfigured = $cn.utilities.isTrue(s.parentalControlsConfigured);
				
                if($cn.utilities.isTrue(s.parentPinEnabledOnStartup)) {
                    $cn.data.ParentPinEnabledOnStartup = $cn.utilities.isTrue(s.parentPinEnabledOnStartup);
				}
				
				//Print configurations
				if (this.DEBUG) log.write('application.init: AuthToken: ' + s.authToken);
				if (this.DEBUG) log.write('application.init: DeviceName: ' + s.deviceName);
				if (this.DEBUG) log.write('application.init: DeviceID: ' + s.deviceId);
				if (this.DEBUG) log.write('application.init: UserEmailAddress: ' + s.emailAddress);
				if (this.DEBUG) log.write('application.init: AdultPinEnabled: ' + s.adultPinEnabled);
				if (this.DEBUG) log.write('application.init: ParentPinEnabled: ' + s.parentPinEnabled);
				if (this.DEBUG) log.write('application.init: PurchasePinEnabled: ' + s.purchasePinEnabled);
				if (this.DEBUG) log.write('application.init: ParentalControlsConfigured: ' + s.parentalControlsConfigured);
				if (this.DEBUG) log.write('application.init: ParentPinEnabledOnStartup: ' + s.parentPinEnabledOnStartup);
			}
		}
		
        self.resolveEnv(self.firstResolveEnvCallback.bind(self));
    },
    firstResolveEnvCallback : function(obj){
        var self = this;
        log.write('Resolving environment...');

		/* Configure API Urls and end point urls */
		var result = obj.data.result;
		self.CurrentEnvironment = configuration.readValue("CustomEndPoint") || self.appSetting('CustomEndPoint') || result.defaultKey;
		self.endPointServer = self.CurrentEnvironment + ".cinemanow.com";
		for(var i = 0; i < result.enviroSelectable.length; i++) {
			//if(result.enviroSelectable[i].keyName == result.defaultKey) {
			if(result.enviroSelectable[i].keyName == self.CurrentEnvironment) {
				self.apiUrl = result.enviroSelectable[i].keyUrl;
				//self.endPointserver = self.apiUrl.match(/:\/\/(.[^/]+)/)[1];
			}
		}
		// Can not match the keyUrl from getDeviceEnv response? Set the apiUrl according to CustomEndPoint.
		if(!self.apiUrl){
			self.apiUrl = "https://" + self.CurrentEnvironment + ".cinemanow.com";
		}
		
		$cn.data.apiUrl  = self.apiUrl;			
		log.write('Current API URL: ' + self.apiUrl);
		
		/* Build configurable Environments */
		envs = 0;
		self.Environments = [];
		result.enviroSelectable.each(function(env){
			self.Environments[envs] = {
				key: env.keyName,
				name: env.keyValue,
				url: env.keyUrl
			};
			envs++;
		});
		
		/* Build End Points */
		result.endPoints.each(function(ep){
			self.EndPoints[ep.keyName] = ep.keyValue;
		});

        // UV endpoints are set by getDeviceEnv now. 2013/04/12
        // Override UV endpoints
        // TODO: set this up dynamically when necessary
        /*if ($cn.config.EnableUV) {
            self.EndPoints['library'] = $cn.data.UvEndpoints.library;
            self.EndPoints['stream'] = $cn.data.UvEndpoints.stream;
            // not working - 2012/11/12 - self.EndPoints['auth'] = $cn.data.UvEndpoints.auth;
        }*/

        /* Should not let mock API methods going into production.
		// If auth not supported, call InitAuthMethodOverrides to setup for it.
		if(!application.authSupported)
			initAuthMethodOverrides(); */
		
		log.write('Setting up device...');
		/* Run the widget setup command */
		
		var lastCacheTime = configuration.readValue('LastCacheTime'); // Read last cache time from current creadential.
		if (lastCacheTime === null) {
		    lastCacheTime = "";
		}
		//We need to call setup device the first time with the current selectedcountryid. If for some reason they do not match then we will call it again with the updated apikeys
		$cn.methods.setupDevice(lastCacheTime, true, function(callback){

			var r = callback.data.result,
				reload,
				c;

			// Check if the country and region have changed since last run.
			self.checkRegion(r);

			//Call setup device again to retrieve the loaded data.
			$cn.methods.setupDevice(lastCacheTime, false, function(callback){
			log.write(" Token is " +($cn.utilities.getMeta("AuthTokenActive", r.configValues) == "True"));
				var firmware;
				//log.write(callback);
				if(callback && callback.data && callback.data.result) {
				    self.setSetupData(callback.data.result);
					
					//Do Basic firmware checks and set classname.
					application.firmwareIsValid = device.setDocumentClassName();	
					
					if(application.firmwareIsValid) {

						if(!$cn.data.SystemOffline) {
						
						    var rest = function() {
							    /* If an auth token is set and it is not active. Delete it and set appropriate variables */
							    if($cn.data.AuthToken.length > 0 && !$cn.data.AuthTokenActive && application.authSupported) { 								
								    self.clearAuthToken();
							    }
    							
							    if($cn.data.RegionCheckEnabled) {
								    var hasCredential = configuration.changeCredentials($cn.data.CountryID);
								    if (!hasCredential && !self.regionError) {
									    // User not in allowed regions THROW ERROR
									    self.regionError = 	{
										    type: application.resource["system_messages"].region_moved_notallowed.MessageType,
										    Message:application.resource["system_messages"].region_moved_notallowed.Message,
										    Content: application.resource["system_messages"].region_moved_notallowed.Content,
										    Close: application.resource["system_messages"].region_moved_notallowed.Close,
										    callback: function(){
											    application.exit();
										    }
									    };
								    }
    								
							    }
    							
							    if(self.regionError) {
								    application.ui.init();
							    }
							    else if(!self.regionError || application.appSetting('IsCesDemo')) {
							        self.buildInitialNav();
							    }
							    else {
								    $('SplashProgressContainer').hide();
								    $('loadingerrormsg').innerHTML = regionError;
								    $('loadingerror').show();
								    navigation.setFocus('exitbtn');
							    }
						    };
						
						    // Flush the content cache if the response value says we should.
						    if ($cn.data.ShouldUpdateCache) {
						        webservices.clearContentCache(rest);
						    } else {
						        rest.call();
						    }
						    
						}
						else {
							$('SplashProgressContainer').hide();
							$('loadingerrormsg').innerHTML = $cn.data.SystemUnavailableMessage;
							$('loadingerror').show();
							navigation.setFocus('exitbtn');
						}
					}
					else {
						$('SplashProgressContainer').hide();
						$('loadingerrormsg').innerHTML = "Please update software in order to enjoy some of our new and exciting features or Apps.<br /><br />Simply go to MENU, SUPPORT, and SOFTWARE UPGRADE.";
						$('loadingerror').show();
						navigation.setFocus('exitbtn');
					}
				}
				else {
					application.events.publish("error", {type: "system_error" });
				}
			});
		});
		
        // TODO: this is wrong - we need to find out from SS / Rovi how to determine this: #11264
        // JN: This likely happens before the setupDevice call above finishes. Is that acceptable?
        if(application.request.data && $cn.config.EnableD2D && $cn.config.DeviceD2DEnabled){
            $cn.data.d2dPath = true;
            d2dTitle = application.request.data.split("|");

            $cn.data.d2dTitleInfo.id = d2dTitle[0];
            $cn.data.d2dTitleInfo.validDisc = d2dTitle[1];
            $cn.data.d2dTitleInfo.rental = d2dTitle[2];

            $cn.methods.getUpgradeOffers(d2dTitle[0], function(result){
                log.debug(JSON.stringify(result));
                if(result.responseMessage ==="success" && result.products.length > 0){
                    $cn.data.d2dTitleOffers = {
                        'availableOffers': result.products
                    };
                } else {
                    //set to invalid since no offers came back. IF not we will error out.
                    $cn.data.d2dTitleInfo.error = true;
                }
                log.write($cn.data.d2dTitleInfo.id);
                log.write($cn.data.d2dTitleInfo.id);
                log.write($cn.data.d2dTitleInfo.id);
                log.write($cn.data.d2dTitleInfo.id);

                log.write("GET UPGRADE OFFERS RETURNED. Proceeding with setup");
                log.write(JSON.stringify($cn.data.d2dTitleOffers));
                self.navigationSetup();
            });
        } else {
            log.write("NO d2d info. Proceeding with setup");
            this.navigationSetup();
        }
    },
    checkRegion: function(r) {
        var defaultCountryID = $UrlQueryString['CountryID'] || $cn.config.DefaultSelectedCountry;
        $cn.data.SelectedCountryID = configuration.readValue('SelectedCountryID'); // Read Selected Country from current creadential.
        var setupDeviceCountryID = $cn.utilities.getMeta("CountryID", r.configValues);
        
		if ($cn.data.RegionCheckEnabled) {
			if (!$cn.data.SelectedCountryID) { // First time run. No SelectedCountryID.
				if (setupDeviceCountryID != defaultCountryID) { // Current CountryID is different from DefaultCountryIDID
				    var hasCredential = configuration.changeCredentials(setupDeviceCountryID);
                    if (hasCredential) {
    					log.write('application.firstResolveEnvCallback: region_notdefault');
					    application.regionError = 	{
							    type: application.resource["system_messages"].region_notdefault.MessageType,
							    Message:application.resource["system_messages"].region_notdefault.Message,
							    Content: application.resource["system_messages"].region_notdefault.Content,
							    OK: application.resource["system_messages"].region_notdefault.OK,
							    Close: application.resource["system_messages"].region_notdefault.Close,
							    callback: function(val){
								    if(val){
									    application.exit();
								    }
								    else {
									    configuration.writeValue('SelectedCountryID', setupDeviceCountryID);
									    location.reload(true);
								    }	
							    }
					    };
					}
					else {
    					log.write('application.firstResolveEnvCallback: region_error');
					    application.regionError = 	{
							    type: application.resource["system_messages"].region_error.MessageType,
							    Message:application.resource["system_messages"].region_error.Message,
							    Close: application.resource["system_messages"].region_error.Close,
							    callback: function(val){
									    application.exit();
							    }
					    };
					} 
				} 
				else {
					configuration.writeValue('SelectedCountryID', setupDeviceCountryID);
				}
			} else if (setupDeviceCountryID != $cn.data.SelectedCountryID) { // Not first time run. Compare the SelectedCountryID with currentID
			    var hasCredential = configuration.changeCredentials(setupDeviceCountryID);
			    if (hasCredential) {
    			    application.regionError = 	{
    					type: application.resource["system_messages"].region_moved.MessageType,
    					Message:application.resource["system_messages"].region_moved.Message,
    					Content: application.resource["system_messages"].region_moved.Content,
    					OK: application.resource["system_messages"].region_moved.OK,
    					Close: application.resource["system_messages"].region_moved.Close,
    					callback: function(val){
    						if(val){
    							application.exit();
    						}
    						else {
    							configuration.writeValue('SelectedCountryID', setupDeviceCountryID);
    							location.reload(true);
    						}												
    					}
    				};
			    } else {
                    log.write('application.firstResolveEnvCallback: region_error');
                    application.regionError =   {
                            type: application.resource["system_messages"].region_error.MessageType,
                            Message:application.resource["system_messages"].region_error.Message,
                            Close: application.resource["system_messages"].region_error.Close,
                            callback: function(val){
                                    application.exit();
                            }
                    };
			    }
			} else {
				configuration.writeValue('SelectedCountryID', setupDeviceCountryID);
			}
		} else {
			configuration.writeValue('SelectedCountryID', setupDeviceCountryID);
		}
    },
    buildInitialNav: function(){
	    /* Build the initial navigation */
	    $cn.methods.getNav(function(callback){
		    var parentId,
			    rootMaster,
			    slaveMaster;
		    /* Build Nav Here */

		    if(callback && callback.data && callback.data.result) {
			    $cn.data.Navigation = callback.data.result;
			    $cn.data.slaveWheel = {};
			    $cn.data.masterWheel = [];
			    parentId = rootMaster = slaveMaster = 0;
			    $cn.data.recommendedGenres = [];
    			
			    callback.data.result.genres.each(function(genre){
    				
				    if(genre.visible){
                        if (!$cn.data.jinniEnable && (genre.name == "Recommended For You" || genre.name == "Movies by Mood" || genre.name == "TV Shows By Mood")){
                            return;//Do not push to the wheel.
                        }
				        
					    if(genre.parentId == 0) {
						    parentId = genre.iD;												
					    }
    					
					    if(genre.parentId == parentId){
						    $cn.data.masterWheel[$cn.data.masterWheel.length] = genre;	
    						
						    if(rootMaster == 0) {
							    rootMaster = genre.iD;
						    }
					    }
					    else {
    						
						    if(!$cn.data.slaveWheel[genre.parentId]) {
							    $cn.data.slaveWheel[genre.parentId] = [];
						    }
    						
						    $cn.data.slaveWheel[genre.parentId].push(genre);	
    						
						    //Loop recommended genres and match the genres to the parent grouping. This is needed for the my videos implementation
						    $cn.data.RecomendedGenreIds.each(function(g){
							    if(g == genre.iD){
								    $cn.data.masterWheel.each(function(m){
									    if(m.iD == genre.parentId){
										    $cn.data.recommendedGenres[$cn.data.recommendedGenres.length] = {id: m.iD, parentname: m.name, name: genre.name, genreid: g};																	
									    }
								    });
							    }
						    });
    						
						    if(slaveMaster == 0 && rootMaster > 0 && rootMaster == genre.parentId) {
							    slaveMaster = genre.iD;
						    }
					    }
				    }
			    });

		    }
    		
		    $cn.methods.getTitlesByGenreId($cn.data.slaveWheel[$cn.data.masterWheel[0].iD][0].iD, 1, function(){
                var i;

			    log.debug("Merch config: " + $cn.data.EnableMerchPage);
    			
			    if($cn.config.EnableMerch) {
				    //Get Merchandising data
				    $cn.methods.getMerchandize(function(result){
                        var collectionId, badId = [];
    					
					    if(result) {
						    //Test to see if data was returned from merch service to determine if the merch page should be displayed or not
						    log.debug("Merch valid?" +  $cn.data.Merch.newMovies.length + ', '+ $cn.data.Merch.newTVShows.length + ", " + $cn.data.Merch.featuredPromotion.titleID);

						    // Check validity of merch response:
						    if( $cn.data.Merch.newMovies.length > 0 &&
							    $cn.data.Merch.newTVShows.length > 0 &&
							    $cn.data.Merch.newCollections &&
							    $cn.data.Merch.featuredPromotion.titleID &&
							    $cn.data.Merch.featuredPromotion.titleID > 0 &&
							    $cn.data.Merch.featuredPromotion.boxartPrefix &&
							    $cn.data.Merch.featuredPromotion.name) {

                                collectionId = [];
                                // If only 1 new collection
                                if ($cn.data.Merch.newCollections.genreID) {
                                    collectionId[0] = $cn.data.Merch.newCollections.genreID;
                                } else {
                                    for (i = 0; i < $cn.data.Merch.newCollections.length; ++i) {
                                        collectionId[i] = $cn.data.Merch.newCollections[i].genreID;
                                    }
                                }

                                // Assume we are okay until proven otherwise
                                $cn.data.EnableMerchPage = true;

						    } else {
							    log.write("=== getMerchandize data is incomplete - Cannot show Merch Page ===");
							    $cn.data.EnableMerchPage = false;
						    }
					    } else {
						    log.write("=== No getMerchandize Result returned - Cannot show Merch Page ===");
						    $cn.data.EnableMerchPage = false;
					    }
    					
					    application.ui.init();	
				    });
			    }
			    else {
				    //Merch not configured for this client so init the app
				    $cn.data.EnableMerchPage = false;
				    application.ui.init();
			    }
		    });
    		
	    });							
    },
    setSetupData: function(r){
		$cn.data.SessionId = r.sessionID;
		$cn.data.jinniEnable = ($cn.utilities.getMeta("JinniEnable", r.configValues) == "True");
        log.write("setupDevice return: jinniEnable: " + $cn.data.jinniEnable);
		$cn.data.flixsterEnable = ($cn.utilities.getMeta("FlixsterEnable", r.configValues) == "True");
        log.write("setupDevice return: flixsterEnable: " + $cn.data.flixsterEnable);
		$cn.data.baselineEnable = ($cn.utilities.getMeta("BaselineEnable", r.configValues) == "True");
        log.write("setupDevice return: baselineEnable: " + $cn.data.baselineEnable);
		$cn.data.ImageLoadTest = $cn.utilities.getMeta("ImageLoadTest", r.configValues);
		$cn.data.ParentalControlsConfigured = ($cn.utilities.getMeta("ParentalControlsConfigured", r.configValues) == "True");
		// Purchase pin is controlled on a device per device basis.
        //$cn.data.PurchasePinEnabled = ($cn.utilities.getMeta("PurchasePinEnabled", r.configValues) == "True"); /* User has parent pin enabled, some ratings may be filtered at the server. Show option to input parent pin if enabled. */
		$cn.data.AdultPinEnabled = ($cn.utilities.getMeta("AdultPinEnabled", r.configValues) == "True"); /* Do not allow user to enter lifestyle store without prompting for pin. */
		$cn.data.LastCacheLoadTimeUTC = $cn.utilities.getMeta("LastCacheLoadTimeUTC", r.configValues); /* Last time in UTC when server side cache was reloaded. */
		configuration.writeValue('LastCacheTime', $cn.data.LastCacheLoadTimeUTC);

		$cn.data.ShouldUpdateCache = ($cn.utilities.getMeta("ShouldUpdateCache", r.configValues) == "True"); /* Calculate based on input if local cache should be purged. */
		$cn.data.CountryID = $cn.utilities.getMeta("CountryID", r.configValues); /* Country ID for the current client request. */
		$cn.data.Region = $cn.utilities.getMeta("RegionCode", r.configValues); //88 is US
		$cn.data.AllowedRegions = $cn.utilities.getMeta("AllowedRegions", r.configValues).split(',');
		$cn.data.AffId = $cn.utilities.getMeta("AffId", r.configValues); /* Aff ID for the current client request. */
		$cn.data.EnableAccountLink = $cn.utilities.getMeta("EnableAccountLink", r.configValues); /* Used in the settings panel to turn on and off the linking feature */
		$cn.data.AccountLinkUrl = $cn.utilities.getMeta("Account_Link_URL", r.configValues); /* Used in the settings panel to turn on and off the linking feature */
		$cn.data.ActivationURL = $cn.config.ActivationURL || $cn.utilities.getMeta("ActivationURL", r.configValues); /* Custom activation URL configurable at server. (when applies) */
		$cn.data.DisplayEula = ($cn.utilities.getMeta("DisplayEula", r.configValues) == "True"); /* If enabled user has not accepted eula, please display. use getEulaText to load text to display. */
		$cn.data.ShouldEnableTvNode = ($cn.utilities.getMeta("ShouldEnableTvNode", r.configValues) == "True"); /* Notes if TV is approved for this device. */
		$cn.data.BandwithCheckURL = $cn.utilities.getMeta("BandwithCheckURL", r.configValues); /* http link to file to be used for testing bandwidth on device. */
		$cn.data.BandwithCheckURLSize = $cn.utilities.getMeta("BandwithCheckURLSize", r.configValues); /* http link to file to be used for testing bandwidth on device. */
		$cn.data.AuthTokenActive = ($cn.utilities.getMeta("AuthTokenActive", r.configValues) == "True"); /* If auth token present in header it will be checked to verify it is active. */
		$cn.data.SystemOffline = ($cn.utilities.getMeta("SystemOffline", r.configValues) == "True"); /* If set to True, display message at startup. */
		$cn.data.SystemUnavailableMessage = $cn.utilities.getMeta("SystemUnavailableMessage", r.configValues); /* Message to display in the case of system offline. */
		$cn.data.SessionLimitRows = $cn.utilities.getMeta("SessionLimitRows", r.configValues);  /* Number of rows to record before forcing save session. */
		$cn.data.SessionLimitMinutes = $cn.utilities.getMeta("SessionLimitMinutes", r.configValues); /* Number of minutes to wait before forcing save session. */
		$cn.data.AllowAdult = ($cn.utilities.getMeta("AllowAdult", r.configValues) == "True"); /* Allow display of adult store. */
		$cn.data.AllowPlayboy = ($cn.utilities.getMeta("AllowPlayboy", r.configValues) == "True"); /* Allow display of playboy stores */
		$cn.data.RootMoodGenreID = $cn.utilities.getMeta("RootMoodGenreID", r.configValues); /* Used as the parent id for the main wheel */
		$cn.data.TVRootMoodGenreID = $cn.utilities.getMeta("TVRootMoodGenreID", r.configValues); /* Used as the parent id for the main wheel */
		$cn.data.RecomendedGenreIds = $cn.utilities.getMeta("RecomendedGenreIds", r.configValues).split(','); /* Used as the parent id for the main wheel */
		
        $cn.config.EnableUV = $cn.utilities.isTrue($cn.utilities.getMeta("UVEnabled", r.configValues));

		/* Load Custom Preferences */
        if($cn.utilities.isTrue($cn.utilities.getMeta("DolbyEnable", r.configValues))) {
			$cn.data.AllowedAudioProfiles[$cn.data.AllowedAudioProfiles.length] = "Dolby_Digital_Plus_51";
			$cn.data.Dolby51Enable = true;
		}
        /* DTS is not supported now */
        /*if($cn.utilities.isTrue($cn.utilities.getMeta("DTSEnable", r.configValues))) {
			$cn.data.AllowedAudioProfiles[$cn.data.AllowedAudioProfiles.length] = "DTS_Express_51";
			$cn.data.DTS51Enable = true;
		}*/
        
        if($cn.utilities.isTrue($cn.utilities.getMeta("DolbyStereoEnable", r.configValues))) {
			$cn.data.AllowedAudioProfiles[$cn.data.AllowedAudioProfiles.length] = "Dolby_Digital_Plus_Stereo";
			$cn.data.DolbyStereoEnable = true;
		}
        
        /*if($cn.utilities.isTrue($cn.utilities.getMeta("DTSStereoEnable", r.configValues))) {
			$cn.data.AllowedAudioProfiles[$cn.data.AllowedAudioProfiles.length] = "DTS_Express_Stereo";
			$cn.data.DTSStereoEnable = true;
		}*/
        
        if($cn.data.PreferredAudioType == '' ){
        	var bDolbyEnable = $cn.data.Dolby51Enable ||$cn.data.DolbyStereoEnable;
        	var bDTSEnable = $cn.data.DTS51Enable ||$cn.data.DTSStereoEnable;
        	
        	$cn.data.PreferredAudioType = 'Stereo_Standard';
          	
        	if(bDolbyEnable && !bDTSEnable){
        		if($cn.data.Dolby51Enable)
        			$cn.data.PreferredAudioType = 'Dolby_Digital_Plus_51';
        		else
        			$cn.data.PreferredAudioType = 'Dolby_Digital_Plus_Stereo';
        	}
        	       	
        	if(bDTSEnable && !bDolbyEnable){
        		if($cn.data.DTS51Enable)
        			$cn.data.PreferredAudioType = 'DTS_Express_51';
        		else
        			$cn.data.PreferredAudioType = 'DTS_Express_Stereo';
        	}
        }
        
		if($cn.config.EnableJinni !== null && $cn.config.EnableJinni != "auto") {
            log.write("Overwrite EnableJinni setting: " + $cn.config.EnableJinni);
			$cn.data.jinniEnable = $cn.config.EnableJinni;
		}
		
		if($cn.config.EnableFlixster !== null && $cn.config.EnableFlixster != "auto") {
            log.write("Overwrite EnableFlixster setting: " + $cn.config.EnableFlixster);
			$cn.data.flixsterEnable = $cn.config.EnableFlixster;
		}
		
		if($cn.config.EnableBaseline !== null && $cn.config.EnableBaseline != "auto") {
            log.write("Overwrite EnableBaseline setting: " + $cn.config.EnableBaseline);
			$cn.data.baselineEnable = $cn.config.EnableBaseline;
		}
		
		if($cn.config.AllowedRegionOverride !== null && $cn.config.AllowedRegionOverride != "auto") {
			$cn.data.AllowedRegions = $cn.config.AllowedRegionOverride;
		}
		
		//If parental controls are configured and the pin is enabled on startup then force pin popup and filter content
		log.write("$cn.data.ParentPinEnabledOnStartup: " + $cn.data.ParentPinEnabledOnStartup);
        if($cn.data.ParentalControlsConfigured && $cn.data.ParentPinEnabledOnStartup) {
			//Setup default params so that content is filtered on startup
			$cn.data.ParentPinEnabled = true;
			$cn.data.IsParent = false;
            application.saveAuthToken();
		}
        else if($cn.data.ParentalControlsConfigured) {
            // leave ParentPinEnabled set as saved in prior run
            $cn.data.IsParent = !$cn.data.ParentPinEnabled;
        }
        else {
            // Reset to defaults
            $cn.data.IsParent = true;
            $cn.data.ParentPinEnabled = false;
            $cn.data.ParentPinEnabledOnStartup = false;
            $cn.data.PurchasePinEnabled = false;
            application.saveAuthToken();
        }
		
		//Setup logging preferences
		log.session.lastSync = new Date();
		log.session.sessionLimitMinutes  = $cn.data.SessionLimitMinutes;
		log.session.sessionLimitRows  = $cn.data.SessionLimitRows;
		log.session.checkinTimer.Interval = $cn.data.SessionLimitMinutes * 60 * 1000;
		log.session.checkinTimer.Tick = log.session.upload; 
		log.session.checkinTimer.Start();
    },
    navigationSetup: function(){
		this._methodMap = {};	
		
		$('navigation').onkeyup = function(evnt){
			application.RepeatKeyBlock = false;
			var payload = {};
			
			if(!application.isBusy) {
//				
//				/*log.write(evnt.keyCode + ":  " + application.keys.KEY_ENTER);*/
//				log.write("keycode: " + evnt.keyCode);
				switch (evnt.keyCode) {
//					case application.keys.KEY_PANEL_CH_DOWN:
//	            	case application.keys.KEY_DOWN:
//	            		payload.direction = "down";
//						payload.current = application.element.current;
//	            		break;
//	            	case application.keys.KEY_PANEL_CH_UP:
//					case application.keys.KEY_UP:
//						payload.direction = "up";
//						payload.current = application.element.current;
//	            		break;
//					case application.keys.KEY_PANEL_VOL_UP:
	                case application.keys.KEY_RIGHT:
	                	payload.direction = "right";
						payload.current = application.element.current;
	            		break;
//	                case application.keys.KEY_PANEL_VOL_DOWN:
					case application.keys.KEY_LEFT:
						payload.direction = "left";
						payload.current = application.element.current;
	            		break;					
//	                case application.keys.KEY_PAGE_UP:
//	                	payload.direction = "pageup";
//						payload.current = application.element.current;
//	            		break;
//	                case application.keys.KEY_PAGE_DOWN:
//	                	payload.direction = "pagedown";
//						payload.current = application.element.current;
//	            		break;
	                default:
	                	break;
//					
				}
//				
    			application.events.publish("keyup", payload);
			}			
		};
		
		$('navigation').onkeydown = function(evnt){
            var keycode = evnt.keyCode;
			/* This object keeps track of all the key events */
			var blockKey = false;
            var time = $cn.utilities.DateDiff(new Date(), application.LastKeyDown);
            
            log.write("blocking access is: " + application.blockWidgetAccess);
            // Treat return key like exit EULA showing
            if (application.blockWidgetAccess) {
                log.write("blocking widget access");
                if (keycode == application.keys.KEY_PANEL_MENU || keycode == application.keys.KEY_RETURN) {
                    log.write("back key override");
                    keycode = application.keys.KEY_EXIT;
                }
            }
            log.write("exit is " + application.keys.KEY_EXIT);
            log.write("key code after all - now - is: " + keycode);
            
            // This section deals with the cases where be want to ignore the key, typically if we get too many
            // keys in a row before a duration. RepeatKeyBlock is used internally for the press and hold case
            // while TempKeyBlock is used by other classes to prevent key interaction in certain cases.  
            
			if (application.RepeatKeyBlock == true && (time < application.RepeatKeyBlockDuration)) {
				blockKey = true;
				if (this.DEBUG) log.write("RepeatKeyBlock set");
			}
			else {
				if (this.DEBUG) log.write("RepeatKeyBlock NOT set");
			}

			// Allow the app to temporarily block key presses for a duration of time. 
			if(application.TempKeyBlock) {
				if(time < application.TempKeyBlockDuration) {
					blockKey = true;
				}
				else {
					application.TempKeyBlock = false;
				}
			}
			
            //Allow the app to block the Enter key. Very Dangerous so it must be used with duration.
			// This functionality does not seem to be used as of 2013/02/04. 
			var blockEnter = false;
            if(application.TempKeyBlockEnter){
                if(time < application.TempKeyBlockDuration) {
                    blockEnter = true;
                }
                else {
                    application.TempKeyBlockEnter = false;
                }
            }
			
            if (!application.isBusy && blockEnter == true &&
				(keycode == application.keys.KEY_PANEL_ENTER ||
				 keycode == application.keys.KEY_PANEL_SOURCE ||
				 keycode == application.keys.KEY_ENTER)) {
	        	 blockKey = true;
			}
			
			// If we want to block keys then bail here..  
            if (blockKey) {
                application.blockNavigation(evnt);
                return;
            }
            			
			// Keep track of the last time that something was clicked so we can check next time through
            // whethhr to keep blocking keys. Set RepeastKeyBlock which keys unset in keyup.
				application.LastKeyDown = new Date();
			application.RepeatKeyBlock = true;
		    
		    var payload = {
				event: {
					keyCode: keycode
				}
			};
			
			if(!application.isBusy) {
				
				/*log.write(keycode + ":  " + application.keys.KEY_ENTER);*/
				log.write("keycode: " + keycode);
				
				switch (keycode) {
					case application.keys.KEY_PANEL_CH_DOWN:
	            	case application.keys.KEY_DOWN:
	            		payload.direction = "down";
	            		payload.current = application.element.current;
	            		application.events.publish("navigate", payload);
	            		break;
	            	case application.keys.KEY_PANEL_CH_UP:
					case application.keys.KEY_UP:
						payload.direction = "up";
						payload.current = application.element.current;
	            		application.events.publish("navigate", payload);
						break;
					case application.keys.KEY_PANEL_VOL_UP:
	                case application.keys.KEY_RIGHT:
	                	payload.direction = "right";
						payload.current = application.element.current;
	            		application.events.publish("navigate", payload);
	                	break;
	                case application.keys.KEY_PANEL_VOL_DOWN:
					case application.keys.KEY_LEFT:
						payload.direction = "left";
						payload.current = application.element.current;
	            		application.events.publish("navigate", payload);
						break;
					case application.keys.KEY_PANEL_ENTER:
	            	case application.keys.KEY_PANEL_SOURCE:
	                case application.keys.KEY_ENTER:
							// Pressing the Enter button on the remote control moves the 
							// focus away from the wheel to the next control to the right. 
		                	log.write("CURRENT ELEMENT: " + application.element.current);
		                	
							if(!$(application.element.current).get("action")) {
								payload.direction = "right";
								payload.keypressed = application.keys.KEY_ENTER;
								payload.current = application.element.current;
								application.events.publish("navigate", payload);
							} else {
								payload.direction = "select";
								application.events.publish("select", payload);
							}
	                	break;
					case application.keys.KEY_PANEL_MENU:
	                case application.keys.KEY_RETURN:
						application.blockNavigation(evnt);
		                	payload.direction = "back";
		                	application.events.publish("back", payload);
	                	break;
	                case application.keys.KEY_MUTE:
	                	break;
	                case application.keys.KEY_INFO:
	                	break;
	                case application.keys.KEY_EXIT:
	                	application.blockNavigation(evnt);
                        if (application.blockWidgetAccess) {
                            application.events.publish("no_choice_exit", payload);
                        } else {
	                	application.events.publish("exit", payload);
                        }
	                	break;
	                case application.keys.KEY_INFOLINK:
	                	break;
	                case application.keys.KEY_RW:
	            		application.events.publish("rewind", payload);
	                	break;
	                case application.keys.KEY_REWIND_:
	                	log.write('skip back');
	            		application.events.publish("skipback", payload);
	                	break;
	                case application.keys.KEY_PAUSE:
	            		application.events.publish("pause", payload);
	                	break;
	                case application.keys.KEY_FF:
	            		application.events.publish("fastforward", payload);
	                	break;
	                case application.keys.KEY_FF_:
	                	log.write('skip forward');
	            		application.events.publish("skipforward", payload);
	                	break;
	                case application.keys.KEY_PLAY:
	            		application.events.publish("play", payload);
	                	break;
	                case application.keys.KEY_STOP:
	            		application.events.publish("stop", payload);
	                	break;
                    case application.keys.KEY_PLAY_PAUSE:
                        application.events.publish("play_pause", payload);
                        break;
                    case application.keys.KEY_CC_TOGGLE:
                        application.events.publish("cc_toggle", payload);
                        break;
	                case application.keys.KEY_VOL_UP:
	                	break;
	                case application.keys.KEY_VOL_DOWN:
	                	break;
	                case application.keys.KEY_SUBTITLE:
	                	break;
	                case application.keys.KEY_PAGE_UP:
	                	payload.direction = "pageup";
						application.events.publish("navigate", payload);
	                	break;
	                case application.keys.KEY_PAGE_DOWN:
	                	payload.direction = "pagedown";
						application.events.publish("navigate", payload);
	                	break;
	                default:
	                	break;
					
				}
				
				application.events.publish("keydown", payload);
			}
			else {
				log.write("Application is busy block navigation... (Except mandatory listeners)");
				switch (keycode) {
				case application.keys.KEY_PANEL_CH_DOWN:
            	case application.keys.KEY_DOWN:
            		payload.direction = "down";
					payload.current = application.element.current;
            		application.events.publish("blockednavigate", payload);
            		break;
            	case application.keys.KEY_PANEL_CH_UP:
				case application.keys.KEY_UP:
					payload.direction = "up";
					payload.current = application.element.current;
            		application.events.publish("blockednavigate", payload);
					break;
				case application.keys.KEY_PANEL_VOL_UP:
                case application.keys.KEY_RIGHT:
                	payload.direction = "right";
					payload.current = application.element.current;
            		application.events.publish("blockednavigate", payload);
                	break;
                case application.keys.KEY_PANEL_VOL_DOWN:
				case application.keys.KEY_LEFT:
					payload.direction = "left";
					payload.current = application.element.current;
            		application.events.publish("blockednavigate", payload);
					break;
				case application.keys.KEY_PANEL_ENTER:
            	case application.keys.KEY_PANEL_SOURCE:
                case application.keys.KEY_ENTER:
					// Pressing the Enter button on the remote control moves the 
					// focus away from the wheel to the next control to the right.
                    //if enter is blocked and is a select, it will be blocked. ex:during checkout so you don't double check out
					if(!$(application.element.current).get("action")) {
						payload.direction = "right";
						payload.current = application.element.current;
						application.events.publish("blockednavigate", payload);
					} else {
						payload.direction = "select";
						application.events.publish("select", payload);
					}
                	break;
				case application.keys.KEY_PANEL_MENU:
                case application.keys.KEY_RETURN:
					application.blockNavigation(evnt);
                	payload.direction = "back";
                	application.events.publish("back", payload);
                	break;
                case application.keys.KEY_EXIT:
                	application.blockNavigation(evnt);
                    if (application.blockWidgetAccess) {
                        application.events.publish("no_choice_exit", payload);
                    } else {
                	application.events.publish("exit", payload);
                    }
                	break;
                case application.keys.KEY_INFOLINK:
                	break;
                case application.keys.KEY_PAUSE:
            		application.events.publish("pause", payload);
                	break;
                case application.keys.KEY_PLAY:
            		application.events.publish("play", payload);
                	break;
                case application.keys.KEY_STOP:
            		application.events.publish("stop", payload);
                	break;
                default:
                	break;
				
			}
			}
		};
        
		$('navigation').focus();
		
		application.events.subscribe(application, "navigate", application.defaultNavigation);
		application.events.subscribe(application, "exit", application.defaultExit);
		application.events.subscribe(application, "back", application.defaultNavigation);
		application.events.subscribe(application, "select", application.defaultAction);	
		application.events.subscribe(application, "goback", application.state.loadPrevious);
		application.events.subscribe(application, "error", application.exception.onHandleError);
	},
	exit: function(){
		log.write('application.exit: UI Closing.');		
		
		if("WebSocketManager" in window ) {
			if("WebSocket" in window) {
				// Close App, this is the last call to SDK.
				log.write("application.exit: App quitting.");
				var request = '<RNOPlatformCall>$$REQUESTID$$<QuitFlash/></RNOPlatformCall>'; 
				WebSocketManager.send(request, this, function(response) {
					WebSocketManager.shutdown();
                });
            }
		}
			
		device.exit();
	},
	reset: function(){
		log.write("Application reset");
		
		/* The reset function should be called when you want to refresh certain data in the application. The most common use for this is user switching. If you are logged in as a parent then the reset function will clear your cached data and reload with your settings. */
		$cn.data.TitlesByGenreID = -1;
		$cn.data.TitlesByGenrePages = {};
		$cn.data.EpisodeCache = {};
		$cn.data.TitlesByCast = {};
		$cn.data.EpisodeListCache = {};
		$cn.data.TitlesBySimilar = {};
		$cn.data.LibraryWheelItems = {};
		$cn.data.MyVideos = [];
		application.state.purge();
	},
    events: {
		/*
		 * Current Listenable Events
		 *  'gainfocus',
		 *	'losefocus',
		 *	'keydown', 
		 *	'navigate',
		 *	'hideView',
		 *	'showView',
		 *		-- payload.direction = ['up','right','down','left'];
		 */
        evnts: {},
        appEvents: {}, /* App events are the default events being sent from the application. They can be overridden by the views by calling evnt.preventDefault(); */
        subscribe: function(context, eventName, callback) {
	        	
	        	var evnt = {context: context, callback: callback};
                //log.write(context.id);
	        	if(context.id == "application") {
	        		this.appEvents[eventName] = this.appEvents[eventName] || [];
	        		this.appEvents[eventName].push(evnt);
	        	}
	        	else {
	        		//Only add an event if the subscriber has not already been added.
	        		var alreadyExists = false;
	        		
	        		if(this.evnts[eventName]) {
		        		this.evnts[eventName].each(function(e){
		        			if(e.context.id == context.id){
		        				alreadyExists = true;
		        			}		        			
		        		});
	        		}
	        		
	        		if(!alreadyExists){
		        		this.evnts[eventName] = this.evnts[eventName] || [];
		        		this.evnts[eventName].push(evnt);
	        		}
	        	}                
        },
        unsubscribe: function(context, eventName){
            var x,
                tmp,
                evnt;
        	/* Unsubscribe only clears control events. Application events are left */
            	if(this.evnts[eventName]){
            		tmp = this.evnts[eventName];
            		
            		if(tmp.length > 0) {
            			this.evnts[eventName] = [];
	            		
	            		for(x = 0; x < tmp.length; x++){
	            			evnt = tmp[x];
	            			if(evnt.context.id !== context.id) {
	            				this.evnts[eventName].push(evnt);
	            			}
	            		}
            		}
            	}
            	
        },            
        publish: function(eventName) {
                var i, callbacks = this.evnts[eventName], appCallbacks = this.appEvents[eventName], args;
                //log.write(eventName);
                log.write('Event: ' + eventName);
                if (callbacks || appCallbacks) {
                	args = Array.prototype.slice.call(arguments, 1);
                	
                	var _defaultPrevented = false;
                    var evnt = {
                    	preventDefault: function(){
                    		_defaultPrevented = true;
                    	},
                    	args: args
                    };
                    
                    if(callbacks) {
	                    for (i = 0; i < callbacks.length; i++) {
	                    	evnt.context = callbacks[i].context;
	                    	callbacks[i].callback.apply(null, [evnt]);	                    	                    	
	                    }
                    }
                    
                    if(appCallbacks) {
	                    for (i = 0; i < appCallbacks.length; i++) {
	                    	if(!_defaultPrevented) {
	                    		evnt.context = appCallbacks[i].context;
	                    		appCallbacks[i].callback.apply(null, [evnt]);
	                    	}                    	
	                    }
                    }
                }
        }        
    },
    exception: {
    	categories: {},
    	onHandleError: function(payload){
    		BrowseView.onHandleError(payload);
    	},
    	resolveMessagePath: function(state){
    		var category = null;
    		
    		//If state is null set default to system_messages. Else load dynamically
    		if(!state){
				category = application.resource["system_messages"];
    		}
    		else {
	    		if(this.categories[state]) {
		    		if(application.resource[this.categories[state]]) {
		    			category = application.resource[this.categories[state]];
		    		}
		    		else {
		    			category = application.resource["system_messages"];
		    		}
	    		}
	    		else {
	    			if(application.resource) {
	    				category = application.resource["system_messages"];
	    			}
	    		}
    		}
    	
    		return category;
    	}
    },
    state: {
    	_history: [],
		_viewstate: {},   
    	purge: function(){
	    	application.state._history = null;
	    	application.state._history = [];
			application.state._viewstate = {};
    	},
    	save: function(template){
			
			if (application.currentView.currentState) {
			
				log.write("function: application.state.save()");
				var focusedElem = null;
				
				if (application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)) {
					focusedElem = application.element.current;
					log.write("Setting current focused element: " + focusedElem);
				}
				
				var state = {};
				var historyId = "history_" + application.utility.generate.counter++;				
				$cn.data.History[historyId] = document.getElementById('uicontainer').innerHTML;
				
				application.events.publish('savestate', state);
 				
				var view = {
					id: historyId,
					state: state,
					template: template,
					focusedElem: focusedElem,
					containerClass: document.getElementById('uicontainer').className,
					currentState: application.currentView.currentState,
					viewState: application.state._viewstate[application.currentView.currentState]
				};
				
				application.state._history.push(view);
				log.write("application.state._history.length: " + application.state._history.length);
				
				if(application.state._history.length > 30) {
					application.state._history.shift();
					log.write("First History item purged.");
				}
				
				application.state._viewstate[application.currentView.currentState] = view;
				state = null;
				view = null;
			}
    	},
    	previous: function(){
    		
    		//Set new waittimer location
    		/* Need to see if we need a spinner here */
            log.write("function: application.previousView()");
    		
    		//This is custom code to ensure that the player is turned off    
    		if(application.currentView.currentState == 'player-view' && application.currentView.PlayerControl._currentStatus != application.currentView.PlayerControl.STOPPED) {
    	 		log.write('Player is still player while changing views. Stop Player.');
    	 		application.currentView.PlayerControl._currentStatus = application.currentView.PlayerControl.STOPPED;
                BrowseView.PlayerControl.stopPlayer();
    		}
    		
    		if(application.state._history[application.state._history.length - 1]) {
    			log.write("###---###");
    			// Do not go back to a saved settings state if we were in debug mode
    			if (application.state._history[application.state._history.length - 1].currentState === "settings-view" && application.doNotRestoreSettings === true) {
    				application.doNotRestoreSettings = false;
    				BrowseView.goSettings(0);
    				return;
    			}
    			application.events.publish("goback",{});
            }
            else{
            	log.write("Current History Length: " + application.state._history.length);
            	
            	if(application.state._history.length === 0 && (BrowseView.currentState === 'browse-view' || BrowseView.currentState === 'merch-view')){
            		application.events.publish("return",{});
            	}
            	else {
            		BrowseView.currentState = null;
            		BrowseView.goHome();
            	}
            }
    	},
    	loadPrevious: function(payload){
    		log.write('Load Previous View');

			var previousView = application.state._history.pop();
			
			application.currentView.currentState = previousView.currentState;
			application.currentView.LastGridProcess = "backaction";
			application.currentView.CurrentProcessLoaded = true;
			var savedState = application.state._viewstate[application.currentView.currentState];
	
			if (savedState)
				application.state._viewstate[application.currentView.currentState] = savedState.viewState;
				
			application.state.loadPreviousView(previousView);
			var innerHTML = $cn.data.History[previousView.id];

			if (innerHTML) {
				$cn.data.History[previousView.id] = null;
				delete innerHTML;
			}
    		
    		savedState = null;
    		previousView = null;
		},
    	loadPreviousView: function(previousView){
			if (previousView.id) {
				if ($cn.data.History[previousView.id]) {
					var innerHTML = $cn.data.History[previousView.id];
					var uiContainer = document.getElementById('uicontainer');

					log.write("Loading view: " + previousView.id);
					uiContainer.setAttribute('class', previousView.containerClass);
					application.putInnerHTML(uiContainer, innerHTML);
				}

				application.element.current = null;
				
				if (previousView.focusedElem) {
					log.write("Setting default focus to: " + previousView.focusedElem);
					application.element.current = previousView.focusedElem;
				}

				application.events.publish('restorestate', previousView.state);
				application.currentView.layoutIsDirty = true;
            }
            else {
                log.write("Previous view DOM object not found.");                
            }
    		
    		previousView = null;
    	},
		loadState: function(state) {
			var previousView = application.state._viewstate[state];
			
			if (previousView) {
				// Need to create a copy since the same object
				// is also stored in the history stack.
				var temp = $extend({}, previousView);
				
				BrowseView.currentState = state;
				this.loadPreviousView(temp);
				
				temp = null;
				return true;
			}
				
			return false;
		}
    },
	loadView: function(view, params, noSaveCurrentViewInHistory) {
    	
		/* Fire Hide View method before destroying HTML */
		this.events.publish("hideView");
		if (this.currentView && typeof this.currentView.hideView == 'function') {
			this.currentView.hideView();
		}

		log.write("preparing to destroy layout");
		/* Clean-up listeners and layout of current view */
		this.ui.destroyLayout();
		log.write("layout destroyed");
		
	    /* Load and render view */
		this._views[view.id] = view;
		this.currentView = view;	
		log.write("preparing to load layout");	
		this.ui.loadLayout(view.id);
		log.write("layout destroyed");
		this.currentView.init(params, "forward");
		log.write("initialize view");
		log.write("preparing to bind actions");
		this.element.bindActions(view.id);
		log.write("actions binded");
		if(!document.getElementById(application.element.current))
			application.navigator.setFirstFocusableElement();
		this.currentView.render();
		this.events.publish("loadView",{view: this.currentView});
		
	},
	registerHandler: function(view, methodName, callback){
		this._methodMap[view + ":" + methodName] = callback;
	},
	defaultNavigation: function(payload){
		payload = payload.args[0];
		
		/* No element is selected. Set focus to first focusable element */
		if((!application.element.current || application.element.current == '') ||  ((application.element.current && application.element.current != '') &&  !document.getElementById(application.element.current))){
			application.navigator.setFirstFocusableElement();
		}
		
		/* Element found perform navigation */
		switch(payload.direction){
			case "up":
				application.navigator.up(payload);
				break;
			case "down":
				application.navigator.down(payload);
				break;
			case "right":
				application.navigator.right(payload);
				break;
			case "left":
				application.navigator.left(payload);
				break;
			case "back":
				application.state.previous();
				break;
			default:
				break;
		}		
	},
	defaultExit: function(payload) {
		device.exit();
	},
	defaultAction: function(payload){
		payload = payload.args[0];
		log.write('Item selected');
		
		if($(application.element.current).get("action")){
			eval('(' + $(application.element.current).get("action")   + ')');
		}
	},
	saveAuthToken: function(p){
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.AuthToken: ' + $cn.data.AuthToken);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.DeviceName: ' + $cn.data.DeviceName);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.UserEmailAddress: ' + $cn.data.UserEmailAddress);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.AdultPinEnabled: ' + $cn.data.AdultPinEnabled);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.ParentPinEnabled: ' + $cn.data.ParentPinEnabled);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.PurchasePinEnabled: ' + $cn.data.PurchasePinEnabled);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.ParentalControlsConfigured: ' + $cn.data.ParentalControlsConfigured);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.CurrentRegion: ' + $cn.data.CurrentRegion);
		if (this.DEBUG) log.write('application.saveAuthToken: $cn.data.ParentPinEnabledOnStartup: ' + $cn.data.ParentPinEnabledOnStartup);
	            
        var authline = '{"authToken": "' + $cn.data.AuthToken + 
	            		'","adultPinEnabled": "' + $cn.data.AdultPinEnabled + 
	            		'","parentPinEnabled": "' + $cn.data.ParentPinEnabled + 
	            		'","deviceName": "' + $cn.data.DeviceName + 
	            		'","emailAddress": "' + $cn.data.UserEmailAddress +
	            		'","purchasePinEnabled": "' + $cn.data.PurchasePinEnabled +
	            		'","parentalControlsConfigured": "' + $cn.data.ParentalControlsConfigured +
	            		'","parentPinEnabledOnStartup": "' + $cn.data.ParentPinEnabledOnStartup +            		
	            		'"}';
		
		configuration.writeValue(configuration.getPrefixedSettingKey('auth'), authline);
	},
	clearAuthToken: function(){
		log.write("Clearing bad auth token.");

		configuration.clearValue(configuration.getPrefixedSettingKey('auth'));
		configuration.clearValue(configuration.getPrefixedSettingKey('welcome'));
		
		application.deleteActivationFile();

        $cn.data.AuthToken = "";
        $cn.data.IsParent = false;
        $cn.data.ParentPinEnabledOnStartup = false;
        $cn.data.ParentPinEnabled = false; 
        $cn.data.PurchasePinEnabled = false;
        $cn.data.AdultPinEnabled = false; 
        $cn.data.LastCacheLoadTimeUTC = null; /* Last time in UTC when server side cache was reloaded. */
        $cn.data.ShouldUpdateCache = false; /* Calculate based on input if local cache should be purged. */
        $cn.data.AuthTokenActive = false; /* If auth token present in header it will be checked to verify it is active. */ 
        $cn.data.purchTypeFilter = 'any';
        $cn.data.PassCache = {};
        $cn.data.UserEmailAddress = '';
        $cn.data.PendingWishlistItem = '';
        $cn.data.DeviceName = '';
        $cn.data.DeviceID = '';
        $cn.data.MyVideos = [];
        $cn.data.CurrentRegion = '';
            
		var authline = '{"authToken": "' + $cn.data.AuthToken + 
                		'","adultPinEnabled": "' + $cn.data.AdultPinEnabled + 
                		'","parentPinEnabled": "' + $cn.data.ParentPinEnabled + 
                		'","deviceName": "' + $cn.data.DeviceName + 
                		'","emailAddress": "' + $cn.data.UserEmailAddress +
                		'","purchasePinEnabled": "' + $cn.data.PurchasePinEnabled +
                		'","parentalControlsConfigured": "' + $cn.data.ParentalControlsConfigured +
                		'","parentPinEnabledOnStartup": "' + $cn.data.ParentPinEnabledOnStartup +
                		'"}';

		configuration.writeValue(configuration.getPrefixedSettingKey('auth'), authline);
	},
    resolveEnv: function(a_cb){
        var result = {err: true, text: '', data:{}};
    
        if(application.appSetting('ApiUrl') == 'auto')
		{
			// See if we can make an authenticated call to the API
			webservices.makeAsyncRequestExt('https://enpointswitch.cinemanow.com', 'api/orbit/util/default.ashx', 'getDeviceEnv', {}, false, this,
				function(obj){
					result.err = false;
					result.text = 'CinemaNOW request successful';
					result.data = obj.data;
					
					for(var i = 0; i < result.data.result.enviroSelectable.length; i++) {
						result.data.result.enviroSelectable[i].keyUrl = 'https://' + result.data.result.enviroSelectable[i].keyName + '.cinemanow.com';
					}
					
					a_cb.call(this, result);
				},
				function(){
					// failure
					// try calling through reverse proxy setup
					var proxyurl = 'http://' + document.domain + '/stgapi';
					webservices.makeAsyncRequestExt(proxyurl, 'api/orbit/util/default.ashx', 'getDeviceEnv', {}, false, this,
						function(obj) {
							result.err = false;
							result.text = 'CinemaNOW request successful';
							result.data = obj.data;

							for(var i = 0; i < result.data.result.enviroSelectable.length; i++) {
								result.data.result.enviroSelectable[i].keyUrl = 'http://' + document.domain + '/' + result.data.result.enviroSelectable[i].keyName;
							}
							
							a_cb.call(this, result);
						},
						function() {
							// failure, authentication not supported
							application.authSupported = false;
							
							// Setup default, browseonly, environment
							var response = {
							   "result": {
									"defaultKey":"stgapi",
									"enviroSelectable":[{"keyName":"stgapi","keyValue":"*Partner Staging","keyUrl":"https://stgapi.cinemanow.com"}],
									"endPoints": [
										{"keyName":"auth","keyValue":"api/orbit/auth/default.ashx"},
										{"keyName":"browse","keyValue":"api/orbit/browse/default.ashx"},
										{"keyName":"commerce","keyValue":"api/orbit/commerce/default.ashx"},
										{"keyName":"library","keyValue":"api/orbit/library/default.ashx"},
										{"keyName":"search","keyValue":"api/orbit/search/default.ashx"},
										{"keyName":"stream","keyValue":"api/orbit/stream/default.ashx"},
										{"keyName":"titledata","keyValue":"api/orbit/titledata/default.ashx"},
										{"keyName":"util","keyValue":"api/orbit/util/default.ashx"},
										{"keyName":"wishlist","keyValue":"api/orbit/wishlist/default.ashx"},
										{"keyName":"download","keyValue":"api/orbit/download/default.ashx"}
									],
								}
							};
							
							result.err = false;
							result.text = 'CinemaNOW request successful';
							result.data = response;

							a_cb.call(this, result);
						}, true, false
					);
				}, true, false
			);
		}
		else {
			this.apiUrl = this.appSetting("ApiUrl");
			//log.write('Current API URL: ' + this.apiUrl);
            $cn.data.apiUrl  = this.apiUrl;
            
            a_cb.call(this, this.apiUrl);
		}
    },
	bandwidthCheck :{
		lastRan: null,
		callbackParams: null,
		callbackType: "purchase",
		successCondition: 0		
	},
	testConnection: function(cb, optionalMaxToWait){	
		// Note: http://jsfiddle.net/pajtai/pN2R8/
		var img 		= new Image(),
			allDone 	= false, // to enable ensuring calback only fires once
			maxToWaitMs = optionalMaxToWait || 5000;
		img.onload = function(){						
			if (! allDone) {
				log.write("ERROR: TEST CONNECTION PASSED");
				cb.call(this, {"result": true});
				allDone = true;
			}
		};
		img.onerror = function(){						
			if (! allDone) {
				log.write("ERROR: TEST CONNECTION FAILED");
				cb.call(this, {"result": false});
				allDone = true;
			}
		};
		img.src = $cn.data.ImageLoadTest + '?d=' + escape(Date());
		// set a time limit for the timeout
		setTimeout(function() {						
			if (! allDone) {
				log.write("ERROR: TEST CONNECTION TIMED OUT");
				cb.call(this, {"result": false});
				allDone = true;
			}
		}, maxToWaitMs);
	},
	createActivationFile: function() {
		device.createActivationFile();
	},
	deleteActivationFile: function() {
		device.deleteActivationFile();
	},
	loadAnimation: function(animation){
		
		var resource = eval("application.resource.animation." + animation);
		
		if (resource) {
			if (resource.options.transition && typeof(resource.options.transition) == "string")
				resource.options.transition = eval(resource.options.transition);
		}
		
		return resource;
	},
	putInnerHTML: function(pDiv, pContents) {
        if (pDiv != null) {
            //
        	while (pDiv.firstChild) {
        		if (pDiv.deleteChild)
        			pDiv.deleteChild(pDiv.firstChild);
        		else 
        			pDiv.removeChild(pDiv.firstChild);
        	}
            //
        	pDiv.innerHTML = pContents;
        }
    },
    blockNavigation: function(event) {
        event.preventDefault();
    }
};
