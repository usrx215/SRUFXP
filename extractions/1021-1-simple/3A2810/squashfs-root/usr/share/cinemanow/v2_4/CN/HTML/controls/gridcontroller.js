//-----------------------------------------------------------------------------
// gridcontroller.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var ActiveGrid = null;
var GridController = new Class({
	DEBUG: false,
	registeredControls: {},
	spinnerPos: 1,
    spinnerTimer: null,
    spinnerSpinning: false,
    spinnerPosition: 1,
	initialize: function(){
		application.events.subscribe(this, 'loadgrid', this.activate.bind(this));
		application.events.subscribe(this, 'gridloading', this.handleGridLoading.bind(this));
		this.spinnerTimer = new Timer();
		this.spinnerTimer.Interval = 80;	
	},
	activate: function(payload){
		
		if (this.DEBUG) log.write("gridcontroller.activate Debug: Enter with payload " + log.dumpObj(payload));

    	payload = payload.args[0];
		
		//Only do this if the current payload matches the latest store grid process. This is necessary because of quick navigation with async callbacks. We should only be doing the last grid operation so there is no erronous grid loads.
		if(BrowseView.LastGridProcess == payload.gridProcess) {
			log.write('gridcontroller.activate Debug: Loading grid...position is ' + payload.position);
	
			var element;
	
			if (ActiveGrid != null && payload.grid != ActiveGrid.id) {
				if (this.DEBUG) log.write('gridcontroller.activate Debug: Hiding active grid.');
				element = $(ActiveGrid.id);
				element.hide();
			}
	
			var className = payload.className ? payload.className : '';
			
			ActiveGrid = this.registeredControls[payload.grid];
			ActiveGrid.className = className;
			ActiveGrid.altMessage = payload.altMessage;
			ActiveGrid.returnFocus = payload.returnFocus;
			ActiveGrid.showFade = payload.showFade;
			
			element = $(ActiveGrid.id);
			element.className = className;
			
			if (payload.position) {
				if (this.DEBUG) log.write("gridcontroller.activate Debug: payload.position set, calling ActiveGrid.redraw passing data" + log.dumpObj(payload.data));
				ActiveGrid.redraw(payload.data);
			}
			else {
				var length = (!payload.data) ? 0 : payload.data.length;
				length = (length != 0 && (payload.customLength && payload.customLength > payload.data.length)) ? payload.customLength : length;
				if (this.DEBUG) log.write("gridcontroller.activate Debug: payload.position NOT set, Calling ActiveGrid.loadData passing data of length " + length + ": " + log.dumpObj(payload.data)); 
				ActiveGrid.loadData(payload.data, payload.columns, payload.template, payload.position, length, (payload.customPages) ? payload.customPages : 1, payload.genreid);
			}
			
			element.show();
	
			application.currentView.layoutIsDirty = true;
		}
	},
	hideAll: function()
	{
		ActiveGrid = null;
		for (var item in this.registeredControls) {
			$(this.registeredControls[item].id).hide();
		}
//		this.registeredControls.each(function(ctl){
//			$(ctl.id).hide();
//		});
	},
	initSpinner: function(){
		log.write('Init Spinner');
		BrowseView.GridController.spinnerTimer.Tick = BrowseView.GridController.spinnerTick;
        if(!BrowseView.GridController.spinnerSpinning) {
        	$('gridspinnercontainer').hide();
        	BrowseView.GridController.spinnerPosition = 1;
        	BrowseView.GridController.spinnerTimer.Start();
        	BrowseView.GridController.spinnerSpinning = true;
        }
       
	},
	deinitSpinner: function(){
		BrowseView.GridController.spinnerTimer.Stop();
		BrowseView.GridController.spinnerSpinning = false;
		$('gridspinnercontainer').hide();
//		$('gridloadingprocessstring').hide();
	}
	,spinnerTick: function(){
		

//		log.write('tick: ' + BrowseView.GridController.spinnerPosition);
		var spinner = document.getElementById('gridspinner');
		if (spinner) {
		
			var red = false; //[REMOVED PER SONIC DIRECTION] $('uicontainer').className == 'redbuttons';
			
			var vstart1 = -413;
			var vstart2 = -461;
			
			if(!red) {
				vstart1 = -1004;
				vstart2 = -1052;
			}
			BrowseView.GridController.spinnerPosition = (BrowseView.GridController.spinnerPosition + 1) % 16;
			

			var hpos = BrowseView.GridController.spinnerPosition * 80 * -1;
			var vpos = vstart1;
			
			if(BrowseView.GridController.spinnerPosition > 7) {
				hpos = (BrowseView.GridController.spinnerPosition - 8) * 80 * -1;
				vpos = vstart2;
			}
							
			spinner.style.backgroundPosition = parseInt(hpos) + 'px ' + vpos + 'px';
			$('gridspinnercontainer').show();
		}
	},
	register: function(ctl){
		this.registeredControls[ctl.id] = ctl;
	},
	handleGridLoading: function(payload){
		payload = payload.args[0];
		var element;

		if (ActiveGrid != null && payload.grid != ActiveGrid.id) {
			element = $(ActiveGrid.id);
			element.hide();
		}

		var className = payload.className ? payload.className : '';
		
		ActiveGrid = this.registeredControls[payload.grid];
		ActiveGrid.className = className;
//		ActiveGrid.altMessage = payload.altMessage;
//		ActiveGrid.returnFocus = payload.returnFocus;
//		ActiveGrid.loadData(payload.data, payload.columns, payload.template, payload.position);
			
		element = $(ActiveGrid.id);
		element.className = className;
		element.show();

		application.currentView.layoutIsDirty = true;
	}	
});
