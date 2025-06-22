//-----------------------------------------------------------------------------
// init.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author OutCoursing Inc
 */
 var theme = 'bby';
 var env = '';
 var $cn = $cn || {};
 var Player = null;
 var originalSource = null;
 var nextRequestId = 0;
 
 var PL_AUDIO_OUTPUT_DEVICE_EXTERNAL = 3;
 var PL_AUDIO_OUTPUT_DEVICE_RECEIVER = 4;
 var PL_AUDIO_OUTPUT_DEVICE_UNKNOWN = 999;
 
 $cn.methods = {};
 $cn.utilities = {};
 $cn.objects = {};
 $cn.data = {};
 application = null;
 configuration = null;

 // Some globally used constants
$cn.data.PAGE_SIZE = 27;
$cn.data.PAGE_PRE_FETCH = 60;
 		
function include(path) {
  var fileref=document.createElement("script");
  fileref.setAttribute("type", "text/javascript");
  fileref.setAttribute("src", path);

  document.getElementsByTagName("head")[0].appendChild(fileref);
}

function includeCss(path){
 
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", path);

    document.getElementsByTagName("head")[0].appendChild(fileref);
}
var splashAnim;
var currPerc = 0;
var currMax = 0;

function updateSplash(percentage) {
	currMax = percentage;
	/*
	splashAnim = new Fx.Morph($('SplashProgress'), {
		duration: 3000,
		unit: '%',
		onComplete: function() {
			log.write('progress: ' + (document.getElementById('SplashProgress').style.width == currPerc + '%'));
			if(currPerc >= 100) {
				$('SplashScreen').hide();
			}
		}
	}).set({width:currPerc + '%'});
	
	splashAnim.start({'width': percentage + '%'});
	*/
	
//	document.getElementById('SplashProgress').style.width = percentage + '%';
	// currPerc = percentage;
}

function updateSplashTick() {
	currPerc++;
	if(currPerc >= currMax) {

		if(currPerc >= 100) {
			if(currMax == 100) {
				splashTimer.Stop();
                if (! $cn.data.DisplayEula && !$cn.data.partnerOfferID) {
				    $('SplashScreen').hide();
                }
			} else {
				currPerc--;
			}
		} else {
			splashTimer.Stop();
			splashTimer.Interval = 300;
			splashTimer.Start();
		}
	} else {
		if(splashTimer.Interval == 300) {
			splashTimer.Stop();
			splashTimer.Interval = 33;
			splashTimer.Start();
		}
	}
	document.getElementById('SplashProgress').style.width = (currPerc) + '%';
}


/* 
 * If the build in function has not been loaded yet then load the local files.
 * If the function hasn't loaded yet then we are not in the widget environment
 */
if (this.Common == null) {
	include('api/Plugin.js');
	include('api/Widget.js');
	include('api/' + $cn.config.CurrentKeymap + '/keymap.js');
}


var splashTimer;

function widgetLoad(){
    log.write("init.widgetLoad: Enter.");
	$("SplashCopyright").innerHTML = application.resource.copyrightString;
	
    if("WebSocketManager" in window ) {
        log.write("init.widgetLoad: Found WebSocketManager.");
        if("WebSocket" in window) {
            //var self = this;
            //Notifications.registerCallback("testtoken", this, 
            //    function(xmldom) {
            //        log.write("widgetLoad, testtoken notification handler: " + XML.toString(xmldom));
            //    }
            //);
			
			// Register shutdown notification handler.
			Notifications.registerCallback("Shutdown", this, BrowseView.exitStore);
		    
			var XMLPort = $UrlQueryString['XMLPort'] || '31415';

            log.write("init.widgetLoad: Found WebSocket.");
            WebSocketManager.initialize("ws://localhost:" + XMLPort +"/res", 
            	function() {
                widgetLoad2();
            	}, 
            	function() {
            		log.write("Error in connecting websocket to SDK.");
                return;
            });
            return;
        }
        else {
            log.write("init.widgetLoad: Warning: No WebSocket");
        }
    }
    else {
        log.write("init.widgetLoad: Warning: No WebSocketManager");
    }
    
    log.write("init.widgetLoad: About to call plain widgetLoad2.");
    widgetLoad2();
}

function widgetLoad2() {
    log.write("init.widgetLoad2: About to call configuration.initialize.");
    if ($UrlQueryString['CredentialsFilePath']){
    	log.write("init.widgetLoad: Found URL CredentialPath:" + $UrlQueryString['CredentialsFilePath']);
    	configuration.setCredentialsFile($UrlQueryString['CredentialsFilePath']);
    }
    configuration.initialize(settingsCheck);
}
// This function will check if we should switch to a new settings files based on the LastCountryID
function settingsCheck()  {
	log.write("init.settingsCheck: check if settings file is correct");
	var lastCountryID = configuration.readValue('LastCountryID');
	
    if ( (lastCountryID==null) || ( lastCountryID == $UrlQueryString['CountryID']))
    	widgetLoad3();
    else
    {
    	//Switch to the LastCountryID's setting file
    	configuration.inited = false;
    	configuration.changeSettingsFile(lastCountryID);
    	configuration.initialize(function() {
            widgetLoad3();
    	});
    }
}  
function widgetLoad3() {
    log.write("init.widgetLoad3: Enter.");
    application.cachedUserAgent = navigator.userAgent;
    
    //application.resource = r.data;

	splashTimer  = new Timer();
	splashTimer.Interval = 33;
	splashTimer.Tick = updateSplashTick;
	splashTimer.Start();
	
	// set splash loading to 60%
	updateSplash(60);
	
	// authSupported is used to control which webservices APIs are used/available.
	// Assume it is available to start with. application.init and resolveenv will 
	// modify this based on success of making secured API calls.
	application.authSupported = true;

    // This is the first output of the app
    // Use spaces to separate columns for consistancy w "1234 ROVI theme
    log.write("widgetLoad makeRestRequest function: BUILD " + configuration.readValue("build"));
	
	device.initialize();
	    
	application.init();	
    log.write("init.widgetLoad3: Return.");
}

function widgetUnload(){
    // If widgetUnload is called by browser without app exit, we should do following work:
    // 1. Close all open modules including Player; 2. Send LPT to server; 3. Notify SDK side
    BrowseView.exitStore();

	/* Widget clean-up when it is unloaded from the system */
	device.unload(); 
}

window.onload = widgetLoad;
