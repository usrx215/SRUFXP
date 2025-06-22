//-----------------------------------------------------------------------------
// pinpopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var PinPopup = new Class({
	Extends:ModalControl,
	id: 'pinpopup',
    _pinValues: [-1,-1,-1,-1],
    _currentIndex: 0,
	show5: false,
	callback: null,
	hideCallback: null,
	initialize: function(){
    	this.parent('pinpopup');
        application.events.subscribe(this, "navigate", this.navigate.bind(this));
        application.events.subscribe(this, "elementfocus", this.focus.bind(this));
        application.events.subscribe(this, "elementblur", this.blur.bind(this));
	},
	select: function(payload) {
		if(application.element.current.indexOf('Pin') == 0 && application.element.current.length == 4) {
			var count = this.show5 ? 5 : 4;
			if(payload.context._currentIndex < count) {
				payload.context._currentIndex++;
				if (payload.context._currentIndex < count) {
					payload.context.moveFocusItems(payload);
					navigation.setFocus('Pin' + payload.context._currentIndex);
				}
			}
			
			if(payload.context._currentIndex == count) {
				payload.context.checkPin();
			}
		}
	},
	flashArrow: function(direction){
		$('PinFocusUp').removeClass('hover');
		$('PinFocusDown').removeClass('hover');
		
		if(direction == 'up'){
			$('PinFocusUp').addClass('hover');
		}
		else {
			$('PinFocusDown').addClass('hover');
		}
		
		setTimeout(function(){
			$('PinFocusUp').removeClass('hover');
			$('PinFocusDown').removeClass('hover');
		},200);
	},
	navigate: function(payload) {
		
		if (document.getElementById(application.element.current) && $(application.element.current).hasClass('numeric')) {	
			payload.preventDefault();
			var swapVal = true;
			var count = this.show5 ? 5 : 4;
			
			switch(payload.args[0].direction) {
				case "up" :
					if(payload.context._pinValues[payload.context._currentIndex] < 9) {
						payload.context._pinValues[payload.context._currentIndex]++;
					}
					else if(payload.context._pinValues[payload.context._currentIndex] == 9) {
						payload.context._pinValues[payload.context._currentIndex] = 0;
					}
					
					this.flashArrow(payload.args[0].direction);
					
					break;
					
				case "down" :
					if(payload.context._pinValues[payload.context._currentIndex] > 0) { 
						payload.context._pinValues[payload.context._currentIndex]--;
					}
					else if(payload.context._pinValues[payload.context._currentIndex] <= 0) {
						payload.context._pinValues[payload.context._currentIndex] = 9;
					}
					
					this.flashArrow(payload.args[0].direction);
					
					break;
				case "left":
					if((application.element.current.replace(/Pin/, '') * 1) > 0) {
						payload.context._pinValues[payload.context._currentIndex] = -1;
						payload.context._pinValues[payload.context._currentIndex - 1] = -1;
						application.navigator.setFocus("Pin" + (payload.context._currentIndex - 1));
					}
					else {
						swapVal = false;
						application.navigator.setFocus("PinCancel");
					}
					break;
				case "right":
					if((application.element.current.replace(/Pin/, '') * 1) < (count - 1)) {
						if(payload.context._pinValues[payload.context._currentIndex] > -1) {
							payload.context._pinValues[payload.context._currentIndex + 1] = -1;
							application.navigator.setFocus("Pin" + (payload.context._currentIndex + 1));
						}
					}
					else {
						swapVal = false;
						this.checkPin();
					}
					break;
			}		
			
			if(swapVal) {
				var val = payload.context._pinValues[payload.context._currentIndex];
				document.getElementById(application.element.current).innerHTML = val == -1 ? '' : val;
			}
		}
	},
	moveFocusItems: function(payload) {
		$('PinFocusUp').setStyle('left', (parseInt(application.resource.pinPopup.left) + (payload.context._currentIndex * 102) + 'px'));
		$('PinFocusDown').setStyle('left', (parseInt(application.resource.pinPopup.left) + (payload.context._currentIndex * 102) + 'px'));
	},
	focus: function(payload) {
		
		if (application.element.current.indexOf('Pin') == 0 && application.element.current.length == 4) {
			
			payload.context._currentIndex = application.element.current.replace(/Pin/, '') * 1;
			log.write('Current Index: ' + payload.context._currentIndex);
			
			payload.context._resetPins();
			if(payload.context._pinValues[payload.context._currentIndex] < 0) {
				payload.context._pinValues[payload.context._currentIndex] = -1;
			}
			
			var val = payload.context._pinValues[payload.context._currentIndex];
			document.getElementById(application.element.current).innerHTML = val == -1 ? '' : val;
			
			
			$('PinFocusUp').show();
			$('PinFocusDown').show();
			
			$('PinIncorrect').hide();
			$('PinNav').show();
			payload.context.moveFocusItems(payload);
		}
		
		if(application.element.current == 'PinCancel') {
			$('PinFocusUp').hide();
			$('PinFocusDown').hide();			
		}
		
	},
	show : function() {
		this._pinValues = [-1,-1,-1,-1];
		this.lastFocus = application.element.current;
		this.parent();
		
		if(!this.show5) {
			$('Pin4').getParent().hide();	
		} else {
			$('Pin4').getParent().show();	
		}
		application.events.subscribe(this, "back", this.handleBack.bind(this));
		application.events.subscribe(this, "keydown", this.handleKeyPress.bind(this));		
	},
	unsubEvents: function(){
		application.events.unsubscribe(this, "back");
		application.events.unsubscribe(this, "keydown");
	},
	handleBack: function(payload){
		payload.preventDefault();
		this.unsubEvents();
		this.hide();
	},	
	handleKeyPress: function(payload){
		
		if (document.getElementById(application.element.current) && $(application.element.current).hasClass("numeric")) {
		
			switch (payload.args[0].event.keyCode) {
				case application.keys.KEY_1:
					this.setCurrentVal(1, payload);
					break;
				case application.keys.KEY_2:
					this.setCurrentVal(2, payload);
					break;
				case application.keys.KEY_3:
					this.setCurrentVal(3, payload);
					break;
				case application.keys.KEY_4:
					this.setCurrentVal(4, payload);
					break;
				case application.keys.KEY_5:
					this.setCurrentVal(5, payload);
					break;
				case application.keys.KEY_6:
					this.setCurrentVal(6, payload);
					break;
				case application.keys.KEY_7:
					this.setCurrentVal(7, payload);
					break;
				case application.keys.KEY_8:
					this.setCurrentVal(8, payload);
					break;
				case application.keys.KEY_9:
					this.setCurrentVal(9, payload);
					break;
				case application.keys.KEY_0:
					this.setCurrentVal(0, payload);
					break;
				default:
					break;
			}
		}
	},
	setCurrentVal: function(num, payload){
		this._pinValues[this._currentIndex] = num;
		document.getElementById(application.element.current).innerHTML = num == -1 ? '' : num;
		this.select(payload);
	},
	blur: function(payload) {
		
		if (application.element.current == 'Pin0') {

			payload.context._resetPins();
			
		}
	},
	_resetPins: function() {
		for(var i=0; i < 5; i++) {
			if(this._pinValues[i] > -1) {
				$('Pin' + i).innerHTML = '*';			
			} else {
				$('Pin' + i).innerHTML = '';
			}
		}
	},
	checkPin: function() {
		
		if(this.show5) {
			this._pinValues[4] = '';
		}
		
		$('Pin3').innerHTML = '*';
		var pin =  this._pinValues.join('');
		var self = this;
		
		if(application.authSupported) {
			application.isBusy = true;
			navigation.setFocusElement(null);
			$cn.methods.checkParentPin(pin, function(result){
				application.isBusy = false;
				
				if(result) {
					self.hide();
					
					self.unsubEvents();
					
					if(self.callback){
						self.callback.call(self);
					}
				} 
				else {
					self._pinValues = [-1,-1,-1,-1];
					self._resetPins();
					self._currentIndex = 0;
					
					application.navigator.setFocus("Pin0");
					
					$('PinIncorrect').show();
					$('PinNav').hide();
				}
			});		
		}
		else {
			self._pinValues = [-1,-1,-1,-1];
			self._resetPins();
			self._currentIndex = 0;
			$(application.element.current).innerHTML = 0;
			application.navigator.setFocus("Pin0");
			
			
			$('PinIncorrect').show();
			$('PinNav').hide();
		}
	},
	hide: function(){
		this.unsubEvents();
		this.parent();
	},
	cancel: function(){
		this.hide();
		
		//log.write("$cn.data.InitialLoad: " + $cn.data.InitialLoad + ", $cn.data.ContentIsFiltered: " + $cn.data.ContentIsFiltered);
		
		//if (!$cn.data.ContentIsFiltered) {
		//	BrowseView.reset();
		//}
	}
});
