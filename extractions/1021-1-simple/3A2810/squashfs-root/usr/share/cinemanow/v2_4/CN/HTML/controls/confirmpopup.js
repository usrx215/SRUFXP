//-----------------------------------------------------------------------------
// confirmpopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var ConfirmPopup = new Class({
	Extends:ModalControl,
	id: 'confirmpopup',
	purchaseType: 'buy',
	rentalLimit: '',
	initialize: function(){
    	this.parent(this.id);
	},
	goLibrary: function(titleid, passid) {
        navigation.setFocusElement(null);

        $cn.methods.getPurchasedTitle(passid, titleid, function(cb){
				BrowseView.loadTitle(cb, '');
		        this.hide(function(){
					BrowseView.TitleViewControl.setFocus();
				});
        }.bind(this));
        BrowseView.setView("library-view");
	},
    startPlay: function(titleid, passid) {    
        this.hide();
        this.parent(titleid, passid);
    },
	/*
	 * Set the status by using the following codes (e.g.: 'HD play rent')
	 * 
	 * HEADER
	 * 
	 * buy: show the buy title and added to library message
	 * rent: show the rent title
	 * 
	 * MESSAGES
	 * 
	 * rent24: show the rent for 24 hours message
	 * rent48: show the rent for 48 hours message
	 * preorder: show preorder message
	 * season: show season pass message
	 * 
	 * BUTTONS
	 * 
	 * play: show the play button
	 * episode1: show the episode 1 play button
	 * resume: show the resume play button
	 * 
	 * HD
	 * bool: show/hide the HD icon
	 * 
	 */
	setStatus: function(header, message, button, hd, surround) {
		
		$('ConfirmationContainer').erase('class');
		$('ConfirmationContainer').addClass(header);
		$('ConfirmationContainer').addClass(message);
		$('ConfirmationContainer').addClass(button);
		
		if(hd)
			$('ConfirmationContainer').addClass('hd');

		if(surround)
			$('ConfirmationContainer').addClass('surround');
		
		var firstFocus = 'ConfirmPlay';
		
		switch(button) {
			case "episode1" :
				firstFocus = "ConfirmPlayEpisode1";
				break;
			case "resume" :
				firstFocus = "ConfirmResumePlay";
				break;
		}
		
		this.rentalLimit = (message.indexOf('rent') > -1) ? message.replace('rent', '') : '';
		this.purchaseType = header;
		this.firstFocus = firstFocus;
		this.layoutIsDirty = true;
		this.show();
	},
	/**
	 * hide - Override parent class to close titleview panel
	 */
	hide: function(callback) {
		this.parent();
		
		$("ModalWindow").erase('style');

		if (callback == null) {
			callback = function(){
				BrowseView.TitleViewControl.setFocus();
			};
		}
		
		BrowseView.expandTitleDetails(callback);	
	},
	show: function() {
		this.parent();
		
		// Position the dialog.  NOTE: Must be done after
		// showing the dialog as the measurement routine
		// for items with visiblity set to none cause problems
		// with the zorder used by the modal code.
		var contentSize = $("ConfirmationContainer").getSize();
		
		$("ModalWindow").setStyles( {
			top: (($("uicontainer").clientHeight - contentSize.y) / 2) + "px",
			height: contentSize.y + "px",
			visibility: "inherit"
		});
	}
});
