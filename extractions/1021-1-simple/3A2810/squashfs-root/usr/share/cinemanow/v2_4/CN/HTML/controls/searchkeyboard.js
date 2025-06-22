//-----------------------------------------------------------------------------
// searchkeyboard.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var SearchKeyboardControl = new Class({
	Extends: KeyboardControl,
//	Implements: KeyboardControl,
	id: 'searchkeyboardcontrol',
	isActive: false,
	_currentCategory: '',
	_refined: false,
	_hault: 0,
	_state: null,
	initialize: function() {
		this.parent();

		application.events.subscribe(this, "navigate", this.navigate.bind(this));
//		application.events.subscribe(this, "back", this.handleBack.bind(this));
		application.events.subscribe(this, "keydown", this.handleKeyPress.bind(this));	
		application.events.subscribe(this, 'elementblur', this.gridBlur.bind(this));
		application.events.subscribe(this, 'elementfocus', this.keyboardFocus.bind(this));
		application.events.subscribe(this, 'refineselection', this.refineSelection.bind(this));
		application.events.subscribe(this, 'searchwheelchanged', this.setcategory.bind(this));
	},
	keyboardFocus: function(payload) {

		if(document.getElementById(payload.args[0].focusedelem)){
			//[Performance] Make sure we don't do a isParentOf keyboard if we know that the element being blured is not a keyboard key
			if(document.getElementById(payload.args[0].focusedelem).className.indexOf("key") > -1) {
			
				if($('keyboard').isParentOf($(payload.args[0].focusedelem))){
					log.write('keyboardfocus');
					this.isActive = true;
					this._hault = 0;
					if(this._refined)
					{
						this._refined = false;
						application.state.previous();
						navigation.setFocus(payload.args[0].focusedelem);
//						this.handlechange();
					}
				}
				
			}
		}
	},
	unsubEvents: function(){
//		application.events.unsubscribe(this, "back");
		application.events.unsubscribe(this, "keydown");
		application.events.unsubscribe(this, "navigate");
		application.events.unsubscribe(this, "elementblur");
		application.events.unsubscribe(this, "elementfocus");
		application.events.unsubscribe(this, 'refineselection');
	},
	keyselect: function(payload) {
		log.write('keyboard select:' + payload.args[0].value);
		log.write(payload);
		this._currentValue +=  payload.args[0].value;
		this.valuechange(payload);
	},
	valuechange: function(payload) {
		if(payload && payload.args[0].caller == this.id) {
			
			if(this._currentValue == "")
				this.shiftReset();
			
			$('SearchText').set('html', this._currentValue + '_');
			
			this.shiftLeft();
			
			this.handlechange();
		}
	},
	shiftLeft: function()
	{
	    var textWidth = parseInt($('SearchText').clientWidth),
            wrapWidth = parseInt($('SearchTextWrap').getComputedSize().width),
            left = parseInt($('SearchText').getStyle("margin-left")),
            l,
            effect;
	        
	    if(textWidth > wrapWidth)
		{
		    if (left == "")
		        left = 0;
		    
		    l = this.lastTextwidth - textWidth;
            l = parseInt(l) + left;
            if(textWidth + left > (wrapWidth)+12){
                log.write("Out of search window - fixing");
                l = wrapWidth - textWidth -5;
            }
		    effect = new Fx.Morph($('SearchText'), {
				duration: 300, 
				transition: Fx.Transitions.Sine.easeOut
			});
		    effect.start({'margin-left': l+"px"});
	    } else {
	    	this.shiftReset();
	    }
        this.lastTextwidth = parseInt($('SearchText').clientWidth);
	},
	shiftReset: function()
	{
		$('SearchText').setStyle('margin-left', '0');
	},
	handleKeyPress: function(payload){
		if(this.isActive) {
			switch(payload.args[0].event.keyCode){
				case application.keys.KEY_1:
					if(document.getElementById('KeyboardKey1').style.display == "block") {
						application.navigator.setFocus('KeyboardKey1');
					}				
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '1'});
					break;
				case application.keys.KEY_2:
					if(document.getElementById('KeyboardKey2').style.display == "block") {
						application.navigator.setFocus('KeyboardKey2');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '2'});
					break;
				case application.keys.KEY_3:
					if(document.getElementById('KeyboardKey3').style.display == "block") {
						application.navigator.setFocus('KeyboardKey3');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '3'});
					break;
				case application.keys.KEY_4:
					if(document.getElementById('KeyboardKey4').style.display == "block") {
						application.navigator.setFocus('KeyboardKey4');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '4'});
					break;
				case application.keys.KEY_5:
					if(document.getElementById('KeyboardKey5').style.display == "block") {
						application.navigator.setFocus('KeyboardKey5');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '5'});
					break;
				case application.keys.KEY_6:
					if(document.getElementById('KeyboardKey6').style.display == "block") {
						application.navigator.setFocus('KeyboardKey6');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '6'});
					break;
				case application.keys.KEY_7:
					if(document.getElementById('KeyboardKey7').style.display == "block") {
						application.navigator.setFocus('KeyboardKey7');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '7'});
					break;
				case application.keys.KEY_8:
					if(document.getElementById('KeyboardKey8').style.display == "block") {
						application.navigator.setFocus('KeyboardKey8');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '8'});
					break;
				case application.keys.KEY_9:
					if(document.getElementById('KeyboardKey9').style.display == "block") {
						application.navigator.setFocus('KeyboardKey9');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '9'});
					break;
				case application.keys.KEY_0:
					if(document.getElementById('KeyboardKey0').style.display == "block") {
						application.navigator.setFocus('KeyboardKey0');
					}
					application.events.publish('keyboardselect', {caller: 'searchkeyboardcontrol', value: '0'});
					break;
				default:
					break;				 
			}
		}
	},
	gridBlur: function(payload) {

		this.isActive = false;
	},
	handlechange: function() {
		this._refined = false;
		$('ScreenSeparator').addClass("minimized");
    	$('ScreenSeparator').removeClass('searchkeyboardcontrol-arrow');
    	$('ScreenSeparatorThumb').removeClass('wheel-thumb-left').show();
    	
    	var thisSearch = this._currentValue;
		
		
		if(this._currentValue.length > 0) 
		{	//this._hault += 1;
			if(this._currentCategory == "Director" || this._currentCategory == "Actor" || this._currentCategory == "Writer")
			{
				application.events.publish('gridloading', {grid: 'titlegrid', message: "searching", columns: 1, className: "refinementgrid", cssClass: "searchList"});
				$cn.methods.getSearchPerson(this._currentValue,this._currentCategory,function(callback){
		        	log.write(callback.castMembers.length);
		        	
		        	if(this._currentValue == thisSearch || this._currentValue.length > 0)
		        	{
		        		BrowseView.LastGridProcess = "search";
			        	if(callback.castMembers.length > 0)
			        	{
			        		var showFade = false;
			        		
			        		//Show fade if results are more than 16
			        		if(callback.castMembers.length > 16) {
			        			document.getElementById('HorizontalFade').className = "personSearch";
			        			document.getElementById('HorizontalFadeTop').className = "personSearch";
			        			$('HorizontalFade').show(); //Do not show top fade that is handled by the grid paging method.
			        			showFade = true;
			        		}
			        		else {
			        			$('HorizontalFade').hide();
			        			$('HorizontalFadeTop').hide();
			        	    	document.getElementById('HorizontalFade').className = "";
			        	    	document.getElementById('HorizontalFadeTop').className = "";
			        		}
			        		
			        		application.events.publish('loadgrid', {grid: 'titlegrid', data: callback.castMembers, columns: 1, gridProcess: 'search', template: "refinementgrid", className: "refinementgrid", showFade: showFade,returnFocus: "KeyboardKeyBACKTop"});
			        	}
			        	else
			        	{
			        		application.events.publish('loadgrid', {grid: 'titlegrid', columns: 1, template: "refinementgrid", gridProcess: 'search', className: "refinementgrid",returnFocus: "KeyboardKeyBACKTop"});
			        	}
		        	}	        	
	
		        	//this._hault = this._hault - 1;
		        }.bind(this));
				
				
			}
			else
			{
				$('HorizontalFade').hide();
				$('HorizontalFadeTop').hide();
				document.getElementById('HorizontalFade').className = "";		    	
		    	document.getElementById('HorizontalFadeTop').className = "";
		    	
					application.events.publish('gridloading', {grid: 'titlegrid', message: "searching", columns: 2, cssClass: "search", className: "searchgrid"});
					$cn.methods.getSearchTitle(this._currentValue,this._currentCategory,function(callback){
						
						if(this._currentValue == thisSearch)
			        	{
							BrowseView.LastGridProcess = "search";
				        	if(callback && callback.items.length > 0)
				        	{
				        		application.events.publish('loadgrid', {grid: 'titlegrid', data: callback.items, columns: 2, gridProcess: 'search', template: "searchtitlelist", className: "searchgrid", returnFocus: "KeyboardKeyBACKTop"});
				        	}
				        	else
				        	{
				        		application.events.publish('loadgrid', {grid: 'titlegrid', columns: 2, gridProcess: 'search', template: "searchtitlelist", className: "searchgrid", returnFocus: "KeyboardKeyBACKTop"});
				        	}
				 
						}
						else if(this._currentValue.length < 1){
							application.events.publish('loadgrid', {grid: 'titlegrid', columns: 2, gridProcess: 'search', template: "searchtitlelist", className: "searchgrid", returnFocus: "KeyboardKeyBACKTop"});
						}
						
			        	//this._hault = this._hault - 1;
			        }.bind(this));
				
			}

		}
		else if(this._currentValue.length == 0 && (this._currentCategory == "Director" || this._currentCategory == "Actor" || this._currentCategory == "Writer"))
		{
			BrowseView.LastGridProcess = "search";
       		application.events.publish('loadgrid', {grid: 'titlegrid', columns: 1, gridProcess: 'search', template: "refinementgrid", className: "refinementgrid"});
		}
		else  if(this._currentValue.length == 0){
			BrowseView.LastGridProcess = "search";
       		application.events.publish('loadgrid', {grid: 'titlegrid', columns: 2, gridProcess: 'search', template: "searchtitlelist", className: "searchgrid"});
		}
	},
	setcategory: function(payload)
	{
		this._currentCategory = payload.args[0].selectedvalue;
		this.keyclear();
		this.shiftReset();
		
		//Swap Keyboard without changing focus
		if(document.getElementById('KeyboardStandardSwap') && document.getElementById('KeyboardStandardSwap').style.display != "none") {
			log.write($$("a.alt").each(function(item){item.hide()}));
			log.write($$("a.standard").each(function(item){item.show()}));
			this.swappedState = "standard";
			
		}
		
		application.currentView.layoutIsDirty = true;		
		navigation.buildNavigation($('keyboard').getElements('a'));
		
		this.handlechange();
	},
	getkeyword: function() {
		return this._currentCategory == "Keyword" ? this._currentValue : null;
	},
	show: function(){
		this.keyclear();
		this.shiftReset();
		this.parent();
		
		//Swap Keyboard without changing focus
		if(document.getElementById('KeyboardStandardSwap') && document.getElementById('KeyboardStandardSwap').style.display != "none") {
			log.write($$("a.alt").each(function(item){item.hide()}));
			log.write($$("a.standard").each(function(item){item.show()}));
			this.swappedState = "standard";
			
		}
		
		//Show  divider here
		document.getElementById('ScreenSeparator').className = this.id + " minimized";
		document.getElementById('ScreenSeparatorThumb').className = 'minimized';
		
		if($cn.config.EnableSearchScreenSeparator) $('ScreenSeparator').show();
		$('keyboard').show();
	},
	hide: function(){
		this.parent();
		//hide divider here
		document.getElementById('ScreenSeparator').className = '';
		document.getElementById('ScreenSeparatorThumb').className = '';
		document.getElementById('HorizontalFade').className = "";
		document.getElementById('HorizontalFadeTop').className = "";
		
//		this.unsubEvents();
		$('HorizontalFade').hide();
		$('HorizontalFadeTop').hide();
		$('ScreenSeparator').hide();
		$('keyboard').hide();
	},
	handleBack: function(payload){
		payload.preventDefault();
		this.unsubEvents();
		this.hide();
	},	
	navigate: function(payload){

		if(this.isActive && payload.args[0].direction == "right") {
			var action = $(application.element.current).get('rightaction');
			
			if(action && action == "focusgrid"){
				var list = document.getElementById('titlelist').getElementsByTagName("a");
				
				if(list.length > 0){
					payload.preventDefault();
					application.navigator.setFocus(list[0].id);
				}
			}
		}
	},
	refineSelection: function(payload){
		
        var event = {
        	preventDefault: function(){
                // TODO: what is this referring to ?
        		_defaultPrevented = true;
        	},
        	args: [{}]
        };
        $('HorizontalFade').hide();
		$('HorizontalFadeTop').hide();
		
		BrowseView.GridControl.onSaveState(event);
		BrowseView.ScrollBar.onSaveState(event);
		this._state = event.args[0];
		
       	application.state.save();
		application.events.publish('gridloading', {grid: 'titlegrid', message: "loadinggeneric", className: "searchgrid"});
		BrowseView.LastGridProcess = "search-refineSelection";
		
		$cn.methods.getBrowseListByCastRole(payload.args[0].id,this._currentCategory,1,function(callback){
            var data = callback.data.result;
			
       		application.events.publish('loadgrid', {grid: 'titlegrid', data: data.items, gridProcess: "search-refineSelection", columns: 2, template: 'searchtitlelist', className: "searchgrid", returnFocus: "KeyboardKeyBACKTop"});

       		if(data.items && data.items.length > 0){
       			
       		}
       		else {
       			navigation.setFocus('KeyboardKeyBACKTop');
       		}
//        	application.currentView.layoutIsDirty = true; 
        	if($("titlelist").getElement(".title"))
        	{
        		navigation.setFocus($("titlelist").getElement(".title").getElement("a").id);
        	}
//        	else //The grid failed to load, set a default focus
//        	{
//        		navigation.setFocus('dock-home');
//        	}
        	
        	$('ScreenSeparator').removeClass("minimized");
        	$('ScreenSeparator').addClass('searchkeyboardcontrol-arrow');
        	$('ScreenSeparatorThumb').addClass('wheel-thumb-left').show();
        	
        	
			this._refined = true;
			
        }.bind(this)); 
	},
	onSaveState: function(payload){
		this.parent(payload);
		
		var state = payload.args[0];
		state[this.id]._currentCategory = this._currentCategory;
		state[this.id]._refined = this._refined;
	},
});
