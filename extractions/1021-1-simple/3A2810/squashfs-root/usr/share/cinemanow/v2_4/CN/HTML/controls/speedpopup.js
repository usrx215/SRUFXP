//-----------------------------------------------------------------------------
// speedpopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var SpeedInterval;

var SpeedPopup = new Class({
	Extends:ModalControl,
	Implements:ModalControl,
	id: 'speedpopup',
    _pinValues: [0,0,0,0,0],
    _currentIndex: 0,
    initialize: function(){
    	this.parent('speedpopup');
	},
	startSpeedCheck: function() {
		$('SpeedTest').show();
		$('SpeedResult').hide();
		$('SpeedUpgrade').hide();
		
		SpeedInterval = BandwidthCheck.popupBandwidthCheck(this, this.onComplete, true);
	},
	showUpgrade: function() {
		$('SpeedTest').hide();
		$('SpeedResult').hide();
		$('SpeedUpgrade').show();
		navigation.setFocus('SpeedClose2');
	},
    hide: function() {
        this.parent();

        if (this.lastFocus === 'transportStop') {
            BrowseView.TitleViewControl.setFocus();
        }
    },
    onComplete: function(p) {
        // TODO - looks like this displays the last of 20 results instead of averaging them
        if(document.getElementById('SpeedStatusMessage')) {
            $('SpeedStatusMessage').set('html','Testing latency...');
          
            if (p) {
                var params = p.split('?');
                log.write(p);
                
                //Value is in bytes per second
                switch (params[0]) {
                    case "Complete" : // test is complete
                        log.write("Speedtest: " + $cn.data.bwTest.speedBytes + " bytes per sec.");
                        
                        //I had to add the > 0 check because some times callback gets called with a byte size of 0
                        //Currently  testing for 700 kbps
                        $cn.data.speedchecked = true;
                        var showResult = true;
                        var resultID = 'SpeedResult1';
						
						if ($cn.data.bwTest.speedBytes > 0) {
							if ($cn.data.bwTest.speedBytes < $cn.config.SDMinimumBandwidth) {
								resultID = 'SpeedResult1';
							}
							else if ($cn.data.bwTest.speedBytes < $cn.config.HDMinimumBandwidth) {
								resultID = 'SpeedResult2';
							}
							else {
								resultID = 'SpeedResult3';
							}
						}
						else {
							showResult = false;
						}
                        
                        log.write('showing: ' + resultID);
                        if(showResult) {
                            var speedText = (parseInt($cn.data.bwTest.speedBytes*8/10000) / 100) + ' Mbps';
                            $('SpeedDownload').set('html',speedText);
                            $('SpeedDownload2').set('html',speedText);
                            $('SpeedTest').hide();
                            $('SpeedUpgrade').hide();
                            $('SpeedResult').show();
                            $(resultID).show();
                            navigation.setFocus('SpeedUpgradeButton');
                        }
                        
                        break;
                    case "ProgressUpdate" : // test is still processing - returns percentage complete
        
                        application.currentView.layoutIsDirty = true;	
                        $('SpeedStatusBar').setStyle("width",params[1] + '%');
                        break;
                    case "SpeedUpdate" :  // test is still processing - returns current bytes/sec
                        $cn.data.bwTest.speedBytes = parseInt(params[1]);
                        break;
                    
                }
            } else {
                if ($cn.data.bwTest.calls >= 10) {
                    clearInterval(SpeedInterval);
                    $('SpeedTest').hide();
                    $('SpeedResult').show();
                    $('SpeedResult1').show();
                }
                
                $('SpeedDownload').set('html','22 Mbps');
        
                $('SpeedDownload2').set('html','22 Mbps');
                navigation.setFocus('SpeedUpgradeButton');
                
                application.currentView.layoutIsDirty = true;	
                $('SpeedStatusBar').setStyle("width",($cn.data.bwTest.calls * 10) + '%');
                
                $cn.data.bwTest.calls++;
            }
        }
    }
});
