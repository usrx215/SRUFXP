//-----------------------------------------------------------------------------
// player.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var PlayerControlProperties = {
    id : 'player',
    debug : false,
    debugAsset : "http://edge.cinemanow.com.edgesuite.net/adaptive/studio/tyson_5f09d885_wv_SD_TRAILER.vob|DEVICE_ID=dev12345|STREAM_ID=strm1234|IP_ADDR=vmes4|DRM_URL=https://fcpstage.shibboleth.tv/widevine/cypherpc/cgi-bin/GetEMMs.cgi|ACK_URL=http://vmes4/cgi-bin|I_SEEK=TIME|CUR_TIME=PTS|COMPONENT=WV", // "http://192.168.1.110/movie.mp4",
    debugCCAsset: [{language: 'en', closedCaptionAssetLocation: 'http://us1cc.res.com.edgesuite.net/d/detour_f2b6e7d5_cc_lid_0_1.xml'}],
    persist : {},
    controls : {},
    buttons : [],
    STOPPED : 0,
    PLAYING : 1,
    PAUSED : 2,
    TRICKPLAY : 3,
    SKIPPING : 4,
    MAX_VOL : 100,
    MIN_VOL : 0,
    totalTime : 1,
    _totalbarSD : 3, // SD's total bar for indicator is 3, 
    _totalbarHD : 6, // HD's total bar for indicator is 6,
    _isLoaded : false,
    isBuffering: false,
    trickPlayCnt : 5,
    _playIndex : 5, // This is the index in the _trickPlayArr that
    // equals PLAY status
    // [LIMITED Speeds]_trickPlayArr: new Array(-8,-4,-2,1,2,4,8),
    _trickPlayArr : new Array(-32, -16, -8, -4, -2, 1, 2, 4, 8, 16, 32),
    _currentStatus : 0,
    _startPos : 0,
    _isHd : false,
    _currentFileType : "STANDARD",
    _title : {},
    _bufferCount : 0, // Total number of "valid" buffer counts, counting toward potential demotion to SD
    _lastBuffer : 0, // This will turn into the date of the last buffering event
    _longBufferCount : 0, // This is used to keep track of the "large window" rebuffering limit
    _lastLongBuffer : 0, // This is used to keep track of the "large window" rebuffering limit
    _singleLongTracker : [], // This tracks and clears individual long buffer events after 30 minuts
    _errorTimeBuffer: 3000,
    hasError : false,
    _readyForTrick : false,
    _trackBuffers: true,
    layoutIsDirty : true,
    noMoreErrors: false,
    tpl : null,
    selection : null,
    identifier : null,
    playerLoadingSpinner : null,
    playerLoadingSpinnerSpinning : false,
    doRegisterBuffers : true,
    registerTimeout: null,
    resumeTime: null,
    stutterTimer : null,
    stutterPosition : 0,
    skipTime : 0,
    skipStartPosition: 0,
    skipWatchTimer : null,
    locateTickTimer: null,
    locateDirection: '',
    locateTimerOn: false,
    loadingTimer : null,
    loadingLimit : 0,
    loadingInProgress : false,
    playPauseKey : 'play',
    inLocateMode : false,
    ccData : {},
    elementCache : {},
    
    initialize : function() {
        application.events.subscribe(this, "pause", this._onPauseButton.bind(this));
        application.events.subscribe(this, "play", this._onPlayButton.bind(this));
        application.events.subscribe(this, "stop", this._onStopButton.bind(this));
        application.events.subscribe(this, "rewind", this._onRewindButton.bind(this));
        application.events.subscribe(this, "fastforward", this._onFastforwardButton.bind(this));
        application.events.subscribe(this, "skipback", this._onSkipbackButton.bind(this)); //[Not Supported by SS]
        application.events.subscribe(this, "skipforward", this._onSkipforwardButton.bind(this)); //[Not Supported by SS]
        application.events.subscribe(this, "play_pause", this._onPlayPauseButton.bind(this));
        application.events.subscribe(this, "cc_toggle", this._onClosedCaptionButton.bind(this));
        //application.events.subscribe(this, "exit", this._onExitButton.bind(this)); ///* NOW BEING HANDLED IN THE STORE
    },
    _onSkipbackButton : function() {
        if (BrowseView.currentState == "player-view") {
            BrowseView.PlayerControl._skiprw();
        }
    },
    _onSkipforwardButton : function() {
        if (BrowseView.currentState == "player-view") {
            BrowseView.PlayerControl._skipff();
        }
    },
    _onPauseButton : function() {
        if (BrowseView.currentState == "player-view") {
            BrowseView.PlayerControl._pause();
        }
    },
    _onPlayButton : function() {
        if (BrowseView.currentState == "player-view") {
            BrowseView.PlayerControl._resume();
        }
    },
    _onStopButton : function() {
        if (BrowseView.currentState == "player-view") {
            this.hasError = false;
            BrowseView.PlayerControl._stop();
        }
    },
    _onPlayPauseButton : function() {
        if (BrowseView.currentState == "player-view") {           
            BrowseView.PlayerControl._playpause();
        }
    },
    _onClosedCaptionButton : function() {
        if (BrowseView.currentState == "player-view") {
            //No action if no cc icon found or player not ready.
            if (!this.getCachedElement('CCState') || this.isBuffering || !this._isLoaded) {
                return;
            }

            if (this._isControlHidden()) {
                this.showControls();
            }

            if (ccrender.isCCAvailable()) {
                this._exitLocateMode('CCState');
                this.onClosedCaptionToggle();
            }

            this._regKeyTimeout('navigate');
        }
    },
    _onNavigate: function(payload){
        if (BrowseView.currentState == "player-view") {
            if (this.isBuffering || !this._isLoaded) {
                log.write("===== Can't navigate on Buffering or unloaded ===== ");
                return;
            }

            var focusId = payload.args[0].current,
                direction = payload.args[0].direction;

            if (this._isControlHidden()) {
                // Just show controls if hidden, and prohibit default action at this time.
                this.showControls();
                payload.preventDefault();
            } else {
                /* if current focus is in transport bar and the movement is up or down, timestring shows
                * or current focus is on playerlocate and the key movement is left or right, timestring shows
                * otherwise timestring hides
                */
                if((focusId == 'playerlocate' && (direction == 'left' || direction == 'right')) || (this._isFocusOnTransport(focusId) && (direction == 'up' || direction == 'down'))) {
                    this.getCachedElement('CurrentTime').show();
                    this.getCachedElement('Trick').addClass('hidden');
                } else {
                    this.getCachedElement('CurrentTime').hide();
                    this.getCachedElement('Trick').removeClass('hidden');
                }

                if(focusId === 'playerlocate' && (direction === 'right' || direction === 'left')) {
                    // Setup timer tick.
                    if (!this.locateTickTimer) {
                        this.locateTickTimer = new Timer();
                        this.locateTickTimer.Interval = 100;

                        this.locateTickTimer.Tick = function() {
                            if (this.locateTimerOn) {
                                if (!this._locatePlaybackTime(this.locateDirection === 'right')) {
                                    // Stop timer tick if locating is out of boundary.
                                    this.locateTimerOn = false;
                                    this.locateDirection = '';
                                }
                            } else {
                                this.locateTickTimer.Stop();
                            }
                        }.bind(this);
                    }

                    if (!this.locateDirection) {
                        // Step only 10s at the first time of key down.
                        if (this._locatePlaybackTime(direction === 'right')) {
                            this.locateDirection = direction;
                        }
                    } else {
                        // Start timer tick only at the second time of key down if user is holding key.
                        if (direction === this.locateDirection && !this.locateTimerOn) {
                            this.locateTimerOn = true;
                            this.locateTickTimer.Start();
                        }
                    }
                }

                // Need to exit locate mode if user moves focus down to transport bar during play and trickplay.
                if (this.inLocateMode && (this._currentStatus === this.PLAYING || this._currentStatus === this.TRICKPLAY) && (focusId == 'playerlocate' && (direction == 'up' || direction == 'down'))) {
                    this._exitLocateMode();
                }
            }

            this._regKeyTimeout('navigate');
        }
    },

    _onKeyUp: function(payload) {
        if (BrowseView.currentState == "player-view") {
            if (this.isBuffering || !this._isLoaded) {
                log.write("===== Can't navigate on Buffering or unloaded ===== ");
                return;
            }

            var focusId = payload.args[0].current,
                direction = payload.args[0].direction;

            if(focusId === 'playerlocate' && (direction === 'right' || direction === 'left')) {
                // Stop timer tick.
                this.locateDirection = '';
                this.locateTimerOn = false;                
            }
        }
    },
    
    // Locate to a new playbck time.
    _locatePlaybackTime: function(forward) {
        var offset = 0, 
            valid = false,
            SHORT_SKIP_UNIT = 10000, // 10s
            LONG_SKIP_UNIT = Math.max(Math.floor(this.totalTime/100), 10000),
            skipUnit = 0;

        if (!this.inLocateMode) {
            // First time positioning in locate mode.
            offset = (forward) ? SHORT_SKIP_UNIT : 0 - SHORT_SKIP_UNIT;
            if (this._isPositionInBound(this._currentTime + offset)) {
                this.skipTime = offset;
                this.skipStartPosition = this._currentTime;
                valid = true;
                log.write("_locatePlaybackTime: first positioning offset: " + this.skipTime/1000);
            }
        } else {
            // Cumulative positioning offset if key is held on.
            skipUnit = (this.locateTimerOn) ? LONG_SKIP_UNIT : SHORT_SKIP_UNIT;
            offset = forward ? this.skipTime + skipUnit : this.skipTime - skipUnit;

            if (!offset) {
                // If offset is 0, span current position.
                offset = forward ? skipUnit : 0 - skipUnit;
            }

            if (this._isPositionInBound(this.skipStartPosition + offset)) {
                this.skipTime = offset;
                valid = true;
                log.write("_locatePlaybackTime: cumulative positioning offset: " + this.skipTime/1000);
            }
        }

        if (valid) {
            if (!this.inLocateMode) {
                // Enter locate mode.
                this.inLocateMode = true;
            }

            // Update progressbar and time indicator.
            this.setProgressBar((this._currentTime/this.totalTime*100), ((this.skipStartPosition + this.skipTime)/this.totalTime*100));
            this.getCachedElement('CurrentTime').set('html', $cn.utilities.convertMStoTime(this.skipStartPosition + this.skipTime));
        }

        return valid;
    },
    // Is control hidden.
    _isControlHidden: function() {
        return parseInt(this.getCachedElement('PlayerLocateBottom').getStyle('bottom')) === -140;
    },
    // Is focus on transport bar.
    _isFocusOnTransport: function(focusId) {
        var current = this.getCachedElement(focusId);        
        if (current && current.getParent().id === 'PlayerTransportBar') {
            return true;
        } else {
            return false;
        }
    },
    // Is playback position in time boundary.
    _isPositionInBound: function(position) {
        return 1000 <= position && position <= this.totalTime - 5000;
    },
    // Exit locate mode and set new focus.
    _exitLocateMode: function(focusId) {
        this.inLocateMode = false;
        this.locateTimerOn = false;

        if (focusId) {
            application.navigator.setFocus(focusId);

            this.getCachedElement('CurrentTime').hide();
            this.getCachedElement('Trick').removeClass('hidden');
        }
    },
    /*
     * NOW BEING HANDLED IN THE STORE _onExitButton: function(payload){
     * if(BrowseView.currentState == "player-view") { payload.preventDefault();
     * BrowseView.PlayerControl.stopPlayer();
     *
     * this._saveStatus("stopped", function(){ device.exit(); }); } },
     */
    _onRewindButton : function(payload) {
        if (!this._isLoaded) {
            log.write("===== Can't RW file not loaded ===== ");
            return;
        }

        var self = payload.context;
        if (self._trickTest) {
            var newdate = new Date();
            var seconds = $cn.utilities.DateDiff(newdate, self._trickTest);
            log.write("newDate: " + newdate.toString() + ", self._rwTest: "
                + self._trickTest.toString() + ", seconds: " + seconds);
            if (!self._readyForTrick && seconds < 2000) {
                log.write('ignore rw');
                return;
            } else {
                self._readyForTrick = true;
            }
            self._trickTest = newdate;
        }
        self._trickTest = new Date();
        self._registerHideControls('rw');
        self._rewind();
    },
    _onFastforwardButton : function(payload) {
        if (!this._isLoaded) {
            log.write("===== Can't FF file is not loaded ===== ");
            return;
        }
        var self = payload.context;
        if (self._trickTest) {
            var newdate = new Date(),
                seconds = $cn.utilities.DateDiff(newdate, self._trickTest);
            log.write("newDate: " + newdate.toString() + ", self._ffTest: "
                + self._trickTest.toString() + ", seconds: " + seconds);
            if (!self._readyForTrick && seconds < 2000) {
                log.write('ignore ff');
                return;
            } else {
                self._readyForTrick = true;
            }
            self._trickTest = newdate;
        }
        self._trickTest = new Date();
        self._registerHideControls('ff');
        self._fastForward();
    },
    _onError : function(err) {
        this._clearAllBufferTimeouts();

        if (this.noMoreErrors || (BrowseView.MessagePopup && BrowseView.MessagePopup.isNowVisible)) {
            log.write("-- Errors occuring too close together. Ignoring this one. --");
            return;
        }

        this.noMoreErrors = true;

        setTimeout(function() {
            this.noMoreErrors = false;
        }.bind(this), this._errorTimeBuffer);

        log.write('Error Occurred: ' + err);

        // Reset states.
        this.trickPlayCnt = this._playIndex;
        this.hideLoading();
        this.isBuffering = false;
        this.hasError = true;

        if (err == 'askabouthdswap_error' || err == 'connectiontooslow_error_player')
        {
            // Already paused.
            this._currentStatus = this.PAUSED;
        }
        else {
            // Stop Player
            this.stopPlayer();
            this._currentStatus = this.STOPPED;
        }

        application.events.publish("error", this._makeErrorObject(err));
    },
    _makeErrorObject: function(err) {
        return {
            type                : err,
            titleID             : this.persist.titleID,
            streamID            : this.persist.streamid,
            url                 : this.persist.url,
            startTimeSeconds    : parseInt(this._currentTime / 1000, 10),
            isHd                : this._isHd,
            passID              : this.persist.passID
        }
    },
    listenForLoad: function() {
        this._isLoaded = true;

		// Commment out this complicated loading check, as it doesn't work under low bandwidth.
        /*var cachedTime = this._currentTime,
            cachedTime2 = false,
            checkInterval,
            self = this;

        checkInterval = setInterval(function() {
            if (self._currentTime !== cachedTime && cachedTime2) {
                log.write("******** loaded ***");
                log.write("new time is: " + self._currentTime);
                self._isLoaded = true;
                clearInterval(checkInterval);
            } else if (self._currentTime !== cachedTime) {
                cachedTime = self._currentTime;
                log.write("*** clearing initial cache and setting new one of: " + cachedTime);
                cachedTime2 = true;
            }
        }, 250);*/
    },
    showStreamSwitch : function() {
        var containerid = 'PlayerLoading';

        $('PlayerLoadingDescription').show();

        BrowseView.PlayerControl.spinnerid = 'PlayerSpinner';
        BrowseView.PlayerControl.playeridx = 0;

        if (BrowseView.PlayerControl.playerLoadingSpinner == null) {
            BrowseView.PlayerControl.playerLoadingSpinner = new Timer();
            BrowseView.PlayerControl.playerLoadingSpinner.Interval = 80;
            BrowseView.PlayerControl.playerLoadingSpinner.Tick = function() {

                if (!BrowseView.PlayerControl.playerLoadingSpinnerSpinning) {
                    BrowseView.PlayerControl.playerLoadingSpinner.Stop();
                    BrowseView.PlayerControl.playerLoadingSpinnerSpinning = false;
                    return;
                }

                var red = false; // [Always false as we are no longer
                // showing red spinners]
                // !BrowseView.PlayerControl.isTrailer;

                var vstart1 = -413;
                var vstart2 = -461;

                if (!red) {
                    vstart1 = -1004;
                    vstart2 = -1052;
                }
                if (document.getElementById(BrowseView.PlayerControl.spinnerid)) {

                    var ps = document.getElementById(BrowseView.PlayerControl.spinnerid);
                    BrowseView.PlayerControl.playeridx = (BrowseView.PlayerControl.playeridx + 1) % 16;

                    var hpos = BrowseView.PlayerControl.playeridx * 80 * -1;
                    var vpos = vstart1;

                    if (BrowseView.PlayerControl.playeridx > 7) {
                        hpos = (BrowseView.PlayerControl.playeridx - 8) * 80 * -1;
                        vpos = vstart2;
                    }

                    ps.style.backgroundPosition = parseInt(hpos) + 'px ' + vpos	+ 'px';

                }
            }
        }

        if (!BrowseView.PlayerControl.playerLoadingSpinnerSpinning) {
            log.write('starting spinner');
            BrowseView.PlayerControl.playerLoadingSpinnerSpinning = true;
            BrowseView.PlayerControl.playerLoadingSpinner.Start();

            // #9542 - we always want to register a buffer, no matter what
            if (!BrowseView.PlayerControl.isBuffering) {
                BrowseView.PlayerControl.isBuffering = true;
                this.registerBuffer();
            }
        }

        $(containerid).show();
    },
    setLoadingProgress: function(limit) {
        this.loadingLimit = limit;        
    },
    showLoadingProgress: function() {
        var progress = 0, 
            limit = 0;

        if (!this.loadingTimer) {
            this.loadingTimer = new Timer();
            this.loadingTimer.Interval = 100;                
            this.loadingTimer.Tick = function() {
                if (this.loadingInProgress) {
                    if (limit < this.loadingLimit) {
                        if (0 < progress && progress < limit) {
                            progress = limit;
                        }
                        limit = this.loadingLimit;
                    }                    

                    if (progress < limit && progress < 100) {
                        progress += 2;
                    }
                } 
                else {
                    progress = 0;
                    limit = 0;
                    this.loadingTimer.Stop();
                }
                
                $('PlayerLoadingProgress').style.width = progress + '%';
            }.bind(this);
        }

        if (!this.loadingInProgress) {    
            this.setLoadingProgress(20);        
            this.loadingInProgress = true;
            this.loadingTimer.Interval = 100;
            this.loadingTimer.Start();            

            $('PlayerLoadingDescription').hide();
            $('PlayerLoading').show();
            $('PlayerLoadingProgressContainer').show();
            $('PlayerSpinner').hide();
        }
    },
    showLoading : function(isBuffer) {
        var containerid = isBuffer ? 'PlayerLoadingResume' : 'PlayerLoading',
            startTime;
        $('PlayerLoadingDescription').hide();

        BrowseView.PlayerControl.spinnerid = isBuffer ? 'PlayerSpinnerResume' : 'PlayerSpinner';
        BrowseView.PlayerControl.playeridx = 0;

        // Setup the loading spinner if need
        if (BrowseView.PlayerControl.playerLoadingSpinner == null) {
            BrowseView.PlayerControl.playerLoadingSpinner = new Timer();
            BrowseView.PlayerControl.playerLoadingSpinner.Interval = 80;
            // Happens every 80
            BrowseView.PlayerControl.playerLoadingSpinner.Tick = function() {
                var red,
                    vstart1,
                    vstart2,
                    ps,
                    hpos,
                    vpos;

                if (!BrowseView.PlayerControl.playerLoadingSpinnerSpinning) {
                    BrowseView.PlayerControl.playerLoadingSpinner.Stop();
                    BrowseView.PlayerControl.playerLoadingSpinnerSpinning = false;
                    return;
                }

                red = false; // [Always false as we are no longer
                // showing red spinner]
                // !BrowseView.PlayerControl.isTrailer;

                vstart1 = -413;
                vstart2 = -461;

                if (!red) {
                    vstart1 = -1004;
                    vstart2 = -1052;
                }
                if (document.getElementById(BrowseView.PlayerControl.spinnerid)) {
                    ps = document.getElementById(BrowseView.PlayerControl.spinnerid);
                    BrowseView.PlayerControl.playeridx = (BrowseView.PlayerControl.playeridx + 1) % 16;

                    hpos = BrowseView.PlayerControl.playeridx * 80 * -1;
                    vpos = vstart1;

                    if (BrowseView.PlayerControl.playeridx > 7) {
                        hpos = (BrowseView.PlayerControl.playeridx - 8) * 80 * -1;
                        vpos = vstart2;
                    }

                    ps.style.backgroundPosition = parseInt(hpos) + 'px ' + vpos	+ 'px';
                }
            }
        }

        if (!BrowseView.PlayerControl.playerLoadingSpinnerSpinning) {
            log.write('starting spinner');
            BrowseView.PlayerControl.playerLoadingSpinnerSpinning = true;
            BrowseView.PlayerControl.playerLoadingSpinner.Start();

            // #9542 - we always want to register a buffer, no matter what
            if (!BrowseView.PlayerControl.isBuffering) {
                BrowseView.PlayerControl.isBuffering = true;
                this.registerBuffer();
            }
        }

        $(containerid).show();
        $('PlayerSpinner').show();
        $('PlayerLoadingProgressContainer').hide();
    },
    hideLoading : function() {
        if (this.loadingTimer) {            
            this.loadingInProgress = false;
        }

        if (this.playerLoadingSpinner) {
            this.playerLoadingSpinner.Stop();
            this.playerLoadingSpinnerSpinning = false;
        }
        
        $('PlayerLoading').hide();
        $('PlayerLoadingResume').hide();
    },
    show : function() {
        this.lastFocus = application.element.current;
        BrowseView.PlayerControl._currentTime = 0;
        // Reset whether we've swapped or not
        this._swappedToSD = false;
        this._isLoaded = false;
        this._readyForTrick = false;
        
        application.events.subscribe(this, "back", this.handleBack.bind(this));
        application.events.subscribe(this, "goback", this.handleBack.bind(this));
        application.events.subscribe(this, "select", this.handleSelect.bind(this));
        application.events.subscribe(this, "navigate", this._onNavigate.bind(this));
        application.events.subscribe(this, "keyup", this._onKeyUp.bind(this));

        BrowseView.hideLogo();
        $('dock').hide();
        $('uicontainer').addClass("initPlayerBackground");
        $('store').set('class', '');
        $('mainstage').hide();
        $('imagepopup').hide();

        application.navigator.setFocus('transportPlayPause');

        // [Direction from Sonic do not add red buttons]
        // if(this.persist.passID && this.persist.passID != '') {
        // $('uicontainer').addClass('redbuttons');
        // }
        // else {
        // $('PlayerLogo').removeClass('redbuttons');
        // }

        $('PlayerLogo').removeClass('redbuttons');
        $('PlayerContainer').show();
        //$('PlayerObject').setStyle('visibility','visible');
        Player.SetVisibility(true);
    },
    hide : function() {
        application.events.unsubscribe(this, "back");
        application.events.unsubscribe(this, "goback");
        application.events.unsubscribe(this, "select");
        application.events.unsubscribe(this, "navigate");
        application.events.unsubscribe(this, "keyup");

        navigation.setFocus(this.lastFocus);
        $('PlayerContainer').hide();
        //$('PlayerObject').setStyle('visibility','hidden');
        Player.SetVisibility(false);
        $('uicontainer').addClass("containerBackground");
        BrowseView.showLogo();
        $('dock').show();
        $('mainstage').show();
    },
    _clearAllBufferTimeouts: function() {
        var i;
        log.write("++++++ clearing all timeouts");
        // Making sure to restart any timers
        if (BrowseView.PlayerControl.playerTimeout) {
            clearTimeout(BrowseView.PlayerControl.playerTimeout);
            BrowseView.PlayerControl.playerTimeout = false;
        }
        if (BrowseView.PlayerControl.bufferCheckTimeout) {
            clearTimeout(BrowseView.PlayerControl.bufferCheckTimeout);
            BrowseView.PlayerControl.bufferCheckTimeout = false;
        }
        // Clear all "30 minute window" timeouts
        for (i = 0; i < this._singleLongTracker.length; ++i) {
            if (this._singleLongTracker[i]) {
                clearTimeout(this._singleLongTracker[i]);
                this._singleLongTracker[i] = false;
            }
        }

        // Reset the buffers
        this._lastBuffer = 0;
        this._bufferCount = 0;

        this._lastLongBuffer = 0;
        this._longBufferCount = 0;
    },
    load: function(titleID, streamid, url, resume, hd, passid, ccData, streamswitch) {
        this._clearAllBufferTimeouts();
        this.identifier = $cn.utilities.uniqueIdentifier();
        log.write("uid is: " + this.identifier);

        log.write("================ Player.load() ===================");

        // Set call back type to player, in case during course of movie there are bw problems
        application.bandwidthCheck.callbackType = "player";
        
        var self = this,
            trailer = (passid == ''),
            audioProfileType = $cn.utilities.currentlyPlayingAudioProfile(passid);

        $('PlayerLoadingTitle').set('html','');

        if(this.playerLoadingSpinnerSpinning && this.playerLoadingSpinner) {
            this.playerLoadingSpinner.Stop();
            this.playerLoadingSpinnerSpinning = false;
        }
        
        (trailer) ? this.showLoading() : this.showLoadingProgress();

        this.persist.titleID = titleID;
        this.persist.passID = passid;
        this.persist.streamid = streamid;
        this.persist.url = url;
        this._isHd = hd;
        this.hasError = false;
        this.trickPlayCnt = this._playIndex;
        this._isLoaded = false;
        this.bandwidthError = false;
        this.resumeTime = resume;
        this._currentStatus = this.STOPPED;
        this.stutterPosition = 0;
        this.playPauseKey = 'play';

        this._trackBuffers = true;

        // Clear element cache.
        this.clearElementCache();
        
        //New additions to reset player window
        this._currentTime = 0;
        this.totalTime = 0;
        this.setProgressBar(0, -1);

        this.getCachedElement('TimeSpent').set('html','');
        this.getCachedElement('TimeRemain').set('html', '');

        //Setup the player badges if the video is not a trailer.
        log.write("this._isHd: " + this._isHd + ", audioProfileType: " + audioProfileType);
        
        this.getCachedElement('audiotype').className = '';
        this.getCachedElement('surround').removeClass("visible");

        if(!trailer) {
            if(audioProfileType != 'Stereo_Standard' && this._isHd) {
				this.getCachedElement('audiotype').className = audioProfileType;
                this.getCachedElement('surround').addClass("visible");
            }
        }

        //hd = true;
        this.isTrailer = (trailer);

        $cn.methods.getTitleListing(titleID,false,function(res) {
            self._title = res;

            var isTV = self._title.titleType.substring(3,0) == "TV_",
                isEpisode = self._title.titleType == "TV_Episode",
                line1 = self._title.name,
                line2 = '',
                loadingTitle = '',
                bwcv,
                resumeTime;
            // check to see if resume time is greater than 20 seconds so we don't get negative number.
            // logic on 476 checks Earliest resume 30 sec - rewindupon 20 seconds which gives 10 seconds.
            // without code below a resume time between 11 seconds would result in a negative resumeTime of -9.
            if(self.resumeTime > $cn.config.EarliestResumeS){
                  resumeTime = (self.resumeTime - $cn.config.RewindUponResumeS);
            } else{
                resumeTime = self.resumeTime;
            }

            if(isEpisode)
            {
                var showName = $cn.utilities.getMeta("ShowName", self._title.metaValues);
                var seasonName = $cn.utilities.getMeta("SeasonName", self._title.metaValues);
                var episodeNumber = $cn.utilities.getMeta("EpisodeNumber", self._title.metaValues);
                var episodeName = $cn.utilities.getMeta("EpisodeName", self._title.metaValues);

                if(showName)
                {
                    line1 = showName;
                }
                if(seasonName)
                {
                    line2 += seasonName + ", ";
                }
                if(episodeNumber)
                {
                    line2 += episodeNumber + ": ";
                    loadingTitle = episodeNumber + ": ";
                }
                line2 += '"' + self._title.name + '"';


            }
            loadingTitle += "\""+ self._title.name +"\" ";

            $('PlayerLoadingTitle').set('html', 'Loading ' + loadingTitle  + ((hd) ? '<div class="HDContainer"><span class="HD"></span></div> ':'') + (($('audiotype').className.length > 0) ? '<div class="AudioContainer"><span class="surround"></span></div> ': '') + '...');


            self.setTitleDisplay(line1, line2);

            // Init ClosedCaption if CC data is valid.
            self.ccData = ccData;
            //self.ccData = self.debugCCAsset;
            var ccValid = (self.ccData != undefined) && (self.ccData.length > 0);

            // Init CCRenderer and get CC settings.
            ccrender.init('TimedTexts');
            self.updateCCState(ccValid);

            log.write("Preparing to play content. url: " + url + "at position " + resumeTime);

            // We don't want to do BW checks
            if(streamswitch) {
                log.write("we are hdsd switching - set bw test passed to true");
                bwcv = true;
            } else {
                bwcv = $cn.utilities.bandwidthCheckValid(self._isHd);
                log.write("we are not hdsd switching - bw test is: " + bwcv);
            }
            
            if (!trailer && !bwcv) {
                self.setLoadingProgress(65);
                self.loadingTimer.Stop();
                self.loadingTimer.Interval = 250;
                self.loadingTimer.Start();
            }

            // If the bandwidth check is valid then play the movie/trailer. Else go back to previous page with failed bandwidth check status
            log.write("bandwidthCheckValid is: " + bwcv);
            if(bwcv) {
            	if (application.playbackSupported && (self.debug || url==null)) {
                    self._play(self.debugAsset, 0);
                } 
            	else{
                    self._play(url, (resume < $cn.config.EarliestResumeS - $cn.config.RewindUponResumeS) ? 0 : resumeTime);
            	}
            }
            else {
            	BandwidthCheck.playerBandwidthCheck(url, self._isHd, resume, resumeTime, PlaybackBandwidthTest);            	
            }
        });
    },
    handleBack : function(payload) {
        // Handle back button if the current view is the player view and
        // the exit message is not on the screen.
        if (BrowseView.currentState == "player-view"
            && $$('div.message_exit').length == 0) {
            payload.preventDefault();

            if (this.isBuffering) {
                this.isBuffering = false;
                this._clearAllBufferTimeouts();
            }
             
            this.hasError = false;
            this._stop(true);
        }
    },
    handleSelect : function(payload) {
        // Ignore the enter key on this view as it does not do anything.
        log.write("Current elem: " + application.element.current);
        if (this._isControlHidden()) {
            this.showControls();   
            payload.preventDefault();
            this._regKeyTimeout('navigate');
        }
    },
    /*
     * State Options:
     *
     * pause: video paused play: video playing rr: rewinding ff: fast forwarding
     * skiprr: skip back skipff: skip forward
     *
     * Speed Options: ff/rw 2X,4X,8X,16X -2X,-4X,-8X,-16X skipff/skiprw -5m +5m
     *
     */
    setPlayStateDisplay : function(state, speed) {
        $('PlayerContainer').erase('class');
        $('PlayerContainer').addClass(state);
        $('PlayerContainer').addClass(state + "_" + speed);

        if (speed && speed != '') {
            $('PlayerContainer').addClass('skiptext');
            this.getCachedElement('TransportRW').set('html', "<div>" + speed + "</div>");
            this.getCachedElement('TransportFF').set('html', "<div>" + speed + "</div>");
            this.getCachedElement('TransportSkipRW').set('html', "<div>" + speed + "</div>");
            this.getCachedElement('TransportSkipFF').set('html', "<div>" + speed + "</div>");
            this.getCachedElement('TrickText').set('html', speed);
        }

        if (state === 'play') {
            this.getCachedElement('VideoQuality').show();
        } else {
            this.getCachedElement('VideoQuality').hide();
        }

        this.getCachedElement('TransportCenter').show();
    },
    /*
     * setProgressBar
     */
    setProgressBar : function(curPercent, newPercent) {    
        var leftPos = 0;
        
		if (newPercent > -1) {
            //log.write("setProgressBar: " + curPercent + " " + newPercent);
           
            if (curPercent < newPercent) {
                this.getCachedElement('VideoProgress').style.width = curPercent + '%';
                this.getCachedElement('VideoProgressShade').style.width = newPercent + '%';
                leftPos = this.getCachedElement('VideoProgressShade').offsetWidth + 115;
            }
            else {     
                this.getCachedElement('VideoProgressShade').style.width = curPercent + '%';
                this.getCachedElement('VideoProgress').style.width = newPercent + '%';
                leftPos = this.getCachedElement('VideoProgress').offsetWidth + 115;
            }
		} else {
            this.getCachedElement('VideoProgress').style.width = curPercent + '%';
            this.getCachedElement('VideoProgressShade').style.width = curPercent + '%';
            leftPos = this.getCachedElement('VideoProgress').offsetWidth + 115;
        }

        this.getCachedElement('TrickRW').style.left = leftPos + 'px';
        this.getCachedElement('TrickFF').style.left = leftPos + 'px';
        this.getCachedElement('TrickSkipFF').style.left = leftPos + 'px';
        this.getCachedElement('TrickSkipRW').style.left = leftPos + 'px';
        this.getCachedElement('TrickText').style.left = (leftPos + 25) + 'px';
        this.getCachedElement('CurrentTime').style.left = (leftPos - 15) + 'px';
        this.getCachedElement('playerlocate').style.left = (leftPos - 137) + 'px';
    },
    /*
     * Options:
     *
     * bar: int 1-4
     *
     *
     * bitrates (based on bar): For HD: 1: null 2: 2.0Mbps 3: 4.0Mbps 4: 8.0Mbps
     *
     * For SD: 1:0.7Mbps 2:1.0Mpbs 3: 1.5Mbps 4: 2.0Mbps
     *
     */
    setQuality : function(bar) {
        var qualityEl = this.getCachedElement('VideoQuality');

        qualityEl.erase('class');
        qualityEl.addClass('q' + bar);
        if (this._isHd && bar > 2) {
            qualityEl.addClass('hd');
        }

        var bitrate = '';

        switch (bar) {
            case 1:
                bitrate = this._isHd ? '' : '0.7 Mbps';
                break;
            case 2:
                bitrate = this._isHd ? '2.0 Mbps' : '1.0 Mbps';
                break;
            case 3:
                bitrate = this._isHd ? '4.0 Mbps' : '1.5 Mbps';
                break;
            case 4:
                bitrate = this._isHd ? '8.0 Mbps' : '2.0 Mbps';
                break;
        }

        this.getCachedElement('BitrateText').set('html', bitrate);
    },
    /*
     * Options: ms: time in milliseconds
     */
    setTimeDisplay : function(ms) {
        this._currentTime = ms;
        this.getCachedElement('TimeSpent').set('html', $cn.utilities.convertMStoTime(ms));
        this.getCachedElement('TimeRemain').set( 'html', '-' + $cn.utilities.convertMStoTime(parseInt(parseInt(this.totalTime) - parseInt(ms))));

        var curPercent = (ms/this.totalTime * 100),
            newPercent;

        if (this._currentStatus === this.SKIPPING || this.inLocateMode) {
            newPercent = ((this.skipStartPosition + this.skipTime)/this.totalTime*100);
        } else {
            newPercent = -1;
            this.getCachedElement('CurrentTime').set('html', $cn.utilities.convertMStoTime(ms));
        }

        this.setProgressBar(curPercent, newPercent);

        // Show or hide the quality indicator if trick play and visible
        /*if (this.trickPlayCnt != this._playIndex
            && document.getElementById('PlayerTop')
            && document.getElementById('PlayerTop').style.top == "0px"
            && document.getElementById('VideoQuality').style.display == "block") {
            $('VideoQuality').hide();
        } else if (this.trickPlayCnt == this._playIndex
            && document.getElementById('PlayerTop')
            && document.getElementById('PlayerTop').style.top == "0px"
            && (document.getElementById('VideoQuality').style.display == "none" || document
            .getElementById('VideoQuality').style.display == "")) {
            $('VideoQuality').show();
        }*/
        // else If title is not in trickplay
        // sets VFD current time
        device.displayTime(ms);
    },
    /*
     * Options: title: title of the video subtitle: subtitle/summary of the
     * video
     *
     */
    setTitleDisplay : function(title, subtitle) {
        $('VideoTitle').set('html', title);
        $('VideoSummary').set('html', subtitle);
    },
    
    updateCCState: function(available){
        var stateEl = this.getCachedElement('CCState'),
            enabled = ccrender.isCCEnabled();

        ccrender.setCCAvailable(available);

        // Only update when CCState element exists
        if(stateEl) {
            stateEl.removeClass("CCOn");
            stateEl.removeClass("CCOff");
            stateEl.removeClass("CCUnavailableOn");
            stateEl.removeClass("CCUnavailableOff");

            if (available) {
                this.getCachedElement('transportSkipRW').setAttribute('left', 'CCState');
                this.getCachedElement('transportSkipFW').setAttribute('right', 'CCState');

                if (enabled) {
                    stateEl.addClass("CCOn");
                } else {
                    stateEl.addClass("CCOff");
                }
            } else {
                this.getCachedElement('transportSkipRW').setAttribute('left', 'transportSkipFW');
                this.getCachedElement('transportSkipFW').setAttribute('right', 'transportSkipRW');

                if (enabled) {
                    stateEl.addClass("CCUnavailableOn");
                } else {
                    stateEl.addClass("CCUnavailableOff");
                }
            }
        }
    },
    
    hideControls : function(caller, external) {
        log.write("caller == " + caller
            + ", BrowseView.PlayerControl._hideCtrlId: "
            + BrowseView.PlayerControl._hideCtrlId);

        if (caller == BrowseView.PlayerControl._hideCtrlId || external) {
            var animation1 = new Fx.Morph($('PlayerTop'), {
                duration : 300,
                transition : Fx.Transitions.Sine.easeOut
            });
            var animation2 = new Fx.Morph($('PlayerLocateBottom'), {
                duration : 300,
                transition : Fx.Transitions.Sine.easeOut
            });
            animation1.start({
                'top' : '-90px'
            });
            animation2.start({
                'bottom' : '-140px'
            });

            $('TransportCenter').hide();

            // Exit locate mode if user doesn't press enter key in time.
            this._exitLocateMode();
        }
    },
    showControls : function() {
        // Added to ensure that every time the controls are displayed
        // that the br indicator is updated.
        if (BrowseView.PlayerControl._currentStatus == BrowseView.PlayerControl.PLAYING) {
            BrowseView.PlayerControl._StreamBitRates();
            // $('VideoQuality').show();
        } else {
            // $('VideoQuality').hide();
        }

        var animation1 = new Fx.Morph($('PlayerTop'), {
            duration : 300,
            transition : Fx.Transitions.Sine.easeOut
        });
        var animation2 = new Fx.Morph($('PlayerLocateBottom'), {
            duration : 300,
            transition : Fx.Transitions.Sine.easeOut
        });
        animation1.start({
            'top' : '0px'
        });
        animation2.start({
            'bottom' : '0px'
        });
    },
    registerBuffer : function() {
        var time,
            lastBuffer,
            self = this,
            seconds,
            now,
            currentId = this.identifier,
            checkBackTime;

        log.write("+++ doRegisterBuffers: " + this.doRegisterBuffers);
        log.write("+++ currentStatus: " + this._currentStatus);

        log.write("********* playerTimeout is: " + this.playerTimeout);
        if(!this.playerTimeout) {

            log.write("+++ creating a new playerTimeout");
            this.playerTimeout = setTimeout(function(){

                log.write('Buffering Timeout called back. Current Player Identity: ' + self.identifier + ", this timer created by: " + currentId + ". Now check if anything should be done.");

                if(!self._isLoaded && self.identifier === currentId){
                    log.write("Something should be done. Buffering Timeout: Player is not loaded show error. Assuming we are unplugged.");
                    self._onError('OnNetworkDisconnected');
                }

            }, application.appSetting("PlayerBufferTimeout"));

        }
        // Fail safe to make sure that buffering does not keep going for way too long - assume disconnected if it does
        log.write("+++ Creating this.playerTimeout: " + this.playerTimeout + " with identity " + this.identifier);

        // Only register buffers if we are playing, and we are supposed to
        if (! this.doRegisterBuffers || ! this._trackBuffers || this._currentStatus != this.PLAYING) {
            log.write("doRegisterBuffers is: " + this.doRegisterBuffers);
            log.write("_trackBuffers is: " + this._trackBuffers);
            log.write("_currentStatus is " + this._currentStatus);
            log.write("--- bail from registerBuffer ---");
            return;
        }

        // If buffer is triggered and movie is playing. And movie is HD
        // update buffercount variable


        /*
         } else {
         // This is the SD branch

         // #9542
         // Store current buffer locally
         lastBuffer = this._lastBuffer;
         BrowseView.PlayerControl.bufferCheckTimeout = setTimeout(function() {
         log.write("outside");
         // Identity check fails so not included
         if (BrowseView.PlayerControl.isBuffering === true && lastBuffer === self._lastBuffer && BrowseView.currentState === 'player-view') {

         log.write("SD spinner showing for too long - el stopo ===============");
         BrowseView.PlayerControl._onError('connectiontooslow_error');
         }
         }, application.appSetting("SDMaxBufferSeconds") * 1000);


         }
         */
        this._bufferCount++;
        this._longBufferCount++;

        // This individual single long rebuffering should be deleted after 30 minutes
        this._singleLongTracker[this._singleLongTracker.length] = setTimeout(function () {
            log.write("+++++++++++++++++++++ reduce called");
            // This if check is here to handle if this returns the same second the longBufferCount was cleared to 1 - though this should not happen

            self._longBufferCount = self._longBufferCount - 1;
            log.write("+++++++++++++++++++++ reduce long buffer count by one to: " + self._longBufferCount);

        }, application.appSetting("LongWindowMinutes") * 60 * 1000); // Minutes * 60seconds/minute * 1000ms/seconds

        // Bit rate is no longer needed. We are using buffer counts to switch to SD.
        // currentBitrates = Player.GetCurrentBitrates();
        // val = parseInt(currentBitrates) / (1000 * 1024);
        // log.write("> current bit rate is " + currentBitrates);

        // We should not use number of seconds into the movie as buffer counting criterion, since it doesn't work with resume play
        // There was already a doRegisterBuffers check upstream
        // seconds = Math.floor(parseInt(this._currentTime) / 1000);

        // If time of last buffer hasn't been set then set it.
        // Last buffer is the number of seconds we were into the movie when it started buffering previously

        // HD and SD buffer counts / check are identical
        //   the results are differnt: HD switches to SD, SD shows connection too slow
        if (this._lastBuffer === 0 || this._lastLongBuffer === 0) {
            this._lastBuffer = new Date();
            this._lastLongBuffer = new Date();
        } else {

            now = new Date();

            // Logic for updating and tracking small window rebuffering events
            time = $cn.utilities.DateDiff(now, this._lastBuffer);
            seconds = this.msToSeconds(time);
            if (seconds > application.appSetting("HDChokeTimeSpan")) {
                this._bufferCount = 1;
            }
            this._lastBuffer = now;

            // Logic for updating and tracking large window rebuffering events
            time = $cn.utilities.DateDiff(now, this._lastLongBuffer);
            seconds = this.msToSeconds(time);

            this._lastLongBuffer = now;

            // If this is the xth or more buffering in x mins then swap title
            if (this._bufferCount >= application.appSetting("HDChokeLimit") || this._longBufferCount >= application.appSetting("HDLongChokeLimit")) {
                if (self._isHd) {
                    // If this is an HD title, notify user, and ask them if they want to switch
                    BrowseView.PlayerControl._onError('askabouthdswap_error');
                } else {
                    log.write("+++++++++++++++++++++ Too many SD buffers shown. Connetion too slow.");
                    BrowseView.PlayerControl._onError('connectiontooslow_error_player');
                    // stop tracking buffers for UX
                    //self._trackBuffers = false;
                }
            }
        }

        log.write("+++++++++++++++++++++ short buffer count: " + this._bufferCount);
        log.write("+++++++++++++++++++++ long buffer count: "  + this._longBufferCount);
        log.write("+++++++++++++++++++++ time: " + (new Date()));

        // Check back on buffer in x seconds. If it is still showing, then switch to SD
        // #9542
        // Store current buffer locally
		/*
        lastBuffer = this._lastBuffer;
        checkBackTime = this._isHd ? $cn.config.HDMaxBufferSeconds : $cn.config.SDMaxBufferSeconds;
        log.write("Checking back on this buffer in " + checkBackTime + " seconds.");
        BrowseView.PlayerControl.bufferCheckTimeout = setTimeout(function() {

            // Identity check fails, so not included
            if (BrowseView.PlayerControl.isBuffering === true && lastBuffer === self._lastBuffer && BrowseView.currentState === 'player-view') {

                log.write("+++++++++++++++++++++ spinner showing for too long ===============");
                if (self._isHd) {
					self.stopPlayer();
                    self._handleHdSwap();
                } else {
                    BrowseView.PlayerControl._onError('connectiontooslow_error');
                    self._trackBuffers = false;
                }
            }
		}, checkBackTime * 1000); */ 

    },
    _handleHdSwap : function() {
        // The swap should only be done once.
        if (this._swappedToSD) {
            return;
        }

        this._swappedToSD = true;
        this._isHd = false;
        this._clearAllBufferTimeouts();
       
        // Stop player.
        this.stopPlayer();
        this._currentStatus = this.STOPPED;

        // Wait for player to stop, load SD title in stopped event callback.
    },
    _OnTimeChanged : function(time) {
        if (time > 2000 && !this.isBuffering) {
            this._readyForTrick = true;
        }
        this.setTimeDisplay(time);
    },
    /*
     *
     * PRIVATE PLAYER METHODS
     *
     *
     */
    _play : function(url, resumePosition) {
        log.write("+++ PLAY +++");
        var MAXURI_LENGTH = 2000;
        var nRtn = 0;
        var urlLength = 0;

        //this.setRegisterBufferTimeout();

        /*
        if (!Player)
            Player = $("PlayerObject");
        */

        if (Player) {
            if (url) {
                urlLength = url.length;
            }

            if (urlLength && urlLength > MAXURI_LENGTH) {
                // Go to error screen URL is too long
                log.write("PlayerControl._play, url is too long!");
            } else if (urlLength > 0 && urlLength <= MAXURI_LENGTH) {
                this.setLoadingProgress(90);

                this._currentStatus = this.PLAYING;           
            	device.play(this, url, resumePosition, this.ccData);
                this.setPlayStateDisplay('play');
           	}
        }
    },

    _pause : function() {
        if (this.isBuffering || !this._isLoaded || this._currentStatus == this.SKIPPING) {
            log.write("===== Can't Pause on Buffering, unloaded or skipping ===== ");
            return;
        }

        this._exitLocateMode('transportPlayPause');

        if (this._currentStatus != this.PAUSED) {
            log.write("===== Start movie pausing ===== ");

            /* History Values */
            var hist_trickPlayCnt = this.trickPlayCnt;
            var hist_currentStatus = this._currentStatus;

            this._currentStatus = this.PAUSED;
            this.playPauseKey = 'pause';
            Player.Pause();

            if (this.trickPlayCnt != this._playIndex) {
                this.trickPlayCnt = this._playIndex;
                /*if (Player.SetPlaybackSpeed(this._trickPlayArr[this.trickPlayCnt]) == 1) {
                    this._handleTrickplay(this._trickPlayArr[this.trickPlayCnt]);
                } else {
                    log.write("Player.SetPlaybackSpeed FAILED. Reset values and ignore the request.");
                    this.trickPlayCnt = hist_trickPlayCnt;
                    this._currentStatus = hist_currentStatus;
                    return;
                }*/
            }

            this.showControls();
            this.setPlayStateDisplay('pause');

            device.setOnScreenSaver();
            this._registerHideControls("pause");
            log.write("Screen Saver Turned on while playback is stopped.");

            // sets VFD to PAUSE
            device.displayPause();
        } else {
        	// When Pause-Off is enabled, press pause key again goes to resume.
        	if (configuration.readValue('PauseResumeEnable') == true) {
        		this._resume();
        	} else {
        		log.write("===== Can't Pause, movie is already paused ===== ");
        	}
        }
    },
    _resume : function() {
        // _resume is called after trick play, etc.        
        if (this.isBuffering || !this._isLoaded) {
            log.write("===== Can't Resume on Buffering or unloaded ===== ");
            return;
        }

        this._exitLocateMode('transportPlayPause');

        // Skip chapter if play is pressed.
        if (this._currentStatus == this.SKIPPING) {
            if (this.skipWatchTimer) {
                clearTimeout(this.skipWatchTimer);
                this.skipWatchTimer = null;
            }

            log.write('_resume: skip chapter, skipTime(' + this.skipTime/1000 + '), new position(' + (this.skipStartPosition + this.skipTime)/1000 + ')');
            Player.LocateToPosition(parseInt((this.skipStartPosition + this.skipTime)/1000));

            // Show loading.
            this.isBuffering = true;
            this.showLoading(true);
            return;
        }
		
		if (this.hasError && this._currentStatus == this.PAUSED) {
            // Clear rebuffering counters in transition.
            this.hasError = false;
            this._clearAllBufferTimeouts();
		}

        log.write("_resume() called and we are not buffering");

        if (this._currentStatus != this.PLAYING) {
            //this.setRegisterBufferTimeout();

            log.write("+++=== Movie resuming ===+++");
            /* History Values */
            var hist_trickPlayCnt = this.trickPlayCnt;
            var hist_currentStatus = this._currentStatus;

            device.setOffScreenSaver();
            log.write("Screen Saver Turned off during playback.");

            if (hist_currentStatus == this.PAUSED) {
                var resp = Player.Resume();
                log.write("Resume Response:" + resp);
                if (resp != 1) {
                    log.write("Player.Resume FAILED. Reset values and ignore the request.");
                    this.trickPlayCnt = hist_trickPlayCnt;
                    this._currentStatus = hist_currentStatus;
                    return;
                }
            }
            
            if (this.trickPlayCnt != this._playIndex) {
                log.write("Reset Playback speed.");
                this.trickPlayCnt = this._playIndex;
                if (Player.SetPlaybackSpeed(this._trickPlayArr[this.trickPlayCnt]) == 1) {
                    this._handleTrickplay(this._trickPlayArr[this.trickPlayCnt]);
                } else {
                    log.write("Player.SetPlaybackSpeed FAILED. Reset values and ignore the request.");
                    this.trickPlayCnt = hist_trickPlayCnt;
                    this._currentStatus = hist_currentStatus;
                    return;
                }
            }

            this.setPlayStateDisplay('play');
            this._currentStatus = this.PLAYING;
            this._regKeyTimeout('resume');
            this.playPauseKey = 'play';

            // sets VFD to PLAY
            device.displayPlay();
        } else {
            log.write("===== Can't Resume movie already playing ===== ");
            this.showControls();
			this.setPlayStateDisplay('play');
            this._regKeyTimeout('resume');
        }
    },
    _playpause: function() {
        if (this._currentStatus == this.PLAYING || (this._currentStatus == this.TRICKPLAY && this.playPauseKey == 'pause')) {
            this._pause();
        }
        else if (this._currentStatus == this.PAUSED || (this._currentStatus == this.TRICKPLAY && this.playPauseKey == 'play')) {
            this._resume();
        }
    },    
    stopPlayer: function() {
        // Player stop calls should be non blocking, since `Player.Stop()` takes several minutes to complete if there is
        // no internet connection.
        setTimeout(function() {
            Player.Stop();
        }, 0);
    },
    _stop : function(eof) {
        log.write('Attempting to stop.');
        var self = this;

        if (this.isBuffering) {
            log.write("===== Can't Stop on Buffering ===== ");
            return;
        }

        // Do this every time just in case.
        this.stopPlayer();

        this._exitLocateMode('transportStop');

        // If movie is not stopped then stop it
        if (this._currentStatus != this.STOPPED) {
            this._currentStatus = this.STOPPED; 
            // prevent double calls
            // when savestatus is in
            // process

            /*
             * If the end of the stream is not reached then save the stopped
             * status and insure that the response from the server is received
             * and then clean everything up.
             */
            this._saveStatus("stopped", function(){
                log.write("Manage Stream Instance - Stop response received.");

                self.isBuffering = false;
                self.trickPlayCnt = self._playIndex;

                //[SONIC] CNSWE20-1133
                //self._handleTrickplay(self._trickPlayArr[self.trickPlayCnt]);

                log.write('Current stopping status: ' + self._currentTime);

                device.setOnScreenSaver();
                log.write("Screen Saver Turned on while playback is stopped.");

                // Check if this is a 3D SKU
                // This code is commented out to match the already commented out
                // code in application.js which was used to enable the 3D support.
                // In the current code 3D is neven on, and the comments from application.js
                // say that is hacked code to support CES and when real 3D Content arrives
                // the 3D Plugin code should be revisited. All 3D code is commented out
                // until that time. Seach for plugin3D to see use in application.js.
                /*
                if(self.plugin3D != null) {
                    log.write("Turn off 3D Support");

                    var nRtn_3D = 0;

                    log.write("plugin3D.Flag3DEffectSupport(): " + self.plugin3D.Flag3DEffectSupport());
                    if(self.plugin3D.Flag3DEffectSupport() == 1) {
                        log.write("plugin3D.Get3DEffectMode(): " + self.plugin3D.Get3DEffectMode());

                        if(self.plugin3D.Check3DEffectMode(0) == 1) {
                            nRtn_3D = self.plugin3D.Set3DEffectMode(0);
                            log.write("plugin3D.Set2DEffectMode(2): " + nRtn_3D);
                        }

                        log.write("plugin3D.Get3DEffectMode(): " + self.plugin3D.Get3DEffectMode());
                    }
                }
                */

                // sets VFD to STOP
                device.displayStop();
                
                self._handleReturnKey(eof);
            });
        }
        else {
            this._handleReturnKey(eof);
        }
    },
    _fastForward : function() {
        if (this.isBuffering || this._currentStatus == this.SKIPPING) {
            log.write("===== Can't TrickPlay on Buffering or skipping ===== ");
            return;
        } else {
            this._exitLocateMode('transportFW');

            if (this._readyForTrick) { // && this.trickPlayCnt != 10
                /* History Values */
                var hist_trickPlayCnt = this.trickPlayCnt;
                var hist_currentStatus = this._currentStatus;

                if (this._currentStatus == this.PAUSED) {
                    Player.Resume();
                    this.trickPlayCnt = this._playIndex + 1;
                } else {
                    // always set to fastforward if original status is
                    // rewind
                    if (this.trickPlayCnt < this._playIndex)
                        this.trickPlayCnt = this._playIndex;

                    this.trickPlayCnt++;
                    if (this.trickPlayCnt >= this._trickPlayArr.length) {
                        // this.trickPlayCnt = this._trickPlayArr.length
                        // -1;
                        // return;
                        //
                        this.trickPlayCnt = this._playIndex + 1;
                    }
                }

                this._readyForTrick = false;
                log.write("_trickPlayArr["+this.trickPlayCnt+"] :: "+this._trickPlayArr[this.trickPlayCnt]);
                var setspeed = Player.SetPlaybackSpeed(this._trickPlayArr[this.trickPlayCnt]);
                log.write("setspeed:" + setspeed);
                if(setspeed == 1) {
                    log.write('Handle Trickplay UI');
                    this._handleTrickplay(this._trickPlayArr[this.trickPlayCnt]);

                    if(this._trickPlayArr[this.trickPlayCnt] == 1) {
                        this._currentStatus = this.PLAYING;
                        this._regKeyTimeout('tp');
                    }
                    else {
                        this.setToTrickPlay();
                    }
                }
                else {
                    log.write("Player.SetPlaybackSpeed FAILED. Reset values and ignore the request.");
                    this.trickPlayCnt = hist_trickPlayCnt;
                    this._currentStatus = hist_currentStatus;

                    if(this._currentStatus == this.PAUSED) {
                        var resp = Player.Pause();
                    }
                }
            }
        }
    },
    setToTrickPlay : function() {
        this._currentStatus = this.TRICKPLAY;
    },
    _rewind : function() {
        if (this.isBuffering || this._currentStatus == this.SKIPPING) {
            log.write("===== Can't TrickPlay on Buffering or skipping ===== ");
            return;
        }

        this._exitLocateMode('transportRW');

        if (this._readyForTrick) { // && this.trickPlayCnt > 0
            /* History Values */
            var hist_trickPlayCnt = this.trickPlayCnt;
            var hist_currentStatus = this._currentStatus;

            if (this._currentStatus == this.PAUSED) {
                Player.Resume();
                this.trickPlayCnt = this._playIndex - 1;
            } else {
                // always set to rewind if original status is
                // fastforward
                if (this.trickPlayCnt > this._playIndex)
                    this.trickPlayCnt = this._playIndex;

                this.trickPlayCnt--;
                if (this.trickPlayCnt < 0) {
                    this.trickPlayCnt = this._playIndex - 1;
                }
            }

            this._readyForTrick = false;
            var setspeed = Player
                .SetPlaybackSpeed(this._trickPlayArr[this.trickPlayCnt]);
            log.write("setspeed:" + setspeed);
            log.write("setspeed:" + setspeed);
            if(setspeed == 1) {
                log.write("_trickPlayArr["+this.trickPlayCnt+"] :: "+this._trickPlayArr[this.trickPlayCnt]);
                this._handleTrickplay(this._trickPlayArr[this.trickPlayCnt]);

                if(this._trickPlayArr[this.trickPlayCnt] == 1) {
                    this._currentStatus = this.PLAYING;
                    this._regKeyTimeout('tp');
                }
                else {
                    this.setToTrickPlay();
                }
            }
            else {
                log.write("Player.SetPlaybackSpeed FAILED. Reset values and ignore the request.");
                this.trickPlayCnt = hist_trickPlayCnt;
                this._currentStatus = hist_currentStatus;

                if(this._currentStatus == this.PAUSED) {
                    var resp = Player.Pause();
                }
            }
        }
    },
    _skipff : function() {
        this._skipChapter(true);
    },
    _skiprw : function() {
        this._skipChapter(false);
    },
    _skipChapter : function(forward) {
        if (this.isBuffering || !this._isLoaded) {
            log.write("===== Can't TrickPlay on Buffering or unloaded ===== ");
            return;
        }

        this._exitLocateMode(forward ? 'transportSkipFW' : 'transportSkipRW');       
        
        var SKIP_TIME_UNIT = 300000, // skip unit is 5 mins.            
            skipOffset = 0,
            valid = false;      

        if (this._currentStatus != this.SKIPPING) {
            // First skip.
            skipOffset = (forward) ? SKIP_TIME_UNIT : 0 - SKIP_TIME_UNIT;
            if (this._isPositionInBound(this._currentTime + skipOffset)) {
                this.skipTime = skipOffset;
                this.skipStartPosition = this._currentTime;
                valid = true;
                log.write('_skipChapter: set first skip time: ' + this.skipTime/1000);
            }
        }
        else {
            // Cumulative skip.
            skipOffset = (forward) ? this.skipTime + SKIP_TIME_UNIT : this.skipTime - SKIP_TIME_UNIT;
            if (!skipOffset) {
                // If skip offset is 0, span current time.
                skipOffset = (forward) ? SKIP_TIME_UNIT : 0 - SKIP_TIME_UNIT;
            }

            if (this._isPositionInBound(this.skipStartPosition + skipOffset)) {
                this.skipTime = skipOffset;  
                valid = true;
                log.write('_skipChapter: set cumulative skip time: ' + this.skipTime/1000);
            }
        }

        if (valid) {
            if (this._currentStatus != this.SKIPPING) {
                // Enter skip mode.
                this._currentStatus = this.SKIPPING; 
                this._registerHideControls("skip");
                this.showControls();
                
                // Reset scan speed.
                if (this.trickPlayCnt != this._playIndex) {
                    this.trickPlayCnt = this._playIndex;
                }
            }

            // Update transition state.
            if (this.skipTime > 0) {
                this.setPlayStateDisplay('skipff', '+' + this.skipTime/60000 + 'm');
            }
            else if (this.skipTime < 0){                    
                this.setPlayStateDisplay('skiprw', this.skipTime/60000 + 'm');
            }
			
            this.setProgressBar((this._currentTime/this.totalTime*100), ((this.skipStartPosition + this.skipTime)/this.totalTime*100));
                
            // Refresh timer.
            if (this.skipWatchTimer) {
                clearTimeout(this.skipWatchTimer);
            }

            this.skipWatchTimer = setTimeout(function() {
                this.skipWatchTimer = null;

                //Timeout and skip actually.
				if (this._currentStatus == this.SKIPPING) {
                    log.write('_skipChapter: skip chapter, skipTime(' + this.skipTime/1000 + '), new position(' + (this.skipStartPosition + this.skipTime)/1000 + ')');
                    Player.LocateToPosition(parseInt((this.skipStartPosition + this.skipTime)/1000));

                    // Show loading.
                    this.isBuffering = true;
                    this.showLoading(true);
				}
            }.bind(this), 1500);
        }
    },
    /*
     *
     * END PRIVATE PLAYER METHODS
     *
     *
     */

    _handleTrickplay : function(speed) {
        this.showControls();
        if (speed > 1) {
            // Setup fast forward controls
            this.setPlayStateDisplay('ff', speed + 'X');
        } else {
            if (speed < 0) {
                // Setup rewind controls
                this.setPlayStateDisplay('rw', Math.abs(speed) + 'X');
            } else {
                this.setPlayStateDisplay('play');
            }
        }
    },
    _StreamBitRates : function() {
   		this._handleBitrateIndicatorNew(Player.GetQualityInfo());
    },
    
    _handleBitrateIndicatorNew : function (qualityInfo) {
    	var totalBars = qualityInfo.PlaybackQualityLevels == 4 ? this._totalbarSD : this._totalbarHD; 
    	var barNumber = Math.floor(1 + (totalBars / qualityInfo.PlaybackQualityLevels ) * (qualityInfo.PlaybackQualityLevel - 1));
        log.write("_handleBitrateIndicatorNew: barNumber" + barNumber);
    	
        this.getCachedElement('VideoQuality').erase('class');
        
        //Set Indicator information
        if (qualityInfo.PlaybackQualityLevels == 4) {
        	this.getCachedElement('VideoQuality').addClass('qs' + barNumber);
        } else {
        	this.getCachedElement('VideoQuality').addClass('qh' + barNumber);
        }

        if (this._isHd) {
            this.getCachedElement('VideoQuality').addClass('hd');
        }

        //Set bitrate Information
        var bitrate = this._genMbpsStr(qualityInfo.PlaybackQualityRate);
        this.getCachedElement('BitrateText').set('html', bitrate);
    },
    
    //Generate Mbps information
    _genMbpsStr : function(bps) {
		var ret = (new Number(bps / 1000000)).toFixed(1);
		log.write("_genMbpsStr: Origin" + bps + ". after genMbps: " + ret);
		return (ret + ' Mbps');
    },

    _handleBitrateIndicator : function(bps) {
        var val = parseInt(bps) / (1000 * 1024);
        var idx = 4;
        var idxHD = '';

        if (this._currentStatus == this.PLAYING) {
            if (!this._isHd) {
                if (val <= .8) {
                    idx = 1;
                } else if (val < 1.1) {
                    idx = 2;
                } else if (val <= 1.6) {
                    idx = 3;
                } else if (val <= 2.1) {
                    idx = 4;
                    /*
                     * TODO: Popup speed test //If this is a high def file being
                     * played in SD then do a BW check every minute to see if
                     * the user exceeds the 4mbs check then play the HD file
                     * if(this.persist.passId &&
                     * $cn.data.PassCache[this.persist.passId] ==
                     * "HIGH_DEFINITION") { this.checkBandwidth(); }
                     */
                } else {
                    idx = 4;
                    /*
                     * TODO: Popup speed test //If this is a high def file being
                     * played in SD then do a BW check every minute to see if
                     * the user exceeds the 4mbs check then play the HD file
                     * if(this.persist.passId &&
                     * $cn.data.PassCache[this.persist.passId] ==
                     * "HIGH_DEFINITION") { this.checkBandwidth(); }
                     */
                }
            } else {

                if (val < 4) {
                    // TODO: this._handleHdWarning();
                    idx = 2;
                } else if (val < 4.2) {
                    idx = 2;

                    // This case is only here because we wait until the
                    // current bitrate is above 4.2 to show the message
                    // to the screen
                    if (val >= 4) {
                        idx = 3;
                    }
                } else if (val >= 4.2) {
                    idxHD = "_hd";

                    /*
                     * TODO: //Check to see if this is was previously being
                     * played in SD. If so, show the messaging to the screen for
                     * the swap up. if(this._currentFileType == "STANDARD") {
                     * this._handleHdNotification(); }
                     */

                    if (val < 8) {
                        idx = 3;
                    } else {
                        idx = 4;
                    }
                }
            }

            /*
             * TODO:
             *
             * if($cn.data.PassCache[this.persist.passId] == "HIGH_DEFINITION") {
             * this._qualityCheck = setTimeout("PlayerView._StreamBitRates()",
             * 10000); }
             *
             */
            this.setQuality(idx);

            log.write("Quality: " + bps + "(bps), Quality key: " + val
                + ", Quality IDX: " + idx);

        }
    },
    _saveStatus : function(type, cb) {
        var self = this,
            seconds,
            totalSeconds,
			timer;

        if (!this.isTrailer) {
            seconds = Math.floor(parseInt(this._currentTime, 10) / 1000);
            totalSeconds = Math.floor(parseInt(this.totalTime, 10) / 1000);
            log.write("--- status seconds: " + seconds);
            // Only save the status if the movie more than 30 seconds into it.
            if (seconds > 30 || this.resumeTime !=null) {
                log.write("Saving Stream Status: " + type + ", " + this._currentTime);
				if(seconds < $cn.config.EarliestResumeS || seconds > (totalSeconds -30)) {
					seconds = 999001; //Reset value make sure that it clears out if anything is less than we want
				}

                try {
					timer = $cn.utilities.showLoadingModal(0);
                    $cn.methods.sendStopMessageForStream(self.persist.streamid, seconds, function(api) {
						$cn.utilities.clearLoadingSpinner(timer);
						
						// no action is required
                        log.write("Play Status Saved");
                        if (cb && typeof cb == "function") {
                            cb.call(this);
                        }
					});
                } catch (e) {
                    // Ignore Errors from managing stream instances as
                    // they are not crucial to video playback					
                    cb.call(this);
                }
            } else {
                cb.call(this);
            }
        } else {
            cb.call(this);
        }
    },
    _handleReturnKey : function(eof) {
        var payload,
            self = this;

        // Movie is playing return to title details page
        this.hideLoading();

        if (!this.hasError) {
            log.write("this.persist.passID: " + this.persist.passID);
            payload = {
                passID : this.persist.passID,
                stopPositionMins : (!this.hasError) ? Math
                    .floor((parseInt(this._currentTime) / 1000) / 60) : 0,
                stopPositionPercent : (!this.hasError) ? parseInt(parseFloat(this._currentTime
                    / this.totalTime) * 100)
                    : 0,
                bandwidthError : this.bandwidthError
            };

            if(eof && self._title.titleType == "TV_Episode"){
                    //we are watching an episode
                    log.write('$$$$$$$ NEXT EPISODE EXISTS $$$$$$$');
                    payload.setFocus = 'tdbuttonNextEpisode';
            } else{
                if (BrowseView.showingOtherModal) {
                    payload.leaveFocusAlone = true;
                    BrowseView.showingOtherModal = false;
                } else {
                    application.navigator.setFocus(this.lastFocus);
                }
            }
            BrowseView.TitleViewControl.update(payload);
            device.setOnScreenSaver();
            log.write("Screen Saver Turned on while playback is stopped.");
            log.write('hiding player');
            log.write("LastFocus: " + this.lastFocus);
            BrowseView.currentState = (this.persist.passID) ? "library-view" : "titleview";

            // Add delay hiding the player as the background view needs
            // to update.
            $('TransportCenter').hide(); // Hide any transport icons

            // Manually clean up events and set back focus
            application.events.unsubscribe(this, "back");
            application.events.unsubscribe(this, "goback");
            application.events.unsubscribe(this, "select")
            application.events.unsubscribe(this, "navigate");
            application.events.unsubscribe(this, "keyup");

            if (!this.persist.passID || this.persist.passID == '') {
                log.write('SHOULD NOT FIRE');
                navigation.setFocus(this.lastFocus);
            }

            // Block key presses while back page is loading
            application.TempKeyBlock = true;
            application.TempKeyBlockDuration = 2000;

            setTimeout(function(){
                log.write('TIMEOUT RAN!');
                $('store').set('class',"titleview");
                $('PlayerContainer').hide();
                Player.SetVisibility(false);
                $('uicontainer').removeClass("initPlayerBackground");
                BrowseView.showLogo();
                $('dock').show();
                $('mainstage').show();
            }.bind(this),2000);
        } else {
            log.write("handle return key error");
        }
    },
    getDisplayRatio : function() {
        var dRatio = 0,
            nHeight = Player.GetVideoHeight(),
            nWidth = Player.GetVideoWidth();

        if (nHeight == 0) {
            dRatio = 0;
        } else {
            dRatio = Math.floor(nWidth / nHeight * 100) / 100;
        }
        log.write("====== Video Size ========" + nWidth + " X " + nHeight);
        log.write("====== Video Ratio ========" + dRatio);

        g_dRatio = dRatio;
        return dRatio;
    },
    setVideoposAuto : function() {
        log.write("setVideoposAuto()");
        // setVideoPosInfo(0, 0, 960, 540); below variables take care of
        // the video placement
        var g_nX = 0,
            g_nY = 0,
            g_nW = 960,
            g_nH = 540;

        var playerWidth = (Player.GetVideoWidth() == 720) ? 640 : Player
            .GetVideoWidth();
        var playerHeight = Player.GetVideoHeight();

        var WIDE_RATIO = 1.78; // 16:9
        var NORMAL_RATIO = 1.33; // 4:3
        var dRatio = this.getDisplayRatio();

        log.write("g_dRatio = " + dRatio);
        // if ( dRatio == 2.64 || dRatio == 2 || dRatio == 2.7 || dRatio
        // == 2.35) {
        if(dRatio > NORMAL_RATIO) {
            var nNewHeight = Math.floor( (g_nW * playerHeight) / playerWidth );
            var nNewY = Math.floor((g_nH - nNewHeight) / 2);

            log.write( "x = " +  g_nX  + " y = " + nNewY + " width = " + g_nW + " height = " + nNewHeight);

            if(nNewY < 0){
                nNewY = 0;
            }
            if(nNewHeight > 540){
                nNewHeight = 540;
            }

            /*
            Player.style.left = 0+'px';
            Player.style.top = 0+'px';
            Player.style.width = 960+'px';
            Player.style.height = 540+'px';
            */
            Player.SetDisplayArea(g_nX, nNewY, g_nW, nNewHeight);
        }
        else {
            //TRACE( "g_dRatio Full= " + dRatio);
            // Player.SetDisplayArea(g_nX, g_nY, g_nW, g_nH);

            var nNewWidth = Math.floor( (g_nY * playerWidth) / playerHeight );
            var nNewX = Math.floor((g_nX - nNewWidth) / 2);

            log.write( "x = " +  nNewX  + " y = " + g_nY + " width = " + nNewWidth + " height = " + g_nY);

            //isNaN means that getvideowidth and height failed. Play in full screen THIS WILL STRETCH IN MOST CASES.
            if(!isNaN(nNewX)) {
                /*
                Player.style.left = 0+'px';
                Player.style.top = 0+'px';
                Player.style.width = 960+'px';
                Player.style.height = 540+'px'; 
                */ 
                Player.SetDisplayArea(nNewX, g_nY, nNewWidth, g_nY);
            } else {
                /*
                Player.style.left = 0+'px';
                Player.style.top = 0+'px';
                Player.style.width = 960+'px';
                Player.style.height = 540+'px';
                */
                Player.SetDisplayArea(0, 0, 960, 540);
            }
        }


    },
    _regKeyTimeout : function(key) {
        if (this._currentStatus === this.PLAYING) {
            setTimeout('BrowseView.PlayerControl.hideControls("'
                + BrowseView.PlayerControl._registerHideControls(key) + '")',
                3000);
        }
    },
    _registerHideControls : function(id) {
        if (id == BrowseView.PlayerControl._hideCtrlId) {
            BrowseView.PlayerControl.hideControls();
        } else {
            var rnd = Math.floor(Math.random() * new Date().getMilliseconds());
            BrowseView.PlayerControl._hideCtrlId = id + rnd;
        }
        return BrowseView.PlayerControl._hideCtrlId;
    },
    _OnStreamInfoReady : function() {
        if (BrowseView.currentState == "player-view") {
            log.write('Player.OnStreamInfoReady');

            var totaltime = Player.GetDuration();
            var width = Player.GetVideoWidth();
            var height = Player.GetVideoHeight();
            //alert('totalTime: ' + totaltime + ' starting position: ' + this._startPos + ', width: ' + width + ', height: ' + height);

            // Check for EOF at start If movie is 5 seconds from the end
            // and you
            if (Math.floor(totaltime / 1000) == this._startPos) {
                log.write("EOF Detected at start this will not play a movie. Starting from beginning.");
                this._play(this.persist.url, 0);
            }

            var nTotTime = parseInt(totaltime, 10);
            var nTotSec = Math.floor(nTotTime / 1000);
            log.write('nTotTime: ' + nTotTime);
            log.write('nTotSec: ' + nTotSec);

            this.totalTime = totaltime;
            // $('controlfocus').focus();

            this.setVideoposAuto();

            this._StreamBitRates();
            
            if (!this.isTrailer && !this._isLoaded) {
                this.setLoadingProgress(100);
                this.loadingTimer.Stop();
                this.loadingTimer.Interval = 100;
                this.loadingTimer.Start();
            }

            this._qualityCheck = setTimeout("BrowseView.PlayerControl._StreamBitRates()", 10000);
        } else {
            this.stopPlayer();
            BrowseView.PlayerControl.hide();
        }
    },
    setRegisterBufferTimeout: function() {
        /*var self = this;

        this.doRegisterBuffers = false;
        log.write("--------------- we are NOT registering buffers ------------------------");

        if (this.registerTimeout) {
            clearTimeout(this.registerTimeout);
        }

        this.registerTimeout = setTimeout(function() {
            self.doRegisterBuffers = true;
            log.write("----------------- we are now registering buffers ---------------------------");

        }, application.appSetting("RegisterBufferGracePeriod") * 1000);*/
    },
    msToSeconds: function(ms) {
        return ms / 1000;
    },
    // Get cached element.
    getCachedElement : function(id) {
        var element = this.elementCache[id];
        if (!element) {
            element = $(id);
            if (element) {
                this.elementCache[id] = element;
            }
        }

        return element;
    },
    // Clear element cache.
    clearElementCache : function() {
        this.elementCache = {};
    },
    // On stutter start event
    onStutterStart: function() {
        // Record stutter event only if playback time elapses.
        if (!this.stutterTimer && (this.stutterPosition != this._currentTime)) { 
            var self = this;           
            this.stutterTimer = setTimeout(function() {                  
                self.stutterTimer = null;    
                if (self._currentStatus == self.PLAYING) {
                    log.write('PlayerControl.onStutterStart, pause player and rebuffer');    
                    self.stutterPosition = self._currentTime;
                    Player.Pause();
                    OnBufferingStart();  
                }
                
                if (!self.hasError) {
                    // No transition, continue rebuffering.
                    setTimeout(function() {
                        if (self._currentStatus == self.PLAYING) {
                            log.write('PlayerControl.onStutterStart, end rebuffer and continue play');                        
                            Player.Resume();
                        }
                    }, 6000);
                }
            }, 2000);
        }
    },
    
    // On stutter stop event
    onStutterStop: function() {
        if (this.stutterTimer) {
            log.write('PlayerControl.onStutterStop, clear stuter timer');
            clearTimeout(this.stutterTimer);
            this.stutterTimer = null;
        }
        else {
            log.write('PlayerControl.onStutterStop, end rebuffer and clear loading');
            OnBufferingComplete();
        }
    },

    // On skip chapter end event
    onSkipChapterEnd: function() {
        if (this._currentStatus == this.SKIPPING) {
            log.write('onSkipChapterEnd, back to play state.');
            this._currentStatus = this.PLAYING;
            
            // Exit locate mode.
            this._exitLocateMode();

            log.write('onSkipChapterEnd, clear buffering flag (' + this.isBuffering + ')');
            this.isBuffering = false;
            this.hideLoading();
            this.setPlayStateDisplay('play');
            this._regKeyTimeout('resume');
        }
    },
    
    // On reverse scan to normal play.
    onReverseScanToPlay: function() {
        if (this._currentStatus == this.TRICKPLAY && this.trickPlayCnt < this._playIndex) {
            // Return to normal play if scan backward to the beginning.
            this._exitLocateMode('transportPlayPause');

            this.trickPlayCnt = this._playIndex;
            this.setPlayStateDisplay('play');
            this._currentStatus = this.PLAYING;
            this._regKeyTimeout('resume');

            this.playPauseKey = 'play';
            device.displayPlay();
        }
    },

    // On locate to some playback position.
    onLocateToPosition: function() {
        if (this.isBuffering || !this._isLoaded) {
            log.write("===== Can't locate on Buffering or unloaded ===== ");
            return;
        }

        var position = 0;

        if (this.inLocateMode) {
            position = parseInt((this.skipStartPosition + this.skipTime)/1000);

            if (this._currentStatus === this.PLAYING) {
                this._registerHideControls("skip");
            }
        } else if (this._currentStatus == this.TRICKPLAY || this._currentStatus == this.PAUSED) {
            position = this._currentTime/1000;
        }

        if (position) {
            log.write('onLocateToPosition, play from: (' + position + ')');

            this._currentStatus = this.SKIPPING;
            Player.LocateToPosition(position);

            // Show loading.
            this.isBuffering = true;
            this.showLoading(true);
        }
    },
    // On stopped event.
    onStopped: function() {
        // Only care about stopped event in HD/SD transition.
        if (!this._swappedToSD) {
            return;
        }

        this._swappedToSD = false;
        var self = this,
            seconds; 
        log.write("Current Bandwidth is too low or too many buffers. Switching to SD at: " + this._currentTime + " short buffer count: " + this._bufferCount + " long buffer count: " + this._longBufferCount);

        seconds = Math.floor(parseInt(this._currentTime) / 1000);
        log.write("trying to restart sd at: " + seconds + " seconds.");

        $cn.methods.getStreamingAssetLocation(self.persist.passID, 'STANDARD',
            function(res) {
                var url = $cn.utilities.buildPlaybackURL(res.streamingAssetLocation, res.streamID, res.dRMServerURL, res.dRMACKServerURL, res.heartbeatURL,   res.heartbeatPollInSeconds, false, res.customData);
                url = url + 'HD_STREAM_ID=' + self.persist.streamid + '|';
                self.load(self.persist.titleID,
                    res.streamID,
                    url,
                    seconds,
                    false,
                    self.persist.passID,
                    res.availableClosedCaptions,
                    true);
        }); 
    },
    onTransportSkipRW : function() {
        if(BrowseView.currentState == "player-view") {
            var payload = {};            
            application.events.publish("skipback", payload);
        }
    },
    onTransportRW : function() {
        if(BrowseView.currentState == "player-view") {
            var payload = {};           
            application.events.publish("rewind", payload);
        }
    },
    onTransportPlayPause : function() {
        if(BrowseView.currentState == "player-view") {
            var payload = {};
            if (this._currentStatus === this.PLAYING) {
                application.events.publish("pause", payload);
            } else {
                application.events.publish("play", payload);
            }
        }
    },
    onTransportStop : function() {
        if(BrowseView.currentState == "player-view") {
            var payload = {};           
            application.events.publish("stop", payload);
        }
    },
    onTransportFF : function() {
        if(BrowseView.currentState == "player-view") {
            var payload = {};            
            application.events.publish("fastforward", payload);
        }
    },
    onTransportSkipFF : function() {
        if(BrowseView.currentState == "player-view") {
            var payload = {};
            application.events.publish("skipforward", payload);
        }
    },
    onClosedCaptionToggle : function() {
        if (BrowseView.currentState != 'player-view') {
            return;
        }

        var stateEl = this.getCachedElement('CCState'),
            enabled = ccrender.isCCEnabled(),
            available = ccrender.isCCAvailable();

        if(available && enabled){
            log.write('onClosedCaptionToggle  SetCCEnabled(false)');

            stateEl.removeClass('CCOn');
            stateEl.addClass("CCOff");

            Player.SetCCEnabled(false);
            ccrender.setCCEnabled(false);
        }

        if(available && !enabled){
            log.write('onClosedCaptionToggle  SetCCEnabled(true)');

            stateEl.removeClass('CCOff');
            stateEl.addClass("CCOn");

            Player.SetCCEnabled(true);
            ccrender.setCCEnabled(true);            
        }
        
        this._regKeyTimeout('navigate');
    }

}, PlayerControl = new Class(PlayerControlProperties);

//Video finished stop video
function OnRenderingComplete(){
    log.write('Player.OnRenderingComplete');

    // Hide top and bottom bar to avoid four lines at top error
    $('PlayerTop', 'PlayerLocateBottom').style.display = 'none';
    // Reset the CSS of the top and bottom bars, so that they can be used again
    setTimeout(function(){
        $('PlayerTop', 'PlayerLocateBottom').style.display ='';
    }, 3000);

    // Would like to implement this in the future. Right now functionality is way to buggy
    log.write("Video Stopped while: " + BrowseView.PlayerControl._currentStatus);
    log.write("Playback Speed: " + BrowseView.PlayerControl._trickPlayArr[BrowseView.PlayerControl.trickPlayCnt]);
    // 3 = Trickplay if playback speed is negative then we were rewinding. Play
    // movie instead of returning to title details
    if (BrowseView.PlayerControl._currentStatus == 3
        && BrowseView.PlayerControl._trickPlayArr[BrowseView.PlayerControl.trickPlayCnt] < 0) {

        BrowseView.PlayerControl.stopPlayer();

        setTimeout(function() {
            BrowseView.PlayerControl._isLoaded = false;
            BrowseView.PlayerControl._readyForTrick = false;
            BrowseView.PlayerControl.hideControls('', true);
            BrowseView.PlayerControl.trickPlayCnt = BrowseView.PlayerControl._playIndex;
            BrowseView.PlayerControl._play(BrowseView.PlayerControl.persist.url, 0);
        }, 500);
    } else {
        BrowseView.PlayerControl._stop(true);
    }

    // PlayerView._stop(true);
}

function OnStreamInfoReady() {
    BrowseView.PlayerControl._OnStreamInfoReady();
}

function OnCurrentPlayTime(time) {
    // Time = millisec
    BrowseView.PlayerControl._OnTimeChanged(time);
}

// This is only called after the initial loading is done
function OnBufferingStart() {
    log.write('Player.OnBufferingStart =====================');
    var wasBuffering = BrowseView.PlayerControl.isBuffering;
    BrowseView.PlayerControl.isBuffering = true;

    if (BrowseView.PlayerControl._isLoaded) {
        BrowseView.PlayerControl.showLoading(true);
    }

    // may 2012, moved buffer timeout up into Register Buffer - also made it specifically an SD buffer timeout, due to HD SD switching algorithm

    // If we were already buffering, do not register another buffer
    if (!wasBuffering) {
        log.write("$$$$$$$$$ about to call register buffer ================================");
        BrowseView.PlayerControl.registerBuffer();
    } else {
        log.write("%%%%%%%%% did not call register buffer, there is already another ongoing buffer event +++++++++++++++++++++++++++++++++")
    }

    log.write("_currentStatus from bottom of OnBufferingStart(): " + BrowseView.PlayerControl._currentStatus);
}

function OnBufferingProgress(prog) {
    log.write('Player.OnBufferingProgress: prog(' + prog + ')');
    // BrowseView.PlayerControl.isBuffering = true;
}
function OnBufferingComplete() {
    log.write('Player.OnBufferingComplete');

    if (!BrowseView.PlayerControl._isLoaded) {
        BrowseView.PlayerControl.hideLoading();
        BrowseView.PlayerControl.isBuffering = false;

        // DOUBLE CHECK THAT WE ARE LOADED IN CASE OF LAG BETWEEN BUFFING COMPLETE AND PLAY
        BrowseView.PlayerControl.listenForLoad();

        if (BrowseView.PlayerControl._currentTime > 2000) {
            BrowseView.PlayerControl._readyForTrick = true;
        }
        
        BrowseView.PlayerControl._regKeyTimeout('play');

        if (BrowseView.PlayerControl.playerTimeout) {
            clearTimeout(BrowseView.PlayerControl.playerTimeout);
            BrowseView.PlayerControl.playerTimeout = null;
        }

        if (BrowseView.PlayerControl.bufferCheckTimeout) {
            clearTimeout(BrowseView.PlayerControl.bufferCheckTimeout);
            BrowseView.PlayerControl.bufferCheckTimeout = null;
        }
            
        BrowseView.PlayerControl.showControls();
    }
    else {
        BrowseView.PlayerControl.hideLoading();
        BrowseView.PlayerControl.isBuffering = false;
    }
}

function OnNetworkDisconnected() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }

    log.write('Player.OnNetworkDisconnected');
    BrowseView.PlayerControl._onError('OnNetworkDisconnected');
}

function OnAuthenticationFailed() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }

    log.write('Player.OnAuthenticationFailed');
    BrowseView.PlayerControl._onError('OnAuthenticationFailed');
}

function OnConnectionFailed() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }

    log.write('Player.OnConnectionFailed');
    BrowseView.PlayerControl._onError('OnConnectionFailed');
}

function OnRenderError() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }

    log.write('Player.OnRenderError');
    BrowseView.PlayerControl._onError('OnRenderError');
}

function OnStreamNotFound() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }

    log.write('Player.OnStreamNotFound');

    if (BrowseView.PlayerControl.isTrailer) {
        BrowseView.PlayerControl._onError('OnStreamNotFound_trailer');
    } else {
        BrowseView.PlayerControl._onError('OnStreamNotFound');
    }
}

function OnCustomEvent(evnt) {
    if (BrowseView.currentState != 'player-view') {
        return;
    }

    var sEvnt = String(evnt);
    log.write('Player.OnCustomEvent: ' + evnt);

    BrowseView.PlayerControl._onError('OnWideVineError_' + sEvnt);
}

// Playback stutter start event handler.
function OnPlaybackStutterStart() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }    
    log.write('OnPlaybackStutterStart');    
    BrowseView.PlayerControl.onStutterStart();
}

// Playback stutter stop event handler.
function OnPlaybackStutterStop() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }    
    log.write('OnPlaybackStutterStop');    
    BrowseView.PlayerControl.onStutterStop();   
}

// Playback skip chapter end.
function OnPlaybackSkipChapterEnd() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }    
    log.write('OnPlaybackSkipChapterEnd');    
    BrowseView.PlayerControl.onSkipChapterEnd();     
}

// Playback stopped.
function OnPlaybackStopped() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }    
    log.write('OnPlaybackStopped');    
    BrowseView.PlayerControl.onStopped();  
}

// Playback CC Data.
function OnPlaybackCCData(xmlNodes) {
    if (BrowseView.currentState != 'player-view') {
        return;
    }
    log.write('OnPlaybackCCData');
    ccrender.renderCCXMLNodes(xmlNodes);
}

// Playback update CCState
function OnUpdateCCState(available) {
    if (BrowseView.currentState != 'player-view') {
        return;
    }
    log.write('OnUpdateCCState');
    BrowseView.PlayerControl.updateCCState(available);
}

// Reverse scan to normal play.
function OnReverseScanToPlay() {
    if (BrowseView.currentState != 'player-view') {
        return;
    }
    log.write('OnReverseScanToPlay');
    BrowseView.PlayerControl.onReverseScanToPlay();
}
