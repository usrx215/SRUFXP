//-----------------------------------------------------------------------------
// imagepopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var ImagePopup = new Class({
	Extends:ModalControl,
	id: 'imagepopup',
	currentIdx: 0,
	initialize: function(){
		application.events.subscribe(this, "navigate", this.navigate.bind(this));
		this.parent(this.id, "ImageContent");

	},
	/*
	

	 */
	navigate: function(payload) {
		
		if(document.getElementById(application.element.current) != null && application.element.current == "closeImagePopup"){
			if(payload.args[0].direction == 'left'|| payload.args[0].direction== 'right')
			{
				$('ImageContent').getChildren("div.imageholder")[this.currentIdx].hide();
				switch(payload.args[0].direction)
				{
					case "left":
						if(this.currentIdx > 0)
						{
							this.currentIdx = this.currentIdx - 1;
						}
						break;
					case "right":
						if(this.currentIdx + 1 < this._data.length)
						{
							this.currentIdx = this.currentIdx + 1
						}
						break;
				}
				$('ImageContent').getChildren("div.imageholder")[this.currentIdx].show();
				this.setArrows();
			}
		}
	},
	setArrows: function() {
		$("rightArrow").hide();
		$("leftArrow").hide();
		if(this.currentIdx > 0)
		{
			$("leftArrow").show();
		}
		
		if(this._data.length > 1 && this._data.length - 1 != this.currentIdx)
		{
			$("rightArrow").show();
		}
		
	},
	show: function(idx) {
		
		if(idx)
			this.currentIdx = idx;
		else
			this.currentIdx = 0;
		
		
		this.lastFocus = application.element.current;
		navigation.setFocus('closeImagePopup');
		BrowseView.hideLogo();
		$('dock').hide();
		$('uicontainer').setStyle('background','none');
		$('mainstage').hide();
		$('imagepopup').show();
		$('closeImagePopup').show();
		$('ImageContent').getChildren("div.imageholder")[this.currentIdx].show();
		this.setArrows();
	},
	hide: function() {
		navigation.setFocus(this.lastFocus);
		$('closeImagePopup').hide();
		$('imagepopup').hide();
		$('uicontainer').setStyle('background','#181818');
		
		BrowseView.showLogo();
		$('dock').show();
		$('ImageContent').getChildren("div.imageholder").hide();
		$('mainstage').show();
		

	},
});
