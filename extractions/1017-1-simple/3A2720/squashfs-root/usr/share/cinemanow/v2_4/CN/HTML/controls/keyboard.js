//-----------------------------------------------------------------------------
// keyboard.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author jmccabe
 */
var KeyboardControl = new Class({
	id: 'keyboard',
	persist: {},
    controls:{},
    layoutIsDirty: true,
    swappedState: 'standard',
    tpl: null,
    _currentValue: '',
    initialize: function(){
        application.element.registerControl(this);
        
        application.events.subscribe(this, "keyboardback", this.keyback.bind(this));
        application.events.subscribe(this, "keyboardclear", this.keyclear.bind(this));
        application.events.subscribe(this, "keyboardselect", this.keyselect.bind(this));
        application.events.subscribe(this, "keyboardswap", this.keyboardswap.bind(this));
        
        
	    //application.events.subscribe(this, 'elementblur', this.gridBlur.bind(this));
        //application.events.subscribe(this, 'elementfocus', this.keyboardFocus.bind(this));
		application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
		application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
    },
    init: function(params, direction){
		log.write('searchkeyboard.init()');		
        var self = this;

        //Persist Params
        if(params) {
            this.persist = params;               
        }      
	},
	cleanUI: function(){
		
	},
	/*
	 * Load data will:
	 * 1) Set the HTML source and buttons for the modal view
	 * 2) Render the local controls
	 */
	loadData: function(title) {
		this.persist.title = title;		
		this.draw();		
	},
	/* Read config values and render grid */
	draw: function(){
		this.cleanUI();
		
		
	},
	keyback: function(payload) {
		this._currentValue = this._currentValue.substring(0, this._currentValue.length - 1);
		this.valuechange(payload);		
	},
	keyclear: function(payload) {
		this._currentValue = '';
		$('SearchText').set('html', '_');
		this.valuechange(payload);
		
	},
	keyselect: function(payload) {
		log.write('keyboard select:' + payload.args[0].value);
		log.write(payload);
		if(this._currentValue.length < 11)
			this._currentValue +=  payload.args[0].value;
		this.valuechange(payload);
	},
	valuechange: function(payload) {	
		if(payload && payload.args[0].caller == this.id) {
			if (this._currentValue.length < 11) {
				$('SearchText').set('html', this._currentValue + '_');
			} else {
				$('SearchText').set('html', this._currentValue);
			}		
			this.handlechange();
			
			application.events.publish('keyboardvaluechanged', {
				currentValue: this._currentValue
				
			});
		}
	},
	handlechange: function() {
		//METHOD TO BE OVERRIDDEN 
	},
	keyboardswap: function(payload) {
		log.write('keyboard swap');
		
		
		switch(payload.args[0].value) {
			case "alt":
				log.write($$("a.standard").each(function(item){item.hide()}));
				log.write($$("a.alt").each(function(item){item.show()}));
				navigation.setFocus('KeyboardStandardSwap');
				this.swappedState = "alt";
				break;
			default :
				log.write($$("a.alt").each(function(item){item.hide()}));
				log.write($$("a.standard").each(function(item){item.show()}));
				navigation.setFocus('KeyboardAltSwap');
				this.swappedState = "standard";
				break;
		}
		application.currentView.layoutIsDirty = true;		
        navigation.buildNavigation($('keyboard').getElements('a'));
	},
	show: function (){
		document.getElementById('keyboard').className = this.id;
		this._currentValue = '';
		
		//this.keyboardswap({args:[{value: "standard"}]});
		this.swappedState = "standard";
		application.currentView.layoutIsDirty = true;		
        navigation.buildNavigation($('keyboard').getElements('a'));
		$("keyboard").show();
	},
	hide: function()
	{
		document.getElementById('keyboard').className = '';
		//this._currentValue = '';
		$("keyboard").hide();
	},
	onSaveState: function(payload){
		var state = payload.args[0];
		state[this.id] = {
			_currentValue: this._currentValue,
			swappedState: this.swappedState
		};
	},
	onRestoreState: function(payload){
		var state = payload.args[0];
		$extend(this, state[this.id]);
	}
});
