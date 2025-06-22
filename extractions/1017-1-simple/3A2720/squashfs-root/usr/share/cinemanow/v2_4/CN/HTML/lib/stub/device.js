//-----------------------------------------------------------------------------
// device.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// STUB device API implementation
//

var device = {		
	logSupported: true,	
	logToDisplay: false,
	backupIPConnectionSupported: true,
    realmodelid: 'RES-BD',
	
	initialize:  function() {
		log.write("device.initialize: stub version enter. $cn.data.DeviceID, webservices.uniqueId are " + $cn.data.DeviceID + ", " + webservices.uniqueId);
		
		// If not on device then we setup some fake device information.  Normally we'd like to use MAC address 
		// for device unique ID, but that isn't available in standard javscript.  Will look for alternative.
		// browsers do not allow overriding useragent, but we'll set one up anyway.
		if(application.authSupported)
		{
			// Set the deviceID and uniqueId if they are not already set.
			if (webservices.uniqueId == "") {
				$cn.data.DeviceID = webservices.uniqueId = 'BDE029102EBD';
				log.write("device.initialize: stub version: Setting fixed uniqueId " + webservices.uniqueId);
			}
			else {
				log.write("device.initialize: stub version: Leaving uniqueId, DeviceID as " + webservices.uniqueId + ", " + $cn.data.DeviceID);
			}
			$cn.data.FirmwareVersion = $UrlQueryString['FirmwareVersion'] || $cn.data.FirmwareVersion;
			this.realmodelid = $UrlQueryString['Model'] || this.realmodelid;
			webservices.userAgent = "CNSDK:" + $cn.data.FirmwareVersion + "|" + configuration.readValue("version") + '.' + configuration.readValue("build") + ' CNMODEL:' + this.realmodelid;
		}
				
		log.write("device.initialize: Set User Agent to " + webservices.userAgent);
			
	},

	showBanner: function() {
		// showBanner Is called during init in onWindow. Stub version does not do anything.
		log.write("device.showBanner: stub version enter");
	},

	getFirmwareVersion: function() {
		return $cn.data.FirmwareVersion;
	},

	getFirmwareYear: function() {
		return "2012";
	},

	getDeviceType: function() {
		return "RES";
	},
	
	getDeviceSoc: function() {
		return "BD";
	},
	
	setDeviceSoc: function(deviceSoc) {
		log.write("device.setDeviceSoc: stub version enter");
	},
	
	displayTime: function(ms) {	
		log.write("device.displayTime: stub version enter with ms " + ms);
		// Stub impl does not have a time display
	},
	
	displayPlay: function() {	
		log.write("device.displayPlay: stub version enter");
	},
	
	displayPause: function() {	
		log.write("device.displayPause: stub version enter");
	},

	displayStop: function() {	
		log.write("device.displayStop: stub version enter");
	},	

	initPlayer: function() {
		log.write("device.initPlayer: stub version enter");
	},
	
	initAudioPlugin: function() {		
		log.write("device.initAudioPlugin: stub version enter");
	},
	
	setDocumentClassName: function () {
		if(this.isWebkit()) {
			//If it is not a 2010 device then add the body tag for 2011 browser
			document.getElementsByTagName('body')[0].className = "twothousandtwelve";
		}
		else {
			//If it is a 2012 device then add the body tag for 2012 / webkit
			document.getElementsByTagName('body')[0].className = "twothousandeleven";
		}
		return true;
	},
	
	createActivationFile: function() {
		log.write("device.createActivationFile: stub version enter");
	},
	
	deleteActivationFile: function() {
		log.write("device.deleteActivationFile: stub version enter");
	},
	
	exit: function() {
		log.write("device.exit: stub version enter");
	},
	
	sendReturnEvent: function() {
		log.write("device.sendReturnEvent: stub version enter");
	},
	
	unload : function () {
		log.write("device.unload: stub version enter");
	},
	
	addLogSessionActivity: function(logger, viewName, optionalData){
		log.write("device.addLogSessionActivity: stub version enter");
	},
	
	uploadLogSession: function(){
		log.write("device.uploadLogSession: stub version enter");
	},
	
	play: function(playerControl, url, resumePosition, ccData) {
	    url = url.replace(/&amp;/g, "&");
	    log.write("device.play: stub version. Player url = " + url);
	    	    
		if (resumePosition)
			Player.ResumePlay(url, resumePosition, ccData);
		else 
			Player.Play(url, ccData);
	},
	
    setOffScreenSaver: function () {
		log.write("device.setOffScreenSaver: stub version enter");		
    },
    
    setOnScreenSaver: function () {
		log.write("device.setOnScreenSaver: stub version enter");		
    },
    
    setOffFullScreen: function () {
		log.write("device.setOffFullScreen: stub version enter");		
    },
    
    setOnFullScreen: function () {
		log.write("device.setOnFullScreen: stub version enter");		
    },

	sourceChange: function () {
		log.write("device.sourceChange: stub version enter");
	},
    	
	sourceChange_ori: function() {
		log.write("device.sourceChange_ori: stub version enter");	
	},
    
    isWebkit: function() {
        return (navigator.userAgent.toLowerCase().indexOf("webkit") > -1);
    }

};
	
