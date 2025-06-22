//-----------------------------------------------------------------------------
// dock.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var DockControlObjects = {
		id: 'dock',
		persist: {},
	    controls:{},
	    buttons:[],
	    layoutIsDirty: true,
		hasFocus: false,
	    tpl: null,
		selection: null,
	    initialize: function(){
			//log.write(this.id + ".tpl");
			
			this.tpl = new ui.template("dockcontainer", application.ui.loadTpl(this.id + ".tpl"));
			this.tpl.compile();
			//log.write(this.tpl);
			this.draw();
			
	        application.events.subscribe(application, 'viewchanged', this.onViewChanged.bind(this));
			application.events.subscribe(this, 'elementfocus', this.onFocusChanged.bind(this));
			application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
			application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
			application.events.subscribe(this, 'navigate', this.onNavigate.bind(this));
	    },
	    init: function(params){
			log.write('dockcontrol.init()');
	        //Persist Params
	        if(params) {
	            this.persist = params;               
	        }      
		},
		/* Apply the template */
		draw: function(){
			var val = 'PARENTAL CONTROLS';
			var single = false;
			
			this.tpl.append({SignInString:val});
			this.tpl.apply();
			
			if(single) {
				$('btnAccount').removeClass("double-line");
			}
			else {
				$('btnAccount').addClass("double-line");
			}
			//If configuraion has customized dock return button then use it.
			if (configuration.readValue('BackButtonStyle')) {
		         var dockbackItem = $('dock-back');
		         dockbackItem.removeClass('btnBack');
		         dockbackItem.addClass('btnBack' + configuration.readValue('BackButtonStyle'));
			}
		},
		onNavigate: function(payload){
	    	// Reset debug status when leave settings
	    	if (application.debugMode === true) {
	    		application.debugMode = false;
	    		application.doNotRestoreSettings = true;
	    	}
			if(payload.args[0].direction == 'left' && application.element.current == 'dock-back') {
				log.write('left pressed on dock back');
				//[REMOVED PER CNSWE20-1148] application.events.publish("goback");
			}
			if(BrowseView.currentState == "titleview") {
				if(application.element.current.indexOf('dock-') == 0 || application.element.current.indexOf('btnAccount') == 0){
					
					if(payload.args[0].direction == 'right') {
						var elms = document.getElementById('ButtonPanel').getElementsByTagName('a');
						
						if(elms.length > 0) {
							//Use the default title view control to set it's own focus
							payload.preventDefault();
							BrowseView.TitleViewControl.setFocus();
						}
					}
					
				}
			}
		},
		onFocusChanged: function(payload) {
			log.write("dock.onFocusChanged");
			if (document.getElementById(payload.args[0].focusedelem)) {
				if ($(this.id).isParentOf($(payload.args[0].focusedelem))) {
					if (!this.hasFocus) {					
						this.hasFocus = true;
//						if (this.selection != null) 
//							application.element.current = this.selection;
//						else
//							application.element.current = "dock-back";
					}
				}
				else
					this.hasFocus = false;
			}
		},
		onViewChanged: function(payload) {
			var dockItems = document.getElementById('dockcontainer').getElementsByTagName("a"),
                x;
			for(x = 0; x < dockItems.length; x++) {
				$(dockItems[x].id).removeClass('selected');
				this.selection = null;
			}
			
			switch (payload.args[0]) {
			case "browse-view":
				this.selection = "dock-home";
				break;
			case "search-view":
				this.selection = "dock-search";
				break;
			case "wishlist-view":
				this.selection = "dock-wishlist";
				break;
			case "library-view":
				this.selection = "dock-library";
				break;
			case "settings-view":
				this.selection = "dock-settings";
				break;
			case "help-view":
				this.selection = "dock-help";
				break;
			}
			
			if (this.selection != null) {
				$(this.selection).addClass('selected');
			}
		},
		onSaveState: function(payload){
			var state = payload.args[0];

			state[this.id] = {
				selection: this.selection,
				hasFocus: this.hasFocus
			};
		},
		onRestoreState: function(payload){
			var state = payload.args[0];
			$extend(this, state[this.id]);
		}
	};
var DockControl = new Class(DockControlObjects);
