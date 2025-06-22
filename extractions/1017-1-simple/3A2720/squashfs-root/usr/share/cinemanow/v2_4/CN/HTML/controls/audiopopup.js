//-----------------------------------------------------------------------------
// audiopopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var AudioPopup = new Class({
	Extends:ModalControl,
	id: 'audiopopup',
	titleID: 0,
	passID: 0,
	resume: 0,
	callback: null,
	initialize: function(){
		log.write('audiopopup.init()');
    	this.parent(this.id);
	},
	/*
	

	 */
	navigate: function(payload) {
		
		//If the format panel is selected then we want to handle the focus for a dynamic number of elements
		if($$('div.audiopopup').length > 0 && $$('div.audiopopup')[0].style.display == "block") {
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
	show: function(titleID, passID, resume, callback) {
        var x;
		this.lastFocus = application.element.current;
		
		this.parent();
		this.titleID = titleID;
		this.passID = passID;
		this.resume = resume;
		this.callback = callback;
		
		application.events.subscribe(this, 'elementfocus', this.onFocus.bind(this));
		application.events.subscribe(this, "navigate", this.navigate.bind(this));

		var audioTypes = $cn.utilities.getAudioProfileTypesForPurchase(passID);
		for (var i = 0; i < audioTypes.length; i++) {
			if (audioTypes[i] == 'Dolby') {
			$('audio_dolby').removeClass('hidden');
			application.navigator.setFocus('audio_dolby');
		}

			if (audioTypes[i] == 'DTS') {
			$('audio_dts').removeClass('hidden');
			application.navigator.setFocus('audio_dts');
		}		
		}
	},
	hide: function(){
		application.events.unsubscribe(this, 'elementfocus');
		application.events.unsubscribe(this, 'navigate');
		this.parent();
		
	},
	onFocus: function(){
		if($$('div.audiopopup').length > 0) {
    		switch(application.element.current){
	    		case "audio_stereo":
	    			$$('p.audiopromo').addClass('hidden');
	    			$('aacselected').removeClass('hidden');
	    			break;
	    		case "audio_dts":
	    			$$('p.audiopromo').addClass('hidden');
	    			$('dtsselected').removeClass('hidden');
	    			break;
	    		case "audio_dolby":
	    			$$('p.audiopromo').addClass('hidden');
	    			$('dolbyselected').removeClass('hidden');
	    			break;
	    		default:
	    			break;
    		}
    	}
	},
	selectAudioFormat: function(format){
		$cn.data.PreferredAudioType = format;
		$cn.data.PreferredAudioTypeSet = true;
		
		configuration.writeValue(configuration.getPrefixedSettingKey('PreferredAudioType'), $cn.data.PreferredAudioType);
		configuration.writeValue(configuration.getPrefixedSettingKey('PreferredAudioTypeSet'), $cn.data.PreferredAudioTypeSet);
    	
    	//Set the audio format on the server
    	$cn.methods.setAudioDefaultProperty(format, function(){
    		this.hide();
    		// If a callback was set in show call use that. If no callback specified,
    		// use a default showPlay call.
    		if (this.callback) {
               	this.callback.call();
    		}
    		else {
        	BrowseView.showPlay(this.titleID, this.passID, this.resume,true);
    		}
        }.bind(this));
	}
});
