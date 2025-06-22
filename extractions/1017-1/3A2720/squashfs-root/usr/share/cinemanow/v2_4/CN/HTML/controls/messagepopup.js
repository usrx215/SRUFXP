//-----------------------------------------------------------------------------
// messagepopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var MessagePopup = new Class({
	Extends:ModalControl,
	id: 'messagepopup',
	callback: null,
	spinnerPos: 1,
    spinnerTimer: null,
	initialize: function(id){
    	this.parent(id);
	},
	draw: function() {
		this.parent();
		
		var red = false; //$('uicontainer').className == 'redbuttons';
		
		var vstart1 = -413;
		var vstart2 = -461;
		
		if(!red) {
			vstart1 = -1004;
			vstart2 = -1052;
		}
		
		if ($(this.contentId).getElement(".spinnercontainer")) {
		
			var self = this;
			this.spinnerTimer = new Timer();
			this.spinnerTimer.Interval = 80;
			this.spinnerTimer.Tick = function(){
				if (document.getElementById('messagespinner')) {
					self.spinnerPosition = (self.spinnerPosition + 1) % 16;
					
					var hpos = self.spinnerPosition * 80 * -1;
					var vpos = vstart1;
					
					if(self.spinnerPosition > 7) {
						hpos = (self.spinnerPosition - 8) * 80 * -1;
						vpos = vstart2;
					}
					
					var spinner = document.getElementById('messagespinner');
					spinner.style.backgroundPosition = parseInt(hpos) + 'px ' + vpos + 'px';
				}
			}
		}
	},
	initSpinner: function(){
		
        log.write("Loading Data");        
        application.IsBusy = true;      
        this.spinnerPosition = 1;
        this.spinnerTimer.Start();
       
	},
	deinitSpinner: function(){
		this.spinnerTimer.Stop();
//		$('messagespinner').hide();
	},
	loadData: function(content) {
		this.callback = content.callback;
		this.parent([content]);
	},
	show: function(fullscreen) {
		
		// Hide the window so it doesn't show
		// before we update the position
		var window = $("ModalWindow");
		window.setStyle("visibility","hidden");
		
		this.parent();
		
		// Position the dialog.  NOTE: Must be done after
		// showing the dialog as the measurement routine
		// for items with visiblity set to none cause problems
		// with the zorder used by the modal code.
		var contentSize = $("messagemodalwrap").getSize();
		
		if(!fullscreen)
		{
			window.setStyles( {
				top: (($("uicontainer").clientHeight - contentSize.y) / 2) + "px",
				height: contentSize.y + "px",
				visibility: null
			});
		} else {
			window.setStyles( {
				visibility: null
			});
		}

		if(this.spinnerTimer) {
			this.initSpinner();
		}
		application.isBusy = true;
		application.events.subscribe(this, "blockednavigate", this.blockBusy.bind(this));
	},
	hide: function(result) {

		this.parent();
		application.isBusy = false;
		
		if(this.spinnerTimer) {
			this.deinitSpinner();
		}

        // Caching the Popup is needed for callback that wish to use methods attached to it
        BrowseView.MessagePopupCached = BrowseView.MessagePopup;
		BrowseView.MessagePopup = null;
		
		$("ModalWindow").setStyles( {
			top: null,
			height: null
		});
		
		log.write("Hiding modal, and now calling callback...");
		if (this.callback) {
			this.callback(result);
		}

        // All calback have fired, we can now clear the cache.
        BrowseView.MessagePopupCached = null;

		application.events.unsubscribe(this, "blockednavigate");
	},
	blockBusy: function(payload){
		
		var modalBtns = document.getElementById('ModalWindow').getElementsByTagName('a'),
			isModalClick = false,
			x;
		
		for(x = 0; x < modalBtns.length; x++){
			
			if(modalBtns[x].id == application.element.current){
				var payload = {
					event: payload.args[0].event,
					direction: payload.args[0].direction,
					current: application.element.current
				};
				
	    		application.events.publish("navigate", payload);			
				break;
			}
		}
	}
});
