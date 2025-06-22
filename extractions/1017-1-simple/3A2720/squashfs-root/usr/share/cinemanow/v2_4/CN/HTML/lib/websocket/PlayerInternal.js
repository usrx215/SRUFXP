//-----------------------------------------------------------------------------
// PlayerInternal.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// WebSocket Player implementation
//

var Player = { 
    initialized : false,
    isPlay : false,
    isStopping : false,
	isHD : false,
    isStutter : false,
    isSkipping : false,
    playbackTime: 0,
    playbackSpeed : 1,
    playbackState : 'Stopped',
    duration : 0,
    videoWidth : 960,
    videoHeight : 540,
    bitrate : 0,
    playbackQualityLevels : 4,
    playbackQualityLevel : 1,
    playbackQualityType : 'SD',
    playbackQualityRate : 0,
    ccData: null,
    scanWatchTimer: null,

    // Initialization at beginning, called by device.initPlayer().
	Initialize: function() {
        log.write('Player.Initialize(websocket version)');        
        var ret = false;
        
        // for now, assume if using websocket/SDK player module, that playback is supported.
        if("WebSocketManager" in window) {
            application.playbackSupported = true;
            ret = true;
        }
        
        return ret;
	},

    // Finalization at end, Called by BrowseView.exitStore().
	Shutdown: function() {
        log.write('Player.Shutdown(websocket version)');   

        // Stop player if needed.
        this.Stop();

        // Release player if needed.
        this._releasePlayer();  
	},

    // Create player and play from beginning, return 1 as success.
	Play: function(url, ccData) {
        log.write('Player.Play(websocket version): url(' + url + ')');
        if (this.initialized) {
            log.write('Player.Play(websocket version): already initialized!');
            return;
        }

        this.ccData = ccData;

        // Parse url and generate request string.
        var request = this._generateCreatePlayerRequest(url),
            self = this;

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'CreatePlayer_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {
                        log.write('Player.Play(websocket version): create player success!');
                        self.initialized = true;

                        // Register event handler, call Play after successful registration.
                        self._registerEventHandler();
                    }
                    else {
                        self._handleError(attributes[0].value);
                    }
                }
            }
        });

        return 1;
	},

    // Create player and resume play from LPT, return 1 as success.
    // Parameter:
    //  resumePosition: resume time in second
    ResumePlay: function(url, resumePosition, ccData) {
        log.write('Player.ResumePlay(websocket version): url(' + url + '), resumePosition(' + resumePosition + ')');
        if (this.initialized) {
            log.write('Player.ResumePlay(websocket version): already initialized!');
            return;
        } 

        this.ccData = ccData;

        // Parse url and generate request string.
        var request = this._generateCreatePlayerRequest(url),
            self = this;

        WebSocketManager.send(request, this, function(response) {
            var responseNode = self._getResponseNode(response, 'CreatePlayer_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {                          
                        log.write('Player.ResumePlay(websocket version): create player success!');
                        self.initialized = true;

                        // Register event handler, call Play after successful registration.
                        self.playbackTime = resumePosition;
                        self._registerEventHandler();
                    }
                    else {
                        self._handleError(attributes[0].value);
                    }
                }
            }         
        });
		
		return 1;
    },

    // Pause player, return 1 as success.
	Pause: function() {
        log.write('Player.Pause(websocket version)');        
        if (!this.isPlay) {
            log.write('Player.Pause(websocket version): not played!');
			return;
		}

        var request = '<RNOPlayerCall>$$REQUESTID$$<Pause/></RNOPlayerCall>',
            self = this;
      
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'Pause_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.Pause(websocket version): pause player success!');
                    }
                }
            }     
        });

        return 1;
	},

    // Resume player after paused, return 1 as success.
	Resume: function() {
		log.write('Player.Resume(websocket version)');
        if (!this.isPlay) {
            log.write('Player.Resume(websocket version): not played!');
            return;
        }

        // Pass 0 as playback time to avoid wv's sync operation.
        this._requestPlay();
		return 1;
	},

    // Stop and release player.
	Stop: function() {
		log.write('Player.Stop(websocket version)');
        if (!this.initialized) {
            log.write('Player.Stop(websocket version): not initialized!');
            return;
        }

        this.isStopping = true;
        var request = '<RNOPlayerCall>$$REQUESTID$$<Stop/></RNOPlayerCall>', 
            self = this;
        
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'Stop_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {                          
                        log.write('Player.Stop(websocket version), stop player success!');
                        self.isPlay = false;                            
                    }
                    else {                        
                        log.write('Player.Stop(websocket version), stop player error(' + attributes[0].value + ')!');
                    }

                    // Release player always.
                    self._releasePlayer();
                }
            }     
        });
	},

    // Jump forward.
	JumpForward: function(second) {
		log.write('Player.JumpForward(websocket version)');
        if (!this.isPlay) {
            log.write('Player.JumpForward(websocket version): not played!');
            return;
        }

        if (this.playbackTime + second < this.duration) {
            this.isSkipping = true;
            this._requestPlay(this.playbackTime + second);
        }
	},

    // Jump backward.
	JumpBackward: function(second) {
		log.write('Player.JumpBackward(websocket version)');
        if (!this.isPlay) {
            log.write('Player.JumpBackward(websocket version): not played!');
            return;
        }

        if (this.playbackTime - second > 0) {
            this.isSkipping = true;
            this._requestPlay(this.playbackTime - second);
        }
	},

    // Locate to some position.
    LocateToPosition: function(position) {
        log.write('Player.LocateToPosition(websocket version): postion(' + position + ')');
        if (!this.isPlay) {
            log.write('Player.LocateToPosition(websocket version): not played!');
            return;
        }

        if (0 < position && position < this.duration) {
            this.isSkipping = true;
            this._requestPlay(position);
        }
        return 1;
    }, 

    // Set playback speed for scanning, return 1 as success.
    SetPlaybackSpeed: function(speed) {
        log.write('Player.SetPlaybackSpeed(websocket version): speed(' + speed + ')');
        if (!this.isPlay) {
            log.write('Player.SetPlaybackSpeed(websocket version): not played!');
            return;
        }

        this._requestPlay(this.playbackTime, speed);
        return 1;
    },

    // Set Player's CSS visibility. 
	SetVisibility: function(visible) {
		log.write('Player.SetVisibility(websocket version)');
	},

	SetDisplayArea: function(x, y, width, height) {
		log.write('Player.SetDisplayArea(websocket version)');
	},

	SetInitialTimeOut: function(second) {
		log.write('Player.SetInitialTimeOut(websocket version)');
	},

    // Return duraion in millisec.
	GetDuration: function() {
        log.write('Player.GetDuration(websocket version), duration(' + this.duration + ')');        
        return this.duration * 1000;
	},

	GetCurrentBitrates: function() {
        log.write('Player.GetCurrentBitrates(websocket version), bitrate(' + this.playbackQualityRate + ')');     
        return this.playbackQualityRate;
	},
	
	GetQualityInfo: function() {
		log.write('Player.GetQualityInfo(websocket version), qualityType(' + this.playbackQualityType + '), Level(' 
				+ this.playbackQualityLevel + '), TotalLevel(' + this.playbackQualityLevels + '), qualityRate(' + this.playbackQualityRate + ')');
		return { 
            PlaybackQualityType : this.playbackQualityType,
			PlaybackQualityLevel : this.playbackQualityLevel,
			PlaybackQualityLevels : this.playbackQualityLevels,
			PlaybackQualityRate : this.playbackQualityRate
		};
	},

	GetVideoHeight: function() {
        log.write('Player.GetVideoHeight(websocket version)');		
        return this.videoHeight;
	},

	GetVideoWidth: function() {
        log.write('Player.GetVideoWidth(websocket version)');
        return this.videoWidth;
	},

    //--------------- Closed Caption --------------
    // Set the desired closed caption language, return 1 as success.
    SetCCLanguage: function(language) {
        log.write('Player.SetCCLanguage(websocket version): language(' + language + ')');

        var request = '<RNOPlayerCall>$$REQUESTID$$<SetCCLanguage>' + language +'</SetCCLanguage></RNOPlayerCall>',
            self = this;

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'SetCCLanguage_Response');
            if (responseNode) {
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.SetCCLanguage(websocket version): SetCCLanguage success!');
                    }
                }
            }     
        });

        return 1;
    },
    
    // SetCCEnabled is used to enable or disable closed caption display
    SetCCEnabled: function(ccEnable) {
        log.write('Player.SetCCEnabled(websocket version): ccEnable(' + ccEnable + ')');

        var request = '<RNOPlayerCall>$$REQUESTID$$<SetCCEnabled>' + ccEnable +'</SetCCEnabled></RNOPlayerCall>',
            self = this;     

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'SetCCEnabled_Response');
            if (responseNode) {
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.SetCCEnabled(websocket version): SetCCEnabled success!');
                    }
                }
            }     
        });

        return 1;
    },

    // GetCCEnabled is used to query the current "enabled" state for closed captions
    GetCCEnabled: function(callback, context) {
        log.write('Player.GetCCEnabled(websocket version)');

        var request = '<RNOPlayerCall>$$REQUESTID$$<GetCCEnabled></GetCCEnabled></RNOPlayerCall>',
            self = this;
        
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'GetCCEnabled_Response'),
                ccEnable = false;

            if (responseNode) {
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error') {
                    if (attributes[0].value == 0) {
                        if (responseNode.firstChild.nodeValue && responseNode.firstChild.nodeValue == 'true')
                            ccEnable = true;
                        else 
                            ccEnable = false;

                        log.write('Player.GetCCEnabled(websocket version): get ccEnable(' + ccEnable + ')');
                        if (typeof callback === 'function') {
                            callback.call(context, ccEnable);
                        }
                    }
                    else {
                        self._handleError(attributes[0].value);
                    }
                }
            }             
        });
    },

    // <SetCCCache cacheType="closedcaptions"/>
    // SetCCCache is used to set caching information for the closed caption manager
    SetCCCache: function() {
        log.write('Player.SetCCCache(websocket version)');

        var request = '<RNOPlayerCall>$$REQUESTID$$<SetCCCache type="closedcaptions"/></RNOPlayerCall>',
            self = this;     

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'SetCCCache_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.SetCCCache(websocket version): SetCCCache success!');
                    }
                }
            }     
        });

        return 1;
    },

    // <SetCCData language="en" url="http://....xml"/>
    // SetCCData is used to associate an out-of-band closed caption data file with a particular language
    SetCCData: function(language, url) {
        log.write('Player.SetCCData(websocket version): language(' + language  + ') url (' + url + ')');

        var request = '<RNOPlayerCall>$$REQUESTID$$<SetCCData language="' + language + '" url="' + url +'"/>' + '</RNOPlayerCall>',
            self = this; 

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'SetCCData_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.SetCCData(websocket version): SetCCData success!');
                    }
                }
            }     
        });

        return 1;
    }, 

    // InitClosedCaption is used to init closed caption related parts.
    InitClosedCaption: function() {
        if (!this.ccData || !this.ccData.length) {
            log.write('Player.InitClosedCaption(websocket version), CC data invalid, just return!');
            return;
        }

        var enabled = ccrender.isCCEnabled(),
            request = '<RNOPlayerCall>$$REQUESTID$$' +
            '<SetCCLanguage>' + this.ccData[0].language +'</SetCCLanguage>' +
            '<SetCCEnabled>' + enabled +'</SetCCEnabled>' +
            '<SetCCCache type="closedcaptions"/>' +
            '<SetCCData language="' + this.ccData[0].language + '" url="' + this.ccData[0].closedCaptionAssetLocation +'"/>' +
            '</RNOPlayerCall>',
            self = this;

        log.write('Player.InitClosedCaption(websocket version): ' + request);

        WebSocketManager.send(request, this, function(response) {
            var responseNode = self._getResponseNode(response, 'SetCCData_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        // Wait for notification that CC stream is downloaded and parsed.
                        log.write('Player.InitClosedCaption(websocket version): SetCCData success!');
                    }
                }
            }

            /*responseNode = self._getResponseNode(response, 'SetCCCache_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.InitClosedCaption(websocket version): SetCCCache success!');
                    }
                }
            }

            responseNode = self._getResponseNode(response, 'SetCCLanguage_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.InitClosedCaption(websocket version): SetCCLanguage success!');
                    }
                }
            }    

            responseNode = self._getResponseNode(response, 'SetCCEnabled_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        log.write('Player.InitClosedCaption(websocket version): SetCCEnabled success!');
                    }
                }
            }*/
        });

        return 1;
    }, 

    // Get CC stream info.
    //<RNOPlayerCall>
    //   <GetStreams streamType="closedcaption"/>
    //</RNOPlayerCall>
    GetCCStreams: function() {
        log.write('Player.GetCCStreams(websocket version)');

        var request = '<RNOPlayerCall>$$REQUESTID$$<GetStreams streamType="closedcaption"/></RNOPlayerCall>',
            self = this;   

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'GetStreams_Response');
            if (responseNode) {
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value != 0) {
                        self._handleError(attributes[0].value);
                    }
                    else {
                        var streamState = responseNode.firstChild.firstChild.textContent,
                            available = (streamState === "Playing" || streamState === "Ready");

                        OnUpdateCCState(available);
                    }
                }
            }     
        });
        
        return 1;
    },

    // Parse and return specified response XML node.
    _getResponseNode: function(response, responseTagName) {
        try {
			var str = response.replace(/\r|\n/g, '').replace(/\s*</g, '<'),
                responseNode = XML.rootFromString(str).firstChild,
                i;

            if (responseNode.nodeName === 'RNOPlayerCall_Response' && responseNode.childNodes && responseNode.childNodes.length) {
                for (i = 1; i < responseNode.childNodes.length; i++) {
                    if (responseNode.childNodes[i].nodeName === responseTagName) {
                        return responseNode.childNodes[i];
                    }
                }
            }

            return null;
        }
        catch (e) {                
            log.write("Player._getResponseNode(websocket version): parsing response error: " + e);
            throw(e);
        }
    },

	// Generate CreatePlayer request string.
    _generateCreatePlayerRequest: function(url) {
        // To faciliate parsing.       
        url = 'TITLE_URL=' + url;

        var map = { titleURL: 'TITLE_URL=', deviceID: '|DEVICE_ID=', 
            deviceTypeID: '|DEVICET_TYPE_ID=', streamID: '|STREAM_ID=', 
            clientIP: '|IP_ADDR=', drmServerURL: '|DRM_URL=', 
            drmAckServerURL: '|ACK_URL=', heartbeatURL: '|HEARTBEAT_URL=', 
            heartbeatPeriod: '|HEARTBEAT_PERIOD=', titleProfile : '|TITLE_PROFILE=',
            customData: '|CUSTOM_DATA=',
            hdStreamID: '|HD_STREAM_ID='};
     
        var i = 0, j = 0, key;
        for (key in map) {
            i = url.indexOf(map[key]);
            if (i > -1) {
                j = url.indexOf('|', i + 1);
                if (j > -1) {
                    if (i + map[key].length < j) {
                        map[key] = url.substring(i + map[key].length, j);   
                    }
                    else {
                        map[key] = '';                       
                    }
                }
            }
            else {
                map[key] = '';
            }
        }

        // SWE deviceID's format is different from our implementation: no dash in device ID.  
        map.deviceID = map.deviceID + '|' + map.deviceTypeID;

        // Get title profile.
        this.isHD = (map.titleProfile == 'HD');

        // DPS specific settings.
        var drmProvider = configuration.readValue("PreferredDRMProvider"),
            provisionBlob = configuration.readValue("DPSProvisionBlob"),
            contentId = configuration.readValue("DPSContentID");

        var sdStreamID = '', 
            hdStreamID = '';
        if (this.isHD) {
            hdStreamID = (drmProvider === 'DIVX') ? map.customData : map.streamID;
        }
        else {
            sdStreamID = (drmProvider === 'DIVX') ? map.customData : map.streamID; 

            // If we're in transition, pass hdStreamID to SDK to get correct quality info.
            if (map.hdStreamID) {
                hdStreamID = map.hdStreamID;
            }
        }

        // Generate request string.
        var request = '<RNOPlayerCall>$$REQUESTID$$<CreatePlayer><PlayerSettings>'+ 
            '<SDTitle>' + (this.isHD ? '' : map.titleURL) + '</SDTitle>' +
            '<HDTitle>' + (this.isHD ? map.titleURL : '') + '</HDTitle>' + 
            '<DRMProvider>' + (drmProvider || '') + '</DRMProvider>' +    
            '<Credentials>' + (provisionBlob || '') + '</Credentials>' +        
            '<SD2HDThreshold>4200</SD2HDThreshold>' +
            '<HD2SDThreshold>2800</HD2SDThreshold>' +
            '<ContentID>' + (contentId || '') + '</ContentID>' +
            '<StreamingCredentials>' +
            '<DeviceID>' + map.deviceID + '</DeviceID>' +
            '<SDStreamID>' + sdStreamID + '</SDStreamID>' +
            '<HDStreamID>' + hdStreamID + '</HDStreamID>' +
            '<ClientIP>' + map.clientIP + '</ClientIP>'+
            '<DRMServerURL>' + map.drmServerURL + '</DRMServerURL>'+
            '<DRMAckServerURL>' + map.drmAckServerURL + '</DRMAckServerURL>'+
            '<HeartbeatURL>' + map.heartbeatURL + '</HeartbeatURL>'+
            '<HeartbeatPeriod>' + map.heartbeatPeriod + '</HeartbeatPeriod>'+
            '<TestURL/>' +
            '<BandwidthInterval/>' +
            '<ProxySettingsEnable>false</ProxySettingsEnable>' +
            '<ProxySettingsIPAddr/>' +
            '<ProxySettingsIPPort>0</ProxySettingsIPPort>' +
            '<ProxySettingsUserID/>' +
            '<ProxySettingsPassword/>' +
            '</StreamingCredentials>'  +
            '</PlayerSettings></CreatePlayer></RNOPlayerCall>';

        log.write("Player._generateCreatePlayerRequest(websocket version), request string: " + request);
        return request;
    },
	
	// Request play.
	_requestPlay: function(playbackTime, playbackSpeed) {
        log.write('Player._requestPlay(websocket version), playbackTime(' + playbackTime + '), playbackSpeed(' + playbackSpeed + ')');
        if (!this.initialized) {
            log.write('Player._requestPlay(websocket version): not initialized!');
            return;
        } 

        var time = playbackTime || 0;
        var speed = playbackSpeed || 1;
        this.playbackSpeed = playbackSpeed;

        var request = '<RNOPlayerCall>$$REQUESTID$$<Play>' +
            '<PlaybackTime type="seconds">' + time + '</PlaybackTime>' +
            '<PlaybackSpeed>' + speed + '</PlaybackSpeed>' +
            '</Play></RNOPlayerCall>';

        var self = this;
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'Play_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {                          
                        log.write('Player._requestPlay(websocket version): player play success!');                        

                        if (!self.isPlay && !self.isStopping) {
                            // Initial play.
                            self.isPlay = true;

                            // Notify UI that we're loading.
                            //OnBufferingStart();

                            // Get duration.
                            self._getDuration();

                            // Comment this out as SDK doesn't support GetStreamAttributes call.
                            //self._getStreamAttributes(); 
                        }
                    }
                    else {
                        self._handleError(attributes[0].value);
                    }
                }
            }   
        });		
	},
	
	// Release player.
	_releasePlayer: function() {
        log.write('Player._releasePlayer(websocket version)');
        if (!this.initialized) {
            log.write('Player._releasePlayer(websocket version): not initialized!');
            return;
        } 

        var request = '<RNOPlayerCall>$$REQUESTID$$<ReleasePlayer/></RNOPlayerCall>',
            self = this;
        
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'ReleasePlayer_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {                          
                        log.write('Player._releasePlayer(websocket version), release player success!');

                        self.initialized = false;                         
                        self.isPlay = false;
                        self.isStopping = false;
                        self.isHD = false;
                        self.isStutter = false;
                        self.isSkipping = false;
                        self.playbackTime = 0;
                        self.playbackSpeed = 1;
                        self.playbackState = 'Stopped';
                        self.duration = 0;
                        self.bitrates = 0;
                        self.playbackQualityLevels = 4;
                        self.playbackQualityLevel = 1;        
                        self.playbackQualityType = 'SD';
                        self.playbackQualityRate = 0;
                        self.ccData = null;

                        // Notify UI as HD transition is interested in this event.
                        OnPlaybackStopped();
                    }
                    else {
                        log.write('Player._releasePlayer(websocket version), release player error('+ attributes[0].value + ')!');
                    }
                }
            }
        });	     
	},

    // Get duration.
    _getDuration: function() {
        log.write('Player._getDuration(websocket version)');
        if (!this.isPlay) {
            log.write('Player._getDuration(websocket version): not played!');
            return;
        }    

        var request = '<RNOPlayerCall>$$REQUESTID$$<GetDuration/></RNOPlayerCall>',
            self = this;
        
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'GetDuration_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error') {
                    if (attributes[0].value == 0) { 
                        if (responseNode.firstChild.nodeName == 'PlaybackTime') {
                            attributes = responseNode.firstChild.attributes;
                            self.duration = Number(responseNode.firstChild.firstChild.nodeValue);

                            if (attributes && attributes.length && attributes[0].name.toLowerCase() === 'type' && attributes[0].value.toLowerCase() === 'frames') {
                                // Convert frames to seconds.
                                self.duration = self.duration/25;
                            }

                            log.write('Player._getDuration(websocket version): get duration(' + self.duration + ')');
							
							// Notify UI that stream info is ready.
                            OnStreamInfoReady();
                        }
                    }
                    else {
                        self._handleError(attributes[0].value);
                    }
                }
            }             
        });
    },

    // Get stream attributes. (SDK hasn't supported this call.)
    _getStreamAttributes: function() {
        log.write('Player._getStreamAttributes(websocket version)');
        if (!this.isPlay) {
            log.write('Player._getStreamAttributes(websocket version): not played!');
            return;
        } 

        var request = '<RNOPlayerCall>$$REQUESTID$$<GetStreamAttributes stream="0"/></RNOPlayerCall>',
            self = this, 
            i = 0, 
            j = 0;

        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'GetStreamAttributes_Response');
            if (responseNode) {                       
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {                          
                        // Get some video attributes.
                        var streamNodes = responseNode.childNodes;
                        for (i = 0; i < streamNodes.length; i++) {
                            if (streamNodes[i].nodeName == 'VideoStreamAttributes') {
                                var videoNodes = streamNodes[i].childNodes;
                                for (j = 0; j < videoNodes.length; j++) {
                                    if (videoNodes[j].nodeName == 'Width') {
                                        self.videoWidth = videoNodes[j].firstChild.nodeValue;
                                    } 
                                    else if (videoNodes[j].nodeName == 'Height') {
                                        self.videoHeight = videoNodes[j].firstChild.nodeValue;
                                    }
                                    else if (videoNodes[j].nodeName == 'BitRate') {
                                        self.bitrates = videoNodes[j].firstChild.nodeValue;
                                    }
                                }
                                break;
                            }
                        }

                        // Notify UI that stream info is ready.
                        if (self.duration > 0 && self.videoWidth > 0 && self.videoHeight > 0) {
                            OnStreamInfoReady();
                        }
                    }
                    else {
                         self._handleError(attributes[0].value);
                    }
                }
            }
        });
    },

    // Register event handler, and call Play after successful registration.
    _registerEventHandler: function() {
        log.write('Player._registerEventHandler(websocket version)');
        if (!this.initialized) {
            log.write('Player._registerEventHandler(websocket version): not initialized!');
            return;
        }

        var request = '<RNOPlayerCall>$$REQUESTID$$<RegisterEventHandler/></RNOPlayerCall>',
            self = this;
        
        WebSocketManager.send(request, this, function(response) { 
            var responseNode = self._getResponseNode(response, 'RegisterEventHandler_Response');
            if (responseNode) {                     
                var attributes = responseNode.attributes;
                if (attributes.length > 0 && attributes[0].name == 'error' ) {
                    if (attributes[0].value == 0) {
                        // Register notification handler with WebSocketManager.                       
                        WebSocketManager.addHandler('RNOPlayerCall_Notify', self, self.EventNotification);

                        if (self.ccData && self.ccData.length) {
                            // Init CC if CC data is valid.
                            self.InitClosedCaption();
                        } else {
                            // Play as required.
                            self._requestPlay(self.playbackTime);                            
                        }
                    }
                    else {
                        self._handleError(attributes[0].value);
                    }
                }
            }     
        });

        /* 
        Event callbacks in player.js which need to be called by internal player:
            OnStreamInfoReady() :      The event that notifies video width, height, bitrates are ready for retrieval.
            OnCurrentPlayTime(ms) :    The event that notifies current playback time.
            OnRenderingComplete() :    The event that notifies end of stream.
            OnBufferingStart() :       The event that notifies buffering at beginning, UI should show loading spinnner.
            OnBufferingComplete() :    The event that notifies buffering at end, UI should hide loading spinner.
            OnNetworkDisconnected() :  Network disconnected.
            OnAuthenticationFailed() : Authentication failed.
            OnConnectionFailed() :     Connection failed.
            OnRenderError() :          Genernal rendering error.
            OnStreamNotFound() :       Stream not found.
            OnCustomEvent(error) :     Widewine custom errors.
            OnPlaybackStopped() :      Playback is stopped.
            OnPlaybackSkipChapterEnd() : Skip chapter is completed.
        */
    },

    // Event notification callback, it's registered with WebSocketManager.
    EventNotification: function(xmldom) {
        //log.write('Player.EventNotification(websocket version)');
        var i = 0;
        			
        try {                           
            if (xmldom.nodeName == 'RNOPlayerCall_Notify') {
                // Player notification.
                if (xmldom.firstChild.nodeName == 'PlaybackStateEvent') {
                    // Playback state event.
                    var statesNodes = xmldom.firstChild.childNodes;
                    for (i = 0; i < statesNodes.length; i++) {
                        if (statesNodes[i].nodeName == 'PlaybackState') {                            
                            log.write('Player.EventNotification(websocket version), playbackSate(' + statesNodes[i].firstChild.nodeValue + ')');

                            // Notify UI with state change.                                                      
                            this._playbackStateChanged(statesNodes[i].firstChild.nodeValue);
                        }
                        else if (statesNodes[i].nodeName == 'PlaybackTime') {
                            var playbackTime = Number(statesNodes[i].firstChild.nodeValue);

                            this._checkForReverseScanEnd(playbackTime);

                            this.playbackTime = playbackTime;
                            log.write('Player.EventNotification(websocket version), playbackTime(' + this.playbackTime + ')');

                            // Notify UI with current playback time in millisec.
                            OnCurrentPlayTime(this.playbackTime * 1000);
                        }
                        else if (statesNodes[i].nodeName == 'PlaybackQualityLevels') {
                            log.write('Player.EventNotification(websocket version), PlaybackQualityLevels(' + statesNodes[i].firstChild.nodeValue + ')');
                            this.playbackQualityLevels = statesNodes[i].firstChild.nodeValue;
                        }
                        else if (statesNodes[i].nodeName == 'PlaybackQualityLevel') {
                            log.write('Player.EventNotification(websocket version), PlaybackQualityLevel(' + statesNodes[i].firstChild.nodeValue + ')');

                            this.playbackQualityLevel = statesNodes[i].firstChild.nodeValue;

                            // Calculate current bitrate.
                            this._getCurrentBitrate(Number(this.playbackQualityLevel));
                        }
                        else if (statesNodes[i].nodeName == 'PlaybackQualityType') {
                            log.write('Player.EventNotification(websocket version), PlaybackQualityType(' + statesNodes[i].firstChild.nodeValue + ')');
                            this.playbackQualityType = statesNodes[i].firstChild.nodeValue;
                        }
                        else if (statesNodes[i].nodeName == 'PlaybackQualityRate') {
                            log.write('Player.EventNotification(websocket version), PlaybackQualityRate(' + statesNodes[i].firstChild.nodeValue + ')');
                            this.playbackQualityRate = statesNodes[i].firstChild.nodeValue;
                        }
                        /*else if (statesNodes[i].nodeName == 'PlaybackSpeed') {
                            this.playbackSpeed = Number(statesNodes[i].firstChild.nodeValue);
                            log.write('Player.EventNotification(websocket version), PlaybackSpeed(' + this.playbackSpeed + ')');
                        }*/
                    }
                }
                else if (xmldom.firstChild.nodeName == 'ClosedCaptionEvent' ) {
                    // Closed caption data.
                    OnPlaybackCCData(xmldom.firstChild.childNodes);
                }
                else if (xmldom.firstChild.nodeName == 'PlaybackStreamChange' ) {
                    //log.write('Player.EventNotification(websocket version), PlaybackStreamChange!');
                    if(xmldom.firstChild.firstElementChild.nodeName == "ClosedCaptionStreamAttributes"){
                        var streamAttributes = xmldom.firstChild.firstElementChild.childNodes,
                            state;
                        if (streamAttributes && streamAttributes.length) {
                            for (i = 0; i < streamAttributes.length; i++) {
                                if (streamAttributes[i].nodeName === 'StreamState') {
                                    state = streamAttributes[i].firstChild.nodeValue;
                                    log.write('Player.EventNotification(websocket version), ClosedCaptionStream state: ' + state);
                                    break;
                                }
                            }
                        }

                        if (state === 'Downloaded' || state === 'Error') {
                            // Start playback if CC is downloaded and parsed, or has error.
                            if (!this.isPlay) {
                                this._requestPlay(this.playbackTime);
                            }

                            // Notify UI if CC is unavailable.
                            if (state === 'error') {
                                OnUpdateCCState(false);
                            }
                        }
                    }
                }
                else if (xmldom.firstChild.nodeName == 'PlaybackEndOfStreamEvent') {
                    // End of stream event
                    log.write('Player.EventNotification(websocket version), end of stream!');

                    // Notify UI with EOS.
                    OnRenderingComplete();
                }
				else if (xmldom.firstChild.nodeName == 'PlaybackStutterStartEvent') {
					// Stutter start event
					log.write('Player.EventNotification(websocket version), stutter start event!');
                    this.isStutter = true;
                    OnPlaybackStutterStart();			
				}
				else if (xmldom.firstChild.nodeName == 'PlaybackStutterStopEvent') {
					// Stutter stop event
					log.write('Player.EventNotification(websocket version), Stutter stop event!');                    
                    this.isStutter = false;
                    OnPlaybackStutterStop();
				}
                else if (xmldom.firstChild.nodeName == 'PlaybackUnderflowEvent') {
                    // Underflow event.
                    log.write('Player.EventNotification(websocket version), playback underflow!');
                }
                else if (xmldom.firstChild.nodeName == 'PlaybackSeekEvent') {
                    // Seek event.
                    log.write('Player.EventNotification(websocket version), seek finished!');
                }
                else if (xmldom.firstChild.nodeName == 'PlaybackErrorEvent') {
                    // Error event.
                    var error = xmldom.firstChild.firstChild.nodeValue;
                    log.write('Player.EventNotification(websocket version), error(' + error + ') occured!');
                    this._handleError(error);
                }
            }
        } catch (e) {                
            log.write("Player.EventNotification(websocket version): parsing notification error: " + e);
            throw(e);
        } 
    },

    // Calculate current bitrate. 
    // Note: This calculation is inaccurate, only for legacy use.
    _getCurrentBitrate: function(qualityLevel) {
        var rate = 1.0;
        switch (qualityLevel) {
            case 1:
                rate = this.isHD ? 1.0 : 0.7;
                break;
            case 2:
                rate = this.isHD ? 2.0 : 1.0;
                break;
            case 3:
                rate = this.isHD ? 4.0 : 1.5;
                break;
            case 4:
                rate = this.isHD ? 8.0 : 2.0;
                break;
        }

        this.bitrate = rate * 1000 * 1024;
    },

    // Playback state changed.
    _playbackStateChanged: function(newState) {
        if (this.playbackState != newState) {
            log.write('Player._playbackStateChanged(websocket version), state(' + this.playbackState + ' => ' + newState + ')');
            switch (this.playbackState) {
                case 'Stopped':
                    if (newState == 'Playing') {
                        // Loading completed, show UI controls.
                        OnBufferingComplete();
                    }
                    break;
                case 'Paused':
                    if (newState == 'Playing' && this.isStutter) {
                        // Rebuffering completed, hide loading.
                        this.isStutter = false;
                        OnPlaybackStutterStop();
                    }
                    break;
                case 'Scanning':
                    if (newState == 'Playing' && this.playbackSpeed < 1) {
                        this.playbackSpeed = 1;
                        OnReverseScanToPlay();
                    }
                    break;
                default:
                    break;
            }

            this.playbackState = newState;
        }

        if (this.isSkipping && newState == 'Playing') {
            // Skip chapter ends.
            this.isSkipping = false;
            OnPlaybackSkipChapterEnd();
        }
    },

    // Check if reversecan has reached title's beginning, then set a watch timer to go back to normal play as player may be stuck in scanning sometimes.
    _checkForReverseScanEnd: function(playbackTime) {
        var self = this;

        if (this.playbackState === 'Scanning'  && this.playbackSpeed < 1) {            
            if (this.playbackTime <= 2 && this.playbackTime - playbackTime <= 0) {
                log.write('PlayerInternal._checkForReverseScanEnd: the beginning is reached, will go to normal play after 5s, current time: ' + this.playbackTime);

                if (!this.scanWatchTimer) {
                    this.scanWatchTimer = setTimeout(function() {
                        self.scanWatchTimer = null;
                        
                        if (self.playbackState === 'Scanning' && self.playbackSpeed < 1 && self.playbackTime <= 2 && !self.isStopping) {
                            log.write('PlayerInternal._checkForReverseScanEnd: go to normal play as it is stuck in scanning!');
                            self._requestPlay(self.playbackTime);
                            OnReverseScanToPlay();
                        }
                    }, 5000);
                }
            }
        }
    },

    // Handle errors of response and notification.
    // Parameter:
    //   error: a string of unsigned 32-bit hexadecimal integer or signed 32-bit negative decimal integer.
    _handleError: function(error) {
        log.write('Player._handleError(websocket version), error(' + error + ')');

		var errorCode = 0;
		if (error.charAt(0) === '-') {
			// signed 32-bit negative decimal integer, such as -2146096868.
			errorCode = Number(error);
		}
		else {
			// unsigned 32-bit hexadecimal integer, such as 8015xxxx.
            errorCode = parseInt(error, 16);
		}
        log.write('Player._handleError(websocket version), errorCode(0x' + errorCode.toString(16) + ')');

        errorCode &= 0x7FFFFFFF;
        var unknowError = false;
        
        if (0x140000 <= errorCode && errorCode < 0x150000)
        {
            // WebService errors
            switch (errorCode) {
                case 0x140001: // 512 error
                case 0x140002:            
                    application.events.publish("error", {
                        type : "no_internet"
                    });
                    break;
                default:
                    unknowError = true;
                    break;
            }
        }
        else if (0x150000 <= errorCode && errorCode < 0x160000) 
        {
            // Player errors (WV related)
            var sdkError = errorCode - 0x150000,
                playerError = sdkError - 10000;
            log.write('Player._handleError(websocket version), SDKError(' + sdkError + '), playerError(' + playerError + ')');    

            switch (playerError) {           
                case 463:  // WV_TERMINATE_REQUESTED            
                case 2004: // WV_ERROR_DOWNLOAD_STALLED
                    OnNetworkDisconnected();                
                    break;
                case 401: // WV_UNAUTHORIZED
                    OnAuthenticationFailed();
                    break;          
                case 400: // WV_BAD_REQUEST
                case 408: // WV_REQUEST_TIMEOUT
                case 462: // WV_DESTINATION_UNREACHABLE            
                case 500: // WV_INTERNAL_SERVER_ERROR            
                case 503: // WV_SERVICE_UNAVAILABLE            
                case 504: // WV_SERVICE_RESPONSE_ERROR
                    OnConnectionFailed();
                    break;
                case 404: // WV_NOT_FOUND
                case 454: // WV_SESSION_NOT_FOUND
                    OnStreamNotFound();
                    break;            
                case 513: // WV_STREAMING_ON_OTHER_DEVICE
                case 514: // WV_CC_NOT_ON_FILE
                case 515: // WV_TT_NOT_FOUND_OR_NOT_IN_THIS_REGION
                case 516: // WV_IP_RESTRICTED_DOWNLOAD_TO_THE_GEOGRAPHICAL
                case 517: // WV_ASSET_NOT_FOUND
                case 520: // WV_STREAMID_NOT_MATCH_DEVICEID
                case 521: // WV_STREAMID_NOT_MATCH_IP
                case 522: // WV_INVALID_PASSID
                case 523: // WV_INVALID_USERID
                case 524: // WV_NO_MORE_LICENSES_AVAILABLE
                case 525: // WV_NOT_FOUND_STREAMING_INSTANCE         
                case 550: // WV_SYSTEM_ERROR
                case 570: // WV_USER_LOCKED_OUT
                    OnCustomEvent(playerError);
                    break;
                    // Following errors should be suppressed:
                case 2000: // WV_WARNING_DOWNLOAD_STALLED
                case 2001: // WV_WARNING_NEED_KEY
                case 2002: // WV_WARNING_NOT_AVAILABLE
                case 2003: // WV_CHECKING_BANDWIDTH
                    break;
                default:
                    unknowError = true;
                    break;
            }
        }
        else {
            unknowError = true;
        }

        if (unknowError) {
            log.write('Player._handleError(websocket version), unknown error(' + error + '), call OnRenderError()'); 
            OnRenderError(); 
        }
    }
};
