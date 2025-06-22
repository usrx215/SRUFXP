//-----------------------------------------------------------------------------
// BandwidthCheck.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// BandwidthCheck.js: WebSocket implementation
//

var BandwidthCheck = {
    inited: false,
    callbackParms: null,
    callbackType: "",
    callback: null,
    successCondition: 0,
    lastRan: 0,
    lastProgressUpdateTime: "",
    lastProgressupdateValue: 0,
    
    initialize: function() {
        if(!this.inited) {
            log.write("BandwidthCheck.initialize: websocket version: Setting up unsolicited response handler");
            // Register a handler
            WebSocketManager.addHandler("DownloadFile_Progress", this, this.sdkProgressHandler);
        
            this.inited = true;
        }
    },
    
	playerBandwidthCheck: function(url, hd, resume, resumeTime, callback) {
		log.write("BandwidthCheck.playerBandwidthCheck: websocket version enter");		
        this.initialize();
        
	    this.callbackParams = {
	        url: url,
	        resume: (resume < $cn.config.EarliestResumeS - $cn.config.RewindUponResumeS) ? 0 : resumeTime
	    };

        this.callbackType = "player";
	    this.lastRan = new Date();
	    this.successCondition = (hd) ? application.appSetting("HDMinimumBandwidth") : application.appSetting("SDMinimumBandwidth");
	
        this.callback = callback;
        var requestText = this.createRequest();
        //log.write("BandwidthCheck.playbackBandwidthCheck: sending request: " + requestText);
        WebSocketManager.send(requestText, this, this.sdkResponseHandler);
	},
	
	purchaseBandwidthCheck: function(titleid, skuid, couponcode, hd, callback) {
		log.write("BandwidthCheck.purchaseBandwidthCheck: websocket version enter");		
        try {
            this.initialize();
            
            this.callbackParams = {
                titleid : titleid, skuid : skuid, couponcode : couponcode, pinValidated : true, bandwidthValidated : true
            };
            this.callbackType = "purchase";
            this.lastRan = new Date();
            this.successCondition = (hd) ? application.appSetting("HDMinimumBandwidth") : application.appSetting("SDMinimumBandwidth");

            this.callback = callback;
            var requestText = this.createRequest();
            //log.write("BandwidthCheck.purchaseBandwidthCheck: sending request: " + requestText);
            WebSocketManager.send(requestText, this, this.sdkResponseHandler);
        } 
        catch (e) {
            log.write('BandwidthCheck.purchaseBandwidthCheck: websocket version. download control not supported');
        }
	},
	
	popupBandwidthCheck: function(origin, callback, doSetIntervalOnFail) {
		log.write("BandwidthCheck.popupBandwidthCheck: websocket version enter");
		var speedInterval = 0;
	    try {        
            this.initialize();
            
            // TODO: PJV: Believe these two items no longer are used in the code, remnant from old SWE version?
	        $cn.data.bwTest.bwCallback = callback;
	        $cn.data.bwTest.self = origin;
            
            origin.startTime = new Date();
            // TODO?: create / check timeout for this	        

            this.callback = callback;
            
            var requestText = this.createRequest();
            //log.write("BandwidthCheck.popupBandwidthCheck: sending request: " + requestText);
            WebSocketManager.send(requestText, this, this.sdkResponseHandler);
	    }
	    catch (e) { 
	    	if (doSetIntervalOnFail) {
	    		// systemstatuspopup used 100 at one time in a call to setInterval, but that
	    		// call was commented out, thus the introduction on of doSetIntervalOnFail flag
	    		// and continued use of the 2000 value extracted/abstracted from speedpopup.
				speedInterval = Number(setInterval ( callback, 2000 ));
	    	}
			log.write('BandwidthCheck.popupBandwidthCheck: websocket version. download control not supported'); 
		}
	    return speedInterval;
	},
    
    createRequest: function() {
        var requestText = '<RNOWebServiceCall>$$REQUESTID$$<DownloadFile';
        requestText += ' url="' + $cn.data.BandwithCheckURL + '"';
        requestText += ' targetFile=":null:"';
        requestText += ' maxDownloadTime="8000"';
		requestText += ' skippedTime="3000"';
        requestText += ' maxDownloadSize="' + $cn.data.BandwithCheckURLSize + '"';
        requestText += ' progressid="bandwidthTest"/></RNOWebServiceCall>';
        
        return requestText;
    },
    
    sdkResponseHandler: function(response) {
        log.write("BandwidthCheck.sdkResponseHandler: response: " + response);

        var responseDOM;
        try {
            //log.write("WSRequest (WebSocket) response: " + response);
            responseDOM = XML.rootFromString(response).firstChild;
        }
        catch(e) {
            log.write("WSRequest (WebSocket): parsing error: " + e);
            throw(e);
        }
        
        var speed = 0;
        var size = 0;
        var time = 0;
        var error = 0;
        
        var nodes = responseDOM.getElementsByTagName("DownloadFile_Response");
        if(nodes && nodes.length) {
            var attrs = nodes[0].attributes;
            for(var i=0; i < attrs.length; i++) {
                var name = attrs[i].nodeName;
                if(name == "contentLength") {
                    size = new Number(attrs[i].nodeValue);
                }
                else if(name == "contentTime") {
                    time = new Number(attrs[i].nodeValue);
                }
                else if(name == "error") {
                    error = new Number(attrs[i].nodeValue);
                    if(error == 0)
                        error = 1;
                }
            }
        }
        
        BandwidthCheck.lastProgressUpdate = "";
        
        if(size > 0 && time > 0) {
            speed = parseInt((size * 1000 / time));
            BandwidthCheck.callback("SpeedUpdate?"+speed);
        }
        else {
            BandwidthCheck.callback("SpeedUpdate?0");
        }
        BandwidthCheck.callback("ProgressUpdate?100");
        BandwidthCheck.callback("Complete?"+error);
    },
    
    sdkProgressHandler: function(xmldom) {
        //log.write("BandwidthCheck.sdkProgressHandler: enter: " + XML.toString(xmldom));
        //<DownloadFile_Progress denominator="3757608" numerator="3757608" progressid="bandwidthTest" type="ContentProgress"/>
        if(xmldom) {
            
            var numerator = 0;
            var denominator = 1;
            var type = "";
            
            var nodes = null;
            if(xmldom.nodeName == "DownloadFile_Progress")
                nodes = [xmldom];
            else nodes = xmldom.getElementsByTagName("DownloadFile_Progress");
            
            if(nodes && nodes.length) {
                var attrs = nodes[0].attributes;
                for(var i=0; i<attrs.length; i++) {
                    var name = attrs[i].nodeName;
                    if(name == "denominator") {
                        denominator = new Number(attrs[i].nodeValue);
                        //log.write("den: " + denominator);
                    }
                    else if(name == "numerator") {
                        numerator = new Number(attrs[i].nodeValue);
                        //log.write("num: " + numerator);
                    }
                    else if(name == "type") {
                        type = attrs[i].nodeValue;
                        //log.write("type: " + type);
                    }
                }
                
                if(type == "ContentProgress" && denominator > 1) {
                    // Update percentage 
                    BandwidthCheck.callback("ProgressUpdate?" + parseInt(100 * numerator / denominator));
                    
                    // Update speed
                    var currentTime = new Date();
                    if(BandwidthCheck.lastProgressUpdateTime != "") {
                        var timeDiff = $cn.utilities.DateDiff(currentTime, BandwidthCheck.lastProgressUpdateTime);
                        if(timeDiff >= 1000 && $cn.data.BandwithCheckURLSize == denominator) {
                            var updateSize = $cn.data.BandwithCheckURLSize * ((numerator / denominator) - BandwidthCheck.lastProgressUpdateValue);
                            var updateSpeed = parseInt(updateSize * 1000 / timeDiff);
                            //log.write("BandwidthCheck.sdkProgressHandler: time since last is " + timeDiff + "ms, bytes since last is " + updateSize + ", speed over interval: " + updateSpeed + "B/s");
                            BandwidthCheck.callback("SpeedUpdate?" + updateSpeed);

                            // Save values for next go around differences
                            BandwidthCheck.lastProgressUpdateValue = numerator / denominator;
                            BandwidthCheck.lastProgressUpdateTime = currentTime;
                        }
                    }
                    else {
                        BandwidthCheck.lastProgressUpdateValue = numerator / denominator;
                        BandwidthCheck.lastProgressUpdateTime = currentTime;
                    }
                }
            }
        }
    }
};
