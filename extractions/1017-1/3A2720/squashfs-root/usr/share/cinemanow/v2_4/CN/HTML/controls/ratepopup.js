//-----------------------------------------------------------------------------
// ratepopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var RatePopup = new Class({
	Extends:ModalControl,
	id: 'ratepopup',
	persist: {},
    controls:{},
    layoutIsDirty: true,
    tpl: null,
	_rating: 0,
	_titleID: null,
	initialize: function(title) {
		this.parent('ratepopup');
		this.contentControlId = "RateStars";
		
		application.events.subscribe(this, 'elementfocus', this.focus.bind(this));
		application.events.subscribe(this, "navigate", this.navigate.bind(this));		
	},
	setRate: function(rating) {
		this._rating = rating;
		rating = rating.toString().replace(/\./,'');
		$('RateHolder').erase('class');
		$('RateHolder').addClass('rate' + rating);
	},
	loadData: function(data) {
		log.write(data);
		this._titleID = data[0].titleID;
		this.parent(data);
	},
	hideIfNoFlixster: function(){
		var val = "";
    	
    	if(!$cn.data.flixsterEnable) {
    		val = "hide";
    	}
    	
    	return val;
	},
	showIfNoFlixster: function(){
		var val = "";
    	
    	if($cn.data.flixsterEnable) {
    		val = "hide";
    	}
    	
    	return val;
	},
	saveRate: function() {
		var self = this;
		log.write('Saving rate: ' + this._rating);
		$cn.methods.rateTitle(this._titleID, this._rating, function(res) {
			self.hide();
			$('YourRating').hide();
            if($('tdbuttonRating').getChildren('span').length){
                $('tdbuttonRating').getFirst('span').set('html', 'Change Rating');
            } else {
                $('tdbuttonRating').set('html', 'Change Rating');
            }
			
			BrowseView.TitleViewControl.setUserRating(self._rating);
			/*
			 * Moved to title view and utilities
			if($cn.data.TitleDetailCache[self._titleID]) {
				var collection = $cn.data.TitleDetailCache[self._titleID].metaValues;
				
				collection.each(function(item){
					if(item.keyName == "YourRating"){
						item.keyValue = self._rating;
					}
				});
			}*/
			
			BrowseView.TitleViewControl.drawStarRating(parseFloat(self._rating));
			$('ratingstar').removeClass('display_none');
		});
	},
	show: function(){
		$('ModalWindow').setAttribute('style', '');
		this.parent();
	},
	hide: function(){
		BrowseView.TitleViewControl.showingRating = false; //We have hidden the rating modal so tell the control.
		this.parent();
	},
	
	flashArrow: function(direction){
		$('RatingLeftArrow').removeClass('hover');
		$('RatingRightArrow').removeClass('hover');
		
		if(direction == 'left'){
			$('RatingLeftArrow').addClass('hover');
		}
		else {
			$('RatingRightArrow').addClass('hover');
		}
		
		setTimeout(function(){
			$('RatingLeftArrow').removeClass('hover');
			$('RatingRightArrow').removeClass('hover');
		},200);
	},
	navigate: function(payload) {

		if (application.element.current == 'RateControl') {

			if (payload.args[0].direction == "left" || (payload.args[0].direction == "right" && (!payload.args[0].keypressed || payload.args[0].keypressed != application.keys.KEY_ENTER))) {

				payload.preventDefault();
			
				var rating = 0;
				switch(payload.args[0].direction) {
					case "left" :
						rating = payload.context._rating > 0.5 ?  payload.context._rating - .5 : 0.5; 
						this.flashArrow(payload.args[0].direction);
						
						break;
					case "right" :
						 rating =  payload.context._rating < 5 ?  payload.context._rating + .5 : 5;
						 this.flashArrow(payload.args[0].direction);
						  
					break;
				}
				
				payload.context.setRate( rating);
			
			}
			else if(payload.args[0].keypressed && payload.args[0].keypressed == application.keys.KEY_ENTER)
			{
				this.saveRate();
			}
			else if(payload.args[0].direction == "down")
				$('RateStars').removeClass('focus');
		} 

	},
	focus: function(payload) {

		if(payload.args[0].focusedelem == 'RateControl') {
			$('RateStars').addClass('focus');
		}
	}
});
