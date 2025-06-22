//-----------------------------------------------------------------------------
// gridcardkeyboard.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var GiftCardKeyboardControl = new Class({
	Extends: KeyboardControl,
	id: 'giftcardkeyboardcontrol',
	_currentCategory: '',
	_refined: false,
	_hault: 0,
	value: '',
	initialize: function(){
		this.parent();
	},
	keyboardFocus: function(payload) {
		if(document.getElementById(payload.args[0].focusedelem)){
			if($('skinnykeyboard').isParentOf($(payload.args[0].focusedelem))){
				log.write('skinnykeyboardfocus');
				if(this._refined)
				{
					this.handlechange();
				}
			}
		}
	},
	unsubEvents: function(){
		application.events.unsubscribe(this, "back");
		application.events.unsubscribe(this, "keydown");
	},
	handleKeyPress: function(payload){
		switch(payload.args[0].event.keyCode){
			case application.keys.KEY_1:
				application.navigator.setFocus('Skinny1');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '1'});
				break;
			case application.keys.KEY_2:
				application.navigator.setFocus('Skinny2');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '2'});
				break;
			case application.keys.KEY_3:
				application.navigator.setFocus('Skinny3');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '3'});
				break;
			case application.keys.KEY_4:
				application.navigator.setFocus('Skinny4');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '4'});
				break;
			case application.keys.KEY_5:
				application.navigator.setFocus('Skinny5');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '5'});
				break;
			case application.keys.KEY_6:
				application.navigator.setFocus('Skinny6');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '6'});
				break;
			case application.keys.KEY_7:
				application.navigator.setFocus('Skinny7');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '7'});
				break;
			case application.keys.KEY_8:
				application.navigator.setFocus('Skinny8');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '8'});
				break;
			case application.keys.KEY_9:
				application.navigator.setFocus('Skinny9');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '9'});
				break;
			case application.keys.KEY_0:
				application.navigator.setFocus('Skinny0');
				application.events.publish('keyboardselect', {caller: 'giftcardkeyboardcontrol', value: '0'});
				break;
			default:
				break;				 
		}
	},
	valuechange: function(payload) {
		if(payload && payload.args[0].caller == this.id) {
			
			if(this._currentValue == "")
				this.shiftReset();
			
			$('SkinnySearchText').set('html', this._currentValue + '_');
			
			this.shiftLeft();
			
			this.handlechange();
		}
	},
	shiftLeft: function()
	{
	
		var textWidth = parseInt($('SkinnySearchText').clientWidth);
		var wrapWidth = parseInt($('SkinnySearchTextWrap').clientWidth)-15;
	    var left = $('SkinnySearchText').getStyle("margin-left");
	    
	    if(textWidth > wrapWidth)
		{
		    if (left == "")
		        left = 0;
		    
		    var effect = new Fx.Morph($('SkinnySearchText'), {
				duration: 300, 
				transition: Fx.Transitions.Sine.easeOut
			});
		    effect.start({'margin-left': wrapWidth - textWidth+"px"});
	    }else {
	    	this.shiftReset();
	    }
	},
	shiftReset: function()
	{
		$('SkinnySearchText').setStyle('margin-left', '0');
	},
	keyselect: function(payload) {
		if(!BrowseView.GiftCardPanel.isProcessing) {
			log.write('keyboard select:' + payload.args[0].value);
			log.write(payload);
			this._currentValue +=  payload.args[0].value;
			this.valuechange(payload);
		}
	},
	clear: function(){
		$('SkinnySearchText').set('html', '_');
		this.value = '';
    	this.shiftReset();
		this._currentValue = '';
	},
	handlechange: function() {
		/* We do not need to do anything here. All functions get called from a button. */
		this.value = this._currentValue;
	},
	setcategory: function(payload)
	{
		this._currentCategory = payload.args[0].selectedvalue;
		this.keyclear();
		this.handlechange();
	},
	show: function (){
		this._currentValue = '';
		$('SkinnySearchText').set('html', '_');
		document.getElementById('skinnykeyboard').className = this.id;
		
		log.write($$("a.standard").each(function(item){item.show()}));
		$("skinnykeyboard").show();
		
        navigation.buildNavigation($('skinnykeyboard').getElements('a'));
        application.events.subscribe(this, "back", this.handleBack.bind(this));
		application.events.subscribe(this, "keydown", this.handleKeyPress.bind(this));		
	},
	handleBack: function(payload){
		payload.preventDefault();
		this.unsubEvents();
		this.hide();
	},	
	hide: function()
	{
		document.getElementById('keyboard').className = '';
		this.unsubEvents();
		$("skinnykeyboard").hide();
	}
});
